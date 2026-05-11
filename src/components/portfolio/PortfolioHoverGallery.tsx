
'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, Maximize2, X } from 'lucide-react';

type PortfolioHoverGalleryProps = {
  images: string[];
  title: string;
};

export default function PortfolioHoverGallery({ images, title }: PortfolioHoverGalleryProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  useEffect(() => {
    if (activeIndex === null) return undefined;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setActiveIndex(null);
      }

      if (event.key === 'ArrowLeft') {
        setActiveIndex((currentIndex) => {
          if (currentIndex === null) return currentIndex;
          return (currentIndex - 1 + images.length) % images.length;
        });
      }

      if (event.key === 'ArrowRight') {
        setActiveIndex((currentIndex) => {
          if (currentIndex === null) return currentIndex;
          return (currentIndex + 1) % images.length;
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeIndex, images.length]);

  if (images.length === 0) return null;

  const activeImage = activeIndex === null ? null : images[activeIndex];

  const openImage = (index: number) => setActiveIndex(index);

  const goToPrevious = () => {
    setActiveIndex((currentIndex) => {
      if (currentIndex === null) return currentIndex;
      return (currentIndex - 1 + images.length) % images.length;
    });
  };

  const goToNext = () => {
    setActiveIndex((currentIndex) => {
      if (currentIndex === null) return currentIndex;
      return (currentIndex + 1) % images.length;
    });
  };

  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {images.map((image, index) => (
          <button
            key={image}
            type="button"
            className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white text-left shadow-[0_10px_30px_rgba(15,23,42,0.08)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_45px_rgba(0,212,255,0.18)] focus:outline-none focus:ring-2 focus:ring-primary/30"
            onClick={() => openImage(index)}
          >
            <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
              <Image
                src={image}
                alt={`${title} gallery image ${index + 1}`}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-110"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-black/0 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            <div className="absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1 text-xs font-medium text-gray-900 shadow-md transition-transform duration-300 group-hover:scale-105">
              <Maximize2 className="h-3.5 w-3.5 text-primary" />
              Open preview
            </div>
          </button>
        ))}
      </div>

      {activeImage && typeof document !== 'undefined'
        ? createPortal(
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <button
              type="button"
              aria-label="Close preview"
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
              onClick={() => setActiveIndex(null)}
            />

            <div className="relative z-10 w-[50vw] min-[768px]:max-[1130px]:w-[75vw] min-[320px]:max-[767px]:w-[90vw] max-w-6xl rounded-[2rem] border border-gray-200 bg-white p-3 shadow-2xl shadow-black/20">
              <div className="flex items-center justify-between gap-4 px-3 py-2">
                <div className="min-w-0">
                  <p className="text-xs uppercase tracking-[0.25em] text-gray-900">
                    Gallery Preview
                  </p>
                  <p className="truncate text-sm text-gray-900">
                    {title}
                  </p>
                </div>
                <button
                  type="button"
                  aria-label="Close preview"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-gray-900 text-gray-900 transition-colors hover:border-primary hover:text-primary"
                  onClick={() => setActiveIndex(null)}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="relative rounded-[1.5rem] bg-gray-100 p-2">
                <button
                  type="button"
                  aria-label="Previous image"
                  className="absolute left-4 top-1/2 z-10 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-gray-900 bg-white/95 text-gray-900 shadow-lg transition-colors hover:border-primary hover:text-primary"
                  onClick={goToPrevious}
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>

                <button
                  type="button"
                  aria-label="Next image"
                  className="absolute right-4 top-1/2 z-10 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-gray-900 bg-white/95 text-gray-900 shadow-lg transition-colors hover:border-primary hover:text-primary"
                  onClick={goToNext}
                >
                  <ChevronRight className="h-5 w-5" />
                </button>

                <div className="relative overflow-hidden rounded-[1.25rem] bg-white min-[1024px]:!min-h-[360px] min-[320px]:max-[450px]:!min-h-[190px]" style={{ minHeight: '300px', maxHeight: '90vh' }}>
                  <Image
                    src={activeImage}
                    alt={title}
                    fill
                    className="object-contain"
                    sizes="100vw"
                  />
                </div>

                <div className="mt-3 flex items-center justify-between px-2 pb-1 text-xs text-gray-900">
                  <span>
                    {activeIndex === null ? 0 : activeIndex + 1} / {images.length}
                  </span>
                  <span>Use arrows or buttons to navigate</span>
                </div>
              </div>
            </div>
          </div>,
          document.body,
        )
        : null}
    </>
  );
}