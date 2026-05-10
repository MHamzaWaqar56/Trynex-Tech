import { Spinner } from '@/components/ui/spinner';

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <Spinner size="lg" />
    </div>
  );
}



  // <div className="fixed inset-0 z-50 flex items-center justify-center bg-dark">
  //     <Spinner size="lg" />
  //   </div>