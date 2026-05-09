"use client";

import { Toaster } from 'sonner';

export default function AppToaster() {
  return (
    <Toaster
      position="top-right"
      richColors
      closeButton
      toastOptions={{
        style: {
          background: '#0d1526',
          color: '#ffffff',
          border: '1px solid #1a2540',
        },
      }}
    />
  );
}
