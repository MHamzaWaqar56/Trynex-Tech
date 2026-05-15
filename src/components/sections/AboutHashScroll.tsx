'use client';

import { useEffect } from 'react';

function scrollToCurrentHash() {
  if (typeof window === 'undefined') return;

  const { hash, pathname } = window.location;
  if (pathname !== '/about' || !hash) return;

  const targetId = decodeURIComponent(hash.slice(1));
  const targetElement = document.getElementById(targetId);

  if (!targetElement) return;

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
}

export default function AboutHashScroll() {
  useEffect(() => {
    scrollToCurrentHash();

    window.addEventListener('hashchange', scrollToCurrentHash);
    return () => window.removeEventListener('hashchange', scrollToCurrentHash);
  }, []);

  return null;
}
