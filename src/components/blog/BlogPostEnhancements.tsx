"use client";

import { useEffect, useState } from 'react';

type BlogPostEnhancementsProps = {
  readTime: string;
  contentId: string;
};

export default function BlogPostEnhancements({ readTime, contentId }: BlogPostEnhancementsProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const contentElement = document.getElementById(contentId);

    if (!contentElement) return;

    const updateProgress = () => {
      const scrollTop = window.scrollY;
      const contentRect = contentElement.getBoundingClientRect();
      const contentTop = contentRect.top + window.scrollY;
      const contentHeight = contentRect.height;
      const viewportHeight = window.innerHeight;
      const contentEnd = contentTop + Math.max(contentHeight - viewportHeight, 1);

      let nextProgress = 0;

      if (scrollTop <= contentTop) {
        nextProgress = 0;
      } else if (scrollTop >= contentEnd) {
        nextProgress = 100;
      } else {
        nextProgress = ((scrollTop - contentTop) / (contentEnd - contentTop)) * 100;
      }

      setProgress(nextProgress);
    };

    updateProgress();
    window.addEventListener('scroll', updateProgress, { passive: true });
    window.addEventListener('resize', updateProgress);

    return () => {
      window.removeEventListener('scroll', updateProgress);
      window.removeEventListener('resize', updateProgress);
    };
  }, [contentId]);

  return (
    <>
      <div className="fixed top-0 left-0 z-[60] h-1 w-full bg-dark/80 backdrop-blur-sm">
        <div
          className="h-full bg-gradient-to-r from-primary via-accent to-primary transition-[width] duration-150"
          style={{ width: `${progress}%` }}
        />
      </div>

    </>
  );
}