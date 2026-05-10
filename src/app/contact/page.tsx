import type { Metadata } from 'next';
import { Mail } from 'lucide-react';
import PageHero from '@/components/sections/PageHero';
import TestimonialsSection from '@/components/sections/TestimonialsSection';
import FAQSection from '@/components/sections/FAQSection';
import CTASection from '@/components/sections/CTASection';
import ContactFormSection from '@/components/sections/ContactFormSection';

export const metadata: Metadata = {
  title: 'Contact Us | Trynex Tech',
  description: 'Get in touch with Trynex Tech. Send us your project details and we will get back to you within 24 hours with a custom proposal.',
  alternates: { canonical: '/contact' },
  keywords: ['contact Trynex Tech', 'get in touch', 'software house Pakistan', 'project inquiry', 'hire developers Pakistan'],
  openGraph: {
    title: 'Contact Us | Trynex Tech',
    description: 'Have a project in mind? Send us a message and we will get back to you within 24 hours.',
    url: '/contact',
    type: 'website',
  },
};

export default function ContactPage() {
  return (
    <>
      <PageHero
        bgImage="https://res.cloudinary.com/da8lxpc3h/image/upload/v1777513166/trynex-about-bg_tpbpqq.png"
        badge={
          <span className="flex items-center gap-2">
            <Mail className="h-4 w-4 animate-pulse" />
            Get In Touch
          </span>
        }
        title={<>Let&apos;s <span className="gradient-text">Talk</span></>}
        description="Have a project in mind? We&apos;d love to hear about it. Send us a message and we&apos;ll get back to you within 24 hours."
      />

      <ContactFormSection />
      <TestimonialsSection />
      <FAQSection />
      <CTASection />
    </>
  );
}