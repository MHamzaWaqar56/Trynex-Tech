'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Plus, Trash2, Pencil, ArrowLeft,
  BookOpen, ImagePlus, Clock, Users,
  Tag, List, DollarSign, GraduationCap,
  Hash, Star, Link2, Globe, CheckCircle2,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button }   from '@/components/ui/button';
import { Input }    from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Spinner }  from '@/components/ui/spinner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

// ─── Types ─────────────────────────────────────────────────────────────────────

interface Instructor { _id: string; name: string; designation: string; image?: string }

interface FeeEntry        { label: string; amount: string | number; currency: string; description: string }
interface CurriculumEntry { week: string; topic: string; details: string }

interface Course {
  _id: string;
  title: string;
  slug: string;
  coverImage: string;
  summary: string;
  description: string;
  category: string;
  level: string;
  language: string;
  duration: string;
  hoursPerWeek: string;
  totalLectures?: number;
  instructor: Instructor | string;
  fees: FeeEntry[];
  curriculum: CurriculumEntry[];
  learningPoints: string[];
  requirements: string[];
  tags: string[];
  featured: boolean;
  isActive: boolean;
  order: number;
  enrollmentLink?: string;
}

interface DeleteDialogState {
  title: string; description: string; confirmLabel: string;
  onConfirm: () => Promise<void>;
}

interface Props {
  onDelete: (dialog: DeleteDialogState) => void;
}

// ─── Empty form ────────────────────────────────────────────────────────────────

const emptyForm = {
  title: '', slug: '', coverImage: '', summary: '', description: '',
  category: '', level: 'All Levels', language: 'English',
  duration: '', hoursPerWeek: '', totalLectures: '',
  instructor: '',
  fees:           [] as FeeEntry[],
  curriculum:     [] as CurriculumEntry[],
  learningPoints: [] as string[],
  requirements:   [] as string[],
  tags: '', featured: false, isActive: true, order: 1, enrollmentLink: '',
};

const LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'All Levels'];

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

// ─── Component ─────────────────────────────────────────────────────────────────

