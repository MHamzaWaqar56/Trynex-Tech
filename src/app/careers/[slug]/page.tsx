import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Briefcase, MapPin, Clock3, TrendingUp, CheckCircle2, ListChecks, Gift, ArrowRight, Users, Send } from 'lucide-react';
import { connectDB } from '@/lib/db';
import { CareerVacancy } from '@/models/CareerVacancy';
import CareerApplicationForm from '@/components/sections/CareerApplicationForm';
import CTASection from '@/components/sections/CTASection';
import PageHero from '@/components/sections/PageHero';
import { getApplicationAvailabilityLabel, isDeadlineExpired } from '@/lib/careers';

interface Props {
  params: { slug: string };
}

type PublicVacancy = {
  _id: string;
  title: string;
  slug: string;
  department: string;
  location: string;
  employmentType: string;
  salary?: string;
  description: string;
  featured?: boolean;
  open?: boolean;
  applicationDeadline?: string;
  responsibilities?: string[];
  requirements?: string[];
  perks?: string[];
};

export async function generateStaticParams() {
  await connectDB();
  const vacancies = await CareerVacancy.find({ open: true })
    .select({ slug: 1 })
    .lean<{ slug: string }[]>();
  return vacancies.map((v) => ({ slug: v.slug }));
}

async function getVacancy(slug: string): Promise<PublicVacancy | null> {
  await connectDB();
  return CareerVacancy.findOne({ slug, open: true }).lean<PublicVacancy>();
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const vacancy = await getVacancy(params.slug);
  if (!vacancy) return {};
  return {
    title: vacancy.title,
    description: vacancy.description,
    alternates: { canonical: `/careers/${vacancy.slug}` },
  };
}

