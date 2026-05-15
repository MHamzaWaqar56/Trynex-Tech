
import Link from 'next/link';
import { ArrowRight, BriefcaseBusiness } from 'lucide-react';
import AppButton from '@/components/shared/AppButton';
import { Portfolio } from '@/models/Portfolio';
import { unstable_noStore as noStore } from 'next/cache';
import { connectDB } from '@/lib/db';



type PortfolioCard = {
  _id?: string;
  title: string;
  slug: string;
  client: string;
  service: string;
  description: string;
  results?: Array<{ label: string; value: string }>;
  tech?: string[];
  images?: string[];
  featured?: boolean;
  order?: number;
};

async function getProjects(): Promise<PortfolioCard[]> {
  noStore();
  await connectDB();
  return Portfolio.find({ featured: true })
    .sort({ order: 1, createdAt: -1 })
    .limit(3)
    .lean<PortfolioCard[]>();
}

export default async function PortfolioSection() {
  const projects = await getProjects();

  return (
    <section className="py-12 bg-white">
      <div className="container-custom">

        {/* Heading */}
        <div className="mb-4">
          <span className="section-badge">Our Portfolio</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
          <h2 className="section-title">
            Featured <span className="gradient-text">Projects</span>
          </h2>
          <p className="text-gray-900 text-base max-w-sm">
            Some of the amazing projects we&apos;ve delivered for our clients.
          </p>
        </div>

        {/* Cards */}
        {projects.length === 0 ? (
          <div className="text-center py-16 text-gray-900">
            No portfolio projects published yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => {
              const image = project.images?.[0];
              return (
                <Link
                  key={project._id || project.slug}
                  href={`/portfolio/${project.slug}`}
                  className="portfolio-card group block bg-white rounded-2xl overflow-hidden"
                >
                  {/* Image */}
                  <div className="aspect-[16/10] overflow-hidden bg-gray-100">
                    {image ? (
                      <img
                        src={image}
                        alt={project.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
                        <span className="text-primary/40 text-sm font-mono uppercase tracking-widest">No Preview</span>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-5 flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <h3 className="font-display font-bold text-gray-900 text-base leading-snug truncate">
                        {project.title}
                      </h3>
                      <p className="text-gray-900 text-sm mt-0.5">{project.service}</p>
                    </div>
                    <div className="shrink-0 w-9 h-9 rounded-full border border-primary flex items-center justify-center text-primary group-hover:bg-primary group-hover:border-primary group-hover:text-white transition-all duration-300">
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* View All */}
        <div className="mt-10 text-center">
          <AppButton href="/portfolio" variant="primary">
               View All Projects <ArrowRight className="w-4 h-4" />
            </AppButton>
        </div>
      </div>
    </section>
  );
}