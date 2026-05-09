

// 'use client';

// import { useEffect, useMemo, useState } from 'react';
// import { ArrowLeft, ArrowRight, ChevronLeft, ChevronRight, Pencil, Trash2 } from 'lucide-react';
// import { useRouter } from 'next/navigation';
// import { toast } from 'sonner';
// import { Button } from '@/components/ui/button';
// import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
// import { Badge } from '@/components/ui/badge';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// import ConfirmDialog from '@/components/admin/ConfirmDialog';

// type BlogPost = {
//   _id: string;
//   title: string;
//   slug: string;
//   excerpt?: string;
//   content: string;
//   tags?: string[];
//   published: boolean;
//   coverImage?: string;
//   author?: string;
//   createdAt?: string;
// };

// type SortKey = 'newest' | 'oldest' | 'title-asc' | 'title-desc';

// const POSTS_PER_PAGE = 9;

// function stripHtml(content: string) {
//   return content.replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
// }

// function estimateReadTime(content: string) {
//   const words = stripHtml(content).split(/\s+/).filter(Boolean).length;
//   return `${Math.max(1, Math.ceil(words / 220))} min`;
// }

// export default function AdminBlogsPage() {
//   const router = useRouter();
//   const [loading, setLoading] = useState(true);
//   const [posts, setPosts] = useState<BlogPost[]>([]);
//   const [deleteTarget, setDeleteTarget] = useState<BlogPost | null>(null);
//   const [busy, setBusy] = useState(false);
//   const [sortKey, setSortKey] = useState<SortKey>('newest');
//   const [currentPage, setCurrentPage] = useState(1);

//   const loadPosts = async () => {
//     setLoading(true);
//     try {
//       const response = await fetch('/api/blogs?all=1');
//       const data = await response.json().catch(() => null);
//       if (response.ok) {
//         setPosts(Array.isArray(data?.posts) ? data.posts : []);
//       } else {
//         toast.error(data?.error || 'Unable to load blog posts.');
//       }
//     } catch {
//       toast.error('Unable to load blog posts.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => { void loadPosts(); }, []);
//   useEffect(() => { setCurrentPage(1); }, [sortKey]);

//   const sortedPosts = useMemo(() => {
//     const items = [...posts];
//     switch (sortKey) {
//       case 'oldest': return items.sort((a, b) => new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime());
//       case 'title-asc': return items.sort((a, b) => a.title.localeCompare(b.title));
//       case 'title-desc': return items.sort((a, b) => b.title.localeCompare(a.title));
//       default: return items.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
//     }
//   }, [posts, sortKey]);

//   const totalPages = Math.max(1, Math.ceil(sortedPosts.length / POSTS_PER_PAGE));
//   const safePage = Math.min(currentPage, totalPages);
//   const startIndex = (safePage - 1) * POSTS_PER_PAGE;
//   const currentPosts = sortedPosts.slice(startIndex, startIndex + POSTS_PER_PAGE);

//   const goToPage = (page: number) => {
//     setCurrentPage(Math.min(Math.max(page, 1), totalPages));
//     window.scrollTo({ top: 0, behavior: 'smooth' });
//   };

//   const pageNumbers = useMemo(() => {
//     if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1);
//     const start = Math.max(1, safePage - 2);
//     const end = Math.min(totalPages, start + 4);
//     const adjustedStart = Math.max(1, end - 4);
//     return Array.from({ length: end - adjustedStart + 1 }, (_, i) => adjustedStart + i);
//   }, [safePage, totalPages]);

//   const confirmDelete = async () => {
//     if (!deleteTarget) return;
//     setBusy(true);
//     try {
//       const res = await fetch(`/api/blogs/${deleteTarget._id}`, { method: 'DELETE' });
//       const data = await res.json().catch(() => null);
//       if (res.ok) {
//         setPosts((current) => current.filter((p) => p._id !== deleteTarget._id));
//         toast.success('Blog post deleted.');
//         setDeleteTarget(null);
//       } else {
//         toast.error(data?.error || 'Delete failed.');
//       }
//     } catch {
//       toast.error('Delete failed.');
//     } finally {
//       setBusy(false);
//     }
//   };

//   return (
//     <div className="relative min-h-screen overflow-hidden bg-[#050814] pt-[5rem] text-white">
//       <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(0,212,255,0.14),transparent_28%),radial-gradient(circle_at_top_right,rgba(255,107,53,0.12),transparent_24%),linear-gradient(180deg,#050814_0%,#070b14_42%,#050814_100%)]" />
//       <div className="container-custom relative z-10 py-8 lg:py-10">

