
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { connectDB } from '@/lib/db';
import { Service as ServiceModel } from '@/models/Service';
import { SERVICES, PRICING } from '@/lib/data';
import CTASection from '@/components/sections/CTASection';
import PricingPackageCard from '@/components/shared/PricingPackageCard';
import CurrencySwitcher from '@/components/shared/CurrencySwitcher';
import PageHero from '@/components/sections/PageHero';
import {
  Check, CircleDollarSign, Settings, Target,
  Layers3, ArrowRight, Tag,
} from 'lucide-react';
import TestimonialsSection from '@/components/sections/TestimonialsSection';

interface Props {
  params: { slug: string };
}

type ServicePackage = {
  name: string;
  price: number | string;
  period: string;
  description: string;
  features: string[];
  highlighted: boolean;
  cta?: string;
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
  details?: string;
  features?: string[];
  technologies?: string[];
  packages?: ServicePackage[];
};

export async function generateStaticParams() {
  await connectDB();
  const services = await ServiceModel.find({}).select({ slug: 1 }).lean<{ slug: string }[]>();
  if (services.length > 0) return services.map((s) => ({ slug: s.slug }));
  return SERVICES.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const service = await getService(params.slug);
  if (!service) return {};
  return { title: service.title, description: service.summary || service.description };
}

const accentMap: Record<string, string> = {
  seo: 'text-green-400',
  'web-development': 'text-primary',
  'data-science': 'text-purple-400',
  'ai-services': 'text-accent',
  'mobile-app-development': 'text-cyan-400',
  'ui-ux-design': 'text-pink-400',
  'cloud-devops': 'text-sky-400',
};

const gradientMap: Record<string, string> = {
  seo: 'from-green-400/10',
  'web-development': 'from-primary/10',
  'data-science': 'from-purple-400/10',
  'ai-services': 'from-accent/10',
  'mobile-app-development': 'from-cyan-400/10',
  'ui-ux-design': 'from-pink-400/10',
  'cloud-devops': 'from-sky-400/10',
};

function fallbackService(slug: string): PublicService | null {
  const service = SERVICES.find((item) => item.slug === slug);
  if (!service) return null;

  const fallbackPackages = PRICING.filter((plan) =>
    plan.service === (slug === 'web-development' ? 'Web' : slug === 'seo' ? 'SEO' : '')
  ).slice(0, 3).map((plan) => ({
    name: plan.name,
    price: plan.price,
    period: plan.period,
    description: plan.description,
    features: plan.features,
    highlighted: plan.highlighted,
    cta: plan.cta,
  }));

  const generatedPackages = fallbackPackages.length > 0 ? fallbackPackages : [
    { name: 'Basic', price: 'Custom', period: 'starter', description: 'Entry package for small projects.', features: service.features.slice(0, 3), highlighted: false, cta: 'Choose Basic' },
    { name: 'Standard', price: 'Custom', period: 'popular', description: 'Balanced package for most businesses.', features: service.features.slice(1, 5), highlighted: true, cta: 'Choose Standard' },
    { name: 'Premium', price: 'Custom', period: 'advanced', description: 'Full-scale package with the most value.', features: service.features.slice(0, 6), highlighted: false, cta: 'Choose Premium' },
  ];

  return {
    title: service.title,
    slug: service.slug,
    summary: service.description,
    details: service.description,
    bullets: service.features,
    tags: service.technologies,
    features: service.features,
    technologies: service.technologies,
    packages: generatedPackages,
  };
}

async function getService(slug: string): Promise<PublicService | null> {
  await connectDB();
  const service = await ServiceModel.findOne({ slug }).lean<PublicService>();
  return service || fallbackService(slug);
}

