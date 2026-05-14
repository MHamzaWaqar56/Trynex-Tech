import type { Metadata } from 'next';
import { connectDB } from '@/lib/db';
import { Newspaper } from 'lucide-react';
import { Blog } from '@/models/Blog';
import CTASection from '@/components/sections/CTASection';
import PageHero from '@/components/sections/PageHero';
import BlogPostsClient from '../../components/blog/BlogPostsClient';
import BlogsNewsletterSection from '@/components/sections/BlogsNewsletterSection';

export const metadata: Metadata = {
  title: 'Blog & Insights',
  description: 'Expert insights on Web Development, SEO, Data Science, and AI from the Trynex Tech team.',
  alternates: { canonical: '/blog' },
  keywords: ['blog', 'SEO tips', 'web development articles', 'AI insights', 'data science', 'technology trends'],
  openGraph: {
    title: 'Blog & Insights | Trynex Tech',
    description: 'Read expert articles, tutorials, and insights from the Trynex Tech team.',
    url: '/blog',
    type: 'website',
  },
};

export const dynamic = 'force-dynamic';

type BlogCard = {
  _id: string;
  title: string;
  slug: string;
  excerpt?: string;
  tags?: string[];
  author?: string;
  content: string;
  published: boolean;
  coverImage?: string;
  views?: number;
  createdAt?: string;
};

function stripHtml(content: string) {
  return content.replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
}

function estimateReadTime(content: string) {
  const words = stripHtml(content).split(/\s+/).filter(Boolean).length;
  return `${Math.max(1, Math.ceil(words / 220))} min`;
}

async function getPosts(): Promise<BlogCard[]> {
  await connectDB();
  return Blog.find({ published: true }).sort({ createdAt: -1 }).lean<BlogCard[]>();
}

export default async function BlogPage() {
  const posts = await getPosts();

  return (
    <>
      <PageHero
       bgImage="https://res.cloudinary.com/da8lxpc3h/image/upload/v1778777706/blog_bg_zz6aal.png"
        badge={
    <span className="flex items-center gap-2">
      <Newspaper className="h-4 w-4 animate-pulse" />
      Blog & Insights
    </span>
  }
        title={<>Knowledge <span className="gradient-text">Hub</span></>}
        description="Expert articles, tutorials, and insights from our team of specialists."
      />

      <section className="py-12 bg-white section-top-accent">
        <div className="container-custom">
          <BlogPostsClient posts={posts} />
        </div>
      </section>
      
      <BlogsNewsletterSection />
      <CTASection />
    </>
  );
}