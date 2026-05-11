import { Calendar, Eye, Newspaper } from 'lucide-react';
import PageHero from '@/components/sections/PageHero';

interface Props {
  title: string;
  author?: string;
  coverImage?: string;
  createdAt?: string;
  views?: number;
  tags?: string[];
}

export default function BlogHero({ title, author, coverImage, createdAt, views, tags }: Props) {
  return (
    <PageHero
      bgImage={coverImage}
      badge={
        <span className="flex items-center gap-2">
          <Newspaper className="h-4 w-4 animate-pulse" />
          {tags?.[0] || 'Blog'}
        </span>
      }
      title={<div className='' style={{ fontSize: 'clamp(1.5rem, 6vw, 3.30rem)' }}>{title}</div>}
      description={
        <span className="flex flex-wrap items-center justify-center gap-1 text-sm text-gray-400 mt-2">
          <span className="font-semibold text-white">By {author || 'Trynex Tech'}</span>
          <span className="text-white"> | </span>
          <span className="flex items-center text-white gap-1">
            <Calendar className="w-3.5 h-3.5" />
            {createdAt
              ? new Date(createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
              : '—'}
          </span>
          {(views ?? 0) > 0 && (
            <>
              <span className="text-white"> | </span>
              <span className="flex items-center text-white gap-1">
                <Eye className="w-3.5 h-3.5" />
                {views?.toLocaleString()} views
              </span>
            </>
          )}
        </span>
      }
    />
  );
}