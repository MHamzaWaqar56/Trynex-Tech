'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useMemo, useState } from 'react';
import { ArrowRight, BookOpen, Clock, Search, Star } from 'lucide-react';
import { Input } from '@/components/ui/input';

type Instructor = { _id: string; name: string; designation: string; image?: string };

type CourseDoc = {
  _id: string;
  title: string;
  slug: string;
  coverImage: string;
  summary: string;
  category: string;
  level: string;
  duration: string;
  hoursPerWeek?: string;
  totalLectures?: number;
  featured: boolean;
  instructor: Instructor;
  tags: string[];
};

type CoursesGridClientProps = {
  courses: CourseDoc[];
};

function matchesSearch(course: CourseDoc, query: string) {
  if (!query.trim()) return true;

  const haystack = [
    course.title,
    course.summary,
    course.category,
    course.level,
    course.duration,
    course.instructor?.name,
    course.instructor?.designation,
    ...(course.tags || []),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  return haystack.includes(query.toLowerCase());
}

export default function CoursesGridClient({ courses }: CoursesGridClientProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCourses = useMemo(
    () => courses.filter((course) => matchesSearch(course, searchTerm)),
    [courses, searchTerm],
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-4">
            <span className="section-badge">All Courses</span>
          </div>
          <h2 className="section-title">
            Explore Our <span className="gradient-text">Courses</span>
          </h2>
          <p className="mt-3 max-w-2xl text-gray-900 text-base">
            Structured learning paths built for beginners to advanced learners.
          </p>
        </div>

        <div className="w-full sm:w-[320px]">
          <label htmlFor="courses-search" className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-900">
            Search Courses
          </label>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              id="courses-search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search by title, category, tags..."
              className="h-11 pl-10 text-sm"
            />
          </div>
          <p className="mt-2 text-xs text-gray-600">
            Showing {filteredCourses.length} of {courses.length} course{courses.length !== 1 ? 's' : ''}.
          </p>
        </div>
      </div>

      {filteredCourses.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-gray-200 bg-white py-24 text-center gap-4">
          <BookOpen className="w-10 h-10 text-primary/40" />
          <p className="text-gray-900 text-lg font-medium">No courses matched your search</p>
          <p className="text-gray-600 text-sm max-w-xs">
            Try a different keyword, category, or instructor name.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <Link
              key={course._id}
              href={`/courses/${course.slug}`}
              className="portfolio-card group flex flex-col overflow-hidden rounded-2xl bg-white"
            >
              <div className="relative aspect-[16/10] overflow-hidden bg-gray-100">
                <Image
                  src={course.coverImage}
                  alt={course.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-dark/60 to-transparent" />
                {course.featured && (
                  <span className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-primary/90 px-2 py-1 text-[10px] font-semibold text-white">
                    <Star className="h-2.5 w-2.5" /> Featured
                  </span>
                )}
                <span className="absolute left-3 bottom-3 rounded-full bg-white/20 px-2 py-1 text-[10px] font-semibold text-white backdrop-blur-sm">
                  {course.level}
                </span>
              </div>

              <div className="flex flex-1 flex-col p-5">
                <div className="flex items-end justify-between gap-4">
                  <div className="min-w-0">
                    <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-primary">
                      {course.category}
                    </p>
                    <h3 className="line-clamp-2 font-display text-base font-bold leading-snug text-gray-900 transition-colors">
                      {course.title}
                    </h3>
                    <p className="mt-1.5 line-clamp-2 text-xs text-gray-900">
                      {course.summary}
                    </p>
                  </div>

                  <div className="shrink-0 flex h-9 w-9 items-center justify-center rounded-full border border-primary text-primary transition-all duration-300 group-hover:bg-primary group-hover:text-white">
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </div>
              </div>

              
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