//         {/* Header */}
//         <div className="mb-8 rounded-[28px] border border-white/10 bg-white/[0.04] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.45)] backdrop-blur-xl lg:p-8">
//           <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
//             <div className="space-y-3">
//               <Button variant="ghost" className="w-fit rounded-full border border-white/10 bg-white/[0.03] text-dark-muted hover:text-white" onClick={() => router.push('/admin')}>
//                 <ArrowLeft className="h-4 w-4" /> Back to Dashboard
//               </Button>
//               <div>
//                 <p className="text-xs uppercase tracking-[0.24em] text-dark-muted font-mono">Blog Management</p>
//                 <h1 className="mt-2 text-3xl font-display font-bold sm:text-4xl">All Blog Posts</h1>
//                 <p className="mt-3 max-w-2xl text-sm leading-6 text-dark-muted sm:text-base">
//                   Edit or delete posts from one focused screen. Use the edit action to jump back into the create editor.
//                 </p>
//               </div>
//             </div>
//             <div className="grid grid-cols-3 gap-3">
//               <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
//                 <p className="text-[11px] uppercase tracking-[0.2em] text-dark-muted">Total</p>
//                 <p className="mt-2 text-2xl font-display font-bold">{posts.length}</p>
//               </div>
//               <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
//                 <p className="text-[11px] uppercase tracking-[0.2em] text-dark-muted">Published</p>
//                 <p className="mt-2 text-2xl font-display font-bold">{posts.filter((p) => p.published).length}</p>
//               </div>
//               <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
//                 <p className="text-[11px] uppercase tracking-[0.2em] text-dark-muted">Drafts</p>
//                 <p className="mt-2 text-2xl font-display font-bold">{posts.filter((p) => !p.published).length}</p>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Posts Card */}
//         <Card className="overflow-hidden border-white/10 bg-white/[0.03] shadow-[0_22px_60px_rgba(0,0,0,0.35)] backdrop-blur-xl">
//           <CardHeader className="border-b border-white/10 bg-white/[0.02]">
//             <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
//               <div>
//                 <CardTitle>Blog Posts</CardTitle>
//                 <CardDescription className="mt-1">
//                   {loading ? 'Loading...' : `Showing ${sortedPosts.length === 0 ? 0 : startIndex + 1}–${Math.min(startIndex + POSTS_PER_PAGE, sortedPosts.length)} of ${sortedPosts.length} posts`}
//                 </CardDescription>
//               </div>
//               <Select value={sortKey} onValueChange={(v) => setSortKey(v as SortKey)}>
//                 <SelectTrigger className="min-w-[160px] rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white outline-none transition-colors focus:border-primary/50">
//                   <SelectValue placeholder="Sort posts" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="newest">Newest</SelectItem>
//                   <SelectItem value="oldest">Oldest</SelectItem>
//                   <SelectItem value="title-asc">Title A–Z</SelectItem>
//                   <SelectItem value="title-desc">Title Z–A</SelectItem>
//                 </SelectContent>
//               </Select>
//             </div>
//           </CardHeader>

//           <CardContent className="p-5">
//             {loading ? (
//               <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
//                 {Array.from({ length: 6 }).map((_, i) => (
//                   <div key={i} className="h-64 animate-pulse rounded-2xl border border-white/10 bg-white/[0.03]" />
//                 ))}
//               </div>
//             ) : sortedPosts.length === 0 ? (
//               <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-center text-dark-muted">
//                 No blog posts found.
//               </div>
//             ) : (
//               <>
//                 <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
//                   {currentPosts.map((post) => (
//                     <article key={post._id} className="group flex flex-col rounded-2xl border border-white/10 bg-white/[0.03] shadow-[0_14px_35px_rgba(0,0,0,0.2)] transition-all duration-300 hover:-translate-y-1 hover:border-white/20 hover:shadow-[0_20px_50px_rgba(0,0,0,0.3)] overflow-hidden">

//                       {/* Cover image */}
//                       {post.coverImage ? (
//                         <div className="overflow-hidden border-b border-white/10 bg-white/[0.02]">
//                           <img src={post.coverImage} alt={post.title} className="h-36 w-full object-cover transition-transform duration-300 group-hover:scale-105" />
//                         </div>
//                       ) : (
//                         <div className="h-36 border-b border-white/10 bg-gradient-to-br from-primary/5 to-accent/5 flex items-center justify-center">
//                           <span className="text-3xl font-black text-primary/20 font-display">{post.title.charAt(0)}</span>
//                         </div>
//                       )}

