'use client';

import { Clock, MessageSquare, Sparkles, CheckCircle } from 'lucide-react';

const whatYouGetItems = [
  {
    icon: MessageSquare,
    title: 'Project discussion',
    description: 'Share your goals, scope, and any blockers so we can understand the project clearly.',
  },
  {
    icon: Sparkles,
    title: 'Strategy suggestions',
    description: 'Get practical ideas on the best approach, priorities, and possible execution path.',
  },
  {
    icon: Clock,
    title: 'Cost/time estimate',
    description: 'We’ll give you a realistic view of budget range and delivery timeline.',
  },
  {
    icon: CheckCircle,
    title: 'Q&A with expert',
    description: 'Ask anything and leave the call with clear next steps and expert guidance.',
  },
];

export default function WhatYouWillGet() {

  return (
     
      <section className="py-12 bg-white">
        <div className="container-custom">
          <div className="mb-4">
            <span className="section-badge">
              <Sparkles className="h-3.5 w-3.5" />
              What You&rsquo;ll Get
            </span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
            <h2 className="section-title">
              A focused <span className="gradient-text">consultation call</span>
            </h2>
            <p className="text-gray-900 text-base max-w-md">
              We keep the session practical so you leave with clarity, direction, and a realistic next step.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {whatYouGetItems.map(({ icon: Icon, title, description }) => (
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

    
    
  );
}