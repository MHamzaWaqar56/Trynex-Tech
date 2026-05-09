'use client';

import { useEffect } from 'react';

type BlogViewTrackerProps = {
  slug: string;
};

export default function BlogViewTracker({ slug }: BlogViewTrackerProps) {
  useEffect(() => {
    const key = `blog_viewed_${slug}`;

    if (localStorage.getItem(key)) return;

    const timeoutId = window.setTimeout(() => {
      fetch(`/api/blogs/${slug}/view`, { method: 'POST' })
        .then(() => {
          localStorage.setItem(key, '1');
        })
        .catch(() => {});
    }, 1000);

    return () => window.clearTimeout(timeoutId);
  }, [slug]);

  return null;
}