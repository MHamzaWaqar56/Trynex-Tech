import type { Metadata } from 'next';
import { connectDB } from '@/lib/db';
import { Portfolio } from '@/models/Portfolio';
import CTASection from '@/components/sections/CTASection';
import PageHero from '@/components/sections/PageHero';
import PortfolioProjectsClient from '@/components/portfolio/PortfolioProjectsClient';
import { BriefcaseBusiness } from 'lucide-react';
import TestimonialsSection from '@/components/sections/TestimonialsSection';
import StatsSection from '@/components/sections/StatsSection';

export const metadata: Metadata = {
  title: 'Portfolio & Case Studies',
  description: 'Explore our portfolio and case studies across SEO, Web Development, Data Science, and AI.',
  alternates: { canonical: '/portfolio' },
  keywords: ['portfolio', 'case studies', 'web development projects', 'SEO results', 'AI projects'],
  openGraph: {
    title: 'Portfolio & Case Studies | Trynex Tech',
    description: 'See real client work, project results, and case studies from Trynex Tech.',
    url: '/portfolio',
    type: 'website',
  },
};

export const dynamic = 'force-dynamic';

type PortfolioProject = {
  _id: string;
  title: string;
  slug: string;
  client: string;
  service: string;
  description: string;
  results?: Array<{ label: string; value: string }>;
  tech?: string[];
  images?: string[];
  featured?: boolean;
  createdAt?: string;
};

async function getProjects(): Promise<PortfolioProject[]> {
  await connectDB();
  return Portfolio.find({}).lean<PortfolioProject[]>();
}

export default async function PortfolioPage() {
  const projects = await getProjects();

  return (
    <>
      <PageHero
         bgImage="https://res.cloudinary.com/da8lxpc3h/image/upload/v1778777951/portfolio_bg2_gyepov.png"
        badge={
          <span className="flex items-center gap-2">
            <BriefcaseBusiness className="h-4 w-4 animate-pulse" />
            Our Work
          </span>
        }
        title={<>Real Projects, <span className="gradient-text">Real Results</span></>}
        description="We let our work speak for itself. Explore case studies across all our service areas."
      />

      <section className="py-12 bg-white">
        <div className="container-custom">
          <PortfolioProjectsClient projects={projects} />
        </div>
      </section>
       
      <StatsSection />
      <TestimonialsSection /> 
      <CTASection />
    </>
  );
}
