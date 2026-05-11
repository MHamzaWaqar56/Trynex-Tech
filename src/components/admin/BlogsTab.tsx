'use client';

import type { FormEvent } from 'react';
import { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import {
  Send, BookOpen, ImagePlus, Pencil, Trash2,
  Eye, EyeOff, ArrowLeft, Plus, Tag, User,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });

// ─── Quill config ─────────────────────────────────────────────────────────────

const quillModules = {
  toolbar: [
    [{ header: [1, 2, 3, 4, 5, 6, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ list: 'ordered' }, { list: 'bullet' }],
    [{ align: [] }],
    ['blockquote', 'code-block'],
    ['link'],
    ['clean'],
  ],
};

const quillFormats = [
  'header', 'bold', 'italic', 'underline', 'strike',
  'list', 'bullet', 'align', 'blockquote', 'code-block', 'link',
];

// ─── Types ────────────────────────────────────────────────────────────────────

export interface BlogPost {
  _id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  tags?: string[];
  author?: string;
  published: boolean;
  coverImage?: string;
  createdAt?: string;
}

interface DeleteDialogState {
  title: string;
  description: string;
  confirmLabel: string;
  onConfirm: () => Promise<void>;
}

interface Props {
  /** Full list of blog posts (for the list view) */
  blogs: BlogPost[];
  /** Pass openDeleteDialog from the parent */
  onDelete: (dialog: DeleteDialogState) => void;
  /** Called after any mutation so parent can reload */
  onRefresh: () => Promise<void>;
  /** If set, the editor opens in edit-mode for this post */
  editingId?: string | null;
  /** Parent clears editingId after cancel */
  onCancelEdit?: () => void;
  /** Navigate to /admin/blogs list page */
  onGoToList: () => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

function listToArray(value: string) {
  return value.split(',').map((s) => s.trim()).filter(Boolean);
}

const emptyForm = {
  slug: '',
  title: '',
  excerpt: '',
  content: '',
  tags: '',
  author: '',
  published: true,
  coverImage: '',
};

function normalizeForm(post: Partial<BlogPost>) {
  return {
    slug:       post.slug        || slugify(post.title || ''),
    title:      post.title       || '',
    excerpt:    post.excerpt     || '',
    content:    post.content     || '',
    tags:       Array.isArray(post.tags) ? post.tags.join(', ') : (post.tags ?? ''),
    author:     post.author      || '',
    published:  typeof post.published === 'boolean' ? post.published : true,
    coverImage: post.coverImage  || '',
  };
}

// ─── Upload helper ────────────────────────────────────────────────────────────

async function uploadToCloudinary(file: File, folder: string): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('folder', folder);

  const res = await fetch('/api/admin/upload', { method: 'POST', body: formData });
  if (!res.ok) {
    const payload = await res.json().catch(() => null);
    throw new Error(payload?.error || 'Upload failed.');
  }
  const data = await res.json();
  const url = data?.asset?.secure_url;
  if (!url) throw new Error('Upload returned no file URL.');
  return url as string;
}

// ─── View: "list" | "editor" ──────────────────────────────────────────────────

type View = 'list' | 'editor';

// ─── Component ────────────────────────────────────────────────────────────────

export default function BlogsTab({
  blogs,
  onDelete,
  onRefresh,
  editingId,
  onCancelEdit,
  onGoToList,
}: Props) {
  const [view, setView] = useState<View>(editingId ? 'editor' : 'list');
  const [form, setForm] = useState(emptyForm);
  const [localEditingId, setLocalEditingId] = useState<string | null>(editingId ?? null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // Sync external editingId (from parent click on a blog row elsewhere)
  useEffect(() => {
    if (editingId) {
      const post = blogs.find((b) => b._id === editingId);
      if (post) {
        setForm(normalizeForm(post));
        setLocalEditingId(editingId);
        setCoverFile(null);
        setView('editor');
      }
    }
  }, [editingId]);

  // ── Save (create or update)
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!form.title.trim()) { toast.error('Title is required.'); return; }

    setBusy(true);
    try {
      const coverImage = coverFile
        ? await uploadToCloudinary(coverFile, 'blogs')
        : form.coverImage;

      const payload = {
        ...form,
        slug: form.slug || slugify(form.title),
        coverImage,
        tags: listToArray(form.tags),
      };

      const res = localEditingId
        ? await fetch(`/api/blogs/${localEditingId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          })
        : await fetch('/api/blogs', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });

      if (res.ok) {
        toast.success(localEditingId ? 'Blog post updated!' : 'Blog post published!');
        resetForm();
        await onRefresh();
        setView('list');
      } else {
        const err = await res.json().catch(() => null);
        toast.error(err?.error || 'Save failed.');
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Save failed.');
    } finally {
      setBusy(false);
    }
  };

  // ── Edit
  const startEdit = (post: BlogPost) => {
    setForm(normalizeForm(post));
    setLocalEditingId(post._id);
    setCoverFile(null);
    setView('editor');
  };

  // ── Delete
  const handleDelete = (post: BlogPost) => {
    onDelete({
      title: 'Delete blog post?',
      description: `This will permanently remove "${post.title}" from the blog.`,
      confirmLabel: 'Delete Post',
      onConfirm: async () => {
        const res = await fetch(`/api/blogs/${post._id}`, { method: 'DELETE' });
        if (res.ok) {
          toast.success('Blog post deleted.');
          await onRefresh();
        } else {
          toast.error('Delete failed.');
        }
      },
    });
  };

  // ── Reset / cancel
  const resetForm = () => {
    setForm(emptyForm);
    setLocalEditingId(null);
    setCoverFile(null);
    if (fileRef.current) fileRef.current.value = '';
  };

  const handleCancel = () => {
    resetForm();
    onCancelEdit?.();
    setView('list');
  };

  // ──────────────────────────────────────────────────────────────────────────
  // LIST VIEW
  // ──────────────────────────────────────────────────────────────────────────
  if (view === 'list') {
    return (
      <div className="flex flex-col gap-4">

        {/* Top bar */}
        <div className="flex items-center justify-between px-4 pt-4">
          <div className="flex items-center gap-2 text-xs text-gray-900">
            <BookOpen className="w-4 h-4" />
            <span><span className="font-semibold text-gray-700">{blogs.length}</span> posts</span>
            <span className="mx-1 text-gray-900">·</span>
            <span className="text-green-600 font-medium">
              {blogs.filter((b) => b.published).length} published
            </span>
            <span className="mx-1 text-gray-900">·</span>
            <span className="text-gray-600">
              {blogs.filter((b) => !b.published).length} draft
            </span>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="ghost" onClick={onGoToList} className="text-xs min-[320px]:max-[500px]:hidden">
              Full Blog Page
            </Button>
            <Button size="sm" onClick={() => { resetForm(); setView('editor'); }} className="text-xs gap-1.5 min-[320px]:max-[400px]:text-[10px] min-[320px]:max-[400px]:gap-[2px] min-[320px]:max-[400px]:px-[8px]">
              <Plus className="w-3.5 h-3.5" /> New Post
            </Button>
          </div>
        </div>

        {/* Blog list table */}
        <div className="overflow-x-auto">
          <table className="min-w-[820px] w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                {['Title', 'Author', 'Tags', 'Status', 'Date', 'Actions'].map((h) => (
                  <th key={h} className="text-left px-4 py-3.5 text-gray-900 font-mono text-xs uppercase tracking-[0.18em]">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-primary-100">
              {blogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center">
                    <div className="flex flex-col items-center gap-2 text-gray-900">
                      <BookOpen className="w-8 h-8 opacity-30" />
                      <span className="text-sm">No blog posts yet.</span>
                      <Button size="sm" variant="default" onClick={() => setView('editor')} className="mt-1 text-xs gap-1">
                        <Plus className="w-3 h-3" /> Write first post
                      </Button>
                    </div>
                  </td>
                </tr>
              ) : (
                blogs.map((post) => (
                  <tr key={post._id} className="align-middle hover:bg-primary-100 transition-colors">
                    {/* Title + excerpt */}
                    <td className="px-4 py-3.5 max-w-[260px]">
                      <div className="font-medium text-gray-900 truncate">{post.title}</div>
                      {post.excerpt && (
                        <div className="text-[11px] text-gray-600 mt-0.5 truncate">{post.excerpt}</div>
                      )}
                    </td>

                    {/* Author */}
                    <td className="px-4 py-3.5 text-gray-900 text-xs whitespace-nowrap">
                      {post.author || '—'}
                    </td>

                    {/* Tags */}
                    <td className="px-4 py-3.5">
                      <div className="flex flex-wrap gap-1 max-w-[200px]">
                        {post.tags?.slice(0, 3).map((tag) => (
                          <span key={tag} className="inline-flex items-center gap-0.5 rounded-full bg-gray-100 px-2 py-0.5 text-[11px] text-gray-600">
                            <Tag className="w-2.5 h-2.5" />{tag}
                          </span>
                        ))}
                        {(post.tags?.length ?? 0) > 3 && (
                          <span className="text-[11px] text-gray-600">+{(post.tags?.length ?? 0) - 3}</span>
                        )}
                        {(!post.tags || post.tags.length === 0) && (
                          <span className="text-[11px] text-gray-400">—</span>
                        )}
                      </div>
                    </td>

                    {/* Published */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      {post.published ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-0.5 text-[11px] font-medium text-green-600">
                          <Eye className="w-3 h-3" /> Published
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-0.5 text-[11px] font-medium text-gray-500">
                          <EyeOff className="w-3 h-3" /> Draft
                        </span>
                      )}
                    </td>

                    {/* Date */}
                    <td className="px-4 py-3.5 text-gray-900 text-xs whitespace-nowrap">
                      {post.createdAt ? new Date(post.createdAt).toLocaleDateString() : '—'}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <Button
                          type="button" size="sm" variant="ghost"
                          className="h-8 w-8 !p-0 justify-center "
                          onClick={() => startEdit(post)}
                          aria-label="Edit post"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          type="button" size="sm" variant="destructive"
                          className="h-8 w-8 !p-0 justify-center "
                          onClick={() => handleDelete(post)}
                          aria-label="Delete post"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // ──────────────────────────────────────────────────────────────────────────
  // EDITOR VIEW
  // ──────────────────────────────────────────────────────────────────────────
  return (
    <div className="p-5 min-[320px]:max-[500px]:p-[6px]">
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <CardTitle>{localEditingId ? 'Edit Blog Post' : 'New Blog Post'}</CardTitle>
              <CardDescription className="mt-1">
                {localEditingId ? 'Update the post details below.' : 'Fill in the details and publish.'}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="default" size="sm" onClick={() => setView('list')} className="gap-1.5 text-xs">
                <ArrowLeft className="w-3.5 h-3.5" /> All Posts
              </Button>
              {localEditingId && (
                <Button type="button" variant="ghost" size="sm" onClick={handleCancel} className="text-xs">
                  Cancel
                </Button>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <form key={localEditingId || 'new'} onSubmit={handleSubmit} className="grid grid-cols-1 gap-5">

            {/* Title + Author */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-900 uppercase tracking-wider">Title *</label>
                <Input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value, slug: slugify(e.target.value) })}
                  placeholder="Post title"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-900 uppercase tracking-wider flex items-center gap-1">
                  <User className="w-3 h-3" /> Author
                </label>
                <Input
                  value={form.author}
                  onChange={(e) => setForm({ ...form, author: e.target.value })}
                  placeholder="Author name"
                />
              </div>
            </div>

            {/* Slug */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-900 uppercase tracking-wider">Slug</label>
              <Input
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
                placeholder="auto-generated-from-title"
                className="font-mono text-xs"
              />
              <p className="text-[11px] text-gray-400">Auto-generated from title. Edit if needed.</p>
            </div>

            {/* Tags */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-900 uppercase tracking-wider flex items-center gap-1">
                <Tag className="w-3 h-3" /> Tags
                <span className="normal-case font-normal text-gray-600 ml-1">(comma separated)</span>
              </label>
              <Input
                value={form.tags}
                onChange={(e) => setForm({ ...form, tags: e.target.value })}
                placeholder="react, nextjs, tailwind"
              />
            </div>

            {/* Cover image */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-900 uppercase tracking-wider flex items-center gap-1">
                <ImagePlus className="w-3 h-3" /> Cover Image
              </label>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                onChange={(e) => setCoverFile(e.target.files?.[0] || null)}
                className="w-full text-sm text-gray-900 file:mr-4 file:rounded-lg file:border-0 file:bg-primary file:px-4 file:py-2 file:text-white file:font-semibold file:text-sm file:cursor-pointer cursor-pointer"
              />
              <p className="text-[11px] text-gray-400">Selected image uploads to Cloudinary when you save.</p>
              {form.coverImage && !coverFile && (
                <div className="rounded-xl overflow-hidden border border-primary-200">
                  <img src={form.coverImage} alt="Cover" className="w-full h-44 object-cover" />
                </div>
              )}
              {coverFile && (
                <div className="rounded-xl overflow-hidden border border-primary-200">
                  <img src={URL.createObjectURL(coverFile)} alt="Preview" className="w-full h-44 object-cover" />
                </div>
              )}
            </div>

            {/* Excerpt */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-900 uppercase tracking-wider">Excerpt</label>
              <Textarea
                value={form.excerpt}
                onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
                placeholder="Short description shown in listings..."
                rows={3}
                className="resize-none"
              />
            </div>

            {/* Content (Quill) */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-900 uppercase tracking-wider">Content</label>
              <div className="border border-primary-200 rounded-lg overflow-hidden blog-quill-wrapper">
                <ReactQuill
                  theme="snow"
                  value={form.content}
                  onChange={(value) => setForm({ ...form, content: value })}
                  modules={quillModules}
                  formats={quillFormats}
                  placeholder="Write your blog post here..."
                  className="blog-quill"
                />
              </div>
            </div>

            {/* Published toggle */}
            <label className="flex items-center gap-2.5 text-sm text-gray-900 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={form.published}
                onChange={(e) => setForm({ ...form, published: e.target.checked })}
                className="w-4 h-4 rounded border-primary-300 accent-primary"
              />
              Publish immediately
            </label>

            {/* Submit */}
            <Button type="submit" disabled={busy} className="w-full justify-center py-3 gap-2">
              {busy ? (
                <Spinner size="sm" variant="dark" />
              ) : (
                <><Send className="w-4 h-4" /> {localEditingId ? 'Update Post' : 'Publish Post'}</>
              )}
            </Button>

          </form>
        </CardContent>
      </Card>
    </div>
  );
}