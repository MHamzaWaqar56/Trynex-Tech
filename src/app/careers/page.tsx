
import type { Metadata } from 'next';
import { Briefcase } from 'lucide-react';
import CTASection from '@/components/sections/CTASection';
import PageHero from '@/components/sections/PageHero';
import WhyJoinUsSection from '@/components/sections/WhyJoinUsSection';
import HiringProcessSection from '@/components/sections/HiringProcessSection';
import OpenVacanciesSection from '@/components/sections/OpenVacanciesSection';
import OurTeamSection from '@/components/sections/OurTeamSection';


export const metadata: Metadata = {
  title: 'Careers',
  description: 'Explore open roles at Trynex Tech and apply for current vacancies.',
  alternates: { canonical: '/careers' },
  keywords: ['careers', 'jobs in Pakistan', 'software house jobs', 'Trynex Tech careers'],
  openGraph: {
    title: 'Careers | Trynex Tech',
    description: 'Explore open roles and apply for current vacancies at Trynex Tech.',
    url: '/careers',
    type: 'website',
  },
};


export default async function CareersPage() {

  return (
    <>
      <PageHero
        bgImage="https://res.cloudinary.com/da8lxpc3h/image/upload/v1777513166/trynex-about-bg_tpbpqq.png"
        badge={
          <span className="flex items-center gap-2">
            <Briefcase className="h-4 w-4 animate-pulse" />
            Careers
          </span>
        }
        title={
          <>
            Build <span className="gradient-text">With Us</span>
          </>
        }
        description="Join the team when we have open roles, and apply directly from each vacancy page. We hire people who care about doing great work."
      />

      <WhyJoinUsSection />
      <HiringProcessSection />
      <OpenVacanciesSection />
      <OurTeamSection />
      <CTASection />
    </>
  );
}