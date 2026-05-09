
import Link from 'next/link';
import { ArrowRight, Check, Send } from 'lucide-react';
import AppButton from '@/components/shared/AppButton';

export default function CTASection() {
  return (
    <section className="py-12 ">
      <div className="container-custom">
        <div className="rounded-2xl bg-[#111827] px-8 py-16 text-center">

          {/* Icon */}
          <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center mx-auto mb-6">
            <Send className="w-6 h-6 text-white" />
          </div>

          {/* Heading */}
          <h2 className="text-3xl sm:text-4xl font-display font-bold text-white mb-4  min-[320px]:max-[767px]:text-[24px]">
            Let&apos;s Build Something Amazing Together
          </h2>

          {/* Subtext */}
          <p className="text-white text-base max-w-xl mx-auto mb-10">
            Have a project in mind? Let&apos;s turn your idea into a powerful digital solution.
          </p>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10  text-white min-[320px]:max-[767px]:mb-0 min-[320px]:max-[767px]:gap-[10px] min-[421px]:max-[767px]:!flex-row">
            <AppButton href="/contact" variant="primary" className='min-[320px]:max-[767px]:px-[1rem] min-[320px]:max-[420px]:flex min-[320px]:max-[420px]:justify-center'>
               Get Free Quote
              <ArrowRight className="w-4 h-4" />
            </AppButton>
            <AppButton href="/portfolio" variant="secondary" className='min-[320px]:max-[767px]:px-[1rem] min-[320px]:max-[420px]:flex min-[320px]:max-[420px]:justify-center'>
                View Our Work
            </AppButton>


          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-white min-[320px]:max-[767px]:hidden">
            {[
              'Free Consultation',
              'No Hidden Charges',
              '24hr Response',
              'NDA Available',
            ].map((item) => (
              <span key={item} className="flex items-center gap-2">
                <Check className="w-4 h-4 text-white" />
                {item}
              </span>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}