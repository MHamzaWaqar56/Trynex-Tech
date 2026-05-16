import type { Metadata } from 'next';
export const dynamic = 'force-dynamic';
import { connectDB } from '@/lib/db';
import { Course } from '@/models/Course';
import '@/models/TeamMember';
import { unstable_noStore as noStore } from 'next/cache';
import PageHero from '@/components/sections/PageHero';
import CTASection from '@/components/sections/CTASection';
import { GraduationCap } from 'lucide-react';
import CoursesGridClient from '@/components/courses/CoursesGridClient';

export const metadata: Metadata = {
  title: 'Courses',
  description: 'Explore our professional courses taught by industry experts.',
  alternates: { canonical: '/courses' },
};

type Instructor = { _id: string; name: string; designation: string; image?: string };
type CourseDoc = {
  _id: string; title: string; slug: string; coverImage: string;
  summary: string; category: string; level: string; duration: string;
  hoursPerWeek?: string; totalLectures?: number; featured: boolean;
  instructor: Instructor; tags: string[];
  fees: { label: string; amount: string | number; currency: string }[];
};

async function getCourses(): Promise<CourseDoc[]> {
  noStore();
  await connectDB();
  return Course.find({ isActive: true })
    .populate('instructor', 'name designation image')
    .sort({ order: 1, createdAt: -1 })
    .select('-curriculum -learningPoints -requirements -description')
    .lean<CourseDoc[]>();
}

export default async function CoursesPage() {
  const courses = await getCourses();

  return (
    <>
      <PageHero
        bgImage="https://res.cloudinary.com/da8lxpc3h/image/upload/v1777513166/trynex-about-bg_tpbpqq.png"
        badge={<span className="flex items-center gap-2"><GraduationCap className="h-4 w-4 animate-pulse" /> Our Courses</span>}
        title={<>Learn from <span className="gradient-text">Industry Experts</span></>}
        description={<>Professional courses designed to give you real-world skills and hands-on experience.</>}
      />

      <section className="py-12 bg-white">
        <div className="container-custom">
          <CoursesGridClient courses={courses} />
        </div>
      </section>

      <CTASection />
    </>
  );
}


