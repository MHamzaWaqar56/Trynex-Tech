import { connectDB } from '@/lib/db';
import { Service } from '@/models/Service';
import Footer from './Footer';

export default async function FooterWrapper() {
  let services: { title: string; slug: string }[] = [];

  try {
    await connectDB();
    const raw = await Service.find({}, { title: 1, slug: 1 })
      .sort({ order: 1 })
      .lean();
    services = raw.map((s) => ({ title: s.title, slug: s.slug }));
  } catch {
    services = [];
  }

  return <Footer dbServices={services} />;
}