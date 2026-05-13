

import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, BadgeDollarSign, Clock3, Sparkles, ShieldCheck, CheckCircle2, Star, Send, Globe } from 'lucide-react';
import { connectDB } from '@/lib/db';
import { Service as ServiceModel } from '@/models/Service';
import { SITE_NAME } from '@/lib/data';
import PricingPackageCard from '@/components/shared/PricingPackageCard';
import CurrencySwitcher from '@/components/shared/CurrencySwitcher';
import CustomPricingForm from '@/components/sections/CustomPricingForm';
import PageHero from '@/components/sections/PageHero';
import TestimonialsSection from '@/components/sections/TestimonialsSection';
import FAQSection from '@/components/sections/FAQSection';

const pricingHighlights = [
  {
    icon: ShieldCheck,
    title: 'Transparent packages',
    description: 'See what is included before you commit, with no hidden pricing surprises.',
  },
  {
    icon: BadgeDollarSign,
    title: 'Currency friendly',
    description: 'Switch between PKR and USD instantly and keep the same package comparison.',
  },
  {
    icon: Clock3,
    title: 'Custom scope support',
    description: 'If your project does not fit a standard package, request a tailored quote.',
  },
];

const howItWorks = [
  {
    step: '01',
    title: 'Browse packages above',
    description: 'Compare starter, standard, and premium plans for each service we offer.',
  },
  {
    step: '02',
    title: 'Switch your currency',
    description: 'Toggle between PKR and USD — prices update instantly across all plans.',
  },
  {
    step: '03',
    title: 'Fill in your details',
    description: 'Share your project scope, budget range, and deadline so we can tailor our response.',
  },
  {
    step: '04',
    title: 'Receive a custom quote',
    description: 'We review your request and send a tailored proposal within 24 hours.',
  },
];

export const metadata: Metadata = {
  title: `Pricing | ${SITE_NAME}`,
  description: 'Compare pricing in PKR or USD and pick a package that fits your budget.',
  alternates: { canonical: '/pricing' },
  keywords: ['pricing', 'PKR pricing', 'USD pricing', 'software house packages', 'Trynex Tech pricing'],
  openGraph: {
    title: `Pricing | ${SITE_NAME}`,
    description: 'Compare pricing in PKR or USD and pick a package that fits your budget.',
    url: '/pricing',
    type: 'website',
  },
};

type ServicePackage = {
  name: string;
  price: number | string;
  period: string;
  description: string;
  features: string[];
  highlighted: boolean;
  cta?: string;
};

type PricingGroup = {
  title: string;
  slug: string;
  packages: ServicePackage[];
};

async function getPricingGroups(): Promise<PricingGroup[]> {
  await connectDB();
  const services = await ServiceModel.find({}).sort({ order: 1, createdAt: -1 }).lean<any[]>();

  if (services.length === 0) return [];

  return services
    .filter((service) => (service.packages || []).length > 0)
    .map((service) => ({
      title: service.title,
      slug: service.slug,
      packages: (service.packages || []).slice(0, 3).map((plan: ServicePackage) => ({
        name: plan.name,
        price: plan.price,
        period: plan.period,
        description: plan.description,
        features: plan.features,
        highlighted: plan.highlighted,
        cta: plan.cta,
      })),
    }));
}

