
import Link from 'next/link';
import { ArrowRight, Package } from 'lucide-react';
import { connectDB } from '@/lib/db';
import AppButton from '@/components/shared/AppButton';
import { Service as ServiceModel } from '@/models/Service';

type ServiceCard = {
  _id?: string;
  title: string;
  slug: string;
  coverImage?: string;
  summary?: string;
  description?: string;
  featured?: boolean;
};

async function getServices(): Promise<ServiceCard[]> {
  await connectDB();
  return ServiceModel.find({ featured: true })
    .sort({ order: 1, createdAt: -1 })
    .limit(3)
    .lean<ServiceCard[]>();
}

export default async function ServicesSection() {
  const services = await getServices();

  return (
    <section className="py-12 bg-white">
      <div className="container-custom">

        {/* Heading */}
        <div className="mb-4">
          <span className="section-badge">What We Offer</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
          <h2 className="section-title">
            Our <span className="gradient-text">Services</span>
          </h2>
          <p className="text-gray-900 text-base max-w-sm">
            Practical, result-driven services with clear scope and delivery options.
          </p>
        </div>

        {/* Cards */}
        {services.length === 0 ? (
          <div className="text-center py-16 text-gray-900">
            No featured services published yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => (
              <Link
                key={service._id || service.slug}
                href={`/services/${service.slug}`}
                className="portfolio-card group block bg-white rounded-2xl overflow-hidden"
              >
                {/* Image */}
                <div className="aspect-[16/10] overflow-hidden bg-gray-100">
                  {service.coverImage ? (
                    <img
                      src={service.coverImage}
                      alt={service.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
                      <Package className="w-10 h-10 text-primary/30" />
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <h3 className="font-display font-bold text-gray-900 text-base leading-snug">
                        {service.title}
                      </h3>
                      <p className="text-gray-900 text-sm mt-1.5 line-clamp-2 leading-relaxed">
                        {service.summary || service.description}
                      </p>
                    </div>
                    <div className="shrink-0 w-9 h-9 rounded-full border border-primary flex items-center justify-center text-primary group-hover:bg-primary group-hover:border-primary group-hover:text-white transition-all duration-300">
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* View All */}
        <div className="mt-10 text-center">
            <AppButton href="/services" variant="primary">
               View All Services <ArrowRight className="w-4 h-4" />
            </AppButton>
        </div>
      </div>
    </section>
  );
}