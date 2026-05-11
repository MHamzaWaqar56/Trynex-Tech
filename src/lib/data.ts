import { Service, PricingPlan, SiteStats } from '@/types';

export const SITE_NAME = 'Trynex Tech';
export const SITE_TAGLINE = 'Your Vision, Engineered to Perform.';
export const SITE_DESCRIPTION = 'Premium software house delivering cutting-edge SEO, Web Development, Data Science, AI solutions and other services that transform businesses.';
export const WHATSAPP_NUMBER = '+923001234567';

export const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'About Us', href: '/about' },
  { label: 'Services', href: '/services' },
  { label: 'Portfolio', href: '/portfolio' },
  { label: 'Blog', href: '/blog' },
  { label: 'Contact', href: '/contact' },
];

export const SERVICES: Service[] = [
  {
    id: 'seo',
    title: 'SEO & Digital Marketing',
    slug: 'seo',
    description:
      'Dominate search rankings and drive organic traffic with data-driven SEO strategies tailored for your business.',
    icon: '🎯',
    features: [
      'Technical SEO Audit',
      'Keyword Research & Strategy',
      'On-Page & Off-Page SEO',
      'Local SEO',
      'E-commerce SEO',
      'Monthly Reporting',
    ],
    technologies: ['Google Analytics', 'Search Console', 'Ahrefs', 'SEMrush', 'Screaming Frog'],
  },
  {
    id: 'web-development',
    title: 'Web Development',
    slug: 'web-development',
    description:
      'High-performance, scalable web applications built with the latest technologies for exceptional user experiences.',
    icon: '💻',
    features: [
      'Custom Web Apps',
      'E-commerce Development',
      'CMS Development',
      'API Development & Integration',
      'Performance Optimization',
      'Maintenance & Support',
    ],
    technologies: ['Next.js', 'React', 'Node.js', 'TypeScript', 'MongoDB', 'PostgreSQL'],
  },
  {
    id: 'data-science',
    title: 'Data Science & Analytics',
    slug: 'data-science',
    description:
      'Transform raw data into actionable insights with advanced analytics, visualization, and predictive modeling.',
    icon: '📊',
    features: [
      'Data Analysis & Visualization',
      'Predictive Modeling',
      'Business Intelligence',
      'ETL Pipeline Development',
      'Statistical Analysis',
      'Data Strategy Consulting',
    ],
    technologies: ['Python', 'TensorFlow', 'Pandas', 'Tableau', 'Power BI', 'Apache Spark'],
  },
  {
    id: 'ai-services',
    title: 'AI Solutions',
    slug: 'ai-services',
    description:
      'Harness the power of artificial intelligence to automate processes, gain insights, and build intelligent products.',
    icon: '🤖',
    features: [
      'Machine Learning Models',
      'Natural Language Processing',
      'Computer Vision',
      'AI Integration & APIs',
      'Process Automation',
      'AI Strategy Consulting',
    ],
    technologies: ['OpenAI', 'LangChain', 'TensorFlow', 'PyTorch', 'Hugging Face', 'Claude API'],
  },
  {
    id: 'ui-ux-design',
    title: 'UI/UX Design',
    slug: 'ui-ux-design',
    description:
      'Design conversion-focused interfaces and user journeys that feel modern, clear, and premium.',
    icon: '🎨',
    features: [
      'Wireframing and prototyping',
      'Design systems',
      'User journey mapping',
      'Responsive interface design',
      'Usability testing',
      'Brand-aligned visuals',
    ],
    technologies: ['Figma', 'Framer', 'FigJam', 'Adobe XD'],
  }
];


export const PRICING: PricingPlan[] = [
  {
    id: 'seo-starter',
    name: 'SEO Starter',
    price: 299,
    period: '/month',
    description: 'Perfect for small businesses starting their SEO journey',
    features: [
      'Keyword Research (20 keywords)',
      'On-Page Optimization',
      'Monthly SEO Report',
      'Google Analytics Setup',
      'Basic Link Building',
      'Email Support',
    ],
    highlighted: false,
    service: 'SEO',
    cta: 'Get Started',
  },
  {
    id: 'seo-pro',
    name: 'SEO Professional',
    price: 599,
    period: '/month',
    description: 'For growing businesses that want to dominate their niche',
    features: [
      'Keyword Research (50 keywords)',
      'Full Technical SEO Audit',
      'Advanced Link Building',
      'Content Strategy & Writing',
      'Local SEO Optimization',
      'Bi-weekly Reports',
      'Priority Support',
    ],
    highlighted: true,
    service: 'SEO',
    cta: 'Most Popular',
  },
  {
    id: 'web-starter',
    name: 'Web Starter',
    price: 'From $1,500',
    period: 'one-time',
    description: 'A professional website to establish your online presence',
    features: [
      'Up to 10 Pages',
      'Responsive Design',
      'SEO-Ready Structure',
      'Contact Form',
      'CMS Integration',
      '3 Months Support',
    ],
    highlighted: false,
    service: 'Web',
    cta: 'Get Quote',
  },
  {
    id: 'web-enterprise',
    name: 'Web Enterprise',
    price: 'Custom',
    period: '',
    description: 'Full-scale web applications for complex business needs',
    features: [
      'Custom Web Application',
      'API Development',
      'Database Design',
      'Authentication System',
      'Admin Dashboard',
      'Performance Optimization',
      '12 Months Support',
    ],
    highlighted: true,
    service: 'Web',
    cta: 'Contact Us',
  },
];


