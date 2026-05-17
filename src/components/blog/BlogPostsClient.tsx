'use client';

import Link from 'next/link';
import { ArrowRight, ChevronLeft, ChevronRight, Newspaper } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type BlogCard = {
  _id: string;
  title: string;
  slug: string;
  excerpt?: string;
  tags?: string[];
  author?: string;
  content: string;
  coverImage?: string;
  createdAt?: string;
};

type SortKey = 'newest' | 'oldest' | 'title-asc' | 'title-desc';

type BlogPostsClientProps = {
  posts: BlogCard[];
};

const POSTS_PER_PAGE = 12;

function stripHtml(content: string) {
  return content.replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
}

function estimateReadTime(content: string) {
  const words = stripHtml(content).split(/\s+/).filter(Boolean).length;
  return `${Math.max(1, Math.ceil(words / 220))} min`;
}

export default function BlogPostsClient({ posts }: BlogPostsClientProps) {
  const [sortKey, setSortKey] = useState<SortKey>('newest');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setCurrentPage(1);
  }, [sortKey]);

  const sortedPosts = useMemo(() => {
    const items = [...posts];

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
  }, [posts, sortKey]);

  const totalPages = Math.max(1, Math.ceil(sortedPosts.length / POSTS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * POSTS_PER_PAGE;
  const currentPosts = sortedPosts.slice(startIndex, startIndex + POSTS_PER_PAGE);

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
            <span className="section-badge">
              <Newspaper className="h-3.5 w-3.5" />
              All Posts
            </span>
          </div>
          <h2 className="section-title">
            Blog <span className="gradient-text">Posts</span>
          </h2>
         
        </div>

        <div className="flex flex-col items-start gap-3 sm:items-end">
          <Select value={sortKey} onValueChange={(value) => setSortKey(value as SortKey)}>
            <SelectTrigger id="blog-sort" className="min-w-[180px] sort-select-trigger">
              <SelectValue placeholder="Sort posts" />
            </SelectTrigger>
            <SelectContent className="sort-select-content">
              <SelectItem className="sort-select-item" value="newest">Newest</SelectItem>
              <SelectItem className="sort-select-item" value="oldest">Oldest</SelectItem>
              <SelectItem className="sort-select-item" value="title-asc">Title A-Z</SelectItem>
              <SelectItem className="sort-select-item" value="title-desc">Title Z-A</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-sm text-gray-900">
            Showing {sortedPosts.length === 0 ? 0 : startIndex + 1}-{Math.min(startIndex + POSTS_PER_PAGE, sortedPosts.length)} of {sortedPosts.length}
          </p>
        </div>
      </div>

      {currentPosts.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-8 text-gray-900">No blog posts yet.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentPosts.map((post) => (
            <Link
              key={post._id}
              href={`/blog/${post.slug}`}
              className="portfolio-card group block bg-white rounded-2xl overflow-hidden"
            >
              <div className="relative aspect-[16/10] overflow-hidden bg-gray-100">
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
                    <span className="text-primary/40 text-sm font-mono uppercase tracking-widest">No Preview</span>
                  </div>
                )}
              </div>

              <div className="p-5">
                <div className="flex items-end justify-between gap-4">
                  <div className="min-w-0">
                    <h3 className="font-display font-bold text-gray-900 text-base leading-snug line-clamp-2">
                      {post.title}
                    </h3>
                    <p className="text-gray-900 text-sm mt-1.5 line-clamp-2 leading-relaxed">
                      {post.excerpt || stripHtml(post.content).slice(0, 140) + '...'}
                    </p>
                  </div>
                  <div className="shrink-0 w-9 h-9 rounded-full border border-primary flex items-center justify-center text-primary group-hover:bg-primary group-hover:border-primary group-hover:text-white transition-all duration-300">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>

                
              </div>
            </Link>
          ))}
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
                  ? 'border-primary bg-primary text-dark'
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
    </div>
  );
}
