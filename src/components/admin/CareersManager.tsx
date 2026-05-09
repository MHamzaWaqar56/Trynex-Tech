
// "use client";

// import { useEffect, useState } from 'react';
// import type { FormEvent } from 'react';
// import { useRouter } from 'next/navigation';
// import { toast } from 'sonner';
// import { ArrowLeft, Calendar, Pencil, Plus, Trash2 } from 'lucide-react';
// import { Button } from '@/components/ui/button';
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
// import { Badge } from '@/components/ui/badge';
// import { Input } from '@/components/ui/input';
// import { Textarea } from '@/components/ui/textarea';
// import { slugify } from '@/lib/utils';
// import ConfirmDialog from '@/components/admin/ConfirmDialog';

// type CareerVacancy = {
//   _id: string;
//   title: string;
//   slug: string;
//   department: string;
//   location: string;
//   employmentType: string;
//   salary?: string;
//   description: string;
//   responsibilities: string[];
//   requirements: string[];
//   perks: string[];
//   applicationDeadline?: string;
//   featured?: boolean;
//   open?: boolean;
//   order?: number;
// };

// type VacancyForm = {
//   title: string;
//   department: string;
//   location: string;
//   employmentType: string;
//   salary: string;
//   description: string;
//   responsibilities: string;
//   requirements: string;
//   perks: string;
//   applicationDeadline: string;
//   featured: boolean;
//   open: boolean;
//   order: number;
// };

// const vacancyFormBase: VacancyForm = {
//   title: '',
//   department: '',
//   location: '',
//   employmentType: 'Full-time',
//   salary: '',
//   description: '',
//   responsibilities: '',
//   requirements: '',
//   perks: '',
//   applicationDeadline: '',
//   featured: false,
//   open: true,
//   order: 1,
// };

// function normalizePositiveOrder(value: number) {
//   const parsedValue = Math.trunc(Number(value) || 1);
//   return parsedValue > 0 ? parsedValue : 1;
// }

// function splitList(value: string) {
//   return value.split(',').map((item) => item.trim()).filter(Boolean);
// }

// type CareersManagerProps = {
//   view?: 'form' | 'list';
// };

// export default function CareersManager({ view = 'form' }: CareersManagerProps) {
//   const router = useRouter();
//   const [loading, setLoading] = useState(true);
//   const [saving, setSaving] = useState(false);
//   const [editingId, setEditingId] = useState<string | null>(null);
//   const [vacancies, setVacancies] = useState<CareerVacancy[]>([]);
//   const [form, setForm] = useState<VacancyForm>(vacancyFormBase);
//   const [deleteTarget, setDeleteTarget] = useState<CareerVacancy | null>(null);
//   const [deleteBusy, setDeleteBusy] = useState(false);

//   const loadVacancies = async () => {
//     setLoading(true);
//     try {
//       const auth = await fetch('/api/admin/me');
//       if (!auth.ok) { router.push('/admin/login'); return; }

//       const res = await fetch('/api/admin/careers');
//       const data = await res.json().catch(() => null);
//       if (res.ok) {
//         setVacancies(Array.isArray(data?.vacancies) ? data.vacancies : []);
//       } else {
//         toast.error(data?.error || 'Unable to load vacancies.');
//       }
//     } catch {
//       toast.error('Unable to load vacancies.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => { loadVacancies(); }, []);

//   const resetForm = () => {
//     setEditingId(null);
//     setForm(vacancyFormBase);
//   };

//   const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
//     event.preventDefault();
//     setSaving(true);

//     const payload = {
//       title: form.title,
//       slug: slugify(form.title),
//       department: form.department,
//       location: form.location,
//       employmentType: form.employmentType,
//       salary: form.salary,
//       description: form.description,
//       responsibilities: splitList(form.responsibilities),
//       requirements: splitList(form.requirements),
//       perks: splitList(form.perks),
//       applicationDeadline: form.applicationDeadline,
//       featured: form.featured,
//       open: form.open,
//       order: normalizePositiveOrder(form.order),
//     };

