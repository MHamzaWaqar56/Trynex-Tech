import type { SVGProps } from 'react';
import { Twitter, Facebook, Linkedin } from 'lucide-react';

function WhatsAppIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" {...props}>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
    </svg>
  );
}

interface Props {
  title: string;
  postUrl: string;
}

export default function BlogShareCard({ title, postUrl }: Props) {
  const shareText = encodeURIComponent(`${title} | Trynex Tech`);
  const shareUrl = encodeURIComponent(postUrl);

  const shareLinks = [
    {
      label: 'Twitter',
      href: `https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}`,
      icon: Twitter,
    },
    {
      label: 'LinkedIn',
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`,
      icon: Linkedin,
    },
    {
      label: 'WhatsApp',
      href: `https://wa.me/?text=${encodeURIComponent(`${title} ${postUrl}`)}`,
      icon: WhatsAppIcon,
    },
    {
      label: 'Facebook',
      href: `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`,
      icon: Facebook,
    },
  ];

  return (
    <div className="glass-card p-5 min-[320px]:max-[500px]:p-[10px] min-[320px]:max-[767px]:flex min-[320px]:max-[767px]:justify-center min-[320px]:max-[767px]:gap-[10px] min-[320px]:max-[767px]:items-center">
      <h3 className="font-display font-bold text-gray-900 text-base mb-3 min-[320px]:max-[767px]:mb-0">Share this post:</h3>
      <div className="flex flex-wrap gap-2 min-[320px]:max-[400px]:gap-[5px]">
        {shareLinks.map(({ label, href, icon: Icon }) => (
          <a
            key={label}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Share on ${label}`}
            className="flex items-center justify-center w-10 h-10 rounded-lg border border-slate-200 text-gray-900 hover:border-primary hover:text-primary transition-all duration-200"
          >
            <Icon className="h-4 w-4" />
          </a>
        ))}
      </div>
    </div>
  );
}