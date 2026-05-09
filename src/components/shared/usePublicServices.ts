'use client';

import { useEffect, useState } from 'react';

export type PublicServiceOption = {
  _id?: string;
  title: string;
  slug: string;
};

type ServicesState = {
  services: PublicServiceOption[];
  loading: boolean;
  error: string | null;
};

export function usePublicServices() {
  const [state, setState] = useState<ServicesState>({
    services: [],
    loading: true,
    error: null,
  });

  useEffect(() => {
    let isActive = true;

    async function loadServices() {
      try {
        const response = await fetch('/api/services', { cache: 'no-store' });
        const data = await response.json();

        if (!isActive) return;

        if (response.ok) {
          setState({
            services: Array.isArray(data?.services) ? data.services : [],
            loading: false,
            error: null,
          });
        } else {
          setState({ services: [], loading: false, error: data?.error || 'Unable to load services.' });
        }
      } catch {
        if (!isActive) return;

        setState({ services: [], loading: false, error: 'Unable to load services.' });
      }
    }

    loadServices();

    return () => {
      isActive = false;
    };
  }, []);

  return state;
}