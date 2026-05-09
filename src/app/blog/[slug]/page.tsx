import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { connectDB } from '@/lib/db';
import { Blog } from '@/models/Blog';
import CTASection from '@/components/sections/CTASection';
import TestimonialsSection from '@/components/sections/TestimonialsSection';
import BlogViewTracker from '@/components/blog/BlogViewTracker';
import BlogPostEnhancements from '@/components/blog/BlogPostEnhancements';
import BlogHero from '@/components/blog/detail/BlogHero';
import BlogArticle from '@/components/blog/detail/BlogArticle';
import BlogSidebar from '@/components/blog/BlogSidebar';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://trynex.com';

export const dynamic = 'force-dynamic';

type BlogPost = {
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  tags?: string[];
  author?: string;
  coverImage?: string;
  createdAt?: string;
  views?: number;
};

type RecentPost = Pick<BlogPost, 'title' | 'slug' | 'coverImage' | 'createdAt' | 'tags'>;

function stripHtml(content: string) {
  return content.replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
}

async function getPost(slug: string): Promise<BlogPost | null> {
  await connectDB();
  return Blog.findOne({ slug, published: true }).lean<BlogPost>();
}

async function getRecentPosts(slug: string): Promise<RecentPost[]> {
  await connectDB();
  return Blog.find({ published: true, slug: { $ne: slug } })
    .sort({ createdAt: -1 })
    .limit(4)
    .lean<RecentPost[]>();
}

interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getPost(params.slug);
  if (!post) return {};
  const description = post.excerpt || stripHtml(post.content).slice(0, 160);
  return {
    title: post.title,
    description,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      title: post.title,
      description,
      url: `${SITE_URL}/blog/${post.slug}`,
      type: 'article',
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const post = await getPost(params.slug);
  if (!post) notFound();

  const recentPosts = await getRecentPosts(post.slug);
  const wordCount = stripHtml(post.content).split(/\s+/).filter(Boolean).length;
  const readTime = `${Math.max(1, Math.ceil(wordCount / 220))} min read`;
  const postUrl = `${SITE_URL}/blog/${post.slug}`;

  return (
    <>
      <BlogHero
        title={post.title}
        author={post.author}
        coverImage={post.coverImage}
        createdAt={post.createdAt}
        views={post.views}
        tags={post.tags}
      />

      <BlogPostEnhancements readTime={readTime} contentId="blog-article-content" />
      <BlogViewTracker slug={post.slug} />

      <section className="py-12 bg-white">
        <div className="container-custom">
          <div className="flex flex-col lg:flex-row gap-10 max-w-[72rem] mx-auto">
            <BlogArticle
              title={post.title}
              coverImage={post.coverImage}
              content={post.content}
            />
            <BlogSidebar
              tags={post.tags || []}
              recentPosts={recentPosts}
              postTitle={post.title}
              postUrl={postUrl}
            />
          </div>
        </div>
      </section>

      <TestimonialsSection />
      <CTASection />
    </>
  );
}