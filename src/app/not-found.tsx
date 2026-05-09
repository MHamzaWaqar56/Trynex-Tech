import Link from 'next/link';
import { ArrowLeft, Zap } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center container-custom text-center">
      <div>
        <div className="text-8xl font-display font-bold gradient-text mb-4">404</div>
        <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-6">
          <Zap className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-2xl font-display font-bold mb-3">Page Not Found</h1>
        <p className="text-dark-muted mb-8 max-w-sm mx-auto">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link href="/" className="btn-primary">
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>
      </div>
    </div>
  );
}