//     try {
//       const res = editingId
//         ? await fetch(`/api/admin/careers/${editingId}`, {
//             method: 'PUT',
//             headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify(payload),
//           })
//         : await fetch('/api/admin/careers', {
//             method: 'POST',
//             headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify(payload),
//           });

//       if (!res.ok) {
//         toast.error(editingId ? 'Vacancy update failed.' : 'Vacancy creation failed.');
//         return;
//       }

//       toast.success(editingId ? 'Vacancy updated.' : 'Vacancy created.');
//       resetForm();
//       await loadVacancies();
//     } catch {
//       toast.error('Network error. Please try again.');
//     } finally {
//       setSaving(false);
//     }
//   };

//   const onEdit = (vacancy: CareerVacancy) => {
//     if (view === 'list') {
//       router.push(`/admin?tab=careers&editVacancy=${vacancy._id}`);
//       return;
//     }
//     setEditingId(vacancy._id);
//     setForm({
//       title: vacancy.title,
//       department: vacancy.department,
//       location: vacancy.location,
//       employmentType: vacancy.employmentType,
//       salary: vacancy.salary || '',
//       description: vacancy.description,
//       responsibilities: vacancy.responsibilities.join(', '),
//       requirements: vacancy.requirements.join(', '),
//       perks: vacancy.perks.join(', '),
//       applicationDeadline: vacancy.applicationDeadline || '',
//       featured: Boolean(vacancy.featured),
//       open: vacancy.open !== false,
//       order: normalizePositiveOrder(vacancy.order || 1),
//     });
//   };

//   const confirmDelete = async () => {
//     if (!deleteTarget) return;
//     setDeleteBusy(true);
//     try {
//       const res = await fetch(`/api/admin/careers/${deleteTarget._id}`, { method: 'DELETE' });
//       if (res.ok) {
//         toast.success('Vacancy deleted.');
//         if (editingId === deleteTarget._id) resetForm();
//         setDeleteTarget(null);
//         await loadVacancies();
//       } else {
//         toast.error('Vacancy delete failed.');
//       }
//     } catch {
//       toast.error('Vacancy delete failed.');
//     } finally {
//       setDeleteBusy(false);
//     }
//   };

//   const vacancyCount = vacancies.length;
//   const openCount = vacancies.filter((v) => v.open !== false).length;
//   const latestOrder = vacancies.length > 0 ? Math.max(...vacancies.map((v) => v.order || 0)) : 0;

//   if (loading) {
//     return <div className="min-h-screen bg-dark text-white flex items-center justify-center">Loading vacancies...</div>;
//   }