export default async function CareerDetailPage({ params }: Props) {
  const vacancy = await getVacancy(params.slug);
  if (!vacancy) notFound();

  const applicationsClosed = isDeadlineExpired(vacancy.applicationDeadline);
  const availabilityLabel = getApplicationAvailabilityLabel(vacancy.applicationDeadline);

  return (
    <>
      {/* ── Hero ── */}
      <PageHero
        bgImage="https://res.cloudinary.com/da8lxpc3h/image/upload/v1777513166/trynex-about-bg_tpbpqq.png"
        badge={
          <span className="flex items-center gap-2">
            <Briefcase className="h-4 w-4 animate-pulse" />
            {vacancy.department}
          </span>
        }
        title={<>{vacancy.title}</>}
        description={
          <span className="flex flex-wrap items-center justify-center gap-3 mt-2 text-sm">
            <span className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4" /> {vacancy.location}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock3 className="w-4 h-4" /> {vacancy.employmentType}
            </span>
            {vacancy.salary && (
              <span className="flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4" /> {vacancy.salary}
              </span>
            )}
            {availabilityLabel && (
              <span className="px-3 py-1 rounded-full bg-primary/10 text-primary font-mono text-xs border border-primary/20">
                {availabilityLabel}
              </span>
            )}
          </span>
        }
      />

      {/* ── Job Details ── */}
      <section className="py-12 bg-white">
        <div className="container-custom">
          <div className="mb-4">
            <span className="section-badge">
              <Briefcase className="h-3.5 w-3.5" />
              Role Details
            </span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
            <h2 className="section-title">
              About This <span className="gradient-text">Role</span>
            </h2>
            <a href="#apply" className="btn-primary self-start sm:self-auto">
              Apply Now <ArrowRight className="w-4 h-4" />
            </a>
          </div>

          {/* Two-column layout — mirrors contact page */}
          <div className="grid grid-cols-1 xl:grid-cols-[1.1fr_0.9fr] gap-10 items-start">

            {/* Left — description + responsibilities */}
            <div className="space-y-6">

              {/* Description card */}
              <div className="glass-card p-6 sm:p-8">
                <p className="text-gray-900 text-base leading-relaxed whitespace-pre-line">
                  {vacancy.description}
                </p>
              </div>

              {/* Responsibilities */}
              {(vacancy.responsibilities || []).length > 0 && (
                <div className="glass-card p-6 sm:p-8">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <ListChecks className="w-5 h-5 text-primary" />
                    </div>
                    <h3 className="text-lg font-display font-bold text-gray-900">
                      Responsibilities
                    </h3>
                  </div>
                  <ul className="space-y-3">
                    {(vacancy.responsibilities || []).map((item) => (
                      <li key={item} className="flex items-start gap-3 text-sm text-gray-900">
                        <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Right — snapshot sidebar */}
            <div className="space-y-5">

              {/* Role Snapshot */}
              <div className="glass-card p-6">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Briefcase className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="text-lg font-display font-bold text-gray-900">Role Snapshot</h3>
                </div>
                <div className="space-y-3 text-sm text-gray-900">
                  <div className="flex items-center gap-3 py-2.5 border-b border-slate-100">
                    <MapPin className="w-4 h-4 text-primary shrink-0" />
                    <span className="font-mono text-xs text-gray-900/60 w-24 shrink-0">Location</span>
                    <span className="font-medium">{vacancy.location}</span>
                  </div>
                  <div className="flex items-center gap-3 py-2.5 border-b border-slate-100">
                    <Clock3 className="w-4 h-4 text-primary shrink-0" />
                    <span className="font-mono text-xs text-gray-900/60 w-24 shrink-0">Type</span>
                    <span className="font-medium">{vacancy.employmentType}</span>
                  </div>
                  {vacancy.salary && (
                    <div className="flex items-center gap-3 py-2.5 border-b border-slate-100">
                      <TrendingUp className="w-4 h-4 text-primary shrink-0" />
                      <span className="font-mono text-xs text-gray-900/60 w-24 shrink-0">Salary</span>
                      <span className="font-medium">{vacancy.salary}</span>
                    </div>
                  )}
                  {vacancy.applicationDeadline && (
                    <div className="flex items-center gap-3 py-2.5">
                      <Clock3 className="w-4 h-4 text-primary shrink-0" />
                      <span className="font-mono text-xs text-gray-900/60 w-24 shrink-0">Deadline</span>
                      <span className="font-medium">{vacancy.applicationDeadline}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Requirements */}
              {(vacancy.requirements || []).length > 0 && (
                <div className="glass-card p-6">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <Users className="w-5 h-5 text-primary" />
                    </div>
                    <h3 className="text-lg font-display font-bold text-gray-900">Requirements</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(vacancy.requirements || []).map((req) => (
                      <span key={req} className="tag">{req}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Perks */}
              {(vacancy.perks || []).length > 0 && (
                <div className="glass-card p-6">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <Gift className="w-5 h-5 text-primary" />
                    </div>
                    <h3 className="text-lg font-display font-bold text-gray-900">Perks & Benefits</h3>
                  </div>
                  <ul className="space-y-3">
                    {(vacancy.perks || []).map((perk) => (
                      <li key={perk} className="flex items-start gap-3 text-sm text-gray-900">
                        <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                        {perk}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── Application Form ── */}
      <section id="apply" className="py-12 bg-white">
        <div className="container-custom">
          <div className="mb-4">
            <span className="section-badge">
              <Send className="h-3.5 w-3.5" />
              Application Form
            </span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
            <h2 className="section-title">
              Apply for <span className="gradient-text">{vacancy.title}</span>
            </h2>
            <p className="text-gray-900 text-base max-w-sm">
              Submit your details and attach your CV. We&apos;ll review and get back to you if
              there&apos;s a fit.
            </p>
          </div>

          <div className="glass-card p-6 sm:p-8 lg:p-10">
            <CareerApplicationForm
              vacancySlug={vacancy.slug}
              vacancyTitle={vacancy.title}
              disabled={applicationsClosed}
              closedMessage={
                applicationsClosed
                  ? `Applications for this vacancy closed on ${vacancy.applicationDeadline}.`
                  : undefined
              }
            />
          </div>
        </div>
      </section>

      <CTASection />
    </>
  );
}