

'use client';

import { useState } from 'react';
import { ChevronDown, Clock, MessageCircle, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const faqs = [
  {
    question: 'What services does Trynex Tech provide?',
    answer: 'We provide SEO, web development, AI solutions, data science, design support, and full digital strategy services tailored to business goals.',
  },
  {
    question: 'How do you price projects?',
    answer: 'Pricing depends on scope, timeline, and complexity. We can start with a fixed package, custom quote, or a consultation-based proposal.',
  },
  {
    question: 'Can you work with international clients?',
    answer: 'Yes. We work with local and international clients and can communicate across time zones using email, chat, and scheduled calls.',
  },
  {
    question: 'How long does a project usually take?',
    answer: 'Timelines vary by project size. Small engagements may take a few days, while larger builds can take several weeks or months.',
  },
  {
    question: 'Do you offer support after launch?',
    answer: 'Yes. We offer post-launch support, maintenance, iterations, and growth-focused improvements depending on your plan.',
  },
];

const infoCards = [
  {
    icon: Clock,
    title: '24hr Response',
    description: 'We respond to every message within 24 hours. Send us your project details and get a custom quote fast.',
    cta: { label: 'Get a Quote', href: '/contact' },
    bg: 'bg-white portfolio-card group rounded-2xl',
    border: 'border-primary/15',
    iconBg: 'bg-primary/10',
    iconColor: 'text-primary',
  },
   {
    icon: MessageCircle,
    title: 'Free Consultation',
    description: 'Not sure where to start? Book a free 30-minute consultation and we will map out the best approach for your project.',
    cta: { label: 'Book a Consultation', href: '/consultation' },
    bg: 'bg-white portfolio-card group rounded-2xl',
    border: 'border-primary/15',
    iconBg: 'bg-primary/10',
    iconColor: 'text-primary',
  },
  
];

type FAQItemProps = {
  question: string;
  answer: string;
  open: boolean;
  onToggle: () => void;
};

function FAQItem({ question, answer, open, onToggle }: FAQItemProps) {
  return (
    <div className={`glass-card-hover overflow-hidden transition-all duration-300 ${open ? 'border-primary/30' : ''}`}>
      <button
        type="button"
        className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left"
        onClick={onToggle}
        aria-expanded={open}
      >
        <span className="font-display font-bold text-gray-900 text-base">{question}</span>
        <div className={`flex-shrink-0 w-8 h-8 rounded-full border border-primary flex items-center justify-center transition-all duration-300 ${open ? 'bg-primary border-primary' : ''}`}>
          <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${open ? 'rotate-180 text-white' : 'text-primary'}`} />
        </div>
      </button>
      <div className={`grid transition-all duration-300 ease-out ${open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
        <div className="overflow-hidden">
          <div className="px-6 pb-5 text-sm text-gray-900 text-justify leading-relaxed border-t border-gray-100 pt-4">
            {answer}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section className="py-12 bg-white">
      <div className="container-custom">

        {/* Header */}
        <div className="mb-4">
          <span className="section-badge">FAQ</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
          <h2 className="section-title">
            Frequently Asked <span className="gradient-text">Questions</span>
          </h2>
          <p className="text-gray-900 text-base max-w-sm">
            Quick answers to the most common questions about our services and process.
          </p>
        </div>

        {/* 2 Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-8 items-start">

          {/* Left — FAQs */}
          <div className="space-y-3">
            {faqs.map((faq, index) => (
              <FAQItem
                key={faq.question}
                question={faq.question}
                answer={faq.answer}
                open={openIndex === index}
                onToggle={() => setOpenIndex((current) => (current === index ? -1 : index))}
              />
            ))}
          </div>

          {/* Right — Info Cards */}
          <div className="flex flex-col gap-4 lg:sticky lg:top-28 min-[768px]:max-[1023px]:!flex-row">
            {infoCards.map(({ icon: Icon, title, description, cta, bg, border, iconBg, iconColor }) => (
              <div
                key={title}
                className={`rounded-2xl border ${border} ${bg} p-6`}
              >
                <div className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center mb-4`}>
                  <Icon className={`w-5 h-5 ${iconColor}`} />
                </div>
                <h3 className="font-display font-bold text-gray-900 text-base mb-2">{title}</h3>
                <p className="text-gray-900 text-sm leading-relaxed mb-4 text-justify">{description}</p>
                {cta && (
                  <Link
                    href={cta.href}
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
                  >
                    {cta.label} <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                )}
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}