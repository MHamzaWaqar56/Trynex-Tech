import { Settings2 } from 'lucide-react';

const steps = [
  {
    number: '01',
    title: 'Discover',
    description: 'We understand your goals, requirements and vision through in-depth consultation.',
  },
  {
    number: '02',
    title: 'Plan',
    description: 'We plan the project and create a clear strategy, timeline, and technical roadmap.',
  },
  {
    number: '03',
    title: 'Design & Develop',
    description: 'We design, develop and build high-quality solutions using modern technologies.',
  },
  {
    number: '04',
    title: 'Launch & Support',
    description: 'We launch your project and provide ongoing support, maintenance, and updates.',
  },
];

export default function HowWeWorkSection() {
  return (
    <section className="py-12 bg-white">
      <div className="container-custom">

        <div className="mb-4">
          <span className="section-badge">
            <Settings2 className="h-3.5 w-3.5" />
            Our Process
          </span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
          <h2 className="section-title">
            How We <span className="gradient-text">Work</span>
          </h2>
          <p className="text-gray-900 text-base max-w-sm">
            A simple, transparent and efficient process from start to finish.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {steps.map(({ number, title, description }) => (
            <div key={number} className="glass-card-hover group flex flex-col gap-4 p-6">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-105">
                  <span className="text-sm font-display font-bold text-primary">{number}</span>
                </div>
                <div className="h-px flex-1 bg-primary/10" />
              </div>
              <div>
                <h3 className="text-base font-display font-bold text-gray-900 mb-1.5">{title}</h3>
                <p className="text-sm text-gray-900 leading-relaxed text-justify">{description}</p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}