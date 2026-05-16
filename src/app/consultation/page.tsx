import type { Metadata } from 'next';
import { CalendarDays } from 'lucide-react';
import PageHero from '@/components/sections/PageHero';
import CTASection from '@/components/sections/CTASection';
import TestimonialsSection from '@/components/sections/TestimonialsSection';
import WhatYouWillGet from '@/components/sections/WhatYouWillGet';
import ConsultationFormSection from '@/components/sections/ConsultationFormSection';


export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Free Consultation | Trynex Tech',
  description: 'Book a free consultation with Trynex Tech. Tell us your goals, timeline, and budget — we will respond within 24 hours with a tailored plan.',
  alternates: { canonical: '/consultation' },
  keywords: ['free consultation', 'book consultation', 'software house Pakistan', 'project planning', 'Trynex Tech consultation'],
  openGraph: {
    title: 'Book a Free Consultation | Trynex Tech',
    description: 'Schedule a free consultation with our team. We will review your goals and send a tailored proposal within 24 hours.',
    url: '/consultation',
    type: 'website',
  },
};

export default function ConsultationPage() {
  return (
    <>
      <PageHero
        bgImage="https://res.cloudinary.com/da8lxpc3h/image/upload/v1778946677/consultation_bg_v3cqo4.png"
        badge={
          <span className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 animate-pulse" />
            Book Consultation
          </span>
        }
        title={<>Plan Your <span className="gradient-text">Project</span></>}
        description="Choose a date and time that works for you. We'll review your goals, timeline, and budget so the call is focused from the start."
      />

      <WhatYouWillGet />
      <TestimonialsSection />
      <ConsultationFormSection />
      <CTASection />
    </>
  );
}