//   if (view === 'list') {
//     return (
//       <div className="relative min-h-screen overflow-hidden bg-[#050814] pt-[5rem] text-white">
//         <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(0,212,255,0.14),transparent_28%),radial-gradient(circle_at_top_right,rgba(255,107,53,0.12),transparent_24%),linear-gradient(180deg,#050814_0%,#070b14_42%,#050814_100%)]" />
//         <div className="container-custom relative z-10 py-8 lg:py-10">
//           <div className="mb-8 rounded-[28px] border border-white/10 bg-white/[0.04] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.45)] backdrop-blur-xl lg:p-8">
//             <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
//               <div className="space-y-3">
//                 <Button variant="ghost" className="w-fit rounded-full border border-white/10 bg-white/[0.03] text-dark-muted hover:text-white" onClick={() => router.push('/admin')}>
//                   <ArrowLeft className="h-4 w-4" /> Back to Dashboard
//                 </Button>
//                 <div>
//                   <p className="text-xs uppercase tracking-[0.24em] text-dark-muted font-mono">Vacancy Management</p>
//                   <h1 className="mt-2 text-3xl font-display font-bold sm:text-4xl">All Vacancies</h1>
//                   <p className="mt-3 max-w-2xl text-sm leading-6 text-dark-muted sm:text-base">
//                     Edit or delete vacancies from a dedicated workspace.
//                   </p>
//                 </div>
//                 <div className="flex flex-wrap gap-3">
//                   <Button onClick={() => router.push('/admin?tab=careers')} className="rounded-full px-5 shadow-[0_12px_30px_rgba(0,212,255,0.18)]">
//                     <Plus className="h-4 w-4" /> Open Vacancy Form
//                   </Button>
//                   <Button variant="ghost" className="rounded-full border border-white/10 px-5 text-dark-muted hover:text-white" onClick={() => router.push('/admin/careers/applications')}>
//                     <Calendar className="h-4 w-4" /> Open Applications
//                   </Button>
//                 </div>
//               </div>
//               <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
//                 <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
//                   <p className="text-[11px] uppercase tracking-[0.2em] text-dark-muted">Total</p>
//                   <p className="mt-2 text-2xl font-display font-bold">{vacancyCount}</p>
//                 </div>
//                 <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
//                   <p className="text-[11px] uppercase tracking-[0.2em] text-dark-muted">Open</p>
//                   <p className="mt-2 text-2xl font-display font-bold">{openCount}</p>
//                 </div>
//                 <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:col-span-1 col-span-2">
//                   <p className="text-[11px] uppercase tracking-[0.2em] text-dark-muted">Latest Order</p>
//                   <p className="mt-2 text-2xl font-display font-bold">{latestOrder}</p>
//                 </div>
//               </div>
//             </div>
//           </div>

//           <Card className="overflow-hidden border-white/10 bg-white/[0.03] shadow-[0_22px_60px_rgba(0,0,0,0.35)] backdrop-blur-xl">
//             <CardHeader className="border-b border-white/10 bg-white/[0.02]">
//               <CardTitle>Vacancies</CardTitle>
//               <CardDescription>Manage the public job openings and their visibility.</CardDescription>
//             </CardHeader>
//             <CardContent className="p-5">
//               {vacancies.length === 0 ? (
//                 <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-center text-dark-muted">
//                   No vacancies found.
//                 </div>
//               ) : (
//                 <div className="grid gap-4 lg:grid-cols-2">
//                   {vacancies.map((vacancy) => (
//                     <div key={vacancy._id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 shadow-[0_14px_35px_rgba(0,0,0,0.2)]">
//                       <div className="mb-4 flex items-start justify-between gap-4">
//                         <div className="min-w-0">
//                           <h3 className="truncate text-lg font-semibold text-white">{vacancy.title}</h3>
//                           <p className="mt-1 text-xs text-dark-muted">/{vacancy.slug}</p>
//                           <p className="mt-2 text-xs text-dark-muted">{vacancy.department} • {vacancy.location} • {vacancy.employmentType}</p>
//                         </div>
//                         <div className="flex flex-wrap gap-2 justify-end">
//                           {vacancy.featured && <Badge variant="default">Featured</Badge>}
//                           <Badge variant={vacancy.open ? 'success' : 'warning'}>{vacancy.open ? 'Open' : 'Closed'}</Badge>
//                         </div>
//                       </div>
//                       <p className="line-clamp-3 text-sm leading-6 text-dark-muted">{vacancy.description}</p>
//                       {vacancy.applicationDeadline && (
//                         <p className="mt-2 text-xs text-dark-muted">Deadline: {vacancy.applicationDeadline}</p>
//                       )}
//                       <div className="mt-5 flex flex-wrap gap-2">
//                         <Button type="button" size="sm" onClick={() => onEdit(vacancy)}>
//                           <Pencil className="h-4 w-4" /> Edit
//                         </Button>
//                         <Button type="button" variant="ghost" size="sm" className="text-red-400 hover:text-red-300" onClick={() => setDeleteTarget(vacancy)}>
//                           <Trash2 className="h-4 w-4" /> Delete
//                         </Button>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </CardContent>
//           </Card>
//         </div>

