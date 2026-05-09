import type { Metadata } from 'next';
import { connectDB } from '@/lib/db';
import { Settings } from 'lucide-react';
import { Service as ServiceModel } from '@/models/Service';
import { SERVICES } from '@/lib/data';
import CTASection from '@/components/sections/CTASection';
import PageHero from '@/components/sections/PageHero';
import ServicesGridClient from '@/components/services/ServicesGridClient';
import TestimonialsSection from '@/components/sections/TestimonialsSection';
import WhyChooseUsSection from '@/components/sections/WhyChooseUsSection';
import FAQSection from '@/components/sections/FAQSection';

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

function fallbackServices(): PublicService[] {
  return SERVICES.map((service) => ({
    title: service.title,
    slug: service.slug,
    description: service.description,
    features: service.features,
    technologies: service.technologies,
  }));
}

async function getServices(): Promise<PublicService[]> {
  try {
    await connectDB();
    const services = await ServiceModel.find({}).sort({ order: 1, createdAt: -1 }).lean<PublicService[]>();
    return services.length > 0 ? services : fallbackServices();
  } catch {
    return fallbackServices();
  }
}

export default async function ServicesPage() {
  const services = await getServices();

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
          <ServicesGridClient services={services} />
        </div>
      </section>

      <WhyChooseUsSection />
      <TestimonialsSection />
      <FAQSection />
      <CTASection />
    </>
  );
}
