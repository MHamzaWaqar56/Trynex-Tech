interface Props {
  title: string;
  coverImage?: string;
  content: string;
}

export default function BlogArticle({ content }: Props) {
  return (
    <article className="flex-1 min-w-0">
     

      {/* Blog content */}
      <div id="blog-article-content" className="blog-content max-w-none">
        <div dangerouslySetInnerHTML={{ __html: content }} />
      </div>
    </article>
  );
}