//         <ConfirmDialog
//           open={!!deleteTarget}
//           title="Delete Vacancy?"
//           description={`This will permanently remove "${deleteTarget?.title}" from public listings. This cannot be undone.`}
//           busy={deleteBusy}
//           onConfirm={confirmDelete}
//           onCancel={() => setDeleteTarget(null)}
//         />
//       </div>
//     );
//   }

//   return (
//     <div className="relative min-h-screen overflow-hidden bg-[#050814] pt-[5rem] text-white">
//       <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(0,212,255,0.14),transparent_28%),radial-gradient(circle_at_top_right,rgba(255,107,53,0.12),transparent_24%),linear-gradient(180deg,#050814_0%,#070b14_42%,#050814_100%)]" />
//       <div className="container-custom relative z-10 py-8 lg:py-10">
//         <Card className="overflow-hidden border-white/10 bg-white/[0.03] shadow-[0_22px_60px_rgba(0,0,0,0.35)] backdrop-blur-xl">
//           <CardHeader className="border-b border-white/10 bg-white/[0.02]">
//             <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
//               <CardTitle>{editingId ? 'Edit Vacancy' : 'New Vacancy'}</CardTitle>
//               <div className="flex flex-wrap gap-2">
//                 <Button variant="secondary" size="sm" onClick={() => router.push('/admin/careers')}>
//                   Vacancies
//                 </Button>
//               </div>
//             </div>
//             <CardDescription>Create or update public job openings here.</CardDescription>
//           </CardHeader>
//           <CardContent className="p-5">
//             <form onSubmit={onSubmit} className="grid grid-cols-1 gap-4">
//               <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Job title" />
//               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                 <Input value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} placeholder="Department" />
//                 <Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Location" />
//               </div>
//               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                 <Input value={form.employmentType} onChange={(e) => setForm({ ...form, employmentType: e.target.value })} placeholder="Employment type" />
//                 <Input value={form.salary} onChange={(e) => setForm({ ...form, salary: e.target.value })} placeholder="Salary / compensation" />
//               </div>
//               <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={5} placeholder="Description" />
//               <Input value={form.responsibilities} onChange={(e) => setForm({ ...form, responsibilities: e.target.value })} placeholder="Responsibilities separated by commas" />
//               <Input value={form.requirements} onChange={(e) => setForm({ ...form, requirements: e.target.value })} placeholder="Requirements separated by commas" />
//               <Input value={form.perks} onChange={(e) => setForm({ ...form, perks: e.target.value })} placeholder="Perks separated by commas" />
//               <Input type="date" value={form.applicationDeadline} onChange={(e) => setForm({ ...form, applicationDeadline: e.target.value })} />
//               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                 <label className="flex items-center gap-2 text-sm text-dark-muted">
//                   <input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} />
//                   Featured
//                 </label>
//                 <label className="flex items-center gap-2 text-sm text-dark-muted">
//                   <input type="checkbox" checked={form.open} onChange={(e) => setForm({ ...form, open: e.target.checked })} />
//                   Open vacancy
//                 </label>
//               </div>
//               <Input type="number" min={1} step={1} value={String(form.order)} onChange={(e) => setForm({ ...form, order: normalizePositiveOrder(e.currentTarget.valueAsNumber) })} placeholder="Display order" />
//               <div className="flex flex-wrap gap-3">
//                 <Button type="submit" disabled={saving}>
//                   {saving ? 'Saving...' : <><Plus className="w-4 h-4" /> {editingId ? 'Update Vacancy' : 'Add Vacancy'}</>}
//                 </Button>
//                 {editingId && <Button variant="ghost" size="sm" onClick={resetForm}>Cancel</Button>}
//               </div>
//             </form>
//           </CardContent>
//         </Card>
//       </div>
//     </div>
//   );
// }




















"use client";

