import NewsletterWidget from '@/components/blog/NewsletterWidget';
import BlogTagsCard from '@/components/blog/detail/BlogTagsCard';
import BlogRecentPosts from '@/components/blog/detail/BlogRecentPosts';
import BlogShareCard from '@/components/blog/detail/BlogShareCard';

type RecentPost = {
  title: string;
  slug: string;
  coverImage?: string;
  createdAt?: string;
  tags?: string[];
};

interface Props {
  tags: string[];
  recentPosts: RecentPost[];
  postTitle: string;
  postUrl: string;
}

export default function BlogSidebar({ tags, recentPosts, postTitle, postUrl }: Props) {
  return (
    <aside className="w-full lg:w-[300px] shrink-0 space-y-6">
      <NewsletterWidget />
      <BlogTagsCard tags={tags} />
      <BlogRecentPosts posts={recentPosts} />
      <BlogShareCard title={postTitle} postUrl={postUrl} />
    </aside>
  );
}