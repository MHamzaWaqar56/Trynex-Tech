import {
  ArrowRight,
  Briefcase,
  Clock3,
  MapPin,
  Users,
  Zap,
  Heart,
  TrendingUp,
  Star,
  Globe,
  CheckCircle2,
} from 'lucide-react';
import PageHero from '@/components/sections/PageHero';


const whyJoinUs = [
  {
    icon: Zap,
    title: 'Fast-Moving Culture',
    description: 'We move quickly, ship real products, and give everyone ownership of their work.',
  },
  {
    icon: TrendingUp,
    title: 'Growth-First',
    description: 'Mentorship, learning budget, and a team that invests in your career progression.',
  },
  {
    icon: Heart,
    title: 'Collaborative Team',
    description: 'A tight-knit group that helps each other win — no toxic politics, just good work.',
  },
  {
    icon: Globe,
    title: 'Remote Friendly',
    description: 'Work from anywhere in Pakistan. We care about output, not where you sit.',
  },
];


export default async function WhyJoinUsSection() {
  

  return (
    
      <section className="py-12 bg-white">
        <div className="container-custom">
          <div className="mb-4">
            <span className="section-badge">
              <Users className="h-3.5 w-3.5" />
              Why Trynex
            </span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
            <h2 className="section-title">
              Why Join <span className="gradient-text">Our Team</span>
            </h2>
            <p className="text-gray-900 text-base max-w-sm">
              We build software that matters, with people who care about doing it well.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {whyJoinUs.map(({ icon: Icon, title, description }) => (
              <div key={title} className="glass-card-hover group flex flex-col gap-4 p-6">
                <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-105">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-base font-display font-bold text-gray-900 mb-1.5">{title}</h3>
                  <p className="text-sm text-gray-900 leading-relaxed">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

   );
}