
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  ArrowRight, BriefcaseBusiness, ChevronRight,
  Star, Facebook, Linkedin, Github, Mail,
} from 'lucide-react';
import { connectDB } from '@/lib/db';
import { Portfolio } from '@/models/Portfolio';
import { TeamMember } from '@/models/TeamMember';
import CTASection from '@/components/sections/CTASection';
import PageHero from '@/components/sections/PageHero';
import PortfolioHoverGallery from '@/components/portfolio/PortfolioHoverGallery';

export const dynamic = 'force-dynamic';

// ── Types
type TTeamMember = {
  _id: string; name: string; designation: string; image: string;
  facebook?: string; linkedin?: string; github?: string; email?: string;
};
type TTestimonial = {
  _id: string; name: string; company: string; role?: string;
  rating: number; review: string; approved: boolean;
};
type TProject = {
  _id: string; title: string; slug: string; client: string;
  service: string; description: string;
  problem?: string; solution?: string; results?: string;
  tech?: string[]; images?: string[]; featured?: boolean; builtBy?: string[];
  testimonial?: TTestimonial | null;
};

// ── Fetchers
async function getProject(slug: string): Promise<TProject | null> {
  await connectDB();
  return Portfolio.findOne({ slug }).populate('testimonial').lean<TProject>();
}

async function getBuiltByMembers(ids: string[]): Promise<TTeamMember[]> {
  if (!ids?.length) return [];
  return TeamMember.find({ _id: { $in: ids } }).sort({ order: 1 }).lean<TTeamMember[]>();
}

async function getRelatedProjects(currentSlug: string, service: string): Promise<TProject[]> {
  return Portfolio.find({ slug: { $ne: currentSlug }, service })
    .sort({ order: 1 }).limit(2).lean<TProject[]>();
}

interface Props { params: { slug: string }; }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const project = await getProject(params.slug);
  if (!project) return {};
  return {
    title: `${project.title} | Trynex Tech Portfolio`,
    description: project.description,
    alternates: { canonical: `/portfolio/${project.slug}` },
    openGraph: {
      title: project.title, description: project.description, type: 'article',
      images: project.images?.[0] ? [{ url: project.images[0] }] : [],
    },
  };
}

