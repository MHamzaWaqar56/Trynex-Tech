
'use client';

import Link from 'next/link';
import { ArrowRight, ChevronLeft, ChevronRight, Package } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type PublicService = {
  _id?: string;
  title: string;
  slug: string;
  coverImage?: string;
  summary?: string;
  bullets?: string[];
  tags?: string[];
  description?: string;
  features?: string[];
  technologies?: string[];
  featured?: boolean;
  order?: number;
  createdAt?: string;
};

type SortKey = 'newest' | 'oldest' | 'title-asc' | 'title-desc';

type ServicesGridClientProps = {
  services: PublicService[];
};

const SERVICES_PER_PAGE = 6;

function sortServices(services: PublicService[], sortKey: SortKey) {
  const items = [...services];

  switch (sortKey) {
    case 'oldest':
      return items.sort((a, b) => new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime());
    case 'title-asc':
      return items.sort((a, b) => a.title.localeCompare(b.title));
    case 'title-desc':
      return items.sort((a, b) => b.title.localeCompare(a.title));
    case 'newest':
    default:
      return items.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
  }
}

export default function ServicesGridClient({ services }: ServicesGridClientProps) {
  const [sortKey, setSortKey] = useState<SortKey>('newest');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setCurrentPage(1);
  }, [sortKey]);

  const sortedServices = useMemo(() => sortServices(services, sortKey), [services, sortKey]);
  const totalPages = Math.max(1, Math.ceil(sortedServices.length / SERVICES_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * SERVICES_PER_PAGE;
  const currentServices = sortedServices.slice(startIndex, startIndex + SERVICES_PER_PAGE);

  const goToPage = (page: number) => {
    const nextPage = Math.min(Math.max(page, 1), totalPages);
    setCurrentPage(nextPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const pageNumbers = useMemo(() => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, index) => index + 1);
    }

    const start = Math.max(1, safePage - 2);
    const end = Math.min(totalPages, start + 4);
    const adjustedStart = Math.max(1, end - 4);

    return Array.from({ length: end - adjustedStart + 1 }, (_, index) => adjustedStart + index);
  }, [safePage, totalPages]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-4">
            <span className="section-badge">What We Offer</span>
          </div>
          <h2 className="section-title">
            Our <span className="gradient-text">Services</span>
          </h2>
        </div>

        <div className="flex flex-col items-start gap-3 sm:items-end">
          <Select value={sortKey} onValueChange={(value) => setSortKey(value as SortKey)}>
            <SelectTrigger id="services-sort" className="min-w-[180px]">
              <SelectValue placeholder="Sort services" />
            </SelectTrigger>
            <SelectContent >
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="oldest">Oldest</SelectItem>
              <SelectItem value="title-asc">Title A-Z</SelectItem>
              <SelectItem value="title-desc">Title Z-A</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-sm text-gray-900">
            Showing {sortedServices.length === 0 ? 0 : startIndex + 1}-{Math.min(startIndex + SERVICES_PER_PAGE, sortedServices.length)} of {sortedServices.length}
          </p>
        </div>
      </div>

      {currentServices.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-8 text-gray-900">No services yet.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentServices.map((service) => {
            return (
              <Link
                key={service._id || service.slug}
                href={`/services/${service.slug}`}
                className="portfolio-card group block bg-white rounded-2xl overflow-hidden"
              >
                <div className="aspect-[16/10] overflow-hidden bg-gray-100">
                  {service.coverImage ? (
                    <img
                      src={service.coverImage}
                      alt={service.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
                      <Package className="w-10 h-10 text-primary/30" />
                    </div>
                  )}
                </div>

                <div className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <h3 className="font-display font-bold text-gray-900 text-base leading-snug">
                        {service.title}
                      </h3>
                      <p className="text-gray-900 text-sm mt-1.5 line-clamp-2 leading-relaxed">
                        {service.summary || service.description}
                      </p>
                    </div>
                    <div className="shrink-0 w-9 h-9 rounded-full border border-primary flex items-center justify-center text-primary group-hover:bg-primary group-hover:border-primary group-hover:text-white transition-all duration-300">
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
          <button
            type="button"
            onClick={() => goToPage(safePage - 1)}
            disabled={safePage === 1}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-900 bg-white px-3 py-2 text-sm text-gray-900 transition-colors hover:border-primary/40 hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </button>

          {pageNumbers.map((pageNumber) => (
            <button
              key={pageNumber}
              type="button"
              onClick={() => goToPage(pageNumber)}
              className={`min-w-10 rounded-lg border px-3 py-2 text-sm transition-colors ${
                pageNumber === safePage
                  ? 'border-primary bg-primary text-white'
                  : 'border-gray-900 bg-white text-gray-900 hover:border-primary/40 hover:text-primary'
              }`}
            >
              {pageNumber}
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

      <div className="text-center pt-4">
        <Link href="/contact" className="btn-primary">
          Discuss Your Project <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}