//                       <div className="flex flex-1 flex-col p-5">
//                         {/* Tags + badge */}
//                         <div className="mb-3 flex items-center justify-between gap-2">
//                           <div className="flex flex-wrap gap-2">
//                             {(post.tags || []).slice(0, 2).map((tag) => (
//                               <span key={tag} className="text-xs font-mono text-primary">#{tag}</span>
//                             ))}
//                           </div>
//                           <Badge variant={post.published ? 'success' : 'warning'} className="shrink-0">
//                             {post.published ? 'published' : 'draft'}
//                           </Badge>
//                         </div>

//                         {/* Title */}
//                         <h3 className="font-display font-bold text-white mb-2 line-clamp-2 group-hover:text-primary transition-colors">
//                           {post.title}
//                         </h3>

//                         {/* Excerpt */}
//                         <p className="text-dark-muted text-sm leading-relaxed mb-4 line-clamp-3 flex-1">
//                           {post.excerpt || stripHtml(post.content).slice(0, 140) + '...'}
//                         </p>

//                         {/* Read time + slug */}
//                         <div className="mb-4 flex items-center justify-between text-xs text-dark-muted">
//                           <span>{estimateReadTime(post.content)} read</span>
//                           <span className="truncate max-w-[120px] font-mono">/{post.slug}</span>
//                         </div>

//                         {/* Actions */}
//                         <div className="flex gap-2">
//                           <Button type="button" size="sm" className="flex-1" onClick={() => router.push(`/admin?tab=blogs&edit=${post._id}`)}>
//                             <Pencil className="h-3.5 w-3.5" /> Edit
//                           </Button>
//                           <Button type="button" variant="ghost" size="sm" className="text-red-400 hover:text-red-300" onClick={() => setDeleteTarget(post)}>
//                             <Trash2 className="h-3.5 w-3.5" /> Delete
//                           </Button>
//                         </div>
//                       </div>
//                     </article>
//                   ))}
//                 </div>

//                 {/* Pagination */}
//                 {totalPages > 1 && (
//                   <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
//                     <button
//                       type="button"
//                       onClick={() => goToPage(safePage - 1)}
//                       disabled={safePage === 1}
//                       className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-dark-muted transition-colors hover:border-primary/40 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
//                     >
//                       <ChevronLeft className="w-4 h-4" /> Previous
//                     </button>

//                     {pageNumbers.map((pageNum) => (
//                       <button
//                         key={pageNum}
//                         type="button"
//                         onClick={() => goToPage(pageNum)}
//                         className={`min-w-10 rounded-lg border px-3 py-2 text-sm transition-colors ${
//                           pageNum === safePage
//                             ? 'border-primary bg-primary text-dark font-semibold'
//                             : 'border-white/10 bg-white/[0.03] text-dark-muted hover:border-primary/40 hover:text-white'
//                         }`}
//                       >
//                         {pageNum}
//                       </button>
//                     ))}

//                     <button
//                       type="button"
//                       onClick={() => goToPage(safePage + 1)}
//                       disabled={safePage === totalPages}
//                       className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-dark-muted transition-colors hover:border-primary/40 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
//                     >
//                       Next <ChevronRight className="w-4 h-4" />
//                     </button>
//                   </div>
//                 )}
//               </>
//             )}
//           </CardContent>
//         </Card>
//       </div>

//       <ConfirmDialog
//         open={!!deleteTarget}
//         title="Delete Blog Post?"
//         description={`This will permanently remove "${deleteTarget?.title}". This cannot be undone.`}
//         busy={busy}
//         onConfirm={confirmDelete}
//         onCancel={() => setDeleteTarget(null)}
//       />
//     </div>
//   );
// }







'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  Clock,
  Eye,
  FileText,
  Pencil,
  Trash2,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import ConfirmDialog from '@/components/admin/ConfirmDialog';

type BlogPost = {
  _id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  tags?: string[];
  published: boolean;
  coverImage?: string;
  author?: string;
  createdAt?: string;
};

type SortKey = 'newest' | 'oldest' | 'title-asc' | 'title-desc';

const POSTS_PER_PAGE = 9;

function stripHtml(content: string) {
  return content.replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
}

