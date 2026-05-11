import Link from 'next/link';
import { Calendar, MoveRight, Newspaper } from 'lucide-react';

type RecentPost = {
  title: string;
  slug: string;
  coverImage?: string;
  createdAt?: string;
  tags?: string[];
};

interface Props {
  posts: RecentPost[];
}

export default function BlogRecentPosts({ posts }: Props) {
  if (posts.length === 0) return null;

  return (
    <div className="glass-card p-5">
      <h3 className="font-display font-bold text-gray-900 text-lg mb-4">Recent Posts</h3>

      <div className="space-y-4">
        {posts.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="flex items-start gap-3 group"
          >
            {/* Thumbnail */}
            <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-gray-100 bg-gray-50">
              {post.coverImage ? (
                <img
                  src={post.coverImage}
                  alt={post.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                  <Newspaper className="w-5 h-5 text-primary" />
                </div>
              )}
            </div>

            {/* Text */}
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-gray-900 leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                {post.title}
              </p>
              <p className="text-xs text-gray-900/60 mt-1 flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {post.createdAt
                  ? new Date(post.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                  : '—'}
              </p>
            </div>
          </Link>
        ))}
      </div>

      <Link
        href="/blog"
        className="mt-4 flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
      >
        View all posts <MoveRight className="h-4 w-4" />
      </Link>
    </div>
  );
}