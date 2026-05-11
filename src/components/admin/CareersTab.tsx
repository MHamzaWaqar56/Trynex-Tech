'use client';

import type { FormEvent } from 'react';
import { useState, useEffect, useMemo } from 'react';
import {
  Plus, Trash2, Pencil, ArrowLeft, Send,
  Briefcase, Star, MapPin, Clock, Users,
  CheckCircle2, XCircle, Eye, FileText,
  Calendar, DollarSign, Hash, List, Gift,
  ShieldCheck, Download,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from '@/components/ui/select';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CareerVacancy {
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
}

export interface CareerApplication {
  _id: string;
  vacancyTitle: string;
  vacancySlug: string;
  fullName: string;
  email: string;
  phone?: string;
  linkedin?: string;
  portfolioUrl?: string;
  yearsOfExperience?: string;
  coverLetter: string;
  cvUrl: string;
  cvName?: string;
  status: 'new' | 'reviewed' | 'shortlisted' | 'rejected' | 'hired';
  createdAt: string;
}

interface DeleteDialogState {
  title: string;
  description: string;
  confirmLabel: string;
  onConfirm: () => Promise<void>;
}

interface DetailDialogState {
  title: string;
  subtitle: string;
  fields: Array<{ label: string; value: string }>;
  messageLabel: string;
  message: string;
}

interface Props {
  vacancies: CareerVacancy[];
  applications: CareerApplication[];
  onDelete: (dialog: DeleteDialogState) => void;
  onViewDetails: (dialog: DetailDialogState) => void;
  onRefresh: () => Promise<void>;
  editingId?: string | null;
  onCancelEdit?: () => void;
  onGoToList: () => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function normalizeOrder(v: number) {
  const n = Math.trunc(Number(v) || 1);
  return n > 0 ? n : 1;
}

function slugify(text: string) {
  return text.toLowerCase().trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

function listToArray(v: string) {
  return v.split(',').map((s) => s.trim()).filter(Boolean);
}

function isDeadlineExpired(deadline?: string) {
  if (!deadline) return false;
  return new Date(deadline) < new Date();
}


// ─── Form defaults ────────────────────────────────────────────────────────────

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

const emptyForm: VacancyForm = {
  title: '', department: '', location: '', employmentType: '',
  salary: '', description: '', responsibilities: '', requirements: '',
  perks: '', applicationDeadline: '', featured: false, open: true, order: 1,
};

function normalizeForm(v: CareerVacancy): VacancyForm {
  return {
    title:               v.title,
    department:          v.department,
    location:            v.location,
    employmentType:      v.employmentType,
    salary:              v.salary              || '',
    description:         v.description,
    responsibilities:    (v.responsibilities   || []).join(', '),
    requirements:        (v.requirements       || []).join(', '),
    perks:               (v.perks              || []).join(', '),
    applicationDeadline: v.applicationDeadline || '',
    featured:            Boolean(v.featured),
    open:                v.open !== false,
    order:               normalizeOrder(v.order || 1),
  };
}

// ─── Application status config ────────────────────────────────────────────────

const statusConfig: Record<CareerApplication['status'], { label: string; cls: string; icon: React.ReactNode }> = {
  new:         { label: 'New',         cls: 'bg-yellow-50 text-yellow-600 border-yellow-100', icon: <Clock className="w-3 h-3" /> },
  reviewed:    { label: 'Reviewed',    cls: 'bg-blue-50 text-blue-600 border-blue-100',       icon: <Eye className="w-3 h-3" /> },
  shortlisted: { label: 'Shortlisted', cls: 'bg-purple-50 text-purple-600 border-purple-100', icon: <CheckCircle2 className="w-3 h-3" /> },
  rejected:    { label: 'Rejected',    cls: 'bg-red-50 text-red-500 border-red-100',           icon: <XCircle className="w-3 h-3" /> },
  hired:       { label: 'Hired',       cls: 'bg-green-50 text-green-600 border-green-100',    icon: <ShieldCheck className="w-3 h-3" /> },
};

// ─── View ─────────────────────────────────────────────────────────────────────

type View = 'list' | 'editor' | 'applications';

// ─── Component ────────────────────────────────────────────────────────────────

export default function CareersTab({
  vacancies,
  applications,
  onDelete,
  onViewDetails,
  onRefresh,
  editingId,
  onCancelEdit,
  onGoToList,
}: Props) {

  const [view, setView]         = useState<View>(editingId ? 'editor' : 'list');
  const [form, setForm]         = useState<VacancyForm>(emptyForm);
  const [localId, setLocalId]   = useState<string | null>(editingId ?? null);
  const [busy, setBusy]         = useState(false);

  // Application status local state (optimistic)
  const [localApps, setLocalApps] = useState<CareerApplication[]>(applications);
  if (localApps !== applications && applications.length !== localApps.length) {
    setLocalApps(applications);
  }

  // Selected vacancy filter for applications view
  const [appFilter, setAppFilter] = useState<string>('all');

  useEffect(() => {
    if (editingId) {
      const v = vacancies.find((va) => va._id === editingId);
      if (v) openEditor(v);
    }
  }, [editingId]);

  const duplicateOrder = useMemo(() =>
    vacancies.some((v) => v._id !== localId && normalizeOrder(v.order || 1) === normalizeOrder(form.order)),
    [vacancies, localId, form.order],
  );

  // ── Helpers
  function openEditor(v: CareerVacancy) {
    setForm(normalizeForm(v));
    setLocalId(v._id);
    setView('editor');
  }

  function resetForm() {
    setForm(emptyForm);
    setLocalId(null);
  }

  function handleCancel() {
    resetForm();
    onCancelEdit?.();
    setView('list');
  }

  // ── Submit vacancy
  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!form.title || form.title.length < 3)            { toast.error('Title must be at least 3 characters.'); return; }
    if (!form.department || form.department.length < 2)  { toast.error('Department is required.'); return; }
    if (!form.location || form.location.length < 2)      { toast.error('Location is required.'); return; }
    if (!form.employmentType)                            { toast.error('Employment type is required.'); return; }
    if (!form.description || form.description.length < 20) { toast.error('Description must be at least 20 characters.'); return; }
    if (duplicateOrder)                                  { toast.error('This order number already exists.'); return; }

    setBusy(true);
    try {
      const payload = {
        title:               form.title,
        slug:                slugify(form.title),
        department:          form.department,
        location:            form.location,
        employmentType:      form.employmentType,
        salary:              form.salary,
        description:         form.description,
        responsibilities:    listToArray(form.responsibilities),
        requirements:        listToArray(form.requirements),
        perks:               listToArray(form.perks),
        applicationDeadline: form.applicationDeadline,
        featured:            form.featured,
        open:                form.open,
        order:               normalizeOrder(form.order),
      };

      const res = localId
        ? await fetch(`/api/admin/careers/${localId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
        : await fetch('/api/admin/careers', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });

      if (res.ok) {
        toast.success(localId ? 'Vacancy updated!' : 'Vacancy created!');
        resetForm();
        await onRefresh();
        setView('list');
      } else {
        const err = await res.json().catch(() => null);
        toast.error(err?.error || 'Save failed.');
      }
    } catch {
      toast.error('Save failed.');
    } finally {
      setBusy(false);
    }
  }

  // ── Delete vacancy
  function handleDeleteVacancy(v: CareerVacancy) {
    onDelete({
      title: 'Delete vacancy?',
      description: `This will permanently remove "${v.title}" and its applications.`,
      confirmLabel: 'Delete Vacancy',
      onConfirm: async () => {
        const res = await fetch(`/api/admin/careers/${v._id}`, { method: 'DELETE' });
        if (res.ok) {
          toast.success('Vacancy deleted.');
          await onRefresh();
        } else {
          toast.error('Delete failed.');
        }
      },
    });
  }

  // ── Update application status (optimistic)
  async function updateAppStatus(id: string, status: CareerApplication['status']) {
    const res = await fetch(`/api/admin/careers/applications/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      setLocalApps((cur) => cur.map((a) => a._id === id ? { ...a, status } : a));
      toast.success('Applicant status updated.');
    } else {
      toast.error('Status update failed.');
    }
  }

  // ── View application details
  function viewAppDetails(app: CareerApplication) {
    onViewDetails({
      title: app.fullName,
      subtitle: `Applied for: ${app.vacancyTitle}`,
      fields: [
        { label: 'Email',       value: app.email },
        { label: 'Phone',       value: app.phone              || '—' },
        { label: 'LinkedIn',    value: app.linkedin           || '—' },
        { label: 'Portfolio',   value: app.portfolioUrl       || '—' },
        { label: 'Experience',  value: app.yearsOfExperience  || '—' },
        { label: 'CV',         value: app.cvName             || app.cvUrl },
        { label: 'Status',      value: app.status },
        { label: 'Applied on',  value: new Date(app.createdAt).toLocaleString() },
      ],
      messageLabel: 'Cover Letter',
      message: app.coverLetter,
    });
  }

  // Filtered applications
  const filteredApps = appFilter === 'all'
    ? localApps
    : localApps.filter((a) => a.vacancySlug === appFilter);

  // ════════════════════════════════════════════════════════════════════════════
  // LIST VIEW
  // ════════════════════════════════════════════════════════════════════════════
  if (view === 'list') {
    return (
      <div className="flex flex-col gap-4">

        {/* Top bar */}
        <div className="flex items-center justify-between px-4 pt-2 flex-wrap gap-2">
          <div className="flex items-center gap-2 text-xs text-gray-900 flex-wrap">
            <Briefcase className="w-4 h-4" />
            <span><span className="font-semibold text-gray-900">{vacancies.length}</span> vacancies</span>
            {vacancies.filter((v) => v.open !== false).length > 0 && (
              <>
                <span className="text-gray-600">·</span>
                <span className="text-primary font-medium">
                  {vacancies.filter((v) => v.open !== false).length} open
                </span>
              </>
            )}
            {applications.length > 0 && (
              <>
                <span className="text-gray-600">·</span>
                <span className="text-primary font-medium flex items-center gap-1">
                  <Users className="w-3 h-3" /> {applications.length} applications
                </span>
              </>
            )}
          </div>
          <div className="flex gap-2">
            {applications.length > 0 && (
              <Button size="sm"  onClick={() => setView('applications')} className="text-xs gap-1.5">
                <Users className="w-3.5 h-3.5" /> Applications
              </Button>
            )}
            <Button size="sm" variant="ghost" onClick={onGoToList} className="text-xs min-[320px]:max-[500px]:hidden">Careers Page</Button>
            <Button size="sm" onClick={() => { resetForm(); setView('editor'); }} className="text-xs gap-1.5">
              <Plus className="w-3.5 h-3.5" /> New Vacancy
            </Button>
          </div>
        </div>

        {/* Vacancies table */}
        <div className="overflow-x-auto">
          <table className="min-w-[860px] w-full text-sm">
            <thead>
              <tr className="border-b border-primary-100">
                {['Job Title', 'Department', 'Location', 'Type', 'Status', 'Deadline', 'Actions'].map((h) => (
                  <th key={h} className="text-left px-4 py-3.5 text-gray-900 font-mono text-xs uppercase tracking-[0.18em]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-primary-100">
              {vacancies.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center">
                    <div className="flex flex-col items-center gap-2 text-gray-900">
                      <Briefcase className="w-8 h-8 opacity-30" />
                      <span className="text-sm">No vacancies yet.</span>
                      <Button size="sm" onClick={() => setView('editor')} className="mt-1 text-xs gap-1">
                        <Plus className="w-3 h-3" /> Add first vacancy
                      </Button>
                    </div>
                  </td>
                </tr>
              ) : (
                [...vacancies].sort((a, b) => (a.order || 1) - (b.order || 1)).map((v) => {
                  const expired = isDeadlineExpired(v.applicationDeadline);
                  const appCount = applications.filter((a) => a.vacancySlug === v.slug).length;
                  return (
                    <tr key={v._id} className="align-middle hover:bg-primary-100 transition-colors">

                      {/* Title */}
                      <td className="px-4 py-3.5 max-w-[220px]">
                        <div className="flex items-center gap-1.5">
                          {v.featured && <Star className="w-3.5 h-3.5 text-primary-400 flex-shrink-0" />}
                          <span className="font-medium text-gray-900 truncate">{v.title}</span>
                        </div>
                        {appCount > 0 && (
                          <span className="text-[11px] text-primary mt-0.5 flex items-center gap-1">
                            <Users className="w-3 h-3" /> {appCount} applicant{appCount !== 1 ? 's' : ''}
                          </span>
                        )}
                      </td>

                      {/* Department */}
                      <td className="px-4 py-3.5 text-gray-900 text-xs whitespace-nowrap">{v.department}</td>

                      {/* Location */}
                      <td className="px-4 py-3.5">
                        <span className="inline-flex items-center gap-1 text-xs text-gray-900">
                          <MapPin className="w-3 h-3" /> {v.location}
                        </span>
                      </td>

                      {/* Employment type */}
                      <td className="px-4 py-3.5">
                        <Badge className="rounded-full text-[11px] text-gray-500 border-primary-600 px-2.5">
                          {v.employmentType}
                        </Badge>
                      </td>

                      {/* Open/Closed */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        {v.open !== false ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-0.5 text-[11px] font-medium text-green-600">
                            <CheckCircle2 className="w-3 h-3" /> Open
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-0.5 text-[11px] font-medium text-gray-500">
                            <XCircle className="w-3 h-3" /> Closed
                          </span>
                        )}
                      </td>

                      {/* Deadline */}
                      <td className="px-4 py-3.5 text-xs whitespace-nowrap">
                        {v.applicationDeadline ? (
                          <span className={expired ? 'text-red-600' : 'text-gray-900'}>
                            {expired && <XCircle className="w-3 h-3 inline mr-1" />}
                            {new Date(v.applicationDeadline).toLocaleDateString()}
                          </span>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <Button type="button" size="sm" variant="ghost"
                            className="h-8 w-8 !p-0 justify-center text-gray-900 "
                            onClick={() => openEditor(v)} aria-label="Edit">
                            <Pencil className="w-3.5 h-3.5" />
                          </Button>
                          <Button type="button" size="sm" variant="destructive"
                            className="h-8 w-8 !p-0 justify-center"
                            onClick={() => handleDeleteVacancy(v)} aria-label="Delete">
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

  // ════════════════════════════════════════════════════════════════════════════
  // APPLICATIONS VIEW
  // ════════════════════════════════════════════════════════════════════════════
  if (view === 'applications') {
    return (
      <div className="flex flex-col gap-4 p-5">

        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" /> Job Applications
            </h2>
            <p className="text-sm text-gray-900 mt-0.5">
              Review and manage incoming applications.
            </p>
          </div>
          <Button size="sm" variant="default" onClick={() => setView('list')} className="gap-1.5 text-xs">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Vacancies
          </Button>
        </div>

        {/* Vacancy filter */}
        {vacancies.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-900">Filter by vacancy:</span>
            <Select value={appFilter} onValueChange={setAppFilter}>
              <SelectTrigger className="h-8 w-[210px] text-xs border-primary-200 rounded-lg">
                <SelectValue placeholder="All vacancies" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All vacancies ({applications.length})</SelectItem>
                {vacancies.map((v) => {
                  const count = applications.filter((a) => a.vacancySlug === v.slug).length;
                  return (
                    <SelectItem key={v._id} value={v.slug}>
                      {v.title} ({count})
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Applications list */}
        {filteredApps.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center gap-2 py-14 text-gray-900">
              <Users className="w-8 h-8 opacity-30" />
              <span className="text-sm">No applications yet.</span>
            </CardContent>
          </Card>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-[900px] w-full text-sm">
              <thead>
                <tr className="border-b border-primary-100">
                  {['Applicant', 'Position', 'Experience', 'Status', 'Applied On', 'Actions'].map((h) => (
                    <th key={h} className="text-left px-4 py-3.5 text-gray-900 font-mono text-xs uppercase tracking-[0.18em]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredApps.map((app) => {
                  const cfg = statusConfig[app.status] || statusConfig.new;
                  return (
                    <tr key={app._id} className="align-middle hover:bg-primary-50 transition-colors">

                      {/* Applicant */}
                      <td className="px-4 py-3.5 max-w-[200px]">
                        <div className="font-medium text-gray-900 truncate">{app.fullName}</div>
                        <div className="text-[11px] text-gray-600 truncate">{app.email}</div>
                      </td>

                      {/* Position */}
                      <td className="px-4 py-3.5 text-gray-900 text-xs max-w-[180px]">
                        <span className="truncate block">{app.vacancyTitle}</span>
                      </td>

                      {/* Experience */}
                      <td className="px-4 py-3.5 text-gray-900 text-xs whitespace-nowrap">
                        {app.yearsOfExperience ? `${app.yearsOfExperience} yrs` : '—'}
                      </td>

                      {/* Status select */}
                      <td className="px-4 py-3.5">
                        <Select
                          value={app.status}
                          onValueChange={(val) => updateAppStatus(app._id, val as CareerApplication['status'])}
                        >
                          <SelectTrigger className="h-8 min-w-[140px] text-xs border-primary-200 bg-white text-gray-900 rounded-lg">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(statusConfig).map(([val, { label, cls, icon }]) => (
                              <SelectItem key={val} value={val}>
                                <span className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-medium ${cls}`}>
                                  {icon} {label}
                                </span>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </td>

                      {/* Applied on */}
                      <td className="px-4 py-3.5 text-gray-900 text-xs whitespace-nowrap">
                        {new Date(app.createdAt).toLocaleDateString()}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <Button type="button" size="sm" variant="ghost"
                            className="h-8 px-3 text-xs"
                            onClick={() => viewAppDetails(app)}>
                            View
                          </Button>
                          {app.cvUrl && (
                            <a
                              href={app.cvUrl}
                              download={app.cvName || 'CV'}
                              target="_blank"
                              rel="noopener"
                            >
                              <Button
                                type="button" size="sm" variant="default"
                                className="h-8 gap-1.5 px-3 text-xs"
                                aria-label="Download CV"
                              >
                                <Download className="w-3.5 h-3.5" /> CV
                              </Button>
                            </a>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════════════════════
  // EDITOR VIEW
  // ════════════════════════════════════════════════════════════════════════════
  return (
    <div className="p-5 min-[320px]:max-[500px]:p-[6px]">
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <CardTitle>{localId ? 'Edit Vacancy' : 'New Vacancy'}</CardTitle>
              <CardDescription className="mt-1">Create or update public job openings.</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="default" size="sm" onClick={() => setView('list')} className="gap-1.5 text-xs">
                <ArrowLeft className="w-3.5 h-3.5" /> All Vacancies
              </Button>
              {localId && (
                <Button type="button" variant="ghost" size="sm" onClick={handleCancel} className="text-xs">Cancel</Button>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-5">

            {/* Title */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-900 uppercase tracking-wider flex items-center gap-1">
                <Briefcase className="w-3 h-3" /> Job Title *
              </label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Senior Frontend Developer" required />
            </div>

            {/* Department + Location */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-900 uppercase tracking-wider">Department *</label>
                <Input value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} placeholder="e.g. Engineering" required />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-900 uppercase tracking-wider flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> Location *
                </label>
                <Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="e.g. Remote / Lahore" required />
              </div>
            </div>

            {/* Employment type + Salary */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-900 uppercase tracking-wider flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Employment Type *
                </label>
                <Input value={form.employmentType} onChange={(e) => setForm({ ...form, employmentType: e.target.value })} placeholder="e.g. Full-time, Contract" required />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-900 uppercase tracking-wider flex items-center gap-1">
                  <DollarSign className="w-3 h-3" /> Salary / Compensation
                </label>
                <Input value={form.salary} onChange={(e) => setForm({ ...form, salary: e.target.value })} placeholder="e.g. $1500–$2000/month" />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-900 uppercase tracking-wider flex items-center gap-1">
                <FileText className="w-3 h-3" /> Description *
              </label>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={5} placeholder="Role overview, what you'll be doing..." className="resize-none" />
              <p className="text-[11px] text-gray-400">Minimum 20 characters.</p>
            </div>

            {/* Responsibilities, Requirements, Perks */}
            {[
              { key: 'responsibilities' as const, label: 'Responsibilities', icon: <List className="w-3 h-3" />, placeholder: 'Lead code reviews, Mentor junior devs, Build APIs' },
              { key: 'requirements'    as const, label: 'Requirements',     icon: <ShieldCheck className="w-3 h-3" />, placeholder: '3+ years React, TypeScript, Node.js' },
              { key: 'perks'           as const, label: 'Perks',            icon: <Gift className="w-3 h-3" />, placeholder: 'Flexible hours, Remote work, Health benefits' },
            ].map(({ key, label, icon, placeholder }) => (
              <div key={key} className="space-y-1.5">
                <label className="text-xs font-medium text-gray-900 uppercase tracking-wider flex items-center gap-1">
                  {icon} {label}
                  <span className="normal-case font-normal text-gray-400 ml-1">(comma separated)</span>
                </label>
                <Input value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} placeholder={placeholder} />
              </div>
            ))}

            {/* Deadline */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-900 uppercase tracking-wider flex items-center gap-1">
                <Calendar className="w-3 h-3" /> Application Deadline
              </label>
              <Input type="date" value={form.applicationDeadline} onChange={(e) => setForm({ ...form, applicationDeadline: e.target.value })} className="max-w-[200px]" />
            </div>

            {/* Toggles + Order */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
              <label className="flex items-center gap-2.5 text-sm text-gray-900 cursor-pointer select-none">
                <input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} className="w-4 h-4 rounded accent-primary" />
                <Star className="w-4 h-4 text-yellow-400" /> Featured
              </label>
              <label className="flex items-center gap-2.5 text-sm text-gray-900 cursor-pointer select-none">
                <input type="checkbox" checked={form.open} onChange={(e) => setForm({ ...form, open: e.target.checked })} className="w-4 h-4 rounded accent-primary" />
                <CheckCircle2 className="w-4 h-4 text-green-500" /> Open vacancy
              </label>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-900 uppercase tracking-wider flex items-center gap-1">
                  <Hash className="w-3 h-3" /> Display Order
                </label>
                <Input type="number" min={1} step={1} value={String(form.order)}
                  onChange={(e) => setForm({ ...form, order: normalizeOrder(e.currentTarget.valueAsNumber) })}
                  placeholder="1" className="max-w-[100px]"
                />
                {duplicateOrder && <p className="text-xs text-red-400">Order already exists.</p>}
              </div>
            </div>

            {/* Submit */}
            <Button type="submit" disabled={busy} className="w-full justify-center py-3 gap-2">
              {busy
                ? <Spinner size="sm" variant="dark" />
                : <><Send className="w-4 h-4" /> {localId ? 'Update Vacancy' : 'Add Vacancy'}</>
              }
            </Button>

          </form>
        </CardContent>
      </Card>
    </div>
  );
}






