
import { Mail } from 'lucide-react';
import PageHero from '@/components/sections/PageHero';
import TestimonialsSection from '@/components/sections/TestimonialsSection';
import FAQSection from '@/components/sections/FAQSection';
import CTASection from '@/components/sections/CTASection';
import TestimonialFormSection from '@/components/sections/TestimonialFormSection';
import ContactFormSection from '@/components/sections/ContactFormSection';


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
      <TestimonialFormSection />
      <CTASection />


  </>
  );
}