


// 'use client';

// import { useEffect, useState } from 'react';
// import { useRouter } from 'next/navigation';
// import { ArrowLeft, Pencil, Trash2 } from 'lucide-react';
// import { toast } from 'sonner';
// import { Button } from '@/components/ui/button';
// import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
// import ConfirmDialog from '@/components/admin/ConfirmDialog';

// type PortfolioProject = {
//   _id: string;
//   title: string;
//   slug: string;
//   client: string;
//   service: string;
//   featured?: boolean;
//   images?: string[];
// };

// export default function AdminPortfolioPage() {
//   const router = useRouter();
//   const [loading, setLoading] = useState(true);
//   const [projects, setProjects] = useState<PortfolioProject[]>([]);
//   const [deleteTarget, setDeleteTarget] = useState<PortfolioProject | null>(null);
//   const [busy, setBusy] = useState(false);

//   const loadProjects = async () => {
//     setLoading(true);
//     try {
//       const res = await fetch('/api/portfolio');
//       const data = await res.json().catch(() => null);
//       if (res.ok) setProjects(Array.isArray(data?.projects) ? data.projects : []);
//       else toast.error(data?.error || 'Unable to load projects.');
//     } catch {
//       toast.error('Unable to load projects.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => { void loadProjects(); }, []);

//   const confirmDelete = async () => {
//     if (!deleteTarget) return;
//     setBusy(true);
//     try {
//       const res = await fetch(`/api/portfolio/${deleteTarget.slug}`, { method: 'DELETE' });
//       const data = await res.json().catch(() => null);
//       if (res.ok) {
//         setProjects((current) => current.filter((p) => p.slug !== deleteTarget.slug));
//         toast.success('Project deleted successfully.');
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
//       <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(0,212,255,0.14),transparent_28%),radial-gradient(circle_at_top_right,rgba(255,107,53,0.12),transparent_24%)]" />
//       <div className="container-custom relative z-10 py-8 lg:py-10">

//         <div className="mb-8 rounded-[28px] border border-white/10 bg-white/[0.04] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.45)] backdrop-blur-xl lg:p-8">
//           <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
//             <div className="space-y-3">
//               <Button variant="ghost" className="w-fit rounded-full border border-white/10 bg-white/[0.03] text-dark-muted hover:text-white" onClick={() => router.push('/admin')}>
//                 <ArrowLeft className="h-4 w-4" /> Back to Dashboard
//               </Button>
//               <div>
//                 <p className="text-xs uppercase tracking-[0.24em] text-dark-muted font-mono">Portfolio Management</p>
//                 <h1 className="mt-2 text-3xl font-display font-bold sm:text-4xl">All Projects</h1>
//               </div>
//             </div>
//             <div className="grid grid-cols-2 gap-3">
//               <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
//                 <p className="text-[11px] uppercase tracking-[0.2em] text-dark-muted">Total</p>
//                 <p className="mt-2 text-2xl font-display font-bold">{projects.length}</p>
//               </div>
//               <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
//                 <p className="text-[11px] uppercase tracking-[0.2em] text-dark-muted">Featured</p>
//                 <p className="mt-2 text-2xl font-display font-bold">{projects.filter((p) => p.featured).length}</p>
//               </div>
//             </div>
//           </div>
//         </div>

//         <Card className="overflow-hidden border-white/10 bg-white/[0.03]">
//           <CardHeader className="border-b border-white/10 bg-white/[0.02]">
//             <CardTitle>Projects</CardTitle>
//             <CardDescription>Manage portfolio projects shown on the public site.</CardDescription>
//           </CardHeader>
//           <CardContent className="!p-5">
//             {loading ? (
//               <div className="grid gap-4 md:grid-cols-2">
//                 {Array.from({ length: 4 }).map((_, i) => (
//                   <div key={i} className="h-40 animate-pulse rounded-2xl border border-white/10 bg-white/[0.03]" />
//                 ))}
//               </div>
//             ) : projects.length === 0 ? (
//               <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-center text-dark-muted">
//                 No projects found.
//               </div>
//             ) : (
//               <div className="grid gap-4 lg:grid-cols-2">
//                 {projects.map((project) => (
//                   <div key={project._id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
//                     <div className="mb-4 flex items-start gap-4">
//                       <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-dark-card flex items-center justify-center">
//                         {project.images?.[0] ? (
//                           <img src={project.images[0]} alt={project.title} className="h-full w-full object-cover" />
//                         ) : (
//                           <span className="text-xs text-dark-muted font-mono">No Image</span>
//                         )}
//                       </div>
//                       <div className="min-w-0 flex-1">
//                         <h3 className="truncate text-lg font-semibold text-white">{project.title}</h3>
//                         <p className="mt-1 text-xs text-dark-muted">Client: {project.client}</p>
//                         <p className="mt-1 text-xs text-dark-muted">Service: {project.service}</p>
//                         {project.featured && (
//                           <span className="mt-2 inline-block text-[10px] font-mono px-2 py-0.5 rounded-full bg-accent/10 text-accent border border-accent/20">Featured</span>
//                         )}
//                       </div>
//                     </div>
//                     <div className="flex flex-wrap gap-2">
//                       <Button size="sm" onClick={() => router.push(`/admin?tab=portfolio&editProject=${project.slug}`)}>
//                         <Pencil className="h-4 w-4" /> Edit
//                       </Button>
//                       <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-300" onClick={() => setDeleteTarget(project)}>
//                         <Trash2 className="h-4 w-4" /> Delete
//                       </Button>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             )}
//           </CardContent>
//         </Card>
//       </div>

