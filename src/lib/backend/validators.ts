
import { z } from "zod";

export const contactSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional().or(z.literal("")),
  company: z.string().optional().or(z.literal("")),
  service: z.string().optional().or(z.literal("")),
  budget: z.string().optional().or(z.literal("")),
  deadline: z.string().optional().or(z.literal("")),
  message: z.string().min(10),
  subject: z.string().optional().or(z.literal("")),
});

export const consultationSchema = contactSchema.extend({
  service: z.string().min(2),
  preferredDate: z.string().optional().or(z.literal("")),
  preferredTime: z.string().optional().or(z.literal("")),
});

export const quoteRequestSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional().or(z.literal("")),
  company: z.string().optional().or(z.literal("")),
  service: z.string().min(2),
  budget: z.string().optional().or(z.literal("")),
  deadline: z.string().optional().or(z.literal("")),
  message: z.string().min(10),
});

export const newsletterSchema = z.object({
  email: z.string().email(),
});

export const blogSchema = z.object({
  title: z.string().min(3),
  slug: z.string().min(3),
  content: z.string().min(10),
  excerpt: z.string().optional().or(z.literal("")),
  tags: z.array(z.string()).default([]),
  author: z.string().optional().or(z.literal("")),
  published: z.boolean().optional().default(true),
  coverImage: z.string().optional().or(z.literal("")),
  views: z.number().optional().default(0),
});

export const portfolioSchema = z.object({
  title: z.string().min(3),
  slug: z.string().min(3),
  client: z.string().min(2),
  service: z.string().min(2),
  description: z.string().min(10),
  problem:  z.string().default(''),
  solution: z.string().default(''),
  builtBy:     z.array(z.string()).default([]),
  testimonial: z.string().nullable().optional(),
  results:  z.string().default(''),
  images: z.array(z.string()).default([]),
  tech: z.array(z.string()).default([]),
  featured: z.boolean().optional().default(false),
  order: z.coerce.number().int().positive(),
});

export const testimonialSchema = z.object({
  name: z.string().min(2),
  company: z.string().min(2),
  role: z.string().optional().or(z.literal("")),
  rating: z.number().min(1).max(5),
  review: z.string().min(10),
  service: z.string().optional(),
  approved: z.boolean().optional().default(false),
});

export const teamMemberSchema = z.object({
  name: z.string().min(2),
  designation: z.string().min(2),
  coverText: z.string().min(10),
  // FIX: image can be empty string or a valid URL — empty string allowed so edit without changing image works
  image: z.string().refine(
    (val) => val === "" || val.startsWith("http://") || val.startsWith("https://") || val.startsWith("/"),
    { message: "Image must be a valid URL or empty" }
  ).optional().or(z.literal("")),
  facebook: z.string().optional().or(z.literal("")),
  email: z.string().optional().or(z.literal("")),
  linkedin: z.string().optional().or(z.literal("")),
  github: z.string().optional().or(z.literal("")),
  order: z.coerce.number().int().positive(),
});

const servicePackageSchema = z.object({
  name: z.string().min(2),
  price: z.union([z.string().min(1), z.number()]),
  period: z.string().min(1),
  description: z.string().min(5),
  features: z.array(z.string().min(1)).default([]),
  highlighted: z.boolean().optional().default(false),
  cta: z.string().optional().or(z.literal("")),
});

export const serviceSchema = z.object({
  title: z.string().min(3),
  slug: z.string().min(3),
  coverImage: z.string().optional().or(z.literal("")),
  summary: z.string().min(10),
  bullets: z.array(z.string().min(1)).default([]),
  tags: z.array(z.string().min(1)).default([]),
  details: z.string().min(20),
  packages: z.array(servicePackageSchema).min(3),
  featured: z.boolean().optional().default(false),
  order: z.coerce.number().int().positive(),
});

export const pricingCustomSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  company: z.string().optional().or(z.literal("")),
  service: z.string().optional().or(z.literal("")),
  budget: z.string().optional().or(z.literal("")),
  deadline: z.string().optional().or(z.literal("")),
  message: z.string().min(10),
});


export const adminLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});



export const courseSchema = z.object({
  title:          z.string().min(3),
  slug:           z.string().optional(),
  coverImage:     z.string().url().or(z.literal("")),
  summary:        z.string().min(10),
  description:    z.string().min(20),
  category:       z.string().min(2),
  level:          z.enum(['Beginner', 'Intermediate', 'Advanced', 'All Levels']).optional(),
  language:       z.string().optional().or(z.literal("")),
  duration:       z.string().min(2),
  hoursPerWeek:   z.string().optional().or(z.literal("")),
  totalLectures:  z.coerce.number().int().optional(),
  instructor:     z.string().min(1),
  fees: z.array(z.object({
    label:       z.string().min(1),
    amount:      z.union([z.string().min(1), z.coerce.number()]),
    currency:    z.string().optional(),
    description: z.string().optional().or(z.literal("")),
  })).optional(),
  curriculum: z.array(z.object({
    week:    z.string().min(1),
    topic:   z.string().min(1),
    details: z.string().optional().or(z.literal("")),
  })).optional(),
  learningPoints: z.array(z.string()).optional(),
  requirements:   z.array(z.string()).optional(),
  tags:           z.array(z.string()).optional(),
  featured:       z.boolean().optional().default(false),
  isActive:       z.boolean().optional().default(true),
  order:          z.coerce.number().int().positive(),
  enrollmentLink: z.string().optional().or(z.literal("")),
});