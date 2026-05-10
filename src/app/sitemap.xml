
import { MetadataRoute } from 'next';
import { SERVICES } from '@/lib/data';
import { connectDB } from '@/lib/db';
import { Service as ServiceModel } from '@/models/Service';
import { CareerVacancy } from '@/models/CareerVacancy';
import { Blog } from '@/models/Blog';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://trynextech.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages = [
    { url: BASE_URL,                        lastModified: new Date(), changeFrequency: 'weekly'  as const, priority: 1.0 },
    { url: `${BASE_URL}/services`,          lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.9 },
    { url: `${BASE_URL}/portfolio`,         lastModified: new Date(), changeFrequency: 'weekly'  as const, priority: 0.8 },
    { url: `${BASE_URL}/blog`,              lastModified: new Date(), changeFrequency: 'daily'   as const, priority: 0.8 },
    { url: `${BASE_URL}/pricing`,           lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.7 },
    { url: `${BASE_URL}/about`,             lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.6 },
    { url: `${BASE_URL}/contact`,           lastModified: new Date(), changeFrequency: 'yearly'  as const, priority: 0.6 },
    { url: `${BASE_URL}/careers`,           lastModified: new Date(), changeFrequency: 'weekly'  as const, priority: 0.6 },
    { url: `${BASE_URL}/consultation`,      lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.7 },
    { url: `${BASE_URL}/privacy`,           lastModified: new Date(), changeFrequency: 'yearly'  as const, priority: 0.3 },
    { url: `${BASE_URL}/terms`,             lastModified: new Date(), changeFrequency: 'yearly'  as const, priority: 0.3 },
  ];

  await connectDB();

  // ── Services
  const dbServices = await ServiceModel.find({}).select({ slug: 1 }).lean<{ slug: string }[]>();
  const serviceSlugs = dbServices.length > 0
    ? dbServices.map((s) => s.slug)
    : SERVICES.map((s) => s.slug);

  const servicePages = serviceSlugs.map((slug) => ({
    url: `${BASE_URL}/services/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }));

  // ── Blog posts
  const blogPosts = await Blog.find({ published: true })
    .select({ slug: 1, createdAt: 1 })
    .lean<{ slug: string; createdAt?: Date }[]>();

  const blogPages = blogPosts.map((post) => ({
    url: `${BASE_URL}/blog/${post.slug}`,
    lastModified: post.createdAt ? new Date(post.createdAt) : new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  // ── Career vacancies
  const vacancies = await CareerVacancy.find({ open: true })
    .select({ slug: 1 })
    .lean<{ slug: string }[]>();

  const careerPages = vacancies.map((vacancy) => ({
    url: `${BASE_URL}/careers/${vacancy.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }));

  return [...staticPages, ...servicePages, ...blogPages, ...careerPages];
}