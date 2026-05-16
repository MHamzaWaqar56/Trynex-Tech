import type { Metadata } from 'next';
import { FileText } from 'lucide-react';
import PageHero from '@/components/sections/PageHero';
import CTASection from '@/components/sections/CTASection';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Read the Terms of Service for using Trynex Tech website and services.',
  alternates: { canonical: '/terms' },
  keywords: ['terms of service', 'terms and conditions', 'Trynex Tech', 'legal'],
  openGraph: {
    title: 'Terms of Service — Trynex Tech',
    description: 'Read the Terms of Service for using Trynex Tech website and services.',
    url: '/terms',
    type: 'website',
  },
};

const sections = [
  {
    title: '1. Acceptance of Terms',
    content: [
      {
        subtitle: 'Agreement',
        text: 'By accessing or using the Trynex Tech website (trynextech.com) or any of our services, you confirm that you have read, understood, and agree to be bound by these Terms of Service. If you do not agree, please do not use our website or services.',
      },
      {
        subtitle: 'Eligibility',
        text: 'You must be at least 18 years of age to use our services or enter into agreements with Trynex Tech. By using our services, you represent that you meet this requirement.',
      },
    ],
  },
  {
    title: '2. Services Provided',
    content: [
      {
        subtitle: 'Scope of Services',
        text: 'Trynex Tech provides digital services including but not limited to web development, SEO & digital marketing, data science, artificial intelligence solutions, UI/UX design, and related consulting services.',
      },
      {
        subtitle: 'Service Agreements',
        text: 'Specific project terms, deliverables, timelines, and pricing are outlined in individual project proposals or contracts signed between Trynex Tech and the client. Those agreements supplement and may override certain general terms herein.',
      },
      {
        subtitle: 'Changes to Services',
        text: 'We reserve the right to modify, suspend, or discontinue any part of our services at any time with reasonable notice. We will not be liable to you or any third party for any such modification or discontinuation.',
      },
    ],
  },
  {
    title: '3. Intellectual Property',
    content: [
      {
        subtitle: 'Our Content',
        text: 'All content on this website — including text, graphics, logos, icons, images, and software — is the property of Trynex Tech or its content suppliers and is protected by applicable intellectual property laws.',
      },
      {
        subtitle: 'Client Deliverables',
        text: 'Upon full payment, clients receive ownership of the final deliverables as specified in the project agreement. Trynex Tech retains the right to display completed work in our portfolio unless the client requests otherwise in writing.',
      },
      {
        subtitle: 'Prohibited Use',
        text: 'You may not reproduce, distribute, modify, create derivative works of, or commercially exploit any content from this website without our prior written consent.',
      },
    ],
  },
  {
    title: '4. Client Responsibilities',
    content: [
      {
        subtitle: 'Accurate Information',
        text: 'You agree to provide accurate, current, and complete information when communicating with us or submitting project requirements. Inaccurate information may result in project delays or additional costs.',
      },
      {
        subtitle: 'Content Ownership',
        text: 'You confirm that any materials, content, or assets you provide to us for use in your project are either owned by you or that you have the necessary rights and permissions to use them.',
      },
      {
        subtitle: 'Timely Feedback',
        text: 'Timely feedback and approvals from clients are essential for project delivery. Delays caused by the client may affect agreed-upon timelines and may incur additional charges.',
      },
    ],
  },
  {
    title: '5. Payment Terms',
    content: [
      {
        subtitle: 'Invoicing',
        text: 'Payment terms are specified in individual project proposals. Unless otherwise agreed, projects typically require a deposit before work begins, with the remaining balance due upon project completion or as outlined in the contract.',
      },
      {
        subtitle: 'Late Payments',
        text: 'Overdue payments may result in suspension of services. We reserve the right to charge interest on late payments as specified in the project agreement.',
      },
      {
        subtitle: 'Refunds',
        text: 'Refund eligibility depends on the stage of the project and is governed by the individual project agreement. Please review your project contract for specific refund terms.',
      },
    ],
  },
  {
    title: '6. Confidentiality',
    content: [
      {
        subtitle: 'Mutual Confidentiality',
        text: 'Both Trynex Tech and its clients agree to keep confidential any proprietary information, business strategies, technical details, or trade secrets shared during the course of a project.',
      },
      {
        subtitle: 'Non-Disclosure',
        text: 'We will not disclose your confidential information to third parties without your explicit consent, except as required by law or as necessary to deliver the agreed services.',
      },
    ],
  },
  {
    title: '7. Limitation of Liability',
    content: [
      {
        subtitle: 'No Warranty',
        text: 'Our website and services are provided "as is" without any warranties, express or implied. We do not warrant that our services will be uninterrupted, error-free, or free from viruses or other harmful components.',
      },
      {
        subtitle: 'Liability Cap',
        text: 'To the maximum extent permitted by law, Trynex Tech shall not be liable for any indirect, incidental, consequential, or punitive damages arising from your use of our services or website. Our total liability shall not exceed the amount paid by you for the specific service in question.',
      },
    ],
  },
  {
    title: '8. Prohibited Activities',
    content: [
      {
        subtitle: 'Acceptable Use',
        text: 'You agree not to use our website or services to engage in any unlawful activity, transmit malicious code, attempt unauthorized access to our systems, infringe upon intellectual property rights, or engage in any activity that could harm Trynex Tech or its clients.',
      },
      {
        subtitle: 'Consequences',
        text: 'Violation of these terms may result in immediate termination of services without refund and may expose you to legal liability.',
      },
    ],
  },
  {
    title: '9. Termination',
    content: [
      {
        subtitle: 'By Either Party',
        text: 'Either party may terminate a service agreement with written notice as specified in the project contract. Obligations arising before termination (including payment for completed work) remain enforceable.',
      },
      {
        subtitle: 'By Trynex Tech',
        text: 'We reserve the right to terminate or suspend access to our services immediately, without prior notice, for any breach of these terms or conduct we reasonably believe is harmful.',
      },
    ],
  },
  {
    title: '10. Governing Law',
    content: [
      {
        subtitle: 'Jurisdiction',
        text: 'These Terms of Service are governed by the laws of Pakistan. Any disputes arising from these terms or our services shall be subject to the jurisdiction of the courts located in Pakistan.',
      },
    ],
  },
  {
    title: '11. Changes to Terms',
    content: [
      {
        subtitle: 'Updates',
        text: 'We reserve the right to update or modify these Terms of Service at any time. Changes will be effective upon posting to this page with a revised date. Continued use of our website or services after changes constitutes your acceptance of the updated terms.',
      },
    ],
  },
  {
    title: '12. Contact Us',
    content: [
      {
        subtitle: 'Questions?',
        text: 'If you have any questions about these Terms of Service, please contact us at hello@trynextech.com or through our Contact page. We are happy to clarify any points.',
      },
    ],
  },
];

