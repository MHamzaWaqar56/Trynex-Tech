interface Props {
  tags: string[];
}

export default function BlogTagsCard({ tags }: Props) {
  if (tags.length === 0) return null;

  return (
    <div className="glass-card p-5">
      <h3 className="font-display font-bold text-gray-900 text-lg mb-4">Tags</h3>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <span key={tag} className="section-badge">
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}