//       <ConfirmDialog
//         open={!!deleteTarget}
//         title="Delete Project?"
//         description={`This will permanently remove "${deleteTarget?.title}" from the portfolio. This cannot be undone.`}
//         busy={busy}
//         onConfirm={confirmDelete}
//         onCancel={() => setDeleteTarget(null)}
//       />
//     </div>
//   );
// }











'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  ArrowRight,
  BriefcaseBusiness,
  ChevronLeft,
  ChevronRight,
  Pencil,
  Star,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import ConfirmDialog from '@/components/admin/ConfirmDialog';

type PortfolioProject = {
  _id: string;
  title: string;
  slug: string;
  client: string;
  service: string;
  description?: string;
  tech?: string[];
  images?: string[];
  featured?: boolean;
  createdAt?: string;
};

type SortKey = 'newest' | 'oldest' | 'title-asc' | 'title-desc' | 'client-asc' | 'service-asc';

const PROJECTS_PER_PAGE = 9;

function sortProjects(projects: PortfolioProject[], sortKey: SortKey) {
  const items = [...projects];
  switch (sortKey) {
    case 'oldest': return items.sort((a, b) => new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime());
    case 'title-asc': return items.sort((a, b) => a.title.localeCompare(b.title));
    case 'title-desc': return items.sort((a, b) => b.title.localeCompare(a.title));
    case 'client-asc': return items.sort((a, b) => a.client.localeCompare(b.client));
    case 'service-asc': return items.sort((a, b) => a.service.localeCompare(b.service));
    default: return items.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
  }
}