import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  ArrowLeft,
  ArrowRight,
  Briefcase,
  Calendar,
  Clock3,
  MapPin,
  Pencil,
  Plus,
  Star,
  TrendingUp,
  Trash2,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { slugify } from '@/lib/utils';
import ConfirmDialog from '@/components/admin/ConfirmDialog';
import { getApplicationAvailabilityLabel, isDeadlineExpired } from '@/lib/careers';

type CareerVacancy = {
  _id: string;
  title: string;
  slug: string;
  department: string;
  location: string;
  employmentType: string;
  salary?: string;
  description: string;
  responsibilities: string[];
  requirements: string[];
  perks: string[];
  applicationDeadline?: string;
  featured?: boolean;
  open?: boolean;
  order?: number;
};

type VacancyForm = {
  title: string;
  department: string;
  location: string;
  employmentType: string;
  salary: string;
  description: string;
  responsibilities: string;
  requirements: string;
  perks: string;
  applicationDeadline: string;
  featured: boolean;
  open: boolean;
  order: number;
};

const vacancyFormBase: VacancyForm = {
  title: '',
  department: '',
  location: '',
  employmentType: 'Full-time',
  salary: '',
  description: '',
  responsibilities: '',
  requirements: '',
  perks: '',
  applicationDeadline: '',
  featured: false,
  open: true,
  order: 1,
};

function normalizePositiveOrder(value: number) {
  const parsedValue = Math.trunc(Number(value) || 1);
  return parsedValue > 0 ? parsedValue : 1;
}

function splitList(value: string) {
  return value.split(',').map((item) => item.trim()).filter(Boolean);
}

type CareersManagerProps = {
  view?: 'form' | 'list';
};

