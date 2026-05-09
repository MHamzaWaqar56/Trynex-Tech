import type { Metadata } from 'next';
import ApplicationsManager from '@/components/admin/ApplicationsManager';

export const metadata: Metadata = {
  title: 'Careers Applications',
  description: 'Review and manage career applications.',
};

export default function CareersApplicationsPage() {
  return <ApplicationsManager />;
}
