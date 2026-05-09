import type { Metadata } from 'next';
import CareersManager from '@/components/admin/CareersManager';

export const metadata: Metadata = {
  title: 'Vacancies List',
  description: 'Edit or delete career vacancies.',
};

export default function AdminCareersPage() {
  return <CareersManager view="list" />;
}
