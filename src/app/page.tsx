import type { Metadata } from 'next';
import HeroSection from '@/components/sections/HeroSection';
import ServicesSection from '@/components/sections/ServicesSection';
import PortfolioSection from '@/components/sections/PortfolioSection';
import StatsSection from '@/components/sections/StatsSection';
import TestimonialsSection from '@/components/sections/TestimonialsSection';
import CTASection from '@/components/sections/CTASection';
import WhyChooseUsSection from '@/components/sections/WhyChooseUsSection';
import FAQSection from '@/components/sections/FAQSection';
import HowWeWorkSection from '@/components/sections/HowWeWorkSection';
import { connectDB } from '@/lib/db';
import { Testimonial } from '@/models/Testimonial';
import { SiteStats } from '@/models/SiteStats';

export const metadata: Metadata = {
  title: 'Trynex Tech — Premium Software House',
  description:
    'Pakistan\'s leading software house. Expert SEO, Web Development, Data Science, and AI solutions that grow your business.',
  alternates: { canonical: '/' },
  keywords: ['Trynex Tech', 'software house Pakistan', 'SEO services', 'web development', 'AI solutions'],
  openGraph: {
    title: 'Trynex Tech — Premium Software House',
    description:
      'Expert SEO, web development, data science, and AI solutions for growing businesses in Pakistan.',
    url: '/',
    type: 'website',
  },
};

export default async function HomePage() {

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
      <HeroSection />
      <StatsSection />
      <WhyChooseUsSection
        satisfactionScore={satisfactionScore}
        clientRetention={clientRetention}
      />
      <ServicesSection />
      <HowWeWorkSection />
      <PortfolioSection />
      <TestimonialsSection />
      <FAQSection />
      <CTASection />
    </>
  );
}