export default function TermsPage() {
  const lastUpdated = 'May 1, 2025';

  return (
    <>
      {/* Hero */}
      <PageHero
        bgImage="https://res.cloudinary.com/da8lxpc3h/image/upload/v1778946710/terms_of_services_bg_jgyete.png"
        badge={
          <span className="flex items-center gap-2">
            <FileText className="h-4 w-4 animate-pulse" />
            Terms of Service
          </span>
        }
        title={
          <>
            Clear & Fair <span className="gradient-text">Terms</span>
          </>
        }
        description="Please read these terms carefully before using our website or engaging our services. They govern our relationship with you."
      />

      {/* Content */}
      <section className="py-20 bg-white">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto">

            {/* Effective date */}
            <div className="mb-12 p-5 rounded-2xl bg-primary/10 border border-primary flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5 text-primary" />
              </div>
              <p className="text-sm text-gray-900">
                <span className="font-semibold text-gray-900">Last Updated:</span>{' '}
                {lastUpdated}. These terms apply to all users of the Trynex Tech website and
                service clients.
              </p>
            </div>

            {/* Intro */}
            <p className="text-gray-900 text-base leading-relaxed mb-14">
              Welcome to <span className="font-semibold text-gray-900">Trynex Tech</span>.
              These Terms of Service outline the rules and regulations governing your use of
              our website located at{' '}
              <span className="text-primary font-medium">trynextech.com</span> and any
              services we provide. By accessing this website or engaging our services, you
              accept these terms in full.
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
                      <div key={item.subtitle} className="pl-4 border-l-2 border-primary/30">
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