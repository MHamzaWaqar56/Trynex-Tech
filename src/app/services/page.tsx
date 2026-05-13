

import type { Metadata } from 'next';
import { connectDB } from '@/lib/db';
import { Settings } from 'lucide-react';
import { Service as ServiceModel } from '@/models/Service';
import CTASection from '@/components/sections/CTASection';
import PageHero from '@/components/sections/PageHero';
import ServicesGridClient from '@/components/services/ServicesGridClient';
import TestimonialsSection from '@/components/sections/TestimonialsSection';
import WhyChooseUsSection from '@/components/sections/WhyChooseUsSection';
import FAQSection from '@/components/sections/FAQSection';
import { Testimonial } from '@/models/Testimonial';
import { SiteStats } from '@/models/SiteStats';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Services in Pakistan',
  description: 'Explore our full range of digital services in Pakistan: SEO, Web Development, Data Science, and AI Solutions.',
  alternates: { canonical: '/services' },
  keywords: ['services in Pakistan', 'SEO services', 'web development', 'data science', 'AI solutions'],
  openGraph: {
    title: 'Services in Pakistan | Trynex Tech',
    description: 'SEO, web development, data science, and AI solutions designed for businesses in Pakistan.',
    url: '/services',
    type: 'website',
  },
};

type PublicService = {
  _id?: string;
  title: string;
  slug: string;
  coverImage?: string;
  summary?: string;
  bullets?: string[];
  tags?: string[];
  description?: string;
  features?: string[];
  technologies?: string[];
};

async function getServices(): Promise<PublicService[]> {
  try {
    await connectDB();
    return await ServiceModel.find({}).sort({ order: 1, createdAt: -1 }).lean<PublicService[]>();
  } catch {
    return [];
  }
}

export default async function ServicesPage() {
  const services = await getServices();


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
      <PageHero
        bgImage="https://res.cloudinary.com/da8lxpc3h/image/upload/v1777513166/trynex-about-bg_tpbpqq.png"
        badge={
          <span className="flex items-center gap-2">
            <Settings className="h-4 w-4 animate-pulse" />
            What We Offer
          </span>
        }
        title={<>Our <span className="gradient-text">Services</span></>}
        description="Comprehensive digital solutions tailored to your business goals."
      />

      <section className="py-12 bg-white">
        <div className="container-custom">
          {services.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center gap-4">
              <Settings className="w-10 h-10 text-primary/40" />
              <p className="text-gray-900 text-lg font-medium">No services available</p>
              <p className="text-gray-900 text-sm max-w-xs">Please check back later or contact us directly for assistance.</p>
            </div>
          ) : (
            <ServicesGridClient services={services} />
          )}
        </div>
      </section>

      <WhyChooseUsSection
                    satisfactionScore={satisfactionScore}
                    clientRetention={clientRetention}
                  />
      <TestimonialsSection />
      <FAQSection />
      <CTASection />
    </>
  );
}