export default async function PortfolioDetailPage({ params }: Props) {
  const project = await getProject(params.slug);
  if (!project) notFound();

  const [builtByMembers, relatedProjects] = await Promise.all([
    getBuiltByMembers(project.builtBy || []),
    getRelatedProjects(project.slug, project.service),
  ]);

  const testimonial = (project.testimonial && (project.testimonial as TTestimonial).approved !== false)
    ? project.testimonial as TTestimonial
    : null;

  const images  = project.images || [];
  const tech    = project.tech   || [];
  const results = typeof project.results === 'string' ? project.results : '';

  // ── Sidebar card — shadow + hover lift (same effect as glass-card-hover)
  const sidebarCard = [
    'rounded-2xl bg-white p-6',
    'shadow-md hover:shadow-xl hover:-translate-y-1',
    'transition-all duration-300 ease-in-out',
  ].join(' ');

  return (
    <>
      <PageHero
        bgImage={images[0]}
        badge={
          <span className="flex items-center gap-2">
            <BriefcaseBusiness className="h-4 w-4 animate-pulse" />
            {project.service}
          </span>
        }
        title={<div style={{ fontSize: 'clamp(1.5rem, 6vw, 3rem)' }}>{project.title}</div>}
        description={`A complete case study for ${project.client}.`}
      />

      {/* ── Main Layout */}
      <section className="py-14 bg-white">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-12 items-start">

            {/* ════════════ LEFT COLUMN ════════════ */}
            <div className="space-y-14">

              {/* Project Brief */}
              {project.description && (
                <div>
                  <h2 className="text-2xl font-display font-bold text-gray-900 mb-4 pb-3 border-b border-primary-100">
                    Project Brief
                  </h2>
                  <p className="text-gray-900 leading-relaxed text-justify whitespace-pre-line">
                    {project.description}
                  </p>
                </div>
              )}

              {/* The Challenge */}
              {project.problem && (
                <div>
                  <h2 className="text-2xl font-display font-bold text-gray-900 mb-4 pb-3 border-b border-primary-100">
                    The Challenge
                  </h2>
                  <p className="text-gray-900 leading-relaxed text-justify whitespace-pre-line">
                    {project.problem}
                  </p>
                </div>
              )}

              {/* The Solution */}
              {project.solution && (
                <div>
                  <h2 className="text-2xl font-display font-bold text-gray-900 mb-4 pb-3 border-b border-primary-100">
                    The Solution
                  </h2>
                  <p className="text-gray-900 leading-relaxed text-justify whitespace-pre-line">
                    {project.solution}
                  </p>
                </div>
              )}

              {/* Project Screenshots */}
              {images.length > 0 && (
                <div>
                  <h2 className="text-2xl font-display font-bold text-gray-900 mb-6 pb-3 border-b border-primary-100">
                    Project Screenshots
                  </h2>
                  <PortfolioHoverGallery images={images} title={project.title} />
                </div>
              )}

              {/* Key Features & Technologies */}
              {tech.length > 0 && (
                <div>
                  <h2 className="text-2xl font-display font-bold text-gray-900 mb-5 pb-3 border-b border-primary-100">
                    Key Features &amp; Technologies
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {tech.map((t) => (
                      <div key={t} className="flex items-center gap-3 rounded-xl border border-primary bg-primary-50/60 p-3.5">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                          <BriefcaseBusiness className="w-3.5 h-3.5 text-primary" />
                        </div>
                        <span className="text-sm font-medium text-gray-900">{t}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Results & Impact */}
              {results && (
                <div>
                  <h2 className="text-2xl font-display font-bold text-gray-900 mb-4 pb-3 border-b border-primary-100">
                    Results &amp; Impact
                  </h2>
                  <p className="text-gray-900 leading-relaxed text-justify whitespace-pre-line">
                    {results}
                  </p>
                </div>
              )}

              {/* Built By */}
              {builtByMembers.length > 0 && (
                <div>
                  <h2 className="text-2xl font-display font-bold text-gray-900 mb-6 pb-3 border-b border-primary-100">
                    The People Behind It
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {builtByMembers.map((member) => {
                      const initials = member.name.split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase();
                      return (
                        <div key={String(member._id)} className="glass-card p-5 flex items-center gap-4">
                          {member.image ? (
                            <img src={member.image} alt={member.name}
                              className="w-14 h-14 rounded-full object-cover shrink-0 border-2 border-primary/20" />
                          ) : (
                            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center shrink-0 border-2 border-primary/20">
                              <span className="text-primary font-bold text-base">{initials}</span>
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                            <p className="font-display font-bold text-gray-900 text-sm truncate">{member.name}</p>
                            <p className="text-xs text-primary font-mono uppercase tracking-wider mt-0.5">{member.designation}</p>
                            <div className="flex items-center gap-2 mt-2">
                              {member.linkedin && (
                                <a href={member.linkedin} target="_blank" rel="noreferrer"
                                  className="w-6 h-6 rounded bg-slate-100 flex items-center justify-center hover:bg-primary/10 transition-colors">
                                  <Linkedin className="w-3 h-3 text-gray-600" />
                                </a>
                              )}
                              {member.github && (
                                <a href={member.github} target="_blank" rel="noreferrer"
                                  className="w-6 h-6 rounded bg-slate-100 flex items-center justify-center hover:bg-primary/10 transition-colors">
                                  <Github className="w-3 h-3 text-gray-600" />
                                </a>
                              )}
                              {member.facebook && (
                                <a href={member.facebook} target="_blank" rel="noreferrer"
                                  className="w-6 h-6 rounded bg-slate-100 flex items-center justify-center hover:bg-primary/10 transition-colors">
                                  <Facebook className="w-3 h-3 text-gray-600" />
                                </a>
                              )}
                              {member.email && (
                                <a href={`mailto:${member.email}`}
                                  className="w-6 h-6 rounded bg-slate-100 flex items-center justify-center hover:bg-primary/10 transition-colors">
                                  <Mail className="w-3 h-3 text-gray-600" />
                                </a>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

            </div>

            {/* ════════════ RIGHT SIDEBAR ════════════ */}
            <div className="space-y-6 lg:sticky lg:top-24">

              {/* Project Overview */}
              <div className={sidebarCard}>
                <h3 className="text-lg font-display font-bold text-gray-900 mb-5 pb-3 border-b border-primary-100">
                  Project Overview
                </h3>
                <div className="space-y-4">
                  {[
                    { label: 'Client Name',      value: project.client },
                    { label: 'Service',          value: project.service },
                    { label: 'Key Technologies', value: tech.slice(0, 3).join(', ') || '—' },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex flex-col gap-0.5 text-sm border-b border-primary-50 pb-3 last:border-0 last:pb-0">
                      <span className="text-gray-600 text-xs font-mono uppercase tracking-wider">{label}</span>
                      <span className="text-gray-900 font-semibold">{value}</span>
                    </div>
                  ))}
                </div>
                <Link href="/contact" className="btn-primary w-full justify-center mt-6 text-sm">
                  Start a Similar Project <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              {/* Client Testimonial */}
              {testimonial && (
                <div className={sidebarCard}>
                  <h3 className="text-lg font-display font-bold text-gray-900 mb-4 pb-3 border-b border-primary-100">
                    Client Testimonial
                  </h3>
                  <div className="flex gap-0.5 mb-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`w-4 h-4 ${i < testimonial.rating ? 'fill-primary text-primary' : 'text-primary'}`} />
                    ))}
                  </div>
                  <p className="text-sm text-gray-900 leading-relaxed italic mb-4 text-justify">
                    &ldquo;{testimonial.review}&rdquo;
                  </p>
                  <div className="flex items-center gap-3 pt-3 border-t border-primary-100">
                    <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center shrink-0">
                      <span className="text-white text-xs font-bold">
                        {testimonial.name.split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">{testimonial.name}</p>
                      <p className="text-xs text-gray-600">
                        {testimonial.role ? `${testimonial.role}, ` : ''}{testimonial.company}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Related Projects */}
              {relatedProjects.length > 0 && (
                <div className={sidebarCard}>
                  <h3 className="text-lg font-display font-bold text-gray-900 mb-4 pb-3 border-b border-primary-100">
                    Related Projects
                  </h3>
                  <div className="space-y-4">
                    {relatedProjects.map((rp) => (
                      <Link key={rp.slug} href={`/portfolio/${rp.slug}`}
                        className="group flex gap-3 items-start hover:bg-primary-50/50 rounded-xl p-2 -mx-2 transition-colors">
                        <div className="w-20 h-16 rounded-lg overflow-hidden shrink-0 bg-slate-100 border border-slate-200">
                          {rp.images?.[0] ? (
                            <img src={rp.images[0]} alt={rp.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <BriefcaseBusiness className="w-5 h-5 text-gray-300" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-bold text-gray-900 group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                            {rp.title}
                          </p>
                          <p className="text-xs text-gray-600 mt-1">{rp.service}</p>
                          <span className="inline-flex items-center gap-1 text-xs text-primary mt-1.5 font-medium">
                            View Project <ArrowRight className="w-3 h-3" />
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                  <Link href="/portfolio" className="btn-secondary w-full justify-center text-sm mt-5">
                    All Projects <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              )}

            </div>
          </div>
        </div>
      </section>

      <CTASection />
    </>
  );
}