export default function AdminPortfolioPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<PortfolioProject[]>([]);
  const [deleteTarget, setDeleteTarget] = useState<PortfolioProject | null>(null);
  const [busy, setBusy] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey>('newest');
  const [currentPage, setCurrentPage] = useState(1);

  const loadProjects = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/portfolio');
      const data = await res.json().catch(() => null);
      if (res.ok) setProjects(Array.isArray(data?.projects) ? data.projects : []);
      else toast.error(data?.error || 'Unable to load projects.');
    } catch {
      toast.error('Unable to load projects.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void loadProjects(); }, []);
  useEffect(() => { setCurrentPage(1); }, [sortKey]);

  const sortedProjects = useMemo(() => sortProjects(projects, sortKey), [projects, sortKey]);
  const totalPages = Math.max(1, Math.ceil(sortedProjects.length / PROJECTS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * PROJECTS_PER_PAGE;
  const currentProjects = sortedProjects.slice(startIndex, startIndex + PROJECTS_PER_PAGE);

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
      const res = await fetch(`/api/portfolio/${deleteTarget.slug}`, { method: 'DELETE' });
      const data = await res.json().catch(() => null);
      if (res.ok) {
        setProjects((curr) => curr.filter((p) => p.slug !== deleteTarget.slug));
        toast.success('Project deleted successfully.');
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
                  <BriefcaseBusiness className="h-3.5 w-3.5" />
                  Portfolio Management
                </span>
              </div>
              <h1 className="section-title mb-2">
                All <span className="gradient-text">Projects</span>
              </h1>
              <p className="text-gray-900 text-sm max-w-xl leading-relaxed">
                Manage portfolio projects shown on the public site. Edit or delete from one focused screen.
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3 lg:shrink-0">
              {[
                { label: 'Total', value: projects.length },
                { label: 'Featured', value: projects.filter((p) => p.featured).length },
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
                <BriefcaseBusiness className="h-3.5 w-3.5" />
                Our Work
              </span>
            </div>
            <h2 className="section-title text-2xl sm:text-3xl">
              Portfolio <span className="gradient-text">Projects</span>
            </h2>
          </div>

          <div className="flex flex-col items-start gap-2 sm:items-end">
            <Select value={sortKey} onValueChange={(v) => setSortKey(v as SortKey)}>
              <SelectTrigger className="min-w-[180px] sort-select-trigger">
                <SelectValue placeholder="Sort projects" />
              </SelectTrigger>
              <SelectContent className="sort-select-content">
                <SelectItem className="sort-select-item" value="newest">Newest</SelectItem>
                <SelectItem className="sort-select-item" value="oldest">Oldest</SelectItem>
                <SelectItem className="sort-select-item" value="title-asc">Title A–Z</SelectItem>
                <SelectItem className="sort-select-item" value="title-desc">Title Z–A</SelectItem>
                <SelectItem className="sort-select-item" value="client-asc">Client A–Z</SelectItem>
                <SelectItem className="sort-select-item" value="service-asc">Service A–Z</SelectItem>
              </SelectContent>
            </Select>
            {!loading && (
              <p className="text-sm text-gray-900">
                Showing {sortedProjects.length === 0 ? 0 : startIndex + 1}–{Math.min(startIndex + PROJECTS_PER_PAGE, sortedProjects.length)} of {sortedProjects.length}
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
        ) : sortedProjects.length === 0 ? (
          <div className="glass-card p-12 flex flex-col items-center text-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
              <BriefcaseBusiness className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="text-xl font-display font-bold text-gray-900 mb-2">No Projects Yet</h3>
              <p className="text-gray-900 text-sm max-w-sm leading-relaxed">
                Add your first portfolio project from the editor to see it listed here.
              </p>
            </div>
            <button
              type="button"
              onClick={() => router.push('/admin?tab=portfolio')}
              className="btn-primary mt-2"
            >
              Add First Project <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentProjects.map((project) => {
                const previewImage = project.images?.[0];
                return (
                  <article
                    key={project._id}
                    className="portfolio-card group bg-white rounded-2xl overflow-hidden border border-slate-100 flex flex-col"
                  >
                    {/* Image — same as client portfolio card */}
                    <div className="aspect-[16/10] overflow-hidden bg-slate-100 relative">
                      {previewImage ? (
                        <img
                          src={previewImage}
                          alt={project.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5 px-6 text-center">
                          <span className="text-primary/40 text-sm font-mono uppercase tracking-widest">No Preview</span>
                        </div>
                      )}

                      {/* Featured badge */}
                      {project.featured && (
                        <span className="absolute left-3 top-3 z-10 inline-flex items-center gap-1 rounded-full bg-primary px-2.5 py-1 text-[10px] font-semibold uppercase tracking-widest text-white shadow-[0_8px_24px_rgba(0,212,255,0.28)]">
                          <Star className="w-2.5 h-2.5" /> Featured
                        </span>
                      )}
                    </div>

                    {/* Info row — same as client card */}
                    <div className="p-5 flex items-center justify-between gap-4 border-b border-slate-100">
                      <div className="min-w-0">
                        <h3 className="font-display font-bold text-gray-900 text-base leading-snug truncate group-hover:text-primary transition-colors">
                          {project.title}
                        </h3>
                        <p className="text-gray-900 text-sm mt-0.5 truncate">{project.service}</p>
                      </div>
                      
                    </div>

                    {/* Client + actions row */}
                    <div className="px-5 py-3 flex items-center justify-between gap-3">
                      <p className="text-xs font-mono text-gray-900 truncate">
                        Client: <span className="font-semibold">{project.client}</span>
                      </p>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => router.push(`/admin?tab=portfolio&editProject=${project.slug}`)}
                          className="btn-primary py-1.5 px-3 text-xs gap-1.5"
                        >
                          <Pencil className="h-3 w-3" />
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(project)}
                          className="btn-secondary py-1.5 px-3 text-xs gap-1.5 text-red-500 hover:text-red-600 hover:border-red-200"
                        >
                          <Trash2 className="h-3 w-3" />
                          Delete
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
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
        title="Delete Project?"
        description={`This will permanently remove "${deleteTarget?.title}" from the portfolio. This cannot be undone.`}
        busy={busy}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}