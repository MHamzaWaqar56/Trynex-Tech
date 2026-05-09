// import Link from 'next/link';
// import { ArrowLeft, Pencil, Users } from 'lucide-react';
// import { connectDB } from '@/lib/db';
// import { TeamMember as TeamMemberModel } from '@/models/TeamMember';
// import DeleteTeamMemberButton from '@/components/admin/DeleteTeamMemberButton';

// type TeamMember = {
//   _id: string;
//   name: string;
//   designation: string;
//   coverText: string;
//   image: string;
//   facebook?: string;
//   email?: string;
//   linkedin?: string;
//   github?: string;
//   order?: number;
// };

// export const dynamic = 'force-dynamic';

// async function getTeamMembers(): Promise<TeamMember[]> {
//   await connectDB();
//   return TeamMemberModel.find({}).sort({ order: 1, createdAt: -1 }).lean<TeamMember[]>();
// }

// export default async function AdminTeamPage() {
//   const members = await getTeamMembers();

//   return (
//     <div className="relative min-h-screen overflow-hidden bg-[#050814] pt-[5rem] text-white">
//       <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(0,212,255,0.14),transparent_28%),radial-gradient(circle_at_top_right,rgba(255,107,53,0.12),transparent_24%),linear-gradient(180deg,#050814_0%,#070b14_42%,#050814_100%)]" />
//       <div className="container-custom relative z-10 py-8 lg:py-10">

//         <div className="mb-8 rounded-[28px] border border-white/10 bg-white/[0.04] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.45)] backdrop-blur-xl lg:p-8">
//           <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
//             <div className="space-y-3">
//               <Link href="/admin" className="inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-dark-muted hover:text-white">
//                 <ArrowLeft className="h-4 w-4" /> Back to Dashboard
//               </Link>
//               <div>
//                 <p className="text-xs uppercase tracking-[0.24em] text-dark-muted font-mono">Team Management</p>
//                 <h1 className="mt-2 text-3xl font-display font-bold sm:text-4xl">Team Members Directory</h1>
//                 <p className="mt-3 max-w-2xl text-sm leading-6 text-dark-muted sm:text-base">
//                   Manage the people shown across the site. Edit a member in the dashboard, or add a record from the Team form.
//                 </p>
//               </div>
//             </div>
//             <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
//               <p className="text-[11px] uppercase tracking-[0.2em] text-dark-muted">Total</p>
//               <p className="mt-2 text-2xl font-display font-bold">{members.length}</p>
//             </div>
//           </div>
//         </div>

//         <section className="overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.03] shadow-[0_22px_60px_rgba(0,0,0,0.35)] backdrop-blur-xl">
//           <div className="border-b border-white/10 bg-white/[0.02] px-6 py-5">
//             <h2 className="text-xl font-semibold text-white">Team Members</h2>
//             <p className="mt-1 text-sm text-dark-muted">Manage the public team grid and the about page profiles.</p>
//           </div>
//           <div className="p-5">
//             {members.length === 0 ? (
//               <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-white/10 bg-white/[0.02] py-16 text-center">
//                 <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
//                   <Users className="w-6 h-6 text-primary" />
//                 </div>
//                 <div>
//                   <p className="text-white font-semibold">No team members yet</p>
//                   <p className="text-sm text-dark-muted mt-1">Add your first team member from the dashboard.</p>
//                 </div>
//                 <Link href="/admin?tab=team" className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2 text-sm font-medium text-dark hover:opacity-90">
//                   Add Team Member
//                 </Link>
//               </div>
//             ) : (
//               <div className="grid gap-4 lg:grid-cols-2">
//                 {members.map((member) => (
//                   <article key={member._id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 shadow-[0_14px_35px_rgba(0,0,0,0.2)]">
//                     <div className="mb-4 flex items-start gap-4">
//                       <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-dark-card">
//                         <img src={member.image} alt={member.name} className="h-full w-full object-cover" />
//                       </div>
//                       <div className="min-w-0 flex-1">
//                         <h3 className="truncate text-lg font-semibold text-white">{member.name}</h3>
//                         <p className="mt-1 text-xs text-dark-muted">{member.designation}</p>
//                         <p className="mt-2 line-clamp-3 text-sm text-dark-muted">{member.coverText}</p>
//                        </div>
//                     </div>
//                     <div className="mt-5 flex flex-wrap gap-2">
//                       <Link href={`/admin?tab=team&editTeam=${member._id}`} className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-dark hover:opacity-90">
//                         <Pencil className="h-4 w-4" /> Edit
//                       </Link>
//                       <DeleteTeamMemberButton id={String(member._id)} name={member.name} />
//                     </div>
//                   </article>
//                 ))}
//               </div>
//             )}
//           </div>
//         </section>
//       </div>
//     </div>
//   );
// }
















