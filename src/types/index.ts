// types/index.ts

export interface Service {
  id: string;
  title: string;
  slug: string;
  description: string;
  icon: string;
  features: string[];
  technologies: string[];
}

export interface ServicePackage {
  name: string;
  price: number | string;
  period: string;
  description: string;
  features: string[];
  highlighted: boolean;
  cta?: string;
}

export interface ManagedService {
  _id?: string;
  title: string;
  slug: string;
  coverImage: string;
  summary: string;
  bullets: string[];
  tags: string[];
  details: string;
  packages: ServicePackage[];
  order?: number;
}

export interface Project {
  _id?: string;
  title: string;
  slug: string;
  client: string;
  service: string;
  description: string;
  problem: string;
  solution: string;
  results: string[];
  tech: string[];
  images: string[];
  link?: string;
  featured: boolean;
  createdAt?: Date;
}

export interface BlogPost {
  _id?: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  tags: string[];
  author: string;
  coverImage?: string;
  published: boolean;
  views?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Testimonial {
  _id?: string;
  name: string;
  company: string;
  role: string;
  rating: number;
  review: string;
  avatar?: string;
  service: string;
  approved: boolean;
  createdAt?: Date;
}

export interface ContactMessage {
  _id?: string;
  name: string;
  email: string;
  phone?: string;
  service: string;
  message: string;
  status: 'new' | 'read' | 'replied';
  createdAt?: Date;
}

export interface Lead {
  _id?: string;
  name: string;
  email: string;
  phone?: string;
  service: string;
  budget?: string;
  deadline?: string;
  description: string;
  status: 'new' | 'contacted' | 'in-progress' | 'closed';
  createdAt?: Date;
}

export interface NewsletterSubscriber {
  _id?: string;
  email: string;
  active: boolean;
  subscribedAt?: Date;
}

export interface SiteStats {
  projectsCompleted: number;
  happyClients: number;
  yearsExperience: number;
  teamMembers: number;
}

export interface PricingPlan {
  id: string;
  name: string;
  price: number | string;
  period: string;
  description: string;
  features: string[];
  highlighted: boolean;
  service: string;
  cta: string;
}
