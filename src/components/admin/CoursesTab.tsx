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
    <div className="space-y-6 max-w-3xl">

      {/* Header */}
      <div className="flex items-center gap-3">
        <Button onClick={cancelForm} variant="ghost" size="sm" className="gap-1.5">
          <ArrowLeft className="w-4 h-4" /> Back
        </Button>
        <div>
          <h2 className="text-xl font-bold text-gray-900">{editingId ? 'Edit Course' : 'New Course'}</h2>
          <p className="text-xs text-gray-500">Fill in the details below</p>
        </div>
      </div>

      {/* Basic Info */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 space-y-4">
        <h3 className="font-semibold text-gray-900 flex items-center gap-2"><BookOpen className="w-4 h-4 text-primary" /> Basic Info</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1 sm:col-span-2">
            <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">Title *</label>
            <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Full Stack Web Development Bootcamp" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">Category *</label>
            <Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="e.g. Web Development, AI, Design" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">Level</label>
            <select
              value={form.level}
              onChange={(e) => setForm({ ...form, level: e.target.value })}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              {LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
          <div className="space-y-1 sm:col-span-2">
            <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">Summary * (short description)</label>
            <Textarea value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} rows={2} placeholder="One-line course summary shown on listing page" className="resize-none" />
          </div>
          <div className="space-y-1 sm:col-span-2">
            <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">Full Description *</label>
            <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={5} placeholder="Detailed course description..." />
          </div>
        </div>
      </div>

      {/* Cover Image */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 space-y-3">
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
            <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">Duration *</label>
            <Input value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} placeholder="e.g. 3 Months, 6 Weeks" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">Hours / Week</label>
            <Input value={form.hoursPerWeek} onChange={(e) => setForm({ ...form, hoursPerWeek: e.target.value })} placeholder="e.g. 8-10 hours/week" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">Total Lectures</label>
            <Input type="number" value={form.totalLectures} onChange={(e) => setForm({ ...form, totalLectures: e.target.value })} placeholder="e.g. 48" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">Language</label>
            <Input value={form.language} onChange={(e) => setForm({ ...form, language: e.target.value })} placeholder="e.g. English, Urdu" />
          </div>
          <div className="space-y-1 sm:col-span-2">
            <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">Instructor *</label>
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
            <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">Learning Points</label>
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
            <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">Requirements / Prerequisites</label>
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
            <label className="text-xs font-medium text-gray-600 uppercase tracking-wide flex items-center gap-1"><Tag className="w-3 h-3" /> Tags (comma separated)</label>
            <Input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="React, Node.js, MongoDB" />
          </div>
          <div className="space-y-1 sm:col-span-2">
            <label className="text-xs font-medium text-gray-600 uppercase tracking-wide flex items-center gap-1"><Link2 className="w-3 h-3" /> Enrollment Link (optional)</label>
            <Input value={form.enrollmentLink} onChange={(e) => setForm({ ...form, enrollmentLink: e.target.value })} placeholder="https://..." />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-600 uppercase tracking-wide flex items-center gap-1"><Hash className="w-3 h-3" /> Display Order *</label>
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
        <Button onClick={handleSave} disabled={saving || duplicateOrder} className="flex items-center gap-2">
          {saving ? <Spinner size="sm" /> : <CheckCircle2 className="w-4 h-4" />}
          {editingId ? 'Update Course' : 'Create Course'}
        </Button>
        <Button onClick={cancelForm} variant="ghost">Cancel</Button>
      </div>
    </div>
  );

  // ── LIST VIEW ──────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Courses</h2>
          <p className="text-sm text-gray-500 mt-0.5">{courses.length} course{courses.length !== 1 ? 's' : ''} total</p>
        </div>
        <Button onClick={openAdd} size="sm" className="flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Course
        </Button>
      </div>

      {courses.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center gap-3 rounded-2xl border border-dashed border-gray-200">
          <BookOpen className="w-10 h-10 text-gray-300" />
          <p className="text-gray-500 font-medium">No courses yet</p>
          <p className="text-gray-400 text-sm">Click &quot;Add Course&quot; to create your first course.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {courses.map((course) => {
            const instructor = typeof course.instructor === 'object' ? course.instructor : null;
            return (
              <div key={course._id} className={`rounded-2xl border bg-white overflow-hidden transition-opacity ${!course.isActive ? 'opacity-60' : ''}`}>
                {/* Cover */}
                <div className="relative h-40 bg-gray-100">
                  {course.coverImage && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={course.coverImage} alt={course.title} className="w-full h-full object-cover" />
                  )}
                  <span className="absolute top-2 left-2 text-[10px] font-semibold bg-black/60 text-white px-2 py-0.5 rounded-full">
                    #{course.order}
                  </span>
                  {course.featured && (
                    <span className="absolute top-2 right-2 text-[10px] font-semibold bg-primary/90 text-white px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Star className="w-2.5 h-2.5" /> Featured
                    </span>
                  )}
                  <span className={`absolute bottom-2 right-2 text-[10px] font-semibold px-2 py-0.5 rounded-full ${course.isActive ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                    {course.isActive ? 'Active' : 'Hidden'}
                  </span>
                </div>

                {/* Info */}
                <div className="p-4">
                  <p className="text-[10px] font-semibold text-primary uppercase tracking-wide mb-1">{course.category} · {course.level}</p>
                  <h3 className="font-bold text-gray-900 text-sm leading-snug mb-1 line-clamp-2">{course.title}</h3>
                  <p className="text-xs text-gray-500 line-clamp-2 mb-3">{course.summary}</p>
                  <div className="flex items-center gap-3 text-xs text-gray-500 mb-4">
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {course.duration}</span>
                    {instructor && <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {instructor.name}</span>}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button onClick={() => openEdit(course)} variant="ghost" size="sm" className="h-7 px-2.5 text-xs gap-1 flex-1">
                      <Pencil className="w-3 h-3" /> Edit
                    </Button>
                    <Button onClick={() => toggleActive(course)} variant="ghost" size="sm" className="h-7 px-2.5 text-xs">
                      {course.isActive ? 'Hide' : 'Show'}
                    </Button>
                    <Button onClick={() => handleDelete(course)} variant="ghost" size="sm" className="h-7 px-2.5 text-xs text-red-500 hover:text-red-600 hover:border-red-200">
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}