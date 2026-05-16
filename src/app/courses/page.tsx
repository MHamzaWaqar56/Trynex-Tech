import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { connectDB } from '@/lib/db';
import { Course } from '@/models/Course';
import { unstable_noStore as noStore } from 'next/cache';
import PageHero from '@/components/sections/PageHero';
import CTASection from '@/components/sections/CTASection';
import {
  BookOpen, Clock, Users, Star,
  ArrowRight, GraduationCap, ChevronRight,
} from 'lucide-react';

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
          <div className="mb-4"><span className="section-badge">All Courses</span></div>
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
            <h2 className="section-title">
              Explore Our <span className="gradient-text">Courses</span>
            </h2>
            <p className="text-gray-900 text-base max-w-sm">
              Structured learning paths built for beginners to advanced learners.
            </p>
          </div>

          {courses.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center gap-4">
              <BookOpen className="w-10 h-10 text-primary/40" />
              <p className="text-gray-900 text-lg font-medium">No courses available</p>
              <p className="text-gray-500 text-sm max-w-xs">New courses are being prepared. Check back soon!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {courses.map((course) => (
                <Link
                  key={course._id}
                  href={`/courses/${course.slug}`}
                  className="glass-card-hover rounded-2xl overflow-hidden group flex flex-col"
                >
                  {/* Cover */}
                  <div className="relative h-48 overflow-hidden">
                    <Image
                      src={course.coverImage}
                      alt={course.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-dark/60 to-transparent" />
                    {course.featured && (
                      <span className="absolute top-3 right-3 flex items-center gap-1 text-[10px] font-semibold bg-primary/90 text-white px-2 py-1 rounded-full">
                        <Star className="w-2.5 h-2.5" /> Featured
                      </span>
                    )}
                    <span className="absolute bottom-3 left-3 text-[10px] font-semibold bg-white/20 backdrop-blur-sm text-white px-2 py-1 rounded-full">
                      {course.level}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="p-5 flex flex-col flex-1">
                    <p className="text-[10px] font-semibold text-primary uppercase tracking-wide mb-2">{course.category}</p>
                    <h3 className="font-display font-bold text-gray-900 text-base leading-snug mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                      {course.title}
                    </h3>
                    <p className="text-xs text-gray-500 line-clamp-2 mb-4 flex-1">{course.summary}</p>

                    {/* Meta */}
                    <div className="flex items-center gap-4 text-xs text-gray-500 mb-2">
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {course.duration}</span>
                      {course.totalLectures && <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" /> {course.totalLectures} lectures</span>}
                    </div>

                    {/* Instructor */}
                    {/* <div className="flex items-center gap-2 mb-4 pb-4 border-b border-gray-100">
                      {course.instructor?.image && (
                        <Image src={course.instructor.image} alt={course.instructor.name} width={28} height={28} className="rounded-full object-cover w-7 h-7" />
                      )}
                      <div>
                        <p className="text-xs font-semibold text-gray-900">{course.instructor?.name}</p>
                        <p className="text-[10px] text-gray-400">{course.instructor?.designation}</p>
                      </div>
                    </div> */}

                    {/* Fee + CTA */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div>
                        {course.fees?.[0] ? (
                          <p className="text-sm font-bold text-primary">
                            {course.fees[0].amount === 'Free' || course.fees[0].amount === 0
                              ? 'Free'
                              : `${course.fees[0].currency} ${Number(course.fees[0].amount).toLocaleString()}`
                            }
                          </p>
                        ) : (
                          <p className="text-sm font-bold text-primary">Contact Us</p>
                        )}
                      </div>
                      <span className="flex items-center gap-1 text-xs font-semibold text-primary group-hover:gap-2 transition-all">
                        View Details <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <CTASection />
    </>
  );
}