'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Github,
  Linkedin,
  Mail,
  Pencil,
  Trash2,
  Users,
} from 'lucide-react';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import ConfirmDialog from '@/components/admin/ConfirmDialog';

type TeamMember = {
  _id: string;
  name: string;
  designation: string;
  coverText: string;
  image: string;
  facebook?: string;
  email?: string;
  linkedin?: string;
  github?: string;
  order?: number;
  createdAt?: string;
};

type SortKey = 'order-asc' | 'order-desc' | 'name-asc' | 'name-desc' | 'newest' | 'oldest';

const MEMBERS_PER_PAGE = 9;

function sortMembers(members: TeamMember[], sortKey: SortKey) {
  const items = [...members];
  switch (sortKey) {
    case 'order-desc': return items.sort((a, b) => (b.order ?? 0) - (a.order ?? 0));
    case 'name-asc':   return items.sort((a, b) => a.name.localeCompare(b.name));
    case 'name-desc':  return items.sort((a, b) => b.name.localeCompare(a.name));
    case 'newest':     return items.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    case 'oldest':     return items.sort((a, b) => new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime());
    default:           return items.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }
}

export default function AdminTeamPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [deleteTarget, setDeleteTarget] = useState<TeamMember | null>(null);
  const [busy, setBusy] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey>('order-asc');
  const [currentPage, setCurrentPage] = useState(1);

  const loadMembers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/team');
      const data = await res.json().catch(() => null);
      if (res.ok) setMembers(Array.isArray(data?.members) ? data.members : []);
      else toast.error(data?.error || 'Unable to load team members.');
    } catch {
      toast.error('Unable to load team members.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void loadMembers(); }, []);
  useEffect(() => { setCurrentPage(1); }, [sortKey]);

  const sortedMembers = useMemo(() => sortMembers(members, sortKey), [members, sortKey]);
  const totalPages = Math.max(1, Math.ceil(sortedMembers.length / MEMBERS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * MEMBERS_PER_PAGE;
  const currentMembers = sortedMembers.slice(startIndex, startIndex + MEMBERS_PER_PAGE);

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
      const res = await fetch(`/api/admin/team/${deleteTarget._id}`, { method: 'DELETE' });
      const data = await res.json().catch(() => null);
      if (res.ok) {
        setMembers((curr) => curr.filter((m) => m._id !== deleteTarget._id));
        toast.success('Team member deleted successfully.');
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
                  <Users className="h-3.5 w-3.5" />
                  Team Management
                </span>
              </div>
              <h1 className="section-title mb-2">
                All <span className="gradient-text">Members</span>
              </h1>
              <p className="text-gray-900 text-sm max-w-xl leading-relaxed">
                Manage team members shown on the public site. Edit or delete from one focused screen.
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3 lg:shrink-0">
              {[
                { label: 'Total',   value: members.length },
                { label: 'Socials', value: members.filter((m) => m.linkedin || m.github || m.email).length },
              ].map(({ label, value }) => (
                <div key={label} className="glass-card-hover p-4 text-center">
                  <p className="text-[11px] uppercase tracking-widest font-mono text-gray-900 mb-1">{label}</p>
                  <p className="text-2xl font-display font-bold text-gray-900">{value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Toolbar — title left, sort dropdown right */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <div className="mb-3">
              <span className="section-badge">
                <Users className="h-3.5 w-3.5" />
                Our Team
              </span>
            </div>
            <h2 className="section-title text-2xl sm:text-3xl">
              Team <span className="gradient-text">Directory</span>
            </h2>
          </div>

          <div className="flex flex-col items-start gap-2 sm:items-end">
            <Select value={sortKey} onValueChange={(v) => setSortKey(v as SortKey)}>
              <SelectTrigger className="min-w-[180px] sort-select-trigger">
                <SelectValue placeholder="Sort members" />
              </SelectTrigger>
              <SelectContent className="sort-select-content">
                <SelectItem className="sort-select-item" value="order-asc">Order: Low → High</SelectItem>
                <SelectItem className="sort-select-item" value="order-desc">Order: High → Low</SelectItem>
                <SelectItem className="sort-select-item" value="name-asc">Name: A → Z</SelectItem>
                <SelectItem className="sort-select-item" value="name-desc">Name: Z → A</SelectItem>
                <SelectItem className="sort-select-item" value="newest">Newest First</SelectItem>
                <SelectItem className="sort-select-item" value="oldest">Oldest First</SelectItem>
              </SelectContent>
            </Select>
            {!loading && (
              <p className="text-sm text-gray-900">
                Showing {sortedMembers.length === 0 ? 0 : startIndex + 1}–{Math.min(startIndex + MEMBERS_PER_PAGE, sortedMembers.length)} of {sortedMembers.length}
              </p>
            )}
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-64 animate-pulse rounded-2xl border border-slate-100 bg-slate-50" />
            ))}
          </div>

        ) : sortedMembers.length === 0 ? (
          <div className="glass-card p-12 flex flex-col items-center text-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="text-xl font-display font-bold text-gray-900 mb-2">No Team Members Yet</h3>
              <p className="text-gray-900 text-sm max-w-sm leading-relaxed">
                Add your first team member from the editor to see them listed here.
              </p>
            </div>
            <button
              type="button"
              onClick={() => router.push('/admin?tab=team')}
              className="btn-primary mt-2"
            >
              Add First Member <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentMembers.map((member) => (
                <article
                  key={member._id}
                  className="portfolio-card group bg-white rounded-2xl overflow-hidden border border-slate-100 flex flex-col"
                >
                  {/* Profile image — same aspect ratio as portfolio/services card */}
                  <div className="aspect-[16/10] overflow-hidden bg-slate-100 relative">
                    {member.image ? (
                      <img
                        src={member.image}
                        alt={member.name}
                        className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
                        <span className="text-primary/40 text-sm font-mono uppercase tracking-widest">No Photo</span>
                      </div>
                    )}
                  </div>

                  {/* Name + designation row */}
                  <div className="p-5 flex items-center justify-between gap-4 border-b border-slate-100">
                    <div className="min-w-0">
                      <h3 className="font-display font-bold text-gray-900 text-base leading-snug truncate group-hover:text-primary transition-colors">
                        {member.name}
                      </h3>
                      <p className="text-gray-900 text-sm mt-0.5 truncate">{member.designation}</p>
                    </div>

                    {/* Social icons */}
                    <div className="flex items-center gap-2 shrink-0">
                      {member.linkedin && (
                        <a href={member.linkedin} target="_blank" rel="noopener noreferrer"
                          className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-primary/10 hover:text-primary flex items-center justify-center text-gray-400 transition-colors">
                          <Linkedin className="w-3.5 h-3.5" />
                        </a>
                      )}
                      {member.github && (
                        <a href={member.github} target="_blank" rel="noopener noreferrer"
                          className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-primary/10 hover:text-primary flex items-center justify-center text-gray-400 transition-colors">
                          <Github className="w-3.5 h-3.5" />
                        </a>
                      )}
                      {member.email && (
                        <a href={`mailto:${member.email}`}
                          className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-primary/10 hover:text-primary flex items-center justify-center text-gray-400 transition-colors">
                          <Mail className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Order + actions row — mirrors portfolio/services bottom row */}
                  <div className="px-5 py-3 flex items-center justify-between gap-3">
                    <p className="text-xs font-mono text-gray-900 truncate">
                      Order: <span className="font-semibold">#{member.order ?? '—'}</span>
                    </p>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => router.push(`/admin?tab=team&editTeam=${member._id}`)}
                        className="btn-primary py-1.5 px-3 text-xs gap-1.5"
                      >
                        <Pencil className="h-3 w-3" />
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(member)}
                        className="btn-secondary py-1.5 px-3 text-xs gap-1.5 text-red-500 hover:text-red-600 hover:border-red-200"
                      >
                        <Trash2 className="h-3 w-3" />
                        Delete
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {/* Pagination — exact copy from portfolio/services */}
            {totalPages > 1 && (
              <div className="flex flex-wrap items-center justify-center gap-2 pt-8">
                <button
                  type="button"
                  onClick={() => goToPage(safePage - 1)}
                  disabled={safePage === 1}
                  className="inline-flex items-center gap-2 rounded-lg border border-gray-900 bg-white px-3 py-2 text-sm text-gray-900 transition-colors hover:border-primary/40 hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <ChevronLeft className="w-4 h-4" /> Previous
                </button>

                {pageNumbers.map((pageNum) => (
                  <button
                    key={pageNum}
                    type="button"
                    onClick={() => goToPage(pageNum)}
                    className={`min-w-10 rounded-lg border px-3 py-2 text-sm transition-colors ${
                      pageNum === safePage
                        ? 'border-primary bg-primary text-white font-semibold'
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
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Team Member?"
        description={`This will permanently remove "${deleteTarget?.name}" from the about page. This cannot be undone.`}
        busy={busy}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}