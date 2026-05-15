import type { Metadata } from 'next';
export const dynamic = 'force-dynamic';
import {  Users } from 'lucide-react';
import CTASection from '@/components/sections/CTASection';
import StatsSection from '@/components/sections/StatsSection'
import PageHero from '@/components/sections/PageHero';
import HowWeWorkSection from '@/components/sections/HowWeWorkSection'
import WhyChooseUsSection from '@/components/sections/WhyChooseUsSection';
import FAQSection from '@/components/sections/FAQSection';
import OurValuesSection from '@/components/sections/OurValuesSection';
import OurTeamSection from '@/components/sections/OurTeamSection';
import WhoWeAreSection from '@/components/sections/WhoWeAreSection';
import { connectDB } from '@/lib/db';
import { Testimonial } from '@/models/Testimonial';
import { SiteStats } from '@/models/SiteStats';
import CEOIntroSection from '@/components/sections/CEOIntroSection';

export const metadata: Metadata = {
  title: 'About Us',
  description: 'Learn about Trynex Tech — our story, mission, team, and values.',
  alternates: { canonical: '/about' },
  keywords: ['about Trynex Tech', 'software house Pakistan', 'team', 'mission', 'values'],
  openGraph: {
    title: 'About Trynex Tech',
    description: 'Discover our story, mission, and the team behind Trynex Tech.',
    url: '/about',
    type: 'website',
  },
};


export default async function AboutPage() {

    await connectDB();
  
    const [testimonials, stats] = await Promise.all([
      Testimonial.find({ approved: true}).lean<{ rating: number }[]>(),
      SiteStats.findOne({ key: 'main' }),
    ]);
  
    const satisfactionScore =
      testimonials.length > 0
        ? Math.round(
            (testimonials.reduce((sum, t) => sum + t.rating, 0) / testimonials.length / 5) * 100
          )
        : 0;
  
    const clientRetention = stats?.clientRetention ?? 0;
  
  

  return (
    <>
      {/* Hero */}
      <PageHero
        bgImage="https://res.cloudinary.com/da8lxpc3h/image/upload/v1778777730/about_bg_uofwo4.png"
        badge={
          <span className="flex items-center gap-2">
            <Users className="h-4 w-4 animate-pulse" />
            Our Story
          </span>
        }
        title={<>We Are <span className="gradient-text">Trynex Tech</span></>}
        description={<>Trynex Tech empowers businesses globally through accessible, impactful technology solutions.</>}
      />

      <WhoWeAreSection />     
      <WhyChooseUsSection
              satisfactionScore={satisfactionScore}
              clientRetention={clientRetention}
            />
      <StatsSection />
      <OurValuesSection />
      <HowWeWorkSection />
      <CEOIntroSection />
      <OurTeamSection />
      <FAQSection />
      <CTASection />
  
    </>
  );
}