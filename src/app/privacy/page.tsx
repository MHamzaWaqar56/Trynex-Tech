import type { Metadata } from 'next';
import { Shield } from 'lucide-react';
import PageHero from '@/components/sections/PageHero';
import CTASection from '@/components/sections/CTASection';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Learn how Trynex Tech collects, uses, and protects your personal information.',
  alternates: { canonical: '/privacy' },
  keywords: ['privacy policy', 'data protection', 'Trynex Tech', 'personal information'],
  openGraph: {
    title: 'Privacy Policy — Trynex Tech',
    description: 'Learn how Trynex Tech collects, uses, and protects your personal information.',
    url: '/privacy',
    type: 'website',
  },
};

const sections = [
  {
    title: '1. Information We Collect',
    content: [
      {
        subtitle: 'Personal Information',
        text: 'When you contact us, request a consultation, or subscribe to our newsletter, we may collect personal information such as your name, email address, phone number, and company name.',
      },
      {
        subtitle: 'Usage Data',
        text: 'We automatically collect information about how you interact with our website, including IP address, browser type, pages visited, time spent on pages, and referring URLs.',
      },
      {
        subtitle: 'Cookies & Tracking',
        text: 'We use cookies and similar tracking technologies to enhance your browsing experience, analyze site traffic, and understand where our visitors are coming from.',
      },
    ],
  },
  {
    title: '2. How We Use Your Information',
    content: [
      {
        subtitle: 'Service Delivery',
        text: 'We use your information to respond to inquiries, provide requested services, send project updates, and communicate about your ongoing projects.',
      },
      {
        subtitle: 'Marketing & Communication',
        text: 'With your consent, we may send newsletters, promotional materials, and service updates. You can unsubscribe from marketing emails at any time.',
      },
      {
        subtitle: 'Analytics & Improvement',
        text: 'We analyze usage data to improve our website performance, user experience, and service offerings.',
      },
    ],
  },
  {
    title: '3. Information Sharing',
    content: [
      {
        subtitle: 'Third-Party Services',
        text: 'We may share your information with trusted third-party service providers (such as hosting, analytics, or email platforms) strictly for the purpose of delivering our services. These partners are bound by confidentiality obligations.',
      },
      {
        subtitle: 'Legal Requirements',
        text: 'We may disclose your information if required by law, legal process, or governmental authority, or to protect the rights and safety of Trynex Tech and others.',
      },
      {
        subtitle: 'No Sale of Data',
        text: 'We do not sell, rent, or trade your personal information to any third party for their marketing purposes.',
      },
    ],
  },
  {
    title: '4. Data Security',
    content: [
      {
        subtitle: 'Security Measures',
        text: 'We implement industry-standard security measures including SSL encryption, secure servers, and regular security audits to protect your personal information from unauthorized access, alteration, or disclosure.',
      },
      {
        subtitle: 'Data Retention',
        text: 'We retain your personal data only as long as necessary to fulfil the purposes outlined in this policy, or as required by applicable law.',
      },
    ],
  },
  {
    title: '5. Your Rights',
    content: [
      {
        subtitle: 'Access & Correction',
        text: 'You have the right to access, update, or correct your personal information held by us at any time by contacting us directly.',
      },
      {
        subtitle: 'Deletion',
        text: 'You may request deletion of your personal data. We will comply unless retention is required for legal obligations or legitimate business purposes.',
      },
      {
        subtitle: 'Opt-Out',
        text: 'You can opt out of marketing communications at any time by clicking "unsubscribe" in any email or by contacting us at hello@trynextech.com.',
      },
    ],
  },
  {
    title: '6. Cookies Policy',
    content: [
      {
        subtitle: 'Essential Cookies',
        text: 'These cookies are necessary for the website to function properly. They cannot be disabled without affecting site functionality.',
      },
      {
        subtitle: 'Analytics Cookies',
        text: 'We use analytics cookies (such as Google Analytics) to understand how visitors interact with our site. You can opt out through your browser settings or tools like Google Analytics Opt-out.',
      },
      {
        subtitle: 'Managing Cookies',
        text: 'You can control and manage cookies through your browser settings. Please note that disabling certain cookies may affect the functionality of our website.',
      },
    ],
  },
  {
    title: '7. Third-Party Links',
    content: [
      {
        subtitle: 'External Sites',
        text: 'Our website may contain links to third-party websites. We are not responsible for the privacy practices or content of those sites. We encourage you to review the privacy policies of any external sites you visit.',
      },
    ],
  },
  {
    title: '8. Changes to This Policy',
    content: [
      {
        subtitle: 'Updates',
        text: 'We may update this Privacy Policy from time to time. Any changes will be posted on this page with a revised effective date. We encourage you to review this policy periodically.',
      },
    ],
  },
  {
    title: '9. Contact Us',
    content: [
      {
        subtitle: 'Questions?',
        text: 'If you have any questions, concerns, or requests regarding this Privacy Policy or how we handle your data, please contact us at hello@trynextech.com or through our Contact page.',
      },
    ],
  },
];

export default function PrivacyPage() {
  const lastUpdated = 'May 1, 2025';

  return (
    <>
      {/* Hero */}
      <PageHero
        bgImage="https://res.cloudinary.com/da8lxpc3h/image/upload/v1777513166/trynex-about-bg_tpbpqq.png"
        badge={
          <span className="flex items-center gap-2">
            <Shield className="h-4 w-4 animate-pulse" />
            Privacy Policy
          </span>
        }
        title={
          <>
            Your Privacy <span className="gradient-text">Matters to Us</span>
          </>
        }
        description="We are committed to protecting your personal information and being transparent about how we collect and use it."
      />

      {/* Content */}
      <section className="py-20 bg-white">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto">

            {/* Effective date */}
            <div className="mb-12 p-5 rounded-2xl bg-primary/10 border border-primary flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <p className="text-sm text-gray-900">
                <span className="font-semibold text-gray-900">Last Updated:</span>{' '}
                {lastUpdated}. This policy applies to all services provided by Trynex Tech.
              </p>
            </div>

            {/* Intro */}
            <p className="text-gray-900 text-base leading-relaxed mb-14">
              At <span className="font-semibold text-gray-900">Trynex Tech</span>, we take
              your privacy seriously. This Privacy Policy explains what information we collect,
              how we use it, and your rights regarding your personal data when you use our
              website or services. By using our website, you agree to the practices described
              in this policy.
            </p>

            {/* Sections */}
            <div className="space-y-14">
              {sections.map((section) => (
                <div key={section.title}>
                  <h2 className="text-xl font-display font-bold text-gray-900 mb-6 pb-3 border-b border-primary">
                    {section.title}
                  </h2>
                  <div className="space-y-6">
                    {section.content.map((item) => (
                      <div key={item.subtitle} className="pl-4 border-l-2 border-primary">
                        <h3 className="font-semibold text-gray-900 mb-2">{item.subtitle}</h3>
                        <p className="text-gray-900 text-sm leading-relaxed">{item.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>
      </section>

      <CTASection />
    </>
  );
}