export default function CoursesTab({ onDelete }: Props) {
  const [courses,     setCourses]     = useState<Course[]>([]);
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [saving,      setSaving]      = useState(false);
  const [view,        setView]        = useState<'list' | 'form'>('list');
  const [editingId,   setEditingId]   = useState<string | null>(null);
  const [form,        setForm]        = useState({ ...emptyForm });
  const [coverFile,   setCoverFile]   = useState<File | null>(null);

  // ── Fetch ──────────────────────────────────────────────────────────────────

  async function loadData() {
    setLoading(true);
    try {
      const [cRes, tRes] = await Promise.all([
        fetch('/api/admin/courses'),
        fetch('/api/admin/team'),
      ]);
      const cData = await cRes.json();
      const tData = await tRes.json();
      setCourses(cData.courses ?? []);
      setInstructors(tData.members ?? []);
    } catch {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadData(); }, []);

  // ── Duplicate order check ──────────────────────────────────────────────────

  const duplicateOrder = useMemo(
    () => courses.some((c) => c._id !== editingId && c.order === Number(form.order)),
    [courses, editingId, form.order],
  );

  const orderedCourses = useMemo(
    () => [...courses].sort((a, b) => (a.order || 1) - (b.order || 1)),
    [courses],
  );

  // ── Helpers ────────────────────────────────────────────────────────────────

  function openAdd() {
    setEditingId(null);
    setForm({ ...emptyForm, order: courses.length + 1 });
    setCoverFile(null);
    setView('form');
  }

  function openEdit(course: Course) {
    setEditingId(course._id);
    const instructorId = typeof course.instructor === 'object'
      ? course.instructor._id
      : course.instructor;
    setForm({
      title:          course.title,
      slug:           course.slug,
      coverImage:     course.coverImage,
      summary:        course.summary,
      description:    course.description,
      category:       course.category,
      level:          course.level,
      language:       course.language || 'English',
      duration:       course.duration,
      hoursPerWeek:   course.hoursPerWeek || '',
      totalLectures:  course.totalLectures?.toString() || '',
      instructor:     instructorId,
      fees:           course.fees || [],
      curriculum:     course.curriculum || [],
      learningPoints: course.learningPoints || [],
      requirements:   course.requirements || [],
      tags:           (course.tags || []).join(', '),
      featured:       course.featured,
      isActive:       course.isActive,
      order:          course.order,
      enrollmentLink: course.enrollmentLink || '',
    });
    setCoverFile(null);
    setView('form');
  }

  function cancelForm() {
    setView('list');
    setEditingId(null);
    setForm({ ...emptyForm });
    setCoverFile(null);
  }

  // ── Save ───────────────────────────────────────────────────────────────────

  async function handleSave() {
    if (!form.title.trim())        { toast.error('Title is required.');       return; }
    if (!form.summary.trim())      { toast.error('Summary is required.');     return; }
    if (!form.description.trim())  { toast.error('Description is required.'); return; }
    if (!form.category.trim())     { toast.error('Category is required.');    return; }
    if (!form.duration.trim())     { toast.error('Duration is required.');    return; }
    if (!form.instructor)          { toast.error('Instructor is required.');  return; }
    if (!form.coverImage.trim() && !coverFile) { toast.error('Cover image is required.'); return; }
    if (duplicateOrder)            { toast.error('Order number already exists.'); return; }

    setSaving(true);
    try {
      const coverImage = coverFile
        ? await uploadToCloudinary(coverFile, 'courses')
        : form.coverImage;

      const payload = {
        ...form,
        coverImage,
        tags:         form.tags.split(',').map((t) => t.trim()).filter(Boolean),
        totalLectures: form.totalLectures ? Number(form.totalLectures) : undefined,
        order:        Number(form.order),
      };

      const url    = editingId ? `/api/admin/courses/${editingId}` : '/api/admin/courses';
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) { toast.error(data.message ?? 'Failed to save course.'); return; }

      toast.success(editingId ? 'Course updated.' : 'Course created.');
      cancelForm();
      await loadData();
    } catch {
      toast.error('Something went wrong.');
    } finally {
      setSaving(false);
    }
  }

  // ── Delete ─────────────────────────────────────────────────────────────────

  function handleDelete(course: Course) {
    onDelete({
      title: 'Delete Course',
      description: `Delete "${course.title}"? This cannot be undone.`,
      confirmLabel: 'Delete',
      onConfirm: async () => {
        const res = await fetch(`/api/admin/courses/${course._id}`, { method: 'DELETE' });
        if (!res.ok) { toast.error('Failed to delete.'); return; }
        toast.success('Course deleted.');
        await loadData();
      },
    });
  }

  // ── Toggle active ──────────────────────────────────────────────────────────

  async function toggleActive(course: Course) {
    try {
      await fetch(`/api/admin/courses/${course._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...course,
          instructor: typeof course.instructor === 'object' ? course.instructor._id : course.instructor,
          tags: course.tags,
          isActive: !course.isActive,
        }),
      });
      setCourses((prev) => prev.map((c) => c._id === course._id ? { ...c, isActive: !c.isActive } : c));
      toast.success(course.isActive ? 'Course hidden.' : 'Course visible.');
    } catch {
      toast.error('Failed to update status.');
    }
  }

  // ── Loading ────────────────────────────────────────────────────────────────

  if (loading) return <div className="flex items-center justify-center py-24"><Spinner size="lg" /></div>;

  // ── FORM VIEW ──────────────────────────────────────────────────────────────

  if (view === 'form') return (
    <div className="p-5 min-[320px]:max-[500px]:p-[6px]">
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <CardTitle>{editingId ? 'Edit Course' : 'Add New Course'}</CardTitle>
              <CardDescription className="mt-1">Create a course with instructor, curriculum, and pricing details.</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="default" size="sm" onClick={() => setView('list')} className="gap-1.5 text-xs">
                <ArrowLeft className="w-3.5 h-3.5" /> All Courses
              </Button>
              {editingId && (
                <Button type="button" variant="ghost" size="sm" onClick={cancelForm} className="text-xs">Cancel</Button>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="grid grid-cols-1 gap-5">

            {/* Basic Info */}
            <div className="space-y-4 rounded-2xl border border-gray-200 bg-white p-6">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2"><BookOpen className="w-4 h-4 text-primary" /> Basic Info</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-medium text-gray-900 uppercase tracking-wide">Title *</label>
                  <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Full Stack Web Development Bootcamp" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-900 uppercase tracking-wide">Category *</label>
                  <Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="e.g. Web Development, AI, Design" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-900 uppercase tracking-wide">Level</label>
                  <select
                    value={form.level}
                    onChange={(e) => setForm({ ...form, level: e.target.value })}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    {LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-medium text-gray-900 uppercase tracking-wide">Summary * (short description)</label>
                  <Textarea value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} rows={2} placeholder="One-line course summary shown on listing page" className="resize-none" />
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-medium text-gray-900 uppercase tracking-wide">Full Description *</label>
                  <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={5} placeholder="Detailed course description..." />
                </div>
              </div>
            </div>

            {/* Cover Image */}
            <div className="space-y-3 rounded-2xl border border-gray-200 bg-white p-6">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2"><ImagePlus className="w-4 h-4 text-primary" /> Cover Image *</h3>
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => setCoverFile(e.target.files?.[0] || null)}
              />
              <p className="text-[11px] text-gray-500">Selected image uploads to Cloudinary when you save.</p>
              {!coverFile && form.coverImage && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={form.coverImage} alt="cover" className="w-full h-40 object-cover rounded-xl border border-gray-200" />
              )}
              {coverFile && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={URL.createObjectURL(coverFile)} alt="cover preview" className="w-full h-40 object-cover rounded-xl border border-gray-200" />
              )}
            </div>

            {/* Duration & Instructor */}
            <div className="rounded-2xl border border-gray-200 bg-white p-6 space-y-4">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2"><Clock className="w-4 h-4 text-primary" /> Duration & Instructor</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-900 uppercase tracking-wide">Duration *</label>
                  <Input value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} placeholder="e.g. 3 Months, 6 Weeks" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-900 uppercase tracking-wide">Hours / Week</label>
                  <Input value={form.hoursPerWeek} onChange={(e) => setForm({ ...form, hoursPerWeek: e.target.value })} placeholder="e.g. 8-10 hours/week" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-900 uppercase tracking-wide">Total Lectures</label>
                  <Input type="number" value={form.totalLectures} onChange={(e) => setForm({ ...form, totalLectures: e.target.value })} placeholder="e.g. 48" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-900 uppercase tracking-wide">Language</label>
                  <Input value={form.language} onChange={(e) => setForm({ ...form, language: e.target.value })} placeholder="e.g. English, Urdu" />
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-medium text-gray-900 uppercase tracking-wide">Instructor *</label>
                  <select
                    value={form.instructor}
                    onChange={(e) => setForm({ ...form, instructor: e.target.value })}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="">-- Select Instructor --</option>
                    {instructors.map((m) => (
                      <option key={m._id} value={m._id}>{m.name} — {m.designation}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Fee Structure */}
            <div className="rounded-2xl border border-gray-200 bg-white p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2"><DollarSign className="w-4 h-4 text-primary" /> Fee Structure</h3>
                <Button
                  type="button" size="sm" variant="ghost" className="h-7 px-2.5 text-xs gap-1"
                  onClick={() => setForm({ ...form, fees: [...form.fees, { label: '', amount: '', currency: 'PKR', description: '' }] })}
                >
                  <Plus className="w-3 h-3" /> Add Fee
                </Button>
              </div>
              {form.fees.length === 0 && <p className="text-xs text-gray-400">No fee entries yet. Click &quot;Add Fee&quot; to add.</p>}
              {form.fees.map((fee, i) => (
                <div key={i} className="grid grid-cols-1 sm:grid-cols-2 gap-2 rounded-xl border border-gray-100 p-3 relative">
                  <button type="button" onClick={() => setForm({ ...form, fees: form.fees.filter((_, idx) => idx !== i) })}
                    className="absolute top-2 right-2 w-5 h-5 flex items-center justify-center rounded-full bg-red-50 text-red-400 hover:bg-red-100 text-[10px]">✕</button>
                  <Input value={fee.label} onChange={(e) => { const f = [...form.fees]; f[i] = { ...f[i], label: e.target.value }; setForm({ ...form, fees: f }); }} placeholder="Label e.g. One-time, Monthly *" />
                  <Input value={String(fee.amount)} onChange={(e) => { const f = [...form.fees]; f[i] = { ...f[i], amount: e.target.value }; setForm({ ...form, fees: f }); }} placeholder="Amount e.g. 25000, Free *" />
                  <Input value={fee.currency} onChange={(e) => { const f = [...form.fees]; f[i] = { ...f[i], currency: e.target.value }; setForm({ ...form, fees: f }); }} placeholder="Currency e.g. PKR" />
                  <Input value={fee.description} onChange={(e) => { const f = [...form.fees]; f[i] = { ...f[i], description: e.target.value }; setForm({ ...form, fees: f }); }} placeholder="Note e.g. Includes all materials" />
                </div>
              ))}
            </div>

            {/* Curriculum */}
            <div className="rounded-2xl border border-gray-200 bg-white p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2"><List className="w-4 h-4 text-primary" /> Curriculum</h3>
                <Button
                  type="button" size="sm" variant="ghost" className="h-7 px-2.5 text-xs gap-1"
                  onClick={() => setForm({ ...form, curriculum: [...form.curriculum, { week: '', topic: '', details: '' }] })}
                >
                  <Plus className="w-3 h-3" /> Add Week
                </Button>
              </div>
              {form.curriculum.length === 0 && <p className="text-xs text-gray-400">No curriculum added yet.</p>}
              {form.curriculum.map((row, i) => (
                <div key={i} className="grid grid-cols-1 sm:grid-cols-3 gap-2 rounded-xl border border-gray-100 p-3 relative">
                  <button type="button" onClick={() => setForm({ ...form, curriculum: form.curriculum.filter((_, idx) => idx !== i) })}
                    className="absolute top-2 right-2 w-5 h-5 flex items-center justify-center rounded-full bg-red-50 text-red-400 hover:bg-red-100 text-[10px]">✕</button>
                  <Input value={row.week} onChange={(e) => { const c = [...form.curriculum]; c[i] = { ...c[i], week: e.target.value }; setForm({ ...form, curriculum: c }); }} placeholder="Week e.g. Week 1–2 *" />
                  <Input value={row.topic} onChange={(e) => { const c = [...form.curriculum]; c[i] = { ...c[i], topic: e.target.value }; setForm({ ...form, curriculum: c }); }} placeholder="Topic *" />
                  <Input value={row.details} onChange={(e) => { const c = [...form.curriculum]; c[i] = { ...c[i], details: e.target.value }; setForm({ ...form, curriculum: c }); }} placeholder="Details (optional)" />
                </div>
              ))}
            </div>

            {/* Learning Points & Requirements */}
            <div className="rounded-2xl border border-gray-200 bg-white p-6 space-y-5">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2"><GraduationCap className="w-4 h-4 text-primary" /> What You will Learn & Requirements</h3>

              {/* Learning Points */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-gray-900 uppercase tracking-wide">Learning Points</label>
                  <Button type="button" size="sm" variant="ghost" className="h-7 px-2.5 text-xs gap-1"
                    onClick={() => setForm({ ...form, learningPoints: [...form.learningPoints, ''] })}>
                    <Plus className="w-3 h-3" /> Add
                  </Button>
                </div>
                {form.learningPoints.map((pt, i) => (
                  <div key={i} className="flex gap-2">
                    <Input value={pt} onChange={(e) => { const lp = [...form.learningPoints]; lp[i] = e.target.value; setForm({ ...form, learningPoints: lp }); }} placeholder={`Learning point ${i + 1}`} />
                    <button type="button" onClick={() => setForm({ ...form, learningPoints: form.learningPoints.filter((_, idx) => idx !== i) })}
                      className="w-8 h-8 shrink-0 flex items-center justify-center rounded-lg bg-red-50 text-red-400 hover:bg-red-100">✕</button>
                  </div>
                ))}
              </div>

              {/* Requirements */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-gray-900 uppercase tracking-wide">Requirements / Prerequisites</label>
                  <Button type="button" size="sm" variant="ghost" className="h-7 px-2.5 text-xs gap-1"
                    onClick={() => setForm({ ...form, requirements: [...form.requirements, ''] })}>
                    <Plus className="w-3 h-3" /> Add
                  </Button>
                </div>
                {form.requirements.map((req, i) => (
                  <div key={i} className="flex gap-2">
                    <Input value={req} onChange={(e) => { const r = [...form.requirements]; r[i] = e.target.value; setForm({ ...form, requirements: r }); }} placeholder={`Requirement ${i + 1}`} />
                    <button type="button" onClick={() => setForm({ ...form, requirements: form.requirements.filter((_, idx) => idx !== i) })}
                      className="w-8 h-8 shrink-0 flex items-center justify-center rounded-lg bg-red-50 text-red-400 hover:bg-red-100">✕</button>
                  </div>
                ))}
              </div>
            </div>

            {/* Tags, Order, Settings */}
            <div className="rounded-2xl border border-gray-200 bg-white p-6 space-y-4">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2"><Tag className="w-4 h-4 text-primary" /> Tags & Settings</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-medium text-gray-900 uppercase tracking-wide flex items-center gap-1"><Tag className="w-3 h-3" /> Tags (comma separated)</label>
                  <Input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="React, Node.js, MongoDB" />
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-medium text-gray-900 uppercase tracking-wide flex items-center gap-1"><Link2 className="w-3 h-3" /> Enrollment Link (optional)</label>
                  <Input value={form.enrollmentLink} onChange={(e) => setForm({ ...form, enrollmentLink: e.target.value })} placeholder="https://..." />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-900 uppercase tracking-wide flex items-center gap-1"><Hash className="w-3 h-3" /> Display Order *</label>
                  <Input type="number" min={1} value={form.order} onChange={(e) => setForm({ ...form, order: Number(e.target.value) })} className="max-w-[120px]" />
                  {duplicateOrder && <p className="text-xs text-red-400">This order number already exists.</p>}
                </div>
                <div className="flex flex-col gap-3 pt-5">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} className="w-4 h-4 accent-primary" />
                    <span className="text-sm text-gray-700 flex items-center gap-1"><Star className="w-3.5 h-3.5 text-primary" /> Featured course</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="w-4 h-4 accent-primary" />
                    <span className="text-sm text-gray-700 flex items-center gap-1"><Globe className="w-3.5 h-3.5 text-primary" /> Visible on site</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Save */}
            <div className="flex items-center gap-3">
              <Button type="submit" disabled={saving || duplicateOrder} className="flex items-center gap-2">
                {saving ? <Spinner size="sm" /> : <CheckCircle2 className="w-4 h-4" />}
                {editingId ? 'Update Course' : 'Create Course'}
              </Button>
              <Button type="button" onClick={cancelForm} variant="ghost">Cancel</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );

  // ── LIST VIEW ──────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between px-4 pt-2 flex-wrap gap-2">
        <div className="flex items-center gap-2 text-xs text-gray-900">
          <BookOpen className="w-4 h-4" />
          <span><span className="font-semibold text-gray-900">{courses.length}</span> courses</span>
          {courses.filter((c) => c.featured).length > 0 && (
            <>
              <span className="text-gray-900">·</span>
              <span className="text-primary font-medium flex items-center gap-1">
                <Star className="w-3 h-3" /> {courses.filter((c) => c.featured).length} featured
              </span>
            </>
          )}
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="ghost" onClick={openAdd} className="text-xs gap-1.5">
            <Plus className="w-3.5 h-3.5" /> New Course
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-[860px] w-full text-sm">
          <thead>
            <tr className="border-b border-primary-100">
              {['Course', 'Instructor', 'Tags', 'Order', 'Actions'].map((h) => (
                <th key={h} className="text-left px-4 py-3.5 text-gray-900 font-mono text-xs uppercase tracking-[0.18em]">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-primary-100">
            {orderedCourses.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-16 text-center">
                  <div className="flex flex-col items-center gap-2 text-gray-900">
                    <BookOpen className="w-8 h-8 opacity-30" />
                    <span className="text-sm">No courses yet.</span>
                    <Button size="sm" variant="default" onClick={openAdd} className="mt-1 text-xs gap-1">
                      <Plus className="w-3 h-3" /> Add first course
                    </Button>
                  </div>
                </td>
              </tr>
            ) : (
              orderedCourses.map((course) => {
                const instructor = typeof course.instructor === 'object' ? course.instructor : null;
                return (
                  <tr key={course._id} className="align-middle hover:bg-primary-100 transition-colors">
                    <td className="px-4 py-3.5 max-w-[280px]">
                      <div className="flex items-center gap-3">
                        <div className="relative h-12 w-16 overflow-hidden rounded-lg bg-gray-100 shrink-0">
                          {course.coverImage && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={course.coverImage} alt={course.title} className="h-full w-full object-cover" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            {course.featured && <Star className="w-3.5 h-3.5 text-primary flex-shrink-0" />}
                            <span className="font-medium text-gray-900 truncate">{course.title}</span>
                          </div>
                          <p className="text-[11px] text-gray-600 truncate mt-0.5 max-w-[220px]">{course.category} · {course.level}</p>
                          {course.summary && <p className="text-[11px] text-gray-600 truncate mt-0.5 max-w-[240px]">{course.summary}</p>}
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3.5">
                      <div className="min-w-0 max-w-[180px]">
                        <p className="font-medium text-gray-900 truncate">{instructor?.name || '—'}</p>
                        <p className="text-[11px] text-gray-600 truncate mt-0.5">{instructor?.designation || 'No instructor'}</p>
                      </div>
                    </td>

                    <td className="px-4 py-3.5">
                      <div className="flex flex-wrap gap-1 max-w-[220px]">
                        {course.tags?.slice(0, 3).map((t) => (
                          <span key={t} className="inline-flex items-center gap-0.5 rounded-full bg-gray-100 px-2 py-0.5 text-[11px] text-gray-600">
                            <Tag className="w-2.5 h-2.5" />{t}
                          </span>
                        ))}
                        {(course.tags?.length ?? 0) > 3 && (
                          <span className="text-[11px] text-gray-600">+{(course.tags?.length ?? 0) - 3}</span>
                        )}
                        {(!course.tags || course.tags.length === 0) && <span className="text-[11px] text-gray-600">—</span>}
                      </div>
                    </td>

                    <td className="px-4 py-3.5 text-gray-900 text-xs text-center">{course.order ?? 1}</td>

                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <Button type="button" size="sm" variant="ghost"
                          className="h-8 w-8 !p-0 justify-center"
                          onClick={() => openEdit(course)} aria-label="Edit">
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        <Button type="button" size="sm" variant="ghost"
                          className="h-8 px-2.5 text-xs"
                          onClick={() => toggleActive(course)}>
                          {course.isActive ? 'Hide' : 'Show'}
                        </Button>
                        <Button type="button" size="sm" variant="destructive"
                          className="h-8 w-8 !p-0 justify-center"
                          onClick={() => handleDelete(course)} aria-label="Delete">
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}