function estimateReadTime(content: string) {
  const words = stripHtml(content).split(/\s+/).filter(Boolean).length;
  return `${Math.max(1, Math.ceil(words / 220))} min read`;
}

function formatDate(dateStr?: string) {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function AdminBlogsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [deleteTarget, setDeleteTarget] = useState<BlogPost | null>(null);
  const [busy, setBusy] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey>('newest');
  const [currentPage, setCurrentPage] = useState(1);

  const loadPosts = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/blogs?all=1');
      const data = await response.json().catch(() => null);
      if (response.ok) {
        setPosts(Array.isArray(data?.posts) ? data.posts : []);
      } else {
        toast.error(data?.error || 'Unable to load blog posts.');
      }
    } catch {
      toast.error('Unable to load blog posts.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void loadPosts(); }, []);
  useEffect(() => { setCurrentPage(1); }, [sortKey]);

  const sortedPosts = useMemo(() => {
    const items = [...posts];
    switch (sortKey) {
      case 'oldest': return items.sort((a, b) => new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime());
      case 'title-asc': return items.sort((a, b) => a.title.localeCompare(b.title));
      case 'title-desc': return items.sort((a, b) => b.title.localeCompare(a.title));
      default: return items.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    }
  }, [posts, sortKey]);

  const totalPages = Math.max(1, Math.ceil(sortedPosts.length / POSTS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * POSTS_PER_PAGE;
  const currentPosts = sortedPosts.slice(startIndex, startIndex + POSTS_PER_PAGE);

  const goToPage = (page: number) => {
    setCurrentPage(Math.min(Math.max(page, 1), totalPages));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const pageNumbers = useMemo(() => {
    if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const start = Math.max(1, safePage - 2);
    const end = Math.min(totalPages, start + 4);
    const adjustedStart = Math.max(1, end - 4);
    return Array.from({ length: end - adjustedStart + 1 }, (_, i) => adjustedStart + i);
  }, [safePage, totalPages]);

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/blogs/${deleteTarget._id}`, { method: 'DELETE' });
      const data = await res.json().catch(() => null);
      if (res.ok) {
        setPosts((current) => current.filter((p) => p._id !== deleteTarget._id));
        toast.success('Blog post deleted.');
        setDeleteTarget(null);
      } else {
        toast.error(data?.error || 'Delete failed.');
      }
    } catch {
      toast.error('Delete failed.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="container-custom py-8 lg:py-12">

        {/* Back button */}
        <div className="mb-6">
          <button
            type="button"
            onClick={() => router.push('/admin')}
            className="btn-ghost text-sm"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </button>
        </div>

        {/* Page header */}
        <div className="glass-card p-6 sm:p-8 mb-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="mb-3">
                <span className="section-badge">
                  <FileText className="h-3.5 w-3.5" />
                  Blog Management
                </span>
              </div>
              <h1 className="section-title mb-2">
                All Blog <span className="gradient-text">Posts</span>
              </h1>
              <p className="text-gray-900 text-sm max-w-xl leading-relaxed">
                Edit or delete posts from one focused screen. Use the edit action to jump back into the create editor.
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 lg:shrink-0">
              {[
                { label: 'Total', value: posts.length },
                { label: 'Published', value: posts.filter((p) => p.published).length },
                { label: 'Drafts', value: posts.filter((p) => !p.published).length },
              ].map(({ label, value }) => (
                <div key={label} className="glass-card-hover p-4 text-center">
                  <p className="text-[11px] uppercase tracking-widest font-mono text-gray-900 mb-1">{label}</p>
                  <p className="text-2xl font-display font-bold text-gray-900">{value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <div className="mb-3">
              <span className="section-badge">
                <Briefcase className="h-3.5 w-3.5" />
                All Posts
              </span>
            </div>
            <h2 className="section-title text-2xl sm:text-3xl">
              Blog <span className="gradient-text">Posts</span>
            </h2>
          </div>

          <div className="flex flex-col items-start gap-2 sm:items-end">
            <Select value={sortKey} onValueChange={(v) => setSortKey(v as SortKey)}>
              <SelectTrigger className="min-w-[180px] sort-select-trigger">
                <SelectValue placeholder="Sort posts" />
              </SelectTrigger>
              <SelectContent className="sort-select-content">
                <SelectItem className="sort-select-item" value="newest">Newest</SelectItem>
                <SelectItem className="sort-select-item" value="oldest">Oldest</SelectItem>
                <SelectItem className="sort-select-item" value="title-asc">Title A–Z</SelectItem>
                <SelectItem className="sort-select-item" value="title-desc">Title Z–A</SelectItem>
              </SelectContent>
            </Select>
            {!loading && (
              <p className="text-sm text-gray-900">
                Showing {sortedPosts.length === 0 ? 0 : startIndex + 1}–{Math.min(startIndex + POSTS_PER_PAGE, sortedPosts.length)} of {sortedPosts.length}
              </p>
            )}
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-72 animate-pulse rounded-2xl border border-slate-100 bg-slate-50" />
            ))}
          </div>
        ) : sortedPosts.length === 0 ? (
          <div className="glass-card p-12 flex flex-col items-center text-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
              <FileText className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="text-xl font-display font-bold text-gray-900 mb-2">No Blog Posts Yet</h3>
              <p className="text-gray-900 text-sm max-w-sm leading-relaxed">
                Create your first blog post from the editor to see it listed here.
              </p>
            </div>
            <button
              type="button"
              onClick={() => router.push('/admin?tab=blogs')}
              className="btn-primary mt-2"
            >
              Create First Post
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentPosts.map((post) => (
                <article
                  key={post._id}
                  className="portfolio-card group flex flex-col bg-white rounded-2xl overflow-hidden border border-slate-100"
                >
                  {/* Cover image */}
                  <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
                    {post.coverImage ? (
                      <>
                        <img
                          src={post.coverImage}
                          alt={post.title}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        {(post.tags || []).length > 0 && (
                          <span className="absolute left-4 top-4 z-10 inline-flex items-center gap-2 rounded-full bg-primary px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-white shadow-[0_8px_24px_rgba(0,212,255,0.28)]">
                            {(post.tags || [])[0]}
                          </span>
                        )}
                      </>
                    ) : (
                      <div className="relative flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5 px-6 text-center">
                        {(post.tags || []).length > 0 && (
                          <span className="absolute left-4 top-4 z-10 inline-flex items-center gap-2 rounded-full bg-primary px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-white shadow-[0_8px_24px_rgba(0,212,255,0.28)]">
                            {(post.tags || [])[0]}
                          </span>
                        )}
                        <span className="text-4xl font-black text-primary/20 font-display">
                          {post.title.charAt(0)}
                        </span>
                      </div>
                    )}

                    {/* Published / Draft badge — top right */}
                    <span
                      className={`absolute right-4 top-4 z-10 inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-widest ${
                        post.published
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {post.published ? 'Published' : 'Draft'}
                    </span>
                  </div>

                  {/* Body */}
                  <div className="flex flex-1 flex-col p-5">
                    <h3 className="font-display font-bold text-gray-900 text-base leading-snug line-clamp-2 mb-2 group-hover:text-primary transition-colors">
                      {post.title}
                    </h3>

                   

                    
                   
                    {/* Actions */}
                    <div className="flex items-center gap-2 pt-4 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => router.push(`/admin?tab=blogs&edit=${post._id}`)}
                        className="btn-primary flex-1 justify-center py-2.5 px-4 text-sm"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(post)}
                        className="btn-secondary py-2.5 px-4 text-sm text-red-500 hover:text-red-600 hover:border-red-200"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Delete
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex flex-wrap items-center justify-center gap-2 pt-8">
                <button
                  type="button"
                  onClick={() => goToPage(safePage - 1)}
                  disabled={safePage === 1}
                  className="inline-flex items-center gap-2 rounded-lg border border-gray-900 bg-white px-3 py-2 text-sm text-gray-900 transition-colors hover:border-primary/40 hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </button>

                {pageNumbers.map((pageNum) => (
                  <button
                    key={pageNum}
                    type="button"
                    onClick={() => goToPage(pageNum)}
                    className={`min-w-10 rounded-lg border px-3 py-2 text-sm transition-colors ${
                      pageNum === safePage
                        ? 'border-primary bg-primary text-dark font-semibold'
                        : 'border-gray-900 bg-white text-gray-900 hover:border-primary/40 hover:text-primary'
                    }`}
                  >
                    {pageNum}
                  </button>
                ))}

                <button
                  type="button"
                  onClick={() => goToPage(safePage + 1)}
                  disabled={safePage === totalPages}
                  className="inline-flex items-center gap-2 rounded-lg border border-gray-900 bg-white px-3 py-2 text-sm text-gray-900 transition-colors hover:border-primary/40 hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Blog Post?"
        description={`This will permanently remove "${deleteTarget?.title}". This cannot be undone.`}
        busy={busy}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}