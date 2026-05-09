import Link from 'next/link';
import {
  ArrowRight,
  Briefcase,
  Clock3,
  MapPin,
  TrendingUp,
} from 'lucide-react';
import { connectDB } from '@/lib/db';
import { CareerVacancy } from '@/models/CareerVacancy';
import { getApplicationAvailabilityLabel, isDeadlineExpired } from '@/lib/careers';

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

async function getVacancies(): Promise<PublicVacancy[]> {
  await connectDB();
  return CareerVacancy.find({ open: true })
    .sort({ featured: -1, order: 1, createdAt: -1 })
    .lean<PublicVacancy[]>();
}

export default async function OpenVacanciesSection() {
  const vacancies = await getVacancies();

  return (
    
      <section className="py-12 bg-white ">
        <div className="container-custom">
          <div className="mb-4">
            <span className="section-badge">
              <Briefcase className="h-3.5 w-3.5" />
              Open Roles
            </span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
            <h2 className="section-title">
              Current <span className="gradient-text">Vacancies</span>
            </h2>
            <p className="text-gray-900 text-base max-w-sm">
              {vacancies.length > 0
                ? `${vacancies.length} open position${vacancies.length > 1 ? 's' : ''} — apply directly from each listing.`
                : 'No open roles right now. Check back soon or send us your CV.'}
            </p>
          </div>

          {vacancies.length === 0 ? (
            <div className="glass-card p-10 flex flex-col items-center text-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Briefcase className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-display font-bold text-gray-900 mb-2">
                  No Open Vacancies Right Now
                </h3>
                <p className="text-gray-900 text-sm max-w-md leading-relaxed">
                  We don&apos;t have any open roles at the moment, but we&apos;re always growing. Drop us a
                  message and we&apos;ll keep you in mind.
                </p>
              </div>
              <Link href="/contact" className="btn-primary mt-2">
                Send Us Your CV <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {vacancies.map((vacancy) => {
                const expired = isDeadlineExpired(vacancy.applicationDeadline);
                return (
                  <article
                    key={vacancy._id}
                    className="glass-card flex flex-col p-6"
                  >
                    {/* Header */}
                    <div className="flex items-center gap-2 mb-3">
                      <span className="section-badge text-[10px] py-1 px-2.5">
                        <Briefcase className="w-3 h-3" />
                        {vacancy.department}
                      </span>
                      
                    </div>

                    <h2 className="text-lg font-display font-bold text-gray-900 mb-3 leading-snug">
                      {vacancy.title}
                    </h2>

                    {/* Meta */}
                    <div className="flex flex-wrap gap-3 text-sm text-gray-900 mb-4">
                      <span className="flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-primary" /> {vacancy.location}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock3 className="w-4 h-4 text-primary" /> {vacancy.employmentType}
                      </span>
                      {vacancy.salary && (
                        <span className="flex items-center gap-1.5">
                          <TrendingUp className="w-4 h-4 text-primary" /> {vacancy.salary}
                        </span>
                      )}
                    </div>

                    <p className="text-sm text-gray-900 leading-relaxed mb-4 line-clamp-3 flex-1 text-justify">
                      {vacancy.description}
                    </p>

                    {/* Requirement tags */}
                    {(vacancy.requirements || []).length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-5">
                        {(vacancy.requirements || []).slice(0, 4).map((req) => (
                          <span key={req} className="tag">
                            {req}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Footer */}
                    <div className="flex items-center justify-between gap-4 pt-4 border-t border-slate-100 mt-auto min-[320px]:max-[400px]:gap-[5px]">
                      <div className="text-xs text-gray-900 font-mono">
                        {getApplicationAvailabilityLabel(vacancy.applicationDeadline)}
                      </div>
                      <Link
                        href={`/careers/${vacancy.slug}`}
                        className={`btn-primary inline-flex items-center gap-2 py-2.5 px-5 text-sm ${
                          expired ? 'pointer-events-none opacity-60' : ''
                        }`}
                        aria-disabled={expired}
                      >
                        {expired ? 'Closed' : 'View & Apply'}
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>

    
  );
}