export default function CareersManager({ view = 'form' }: CareersManagerProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [vacancies, setVacancies] = useState<CareerVacancy[]>([]);
  const [form, setForm] = useState<VacancyForm>(vacancyFormBase);
  const [deleteTarget, setDeleteTarget] = useState<CareerVacancy | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);

  const loadVacancies = async () => {
    setLoading(true);
    try {
      const auth = await fetch('/api/admin/me');
      if (!auth.ok) { router.push('/admin/login'); return; }
      const res = await fetch('/api/admin/careers');
      const data = await res.json().catch(() => null);
      if (res.ok) setVacancies(Array.isArray(data?.vacancies) ? data.vacancies : []);
      else toast.error(data?.error || 'Unable to load vacancies.');
    } catch {
      toast.error('Unable to load vacancies.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadVacancies(); }, []);

  const resetForm = () => { setEditingId(null); setForm(vacancyFormBase); };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    const payload = {
      title: form.title,
      slug: slugify(form.title),
      department: form.department,
      location: form.location,
      employmentType: form.employmentType,
      salary: form.salary,
      description: form.description,
      responsibilities: splitList(form.responsibilities),
      requirements: splitList(form.requirements),
      perks: splitList(form.perks),
      applicationDeadline: form.applicationDeadline,
      featured: form.featured,
      open: form.open,
      order: normalizePositiveOrder(form.order),
    };
    try {
      const res = editingId
        ? await fetch(`/api/admin/careers/${editingId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
        : await fetch('/api/admin/careers', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (!res.ok) { toast.error(editingId ? 'Vacancy update failed.' : 'Vacancy creation failed.'); return; }
      toast.success(editingId ? 'Vacancy updated.' : 'Vacancy created.');
      resetForm();
      await loadVacancies();
    } catch {
      toast.error('Network error. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const onEdit = (vacancy: CareerVacancy) => {
    if (view === 'list') { router.push(`/admin?tab=careers&editVacancy=${vacancy._id}`); return; }
    setEditingId(vacancy._id);
    setForm({
      title: vacancy.title,
      department: vacancy.department,
      location: vacancy.location,
      employmentType: vacancy.employmentType,
      salary: vacancy.salary || '',
      description: vacancy.description,
      responsibilities: vacancy.responsibilities.join(', '),
      requirements: vacancy.requirements.join(', '),
      perks: vacancy.perks.join(', '),
      applicationDeadline: vacancy.applicationDeadline || '',
      featured: Boolean(vacancy.featured),
      open: vacancy.open !== false,
      order: normalizePositiveOrder(vacancy.order || 1),
    });
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleteBusy(true);
    try {
      const res = await fetch(`/api/admin/careers/${deleteTarget._id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Vacancy deleted.');
        if (editingId === deleteTarget._id) resetForm();
        setDeleteTarget(null);
        await loadVacancies();
      } else {
        toast.error('Vacancy delete failed.');
      }
    } catch {
      toast.error('Vacancy delete failed.');
    } finally {
      setDeleteBusy(false);
    }
  };

  const vacancyCount = vacancies.length;
  const openCount = vacancies.filter((v) => v.open !== false).length;
  const featuredCount = vacancies.filter((v) => v.featured).length;

  // ─── Loading state ────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center animate-pulse">
            <Briefcase className="w-5 h-5 text-primary" />
          </div>
          <p className="text-sm text-gray-900 font-mono">Loading vacancies...</p>
        </div>
      </div>
    );
  }

  // ─── List view ────────────────────────────────────────────────────
  if (view === 'list') {
    return (
      <div className="min-h-screen bg-white">
        <div className="container-custom py-8 lg:py-12">

          {/* Back button */}
          <div className="mb-6">
            <button type="button" onClick={() => router.push('/admin')} className="btn-ghost text-sm">
              <ArrowLeft className="h-4 w-4" /> Back to Dashboard
            </button>
          </div>

          {/* Page header */}
          <div className="glass-card p-6 sm:p-8 mb-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="mb-3">
                  <span className="section-badge">
                    <Briefcase className="h-3.5 w-3.5" /> Vacancy Management
                  </span>
                </div>
                <h1 className="section-title mb-2">
                  All <span className="gradient-text">Vacancies</span>
                </h1>
                <p className="text-gray-900 text-sm max-w-xl leading-relaxed">
                  Edit or delete vacancies from a dedicated workspace. Use edit to jump back into the create editor.
                </p>
                <div className="flex flex-wrap gap-3 mt-4">
                  <button type="button" onClick={() => router.push('/admin?tab=careers')} className="btn-primary py-2 px-4 text-sm">
                    <Plus className="h-4 w-4" /> New Vacancy
                  </button>
                  <button type="button" onClick={() => router.push('/admin/careers/applications')} className="btn-secondary py-2 px-4 text-sm">
                    <Calendar className="h-4 w-4" /> Applications
                  </button>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-3 lg:shrink-0">
                {[
                  { label: 'Total', value: vacancyCount },
                  { label: 'Open', value: openCount },
                  { label: 'Featured', value: featuredCount },
                ].map(({ label, value }) => (
                  <div key={label} className="glass-card-hover p-4 text-center">
                    <p className="text-[11px] uppercase tracking-widest font-mono text-gray-900 mb-1">{label}</p>
                    <p className="text-2xl font-display font-bold text-gray-900">{value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Section heading */}
          <div className="mb-6">
            <div className="mb-3">
              <span className="section-badge">
                <Briefcase className="h-3.5 w-3.5" /> Open Roles
              </span>
            </div>
            <h2 className="section-title text-2xl sm:text-3xl">
              Current <span className="gradient-text">Vacancies</span>
            </h2>
          </div>

          {/* Vacancy cards — same design as client careers page */}
          {vacancies.length === 0 ? (
            <div className="glass-card p-12 flex flex-col items-center text-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Briefcase className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-display font-bold text-gray-900 mb-2">No Vacancies Yet</h3>
                <p className="text-gray-900 text-sm max-w-sm leading-relaxed">
                  Create your first vacancy from the editor to see it listed here.
                </p>
              </div>
              <button type="button" onClick={() => router.push('/admin?tab=careers')} className="btn-primary mt-2">
                Create First Vacancy <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {vacancies.map((vacancy) => {
                const expired = isDeadlineExpired(vacancy.applicationDeadline);
                return (
                  <article key={vacancy._id} className="glass-card p-6 sm:p-8 flex flex-col">

                    {/* Header */}
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="section-badge text-[10px] py-1 px-2.5">
                            <Briefcase className="w-3 h-3" /> {vacancy.department}
                          </span>
                          {vacancy.featured && (
                            <span className="tag text-[10px] inline-flex items-center gap-1">
                              <Star className="w-2.5 h-2.5" /> Featured
                            </span>
                          )}
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-widest ${
                            vacancy.open !== false
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}>
                            {vacancy.open !== false ? 'Open' : 'Closed'}
                          </span>
                        </div>

                        <h2 className="text-xl font-display font-bold text-gray-900 mb-3">
                          {vacancy.title}
                        </h2>

                        <div className="flex flex-wrap gap-3 text-sm text-gray-900">
                          <span className="flex items-center gap-1.5">
                            <MapPin className="w-4 h-4 text-primary" /> {vacancy.location}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Clock3 className="w-4 h-4 text-primary" /> {vacancy.employmentType}
                          </span>
                          {vacancy.salary && (
                            <span className="flex items-center gap-1.5">
                              <TrendingUp className="w-4 h-4 text-primary" /> {vacancy.salary}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-sm text-gray-900 leading-relaxed mb-4 line-clamp-2 flex-1">
                      {vacancy.description}
                    </p>

                    {/* Requirement tags */}
                    {(vacancy.requirements || []).length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-5">
                        {(vacancy.requirements || []).slice(0, 4).map((req) => (
                          <span key={req} className="tag">{req}</span>
                        ))}
                      </div>
                    )}

                    {/* Footer */}
                    <div className="flex items-center justify-between gap-4 pt-4 border-t border-slate-100 mt-auto">
                      <div className="text-xs text-gray-900 font-mono">
                        {getApplicationAvailabilityLabel(vacancy.applicationDeadline)}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => onEdit(vacancy)}
                          className="btn-primary py-2 px-4 text-sm"
                        >
                          <Pencil className="h-3.5 w-3.5" /> Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(vacancy)}
                          className="btn-secondary py-2 px-4 text-sm text-red-500 hover:text-red-600 hover:border-red-200"
                        >
                          <Trash2 className="h-3.5 w-3.5" /> Delete
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>

        <ConfirmDialog
          open={!!deleteTarget}
          title="Delete Vacancy?"
          description={`This will permanently remove "${deleteTarget?.title}" from public listings. This cannot be undone.`}
          busy={deleteBusy}
          onConfirm={confirmDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      </div>
    );
  }

  // ─── Form view ────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-white">
      <div className="container-custom py-8 lg:py-12 max-w-3xl">

        <div className="mb-6 flex items-center justify-between gap-4">
          <button type="button" onClick={() => router.push('/admin/careers')} className="btn-ghost text-sm">
            <ArrowLeft className="h-4 w-4" /> All Vacancies
          </button>
          <button type="button" onClick={() => router.push('/admin/careers/applications')} className="btn-ghost text-sm">
            <Calendar className="h-4 w-4" /> Applications
          </button>
        </div>

        <div className="glass-card p-6 sm:p-8 mb-6">
          <div className="mb-4">
            <span className="section-badge">
              <Briefcase className="h-3.5 w-3.5" />
              {editingId ? 'Edit Vacancy' : 'New Vacancy'}
            </span>
          </div>
          <h1 className="section-title mb-2">
            {editingId ? 'Update' : 'Create'} <span className="gradient-text">Vacancy</span>
          </h1>
          <p className="text-gray-900 text-sm leading-relaxed">
            Create or update public job openings. They will appear on the careers page immediately.
          </p>
        </div>

        <div className="glass-card p-6 sm:p-8">
          <form onSubmit={onSubmit} className="grid grid-cols-1 gap-5">

            {/* Job title */}
            <div>
              <label className="block text-xs font-mono uppercase tracking-widest text-gray-900 mb-2">Job Title *</label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Senior Frontend Developer" required />
            </div>

            {/* Dept + Location */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono uppercase tracking-widest text-gray-900 mb-2">Department *</label>
                <Input value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} placeholder="e.g. Engineering" required />
              </div>
              <div>
                <label className="block text-xs font-mono uppercase tracking-widest text-gray-900 mb-2">Location *</label>
                <Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="e.g. Remote, Pakistan" required />
              </div>
            </div>

            {/* Employment type + Salary */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono uppercase tracking-widest text-gray-900 mb-2">Employment Type *</label>
                <Input value={form.employmentType} onChange={(e) => setForm({ ...form, employmentType: e.target.value })} placeholder="e.g. Full-time" required />
              </div>
              <div>
                <label className="block text-xs font-mono uppercase tracking-widest text-gray-900 mb-2">Salary / Compensation</label>
                <Input value={form.salary} onChange={(e) => setForm({ ...form, salary: e.target.value })} placeholder="e.g. 80k–120k PKR" />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-mono uppercase tracking-widest text-gray-900 mb-2">Description *</label>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={5} placeholder="Describe the role and what the candidate will work on..." required />
            </div>

            {/* Comma-separated fields */}
            {[
              { label: 'Responsibilities', key: 'responsibilities', placeholder: 'Build features, Review code, Write tests' },
              { label: 'Requirements', key: 'requirements', placeholder: 'React, TypeScript, 3+ years experience' },
              { label: 'Perks', key: 'perks', placeholder: 'Remote work, Flexible hours, Learning budget' },
            ].map(({ label, key, placeholder }) => (
              <div key={key}>
                <label className="block text-xs font-mono uppercase tracking-widest text-gray-900 mb-2">
                  {label} <span className="normal-case tracking-normal opacity-60">(comma-separated)</span>
                </label>
                <Input
                  value={form[key as keyof VacancyForm] as string}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  placeholder={placeholder}
                />
              </div>
            ))}

            {/* Deadline */}
            <div>
              <label className="block text-xs font-mono uppercase tracking-widest text-gray-900 mb-2">Application Deadline</label>
              <Input type="date" value={form.applicationDeadline} onChange={(e) => setForm({ ...form, applicationDeadline: e.target.value })} />
            </div>

            {/* Order */}
            <div>
              <label className="block text-xs font-mono uppercase tracking-widest text-gray-900 mb-2">Display Order</label>
              <Input
                type="number"
                min={1}
                step={1}
                value={String(form.order)}
                onChange={(e) => setForm({ ...form, order: normalizePositiveOrder(e.currentTarget.valueAsNumber) })}
                placeholder="1"
              />
            </div>

            {/* Toggles */}
            <div className="flex flex-wrap gap-6">
              <label className="flex items-center gap-2.5 text-sm text-gray-900 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={form.featured}
                  onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                  className="w-4 h-4 accent-primary"
                />
                Mark as Featured
              </label>
              <label className="flex items-center gap-2.5 text-sm text-gray-900 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={form.open}
                  onChange={(e) => setForm({ ...form, open: e.target.checked })}
                  className="w-4 h-4 accent-primary"
                />
                Open (visible on careers page)
              </label>
            </div>

            {/* Submit */}
            <div className="flex flex-wrap gap-3 pt-2 border-t border-slate-100">
              <button type="submit" disabled={saving} className="btn-primary disabled:opacity-60 disabled:cursor-not-allowed">
                {saving ? 'Saving...' : (
                  <><Plus className="w-4 h-4" /> {editingId ? 'Update Vacancy' : 'Add Vacancy'}</>
                )}
              </button>
              {editingId && (
                <button type="button" onClick={resetForm} className="btn-secondary">
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}