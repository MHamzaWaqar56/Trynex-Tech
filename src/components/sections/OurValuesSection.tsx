
import { Target, Eye, Heart, Gem } from 'lucide-react';


const values = [
  {
    icon: Target,
    title: 'Results-Driven',
    desc: 'Every decision we make is tied to measurable outcomes for your business.',
  },
  {
    icon: Eye,
    title: 'Transparent',
    desc: "No hidden fees, no surprises. You'll always know exactly what's happening.",
  },
  {
    icon: Heart,
    title: 'Client-First',
    desc: "Your success is our success. We treat every project like it's our own.",
  },
];



export default async function OurValuesSection() {

  return (
    <>
           
      {/* Values */}
      <section className="py-12 bg-white">
        <div className="container-custom">
          <div className="mb-4">
            <span className="section-badge">
              <Gem className="h-4 w-4 inline mr-1 animate-pulse" /> Our Values
            </span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
            <h2 className="section-title">
              What <span className="gradient-text">Drives Us</span>
            </h2>
            <p className="text-gray-900 text-base max-w-sm">
              The principles that guide every project, decision, and partnership.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {values.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="portfolio-card group p-8 rounded-2xl">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-display font-bold text-gray-900 text-lg mb-3">{title}</h3>
                <p className="text-gray-900 text-sm leading-relaxed text-justify">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    
    </>
  );
}