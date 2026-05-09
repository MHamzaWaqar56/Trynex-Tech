
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowRight, BriefcaseBusiness, CircleDollarSign, Layers3, Sparkles, Target, UserRound } from 'lucide-react';
import { connectDB } from '@/lib/db';
import { Portfolio } from '@/models/Portfolio';
import CTASection from '@/components/sections/CTASection';
import PageHero from '@/components/sections/PageHero';
import PortfolioHoverGallery from '@/components/portfolio/PortfolioHoverGallery';
import HowWeWorkSection from '@/components/sections/HowWeWorkSection';

export const dynamic = 'force-dynamic';

type PortfolioProject = {
  title: string;
  slug: string;
  client: string;
  service: string;
  description: string;
  results?: Array<{ label: string; value: string }>;
  tech?: string[];
  images?: string[];
  featured?: boolean;
};

async function getProject(slug: string): Promise<PortfolioProject | null> {
  await connectDB();
  return Portfolio.findOne({ slug }).lean<PortfolioProject>();
}

interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const project = await getProject(params.slug);
  if (!project) return {};
  return { title: project.title, description: project.description };
}

export default async function PortfolioDetailPage({ params }: Props) {
  const project = await getProject(params.slug);
  if (!project) notFound();

  const galleryImages = project.images || [];
  const heroImage = galleryImages[0];
  const galleryItems = galleryImages;
  const results = project.results || [];
  const techStack = project.tech || [];

  return (
    <>
      <PageHero
        bgImage={heroImage}
        badge={
          <span className="flex items-center gap-2">
            <BriefcaseBusiness className="h-4 w-4 animate-pulse" />
            {project.service}
          </span>
        }
        title={<div style={{ fontSize: 'clamp(1.5rem, 6vw, 3.30rem)' }}>{project.title}</div>}
        description={`A project breakdown for ${project.client} across ${project.service}.`}
      />

      <section className="py-12 bg-white">
        <div className="container-custom space-y-12">
          <div>
            <div className="mb-4">
              <span className="section-badge">Project Overview</span>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between mb-10">
              <h2 className="section-title">
                What This <span className="gradient-text">Project Includes</span>
              </h2>
              <p className="section-subtitle max-w-[34rem] min-[768px]:max-[875px]:max-w-[24rem]">
                A clean case-study layout with the same visual language used across the services detail pages.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-8 items-start">
              <div className="space-y-8">
                <div className="glass-card-hover p-8 md:p-10">
                  <div className="flex flex-wrap items-center gap-3 mb-6">
                    <span className="inline-flex items-center gap-2 rounded-full border border-primary bg-white px-4 py-1.5 text-sm font-medium text-primary">
                      <BriefcaseBusiness className="w-4 h-4 animate-pulse" /> {project.service}
                    </span>
                    
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="glass-card p-4">
                      <p className="text-xs uppercase tracking-[0.25em] text-gray-900 mb-2">Client</p>
                      <p className="text-gray-900 font-semibold">{project.client}</p>
                    </div>
                    <div className="glass-card p-4">
                      <p className="text-xs uppercase tracking-[0.25em] text-gray-900 mb-2">Service</p>
                      <p className="text-gray-900 font-semibold">{project.service}</p>
                    </div>
                    <div className="glass-card p-4">
                      <p className="text-xs uppercase tracking-[0.25em] text-gray-900 mb-2">Gallery Images</p>
                      <p className="text-gray-900 font-semibold">{galleryItems.length} Preview{galleryItems.length === 1 ? '' : 's'}</p>
                    </div>
                  </div>
                </div>

                <div className="glass-card p-6">
                  <div className="flex items-center gap-2 mb-4 text-gray-900">
                    <Target className="w-4 h-4 text-primary" />
                    <h3 className="text-xl font-display font-bold">Project Details</h3>
                  </div>
                  <p className="text-gray-900 leading-relaxed whitespace-pre-line">{project.description}</p>
                </div>

                <div className="glass-card p-6">
                  <div className="flex items-center gap-2 mb-4 text-gray-900">
                    <Layers3 className="w-4 h-4 text-primary" />
                    <h3 className="text-xl font-display font-bold">Key Results</h3>
                  </div>
                  {results.length === 0 ? (
                    <p className="text-gray-900">No measurable results were added for this project yet.</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {results.map((result) => (
                        <div key={`${result.label}-${result.value}`} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                          <p className="text-xs uppercase tracking-[0.25em] text-gray-900 mb-2">{result.label}</p>
                          <p className="text-lg font-semibold text-gray-900">{result.value}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-8 lg:sticky lg:top-24">
                <div className="glass-card p-6">
                  <div className="flex items-center gap-2 mb-4 text-gray-900">
                    <Sparkles className="w-4 h-4 text-primary" />
                    <h3 className="text-xl font-display font-bold">Tech Stack</h3>
                  </div>
                  {techStack.length === 0 ? (
                    <p className="text-gray-900">No technologies were listed for this project.</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {techStack.map((tech) => <span key={tech} className="tag">{tech}</span>)}
                    </div>
                  )}
                </div>

                <div className="glass-card p-6">
                  <div className="flex items-center gap-2 mb-4 text-gray-900">
                    <Sparkles className="w-4 h-4 text-primary" />
                    <h3 className="text-xl font-display font-bold">Feature Image</h3>
                  </div>
                  {heroImage ? (
                    <div className="space-y-3">
                      <img src={heroImage} alt={project.title} className="w-full h-56 rounded-2xl border border-slate-200 object-cover" />
                     </div>
                  ) : (
                    <div className="rounded-2xl border border-slate-200 bg-white p-8 text-gray-900 text-center">
                      No project images uploaded.
                    </div>
                  )}
                </div>

                <div className="glass-card p-6">
                  <div className="flex items-center gap-2 mb-4 text-gray-900">
                    <CircleDollarSign className="w-4 h-4 text-primary" />
                    <h3 className="text-xl font-display font-bold">Next Step</h3>
                  </div>
                  <p className="text-gray-900 leading-relaxed mb-5">
                    Want a similar result for your business? Let&apos;s discuss the scope, timeline, and best approach.
                  </p>
                  <Link href="/contact" className="btn-primary w-full justify-center">
                    Discuss Similar Project <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {galleryItems.length > 0 && (
            <div className="space-y-4">
              <div className="mb-4">
                <span className="section-badge">Gallery</span>
              </div>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between !mt-0 !mb-10">
                <h2 className="section-title">
                  Project <span className="gradient-text">Gallery</span>
                </h2>
                <p className="section-subtitle !max-w-[34rem] min-[768px]:max-[875px]:max-w-[24rem]">
                  Click any image to open the carousel preview, then use the left and right controls to move through all images.
                </p>
              </div>
              <PortfolioHoverGallery images={galleryItems} title={project.title} />
            </div>
          )}
        </div>
      </section>

      <HowWeWorkSection />
      <CTASection />
    </>
  );
}