export default async function PricingPage() {
  const groups = await getPricingGroups();

  return (
    <>
      <PageHero
        bgImage="https://res.cloudinary.com/da8lxpc3h/image/upload/v1777513166/trynex-about-bg_tpbpqq.png"
        badge={<><BadgeDollarSign className="w-4 h-4" /> Transparent Pricing</>}
        title={<>Simple, Clear <span className="gradient-text">Pricing</span></>}
        description="No hidden charges, no surprises. Pick a package that fits your budget or request a custom quote tailored to your project scope."
      />

      {/* ── Highlights ── */}
      <section className="py-12 bg-white">
        <div className="container-custom">
          <div className="mb-4">
            <span className="section-badge">
              <Sparkles className="h-3.5 w-3.5" />
              Pricing Plans
            </span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
            <h2 className="section-title">
              Pricing built for <span className="gradient-text">clarity</span>
            </h2>
            <p className="text-gray-900 text-base max-w-sm">
              Compare packages, switch currency instantly, and request a custom quote for tailored project needs.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {pricingHighlights.map(({ icon: Icon, title, description }) => (
              <div key={title} className="glass-card-hover group p-6 h-full">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-105">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-lg font-display font-bold text-gray-900 mb-2">{title}</h3>
                <p className="text-sm text-gray-900 leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Currency + Packages ── */}
      <section className="py-12 bg-white section-top-accent">
        <div className="container-custom space-y-16">

          {/* Currency switcher card */}
          {groups.length > 0 && <div className="glass-card p-6 md:p-8">
            <div className="flex flex-col items-center text-center gap-4">
              <div className="section-badge">
                <BadgeDollarSign className="h-3.5 w-3.5" />
                Currency Switcher
              </div>
              <p className="text-gray-900 text-base max-w-2xl min-[320px]:max-[500px]:leading-[22px]">
                Choose PKR or USD to compare plans in the currency that works best for your team.
              </p>
              <CurrencySwitcher />
            </div>
          </div>}

          {/* Pricing groups */}
          {groups.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
              <BadgeDollarSign className="w-10 h-10 text-primary/40" />
              <p className="text-gray-900 text-lg font-medium">No pricing available</p>
              <p className="text-gray-900 text-sm max-w-xs">Pricing plans are being updated. Please contact us for a custom quote.</p>
            </div>
          ) : groups.map((group) => (
            <div key={group.slug}>
              <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between mb-8">
                <div>
                  <div className="section-badge mb-3">Pricing Plans</div>
                  <h2 className="section-title !text-3xl sm:!text-4xl lg:!text-4xl">
                    {group.title}
                  </h2>
                </div>
                <Link href="/contact" className="btn-secondary w-fit min-[768px]:max-[810px]:text-[12px]">
                  Request a custom quote <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 min-[768px]:max-[1000px]:gap-4">
                {group.packages.map((plan) => (
                  <PricingPackageCard
                    key={plan.name}
                    plan={plan}
                    accentClass="text-primary"
                    badgeLabel="MOST POPULAR"
                    actionLabel={plan.cta || 'Get Quote'}
                    actionHref="/contact"
                    primary={plan.highlighted}
                  />
                ))}
              </div>
            </div>
          ))}


          {/* ── Custom Pricing — two-column (contact page pattern) ── */}
          <div>
            <div className="mb-4">
              <span className="section-badge">
                <Send className="h-3.5 w-3.5" />
                Custom Pricing
              </span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
              <h2 className="section-title">
                Need a <span className="gradient-text">Custom Quote?</span>
              </h2>
              <p className="text-gray-900 text-base max-w-sm">
                Tell us your scope, budget, and deadline — we&apos;ll send a tailored proposal within 24 hours.
              </p>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-[0.9fr_1.1fr] gap-10 items-start">

              {/* Left column — info cards */}
              <div className="space-y-5">

                {/* How to use grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {howItWorks.map(({ step, title, description }) => (
                    <div key={step} className="glass-card-hover group flex flex-col gap-3 p-5">
                      <span className="text-xs font-mono font-semibold text-primary/70 tracking-widest">
                        STEP {step}
                      </span>
                      <div>
                        <h3 className="text-sm font-display font-bold text-gray-900 mb-1">{title}</h3>
                        <p className="text-xs text-gray-900 leading-relaxed text-justify">{description}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Currency note card */}
                <div className="glass-card p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <Globe className="w-5 h-5 text-primary" />
                    </div>
                    <h3 className="text-base font-display font-bold text-gray-900">
                      Currency switching made simple
                    </h3>
                  </div>
                  <ul className="space-y-3 text-sm text-gray-900">
                    <li className="flex items-start gap-2">
                      <Star className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                      Pakistan visitors see PKR by default, everyone else starts on USD.
                    </li>
                    <li className="flex items-start gap-2">
                      <Star className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                      Switch currency manually on this page or any service page.
                    </li>
                    <li className="flex items-start gap-2">
                      <Star className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                      Your selection is saved in the browser for future visits.
                    </li>
                  </ul>
                </div>

                {/* What you get card */}
                <div className="glass-card p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-5 h-5 text-primary" />
                    </div>
                    <h3 className="text-base font-display font-bold text-gray-900">
                      What you&apos;ll receive
                    </h3>
                  </div>
                  <ul className="space-y-3 text-sm text-gray-900">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                      A detailed proposal tailored to your project scope.
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                      Itemised breakdown of deliverables and timelines.
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                      Response within 24 hours — no chasing required.
                    </li>
                  </ul>
                </div>
              </div>

              {/* Right column — form */}
              <CustomPricingForm />
            </div>
          </div>

        </div>
      </section>

      <TestimonialsSection />
      <FAQSection />

    </>
  );
}