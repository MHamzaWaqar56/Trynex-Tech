
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Briefcase,
  ExternalLink,
  FileText,
  RefreshCw,
  Trash2,
  Users,
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import ConfirmDialog from '@/components/admin/ConfirmDialog';

type CareerApplication = {
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
  createdAt?: string;
};

const statusConfig: Record<CareerApplication['status'], { label: string; classes: string }> = {
  new:         { label: 'New',         classes: 'bg-primary/10 text-primary border-primary/20' },
  reviewed:    { label: 'Reviewed',    classes: 'bg-blue-50 text-blue-700 border-blue-200' },
  shortlisted: { label: 'Shortlisted', classes: 'bg-purple-50 text-purple-700 border-purple-200' },
  rejected:    { label: 'Rejected',    classes: 'bg-red-50 text-red-600 border-red-200' },
  hired:       { label: 'Hired',       classes: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
};

export default function ApplicationsManager() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [applications, setApplications] = useState<CareerApplication[]>([]);
  const [deleteTarget, setDeleteTarget] = useState<CareerApplication | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);

  const loadApplications = async () => {
    setLoading(true);
    try {
      const auth = await fetch('/api/admin/me');
      if (!auth.ok) { router.push('/admin/login'); return; }
      const res = await fetch('/api/admin/careers/applications');
      if (res.ok) {
        const data = await res.json();
        setApplications(data.applications || []);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadApplications(); }, []);

  const updateStatus = async (id: string, status: CareerApplication['status']) => {
    setSavingId(id);
    try {
      const res = await fetch(`/api/admin/careers/applications/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) { toast.error('Could not update application status.'); return; }
      setApplications((curr) => curr.map((a) => a._id === id ? { ...a, status } : a));
      toast.success('Applicant updated and notified.');
    } finally {
      setSavingId(null);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleteBusy(true);
    try {
      const res = await fetch(`/api/admin/careers/applications/${deleteTarget._id}`, { method: 'DELETE' });
      if (res.ok) {
        setApplications((curr) => curr.filter((a) => a._id !== deleteTarget._id));
        toast.success('Application deleted.');
        setDeleteTarget(null);
      } else {
        toast.error('Delete failed.');
      }
    } catch {
      toast.error('Network error.');
    } finally {
      setDeleteBusy(false);
    }
  };

  const totalApplications = applications.length;
  const newCount = applications.filter((a) => a.status === 'new').length;
  const shortlistedCount = applications.filter((a) => a.status === 'shortlisted').length;
  const hiredCount = applications.filter((a) => a.status === 'hired').length;

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center animate-pulse">
            <Users className="w-5 h-5 text-primary" />
          </div>
          <p className="text-sm text-gray-900 font-mono">Loading applications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="container-custom py-8 lg:py-12">

        {/* Back button */}
        <div className="mb-6 flex items-center gap-3">
          <button type="button" onClick={() => router.push('/admin')} className="btn-ghost text-sm">
            <ArrowLeft className="h-4 w-4" /> Back to Dashboard
          </button>
          <button type="button" onClick={() => router.push('/admin/careers')} className="btn-ghost text-sm">
            <Briefcase className="h-4 w-4" /> Vacancies
          </button>
        </div>

        {/* Page header */}
        <div className="glass-card p-6 sm:p-8 mb-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="mb-3">
                <span className="section-badge">
                  <Users className="h-3.5 w-3.5" /> Application Management
                </span>
              </div>
              <h1 className="section-title mb-2">
                All <span className="gradient-text">Applications</span>
              </h1>
              <p className="text-gray-900 text-sm max-w-xl leading-relaxed">
                Review applicants, update their status, and open their CVs from one focused workspace. Status changes automatically notify the applicant.
              </p>
              <div className="mt-4">
                <button type="button" onClick={loadApplications} className="btn-secondary py-2 px-4 text-sm">
                  <RefreshCw className="h-4 w-4" /> Refresh
                </button>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 lg:shrink-0">
              {[
                { label: 'Total', value: totalApplications },
                { label: 'New', value: newCount },
                { label: 'Shortlisted', value: shortlistedCount },
                { label: 'Hired', value: hiredCount },
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
              <FileText className="h-3.5 w-3.5" /> All Applications
            </span>
          </div>
          <h2 className="section-title text-2xl sm:text-3xl">
            Applicant <span className="gradient-text">Cards</span>
          </h2>
        </div>

        {/* Application cards — 3 column grid */}
        {applications.length === 0 ? (
          <div className="glass-card p-12 flex flex-col items-center text-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="text-xl font-display font-bold text-gray-900 mb-2">No Applications Yet</h3>
              <p className="text-gray-900 text-sm max-w-sm leading-relaxed">
                Applications will appear here once candidates submit through the careers page.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {applications.map((application) => {
              const status = statusConfig[application.status];
              return (
                <article key={application._id} className="glass-card flex flex-col gap-4 p-5">

                  {/* Top row — avatar, name, status badge, delete */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                        <span className="text-sm font-display font-bold text-primary">
                          {application.fullName.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-display font-bold text-gray-900 text-sm leading-snug truncate">
                          {application.fullName}
                        </h3>
                        <p className="text-[11px] text-gray-900 font-mono truncate">{application.vacancyTitle}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-widest border ${status.classes}`}>
                        {status.label}
                      </span>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(application)}
                        title="Delete application"
                        className="btn-ghost p-1.5 rounded-lg text-red-400 hover:text-red-600"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Meta */}
                  <div className="flex flex-wrap gap-2 text-[11px] text-gray-900">
                    <span className="font-mono truncate max-w-full">{application.email}</span>
                    {application.phone && <span className="font-mono">{application.phone}</span>}
                    {application.yearsOfExperience && (
                      <span className="tag text-[10px]">{application.yearsOfExperience} exp</span>
                    )}
                  </div>

                  {/* Cover letter */}
                  <div className="bg-slate-50 rounded-xl p-3 flex-1">
                    <p className="text-xs text-gray-900 leading-relaxed line-clamp-4">
                      {application.coverLetter}
                    </p>
                  </div>

                  {/* Links */}
                  <div className="flex flex-wrap gap-1.5">
                    {application.cvUrl && (
                      <a href={application.cvUrl} target="_blank" rel="noreferrer" className="btn-primary py-1.5 px-3 text-[11px] gap-1">
                        <ExternalLink className="w-3 h-3" /> CV
                      </a>
                    )}
                    {application.linkedin && (
                      <a href={application.linkedin} target="_blank" rel="noreferrer" className="btn-secondary py-1.5 px-3 text-[11px] gap-1">
                        <ExternalLink className="w-3 h-3" /> LinkedIn
                      </a>
                    )}
                    {application.portfolioUrl && (
                      <a href={application.portfolioUrl} target="_blank" rel="noreferrer" className="btn-secondary py-1.5 px-3 text-[11px] gap-1">
                        <ExternalLink className="w-3 h-3" /> Portfolio
                      </a>
                    )}
                  </div>

                  {/* Status dropdown */}
                  <div className="pt-3 border-t border-slate-100">
                    <Select
                      value={application.status}
                      disabled={savingId === application._id}
                      onValueChange={(val) => updateStatus(application._id, val as CareerApplication['status'])}
                    >
                      <SelectTrigger className="w-full sort-select-trigger text-xs">
                        <SelectValue placeholder="Update status" />
                      </SelectTrigger>
                      <SelectContent className="sort-select-content">
                        <SelectItem className="sort-select-item" value="new">New</SelectItem>
                        <SelectItem className="sort-select-item" value="reviewed">Reviewed</SelectItem>
                        <SelectItem className="sort-select-item" value="shortlisted">Shortlisted</SelectItem>
                        <SelectItem className="sort-select-item" value="rejected">Rejected</SelectItem>
                        <SelectItem className="sort-select-item" value="hired">Hired</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-[10px] text-gray-900 font-mono mt-1.5">
                      {savingId === application._id ? 'Updating...' : 'Status change notifies applicant.'}
                    </p>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Application?"
        description={`This will permanently remove ${deleteTarget?.fullName}'s application for "${deleteTarget?.vacancyTitle}". This cannot be undone.`}
        busy={deleteBusy}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}