export default async function ServiceDetailPage({ params }: Props) {
  const service = await getService(params.slug);
  if (!service) notFound();

  const bullets = (service.bullets?.length ? service.bullets : service.features || []).slice(0, 6);
  const tags = (service.tags?.length ? service.tags : service.technologies || []).slice(0, 8);
  const packages = (service.packages || []).slice(0, 3);
  const accentColor = accentMap[service.slug] || 'text-primary';
  const gradientColor = gradientMap[service.slug] || 'from-primary/10';

  return (
    <>
      {/* Hero */}
      <PageHero
        bgImage={service.coverImage}
        badge={
          <span className="flex items-center gap-2">
            <Settings className="h-4 w-4 animate-pulse" />
            {tags[0] || 'Service'}
          </span>
        }
        title={<>{service.title}</>}
        description={service.summary || service.description || ''}
        />

      {/* Main Content */}
      <section className="py-12 bg-white">
        <div className="container-custom">
          <div className="mb-4">
            <span className="section-badge">Service Overview</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
            <h2 className="section-title">
              What This Service <span className="gradient-text">Includes</span>
            </h2>
            <p className="text-gray-900 text-base max-w-sm">
              Clear scope, practical deliverables, and a delivery structure that stays consistent with the rest of the site.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-8 items-start">
            <div className="space-y-8">
              <div className="glass-card-hover p-8 md:p-10">
                <div className="inline-flex items-center gap-2 rounded-full border border-primary bg-white px-4 py-1.5 text-sm font-medium text-primary mb-6">
                  <Settings className="w-4 h-4 animate-pulse" /> {service.title}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="glass-card p-4">
                    <p className="text-xs uppercase tracking-[0.25em] text-gray-900 mb-2">Bullets</p>
                    <p className="text-gray-900 font-semibold">{bullets.length} Points</p>
                  </div>
                  <div className="glass-card p-4">
                    <p className="text-xs uppercase tracking-[0.25em] text-gray-900 mb-2">Technologies</p>
                    <p className="text-gray-900 font-semibold">{tags.length} Tags</p>
                  </div>
                  <div className="glass-card p-4">
                    <p className="text-xs uppercase tracking-[0.25em] text-gray-900 mb-2">Packages</p>
                    <p className="text-gray-900 font-semibold">{packages.length} Plans</p>
                  </div>
                </div>
              </div>

              <div className="glass-card p-6">
                <div className="flex items-center gap-2 mb-4 text-gray-900">
                  <Target className="w-4 h-4 text-primary" />
                  <h3 className="text-xl font-display font-bold">Service Details</h3>
                </div>
                <p className="text-gray-900 leading-relaxed whitespace-pre-line">
                  {service.details || service.summary || service.description}
                </p>
              </div>

              <div className="glass-card p-6">
                <div className="flex items-center gap-2 mb-6 text-gray-900">
                  <Layers3 className="w-4 h-4 text-primary" />
                  <h3 className="text-xl font-display font-bold">What&apos;s Included</h3>
                </div>
                {bullets.length === 0 ? (
                  <p className="text-gray-900">No bullet points added yet.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {bullets.map((bullet) => (
                      <div key={bullet} className="rounded-2xl border border-slate-200 bg-white p-4 flex items-start gap-3 shadow-sm">
                        <Check className="w-4 h-4 mt-0.5 shrink-0 text-primary" />
                        <span className="text-sm text-gray-900 leading-relaxed">{bullet}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-8 lg:sticky lg:top-24">
              <div className="glass-card p-6">
                <div className="flex items-center gap-2 mb-4 text-gray-900">
                  <Tag className="w-4 h-4 text-primary" />
                  <h3 className="text-xl font-display font-bold">Technologies</h3>
                </div>
                {tags.length === 0 ? (
                  <p className="text-gray-900">No technologies listed.</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => <span key={tag} className="tag">{tag}</span>)}
                  </div>
                )}
              </div>

              <div className={`rounded-2xl border border-slate-200 bg-gradient-to-br ${gradientColor} to-transparent p-6`}>
                <h3 className="text-xl font-display font-bold mb-4 text-primary">Why Choose Us?</h3>
                <ul className="space-y-3 text-gray-900 text-sm">
                  {[
                    'Dedicated project manager',
                    'Transparent reporting & communication',
                    'Agile delivery and feedback loops',
                    'Post-launch support included',
                    'Quality-focused execution',
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-[#00d4ff] shrink-0" /> {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="glass-card p-6">
                <div className="flex items-center gap-2 mb-4 text-gray-900">
                  <ArrowRight className="w-4 h-4 text-primary" />
                  <h3 className="text-xl font-display font-bold">Get Started</h3>
                </div>
                <p className="text-gray-900 leading-relaxed mb-5">
                  Ready to get started with {service.title}? Let&apos;s discuss your requirements.
                </p>
                <Link href="/contact" className="btn-primary w-full justify-center">
                  Start Your Project <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Packages */}
      <section className="container-custom pb-24 pt-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between mb-12">
          <div>
            <div className="mb-4">
              <span className="section-badge">
                <CircleDollarSign className="h-4 w-4 animate-pulse" /> Packages
              </span>
            </div>
            <h2 className="section-title mb-4">
              Choose the Right <span className="gradient-text">Package</span>
            </h2>
            <p className="section-subtitle max-w-2xl">
              Three clear tiers so clients can pick the fit that matches their scope and budget.
            </p>
          </div>

          <CurrencySwitcher />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {packages.map((plan) => (
            <PricingPackageCard
              key={plan.name}
              plan={plan}
              accentClass="text-primary"
              badgeLabel="MOST POPULAR"
              actionHref="/contact"
              primary={plan.highlighted}
            />
          ))}
        </div>
      </section>

      <TestimonialsSection />
      <CTASection />
    </>
  );
}