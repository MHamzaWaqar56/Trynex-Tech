
'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Pencil,
  Star,
  Trash2,
  Wrench,
} from 'lucide-react';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import ConfirmDialog from '@/components/admin/ConfirmDialog';

type ServiceItem = {
  _id: string;
  title: string;
  slug: string;
  coverImage: string;
  summary: string;
  featured?: boolean;
  order?: number;
  packages?: Array<{ name: string; price: string | number; period: string }>;
  createdAt?: string;
};

type SortKey = 'newest' | 'oldest' | 'title-asc' | 'title-desc' | 'order-asc' | 'order-desc';

const SERVICES_PER_PAGE = 9;

function sortServices(services: ServiceItem[], sortKey: SortKey) {
  const items = [...services];
  switch (sortKey) {
    case 'oldest':     return items.sort((a, b) => new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime());
    case 'title-asc':  return items.sort((a, b) => a.title.localeCompare(b.title));
    case 'title-desc': return items.sort((a, b) => b.title.localeCompare(a.title));
    case 'order-asc':  return items.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    case 'order-desc': return items.sort((a, b) => (b.order ?? 0) - (a.order ?? 0));
    default:           return items.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
  }
}

export default function AdminServicesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [deleteTarget, setDeleteTarget] = useState<ServiceItem | null>(null);
  const [busy, setBusy] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey>('newest');
  const [currentPage, setCurrentPage] = useState(1);

  const loadServices = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/services');
      const data = await res.json().catch(() => null);
      if (res.ok) setServices(Array.isArray(data?.services) ? data.services : []);
      else toast.error(data?.error || 'Unable to load services.');
    } catch {
      toast.error('Unable to load services.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void loadServices(); }, []);
  useEffect(() => { setCurrentPage(1); }, [sortKey]);

  const sortedServices = useMemo(() => sortServices(services, sortKey), [services, sortKey]);
  const totalPages = Math.max(1, Math.ceil(sortedServices.length / SERVICES_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * SERVICES_PER_PAGE;
  const currentServices = sortedServices.slice(startIndex, startIndex + SERVICES_PER_PAGE);

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
      const res = await fetch(`/api/admin/services/${deleteTarget._id}`, { method: 'DELETE' });
      const data = await res.json().catch(() => null);
      if (res.ok) {
        setServices((curr) => curr.filter((s) => s._id !== deleteTarget._id));
        toast.success('Service deleted successfully.');
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
                  <Wrench className="h-3.5 w-3.5" />
                  Service Management
                </span>
              </div>
              <h1 className="section-title mb-2">
                All <span className="gradient-text">Services</span>
              </h1>
              <p className="text-gray-900 text-sm max-w-xl leading-relaxed">
                Manage services shown on the public site. Edit or delete from one focused screen.
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3 lg:shrink-0">
              {[
                { label: 'Total',    value: services.length },
                { label: 'Featured', value: services.filter((s) => s.featured).length },
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
                <Wrench className="h-3.5 w-3.5" />
                Our Services
              </span>
            </div>
            <h2 className="section-title text-2xl sm:text-3xl">
              All <span className="gradient-text">Services</span>
            </h2>
          </div>

          <div className="flex flex-col items-start gap-2 sm:items-end">
            <Select value={sortKey} onValueChange={(v) => setSortKey(v as SortKey)}>
              <SelectTrigger className="min-w-[180px] sort-select-trigger">
                <SelectValue placeholder="Sort services" />
              </SelectTrigger>
              <SelectContent className="sort-select-content">
                <SelectItem className="sort-select-item" value="newest">Newest</SelectItem>
                <SelectItem className="sort-select-item" value="oldest">Oldest</SelectItem>
                <SelectItem className="sort-select-item" value="title-asc">Title A–Z</SelectItem>
                <SelectItem className="sort-select-item" value="title-desc">Title Z–A</SelectItem>
                <SelectItem className="sort-select-item" value="order-asc">Order: Low → High</SelectItem>
                <SelectItem className="sort-select-item" value="order-desc">Order: High → Low</SelectItem>
              </SelectContent>
            </Select>
            {!loading && (
              <p className="text-sm text-gray-900">
                Showing {sortedServices.length === 0 ? 0 : startIndex + 1}–{Math.min(startIndex + SERVICES_PER_PAGE, sortedServices.length)} of {sortedServices.length}
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

        ) : sortedServices.length === 0 ? (
          <div className="glass-card p-12 flex flex-col items-center text-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Wrench className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="text-xl font-display font-bold text-gray-900 mb-2">No Services Yet</h3>
              <p className="text-gray-900 text-sm max-w-sm leading-relaxed">
                Add your first service from the editor to see it listed here.
              </p>
            </div>
            <button
              type="button"
              onClick={() => router.push('/admin?tab=services')}
              className="btn-primary mt-2"
            >
              Add First Service <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentServices.map((service) => (
                <article
                  key={service._id}
                  className="portfolio-card group bg-white rounded-2xl overflow-hidden border border-slate-100 flex flex-col"
                >
                  {/* Cover image — same aspect ratio as portfolio card */}
                  <div className="aspect-[16/10] overflow-hidden bg-slate-100 relative">
                    {service.coverImage ? (
                      <img
                        src={service.coverImage}
                        alt={service.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5 px-6 text-center">
                        <span className="text-primary/40 text-sm font-mono uppercase tracking-widest">No Preview</span>
                      </div>
                    )}

                    {/* Featured badge — exact copy from portfolio */}
                    {service.featured && (
                      <span className="absolute left-3 top-3 z-10 inline-flex items-center gap-1 rounded-full bg-primary px-2.5 py-1 text-[10px] font-semibold uppercase tracking-widest text-white shadow-[0_8px_24px_rgba(0,212,255,0.28)]">
                        <Star className="w-2.5 h-2.5" /> Featured
                      </span>
                    )}
                  </div>

                  {/* Info row — same structure as portfolio card */}
                  <div className="p-5 flex items-center justify-between gap-4 border-b border-slate-100">
                    <div className="min-w-0">
                      <h3 className="font-display font-bold text-gray-900 text-base leading-snug truncate group-hover:text-primary transition-colors">
                        {service.title}
                      </h3>
                      <p className="text-gray-900 text-sm mt-0.5 truncate">{service.summary}</p>
                    </div>
                  </div>

                  {/* Packages count + actions row — mirrors portfolio's client + actions row */}
                  <div className="px-5 py-3 flex items-center justify-between gap-3">
                    <p className="text-xs font-mono text-gray-900 truncate">
                      Packages: <span className="font-semibold">{(service.packages || []).length}</span>
                    </p>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => router.push(`/admin?tab=services&editService=${service._id}`)}
                        className="btn-primary py-1.5 px-3 text-xs gap-1.5"
                      >
                        <Pencil className="h-3 w-3" />
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(service)}
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

            {/* Pagination — exact copy from portfolio */}
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
        title="Delete Service?"
        description={`This will permanently remove "${deleteTarget?.title}" and its packages from the public site. This cannot be undone.`}
        busy={busy}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}