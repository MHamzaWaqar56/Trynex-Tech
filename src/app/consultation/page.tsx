import { CalendarDays } from 'lucide-react';
import PageHero from '@/components/sections/PageHero';
import CTASection from '@/components/sections/CTASection';
import TestimonialsSection from '@/components/sections/TestimonialsSection';
import StatsSection from '@/components/sections/StatsSection';
import WhatYouWillGet from '@/components/sections/WhatYouWillGet';
import ConsultationFormSection from '@/components/sections/ConsultationFormSection';


export default function ConsultationPage() {
 
  return (
    <>
      <PageHero
        bgImage="https://res.cloudinary.com/da8lxpc3h/image/upload/v1777513166/trynex-about-bg_tpbpqq.png"
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