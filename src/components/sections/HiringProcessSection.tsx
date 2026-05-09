import {  CheckCircle2 } from 'lucide-react';

const hiringSteps = [
  {
    step: '01',
    title: 'Apply Online',
    description: 'Submit your application directly from the vacancy page. No middlemen, no forms to mail.',
  },
  {
    step: '02',
    title: 'We Review',
    description: 'Our team reviews every application carefully and responds within 3–5 business days.',
  },
  {
    step: '03',
    title: 'Short Assessment',
    description: 'A brief call or practical task to assess your skills and see if we are a good fit.',
  },
  {
    step: '04',
    title: 'Offer & Onboard',
    description: 'If selected, you will receive an offer letter and be onboarded within a week.',
  },
];


export default async function HiringProcessSection() {
  
  return (
    
      <section className="py-12 bg-white">
        <div className="container-custom">
          <div className="mb-4">
            <span className="section-badge">
              <CheckCircle2 className="h-3.5 w-3.5" />
              How It Works
            </span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
            <h2 className="section-title">
              Our Hiring <span className="gradient-text">Process</span>
            </h2>
            <p className="text-gray-900 text-base max-w-sm">
              Simple, transparent, and respectful of your time.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {hiringSteps.map(({ step, title, description }) => (
              <div key={step} className="glass-card-hover group flex flex-col gap-4 p-6">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-105">
                    <span className="text-sm font-display font-bold text-primary">{step}</span>
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