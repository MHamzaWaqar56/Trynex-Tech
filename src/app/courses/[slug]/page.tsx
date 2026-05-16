import type { Metadata } from 'next';
export const dynamic = 'force-dynamic';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { connectDB } from '@/lib/db';
import { Course } from '@/models/Course';
import '@/models/TeamMember';
import { unstable_noStore as noStore } from 'next/cache';
import CTASection from '@/components/sections/CTASection';
import PageHero from '@/components/sections/PageHero';
import {
  BookOpen, Clock, Users, Star, Check,
  GraduationCap, Globe, ArrowRight,
  Mail, Linkedin, Github, Facebook,
  ChevronDown, DollarSign, List, Tag,
} from 'lucide-react';

// ─── Types ─────────────────────────────────────────────────────────────────────

interface Props { params: Promise<{ slug: string }> }

type Instructor = {
  _id: string; name: string; designation: string;
  image?: string; email?: string; linkedin?: string;
  github?: string; facebook?: string;
};

type CourseDoc = {
  _id: string; title: string; slug: string; coverImage: string;
  summary: string; description: string; category: string;
  level: string; language: string; duration: string;
  hoursPerWeek?: string; totalLectures?: number;
  instructor: Instructor; featured: boolean;
  fees:           { label: string; amount: string | number; currency: string; description?: string }[];
  curriculum:     { week: string; topic: string; details?: string }[];
  learningPoints: string[];
  requirements:   string[];
  tags:           string[];
  enrollmentLink?: string;
};

// ─── Metadata ─────────────────────────────────────────────────────────────────

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  await connectDB();
  const course = await Course.findOne({ slug, isActive: true }).lean<CourseDoc>();
  if (!course) return {};
  return {
    title: course.title,
    description: course.summary,
    alternates: { canonical: `/courses/${course.slug}` },
  };
}

// ─── Data fetch ────────────────────────────────────────────────────────────────

async function getCourse(slug: string): Promise<CourseDoc | null> {
  noStore();
  await connectDB();
  return Course.findOne({ slug, isActive: true })
    .populate('instructor', 'name designation image email linkedin github facebook')
    .lean<CourseDoc>();
}

// ─── Component ────────────────────────────────────────────────────────────────

export default async function CourseDetailPage({ params }: Props) {
  const { slug } = await params;
  const course = await getCourse(slug);
  if (!course) notFound();

  return (
    <>
      {/* Hero */}
      <PageHero
        bgImage={course.coverImage}
        badge={<span className="flex items-center gap-2"><GraduationCap className="h-4 w-4 animate-pulse" />{course.category}</span>}
        title={<>{course.title}</>}
        description={<span className="block min-[320px]:max-[500px]:text-[14px]">{course.summary}</span>}
      />

      <section className="py-12 bg-white">
        <div className="container-custom">

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-8 items-start">

            {/* ── Left Column ─────────────────────────────────────────────── */}
            <div className="space-y-8">

              {/* Quick Stats */}
              <div className="glass-card glass-card-hover p-6">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {[
                    { icon: Clock,    label: 'Duration',  value: course.duration },
                    { icon: Globe,    label: 'Language',  value: course.language },
                    { icon: BookOpen, label: 'Level',     value: course.level },
                    { icon: BookOpen, label: 'Lectures',  value: course.totalLectures ? `${course.totalLectures} lectures` : 'N/A' },
                  ].map(({ icon: Icon, label, value }) => (
                    <div key={label} className="glass-card p-4 text-center">
                      <Icon className="w-4 h-4 text-primary mx-auto mb-1" />
                      <p className="text-[10px] uppercase tracking-wide text-gray-600 mb-0.5">{label}</p>
                      <p className="text-sm font-semibold text-gray-900">{value}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div className="glass-card p-6">
                <h2 className="text-xl font-display font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-primary" /> About This Course
                </h2>
                <p className="text-gray-900 leading-relaxed text-sm whitespace-pre-line text-justify">{course.description}</p>
              </div>

              {/* What you'll learn */}
              {course.learningPoints.length > 0 && (
                <div className="glass-card p-6">
                  <h2 className="text-xl font-display font-bold text-gray-900 mb-5 flex items-center gap-2">
                    <GraduationCap className="w-5 h-5 text-primary" /> What You&apos;ll Learn
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {course.learningPoints.map((pt, i) => (
                      <div key={i} className="flex items-start gap-3 rounded-xl border border-primary/20 bg-white p-3 shadow-sm">
                        <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                        <span className="text-sm text-gray-900 leading-relaxed">{pt}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Requirements */}
              {course.requirements.length > 0 && (
                <div className="glass-card p-6">
                  <h2 className="text-xl font-display font-bold text-gray-900 mb-5 flex items-center gap-2">
                    <List className="w-5 h-5 text-primary" /> Requirements
                  </h2>
                  <ul className="space-y-2">
                    {course.requirements.map((req, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-900">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0 mt-2" />
                        {req}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Curriculum */}
              {course.curriculum.length > 0 && (
                <div className="glass-card p-6">
                  <h2 className="text-xl font-display font-bold text-gray-900 mb-5 flex items-center gap-2">
                    <List className="w-5 h-5 text-primary" /> Curriculum
                  </h2>
                  <div className="space-y-3">
                    {course.curriculum.map((row, i) => (
                      <div key={i} className="rounded-xl border border-primary/20 bg-white p-4">
                        <div className="flex items-center gap-3 mb-1">
                          <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">{row.week}</span>
                          <p className="font-semibold text-gray-900 text-sm">{row.topic}</p>
                        </div>
                        {row.details && <p className="text-xs text-gray-600 leading-relaxed pl-1">{row.details}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tags */}
              {course.tags.length > 0 && (
                <div className="glass-card p-6">
                  <h2 className="text-xl font-display font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Tag className="w-5 h-5 text-primary" /> Technologies & Topics
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {course.tags.map((tag) => (
                      <span key={tag} className="tag">{tag}</span>
                    ))}
                  </div>
                </div>
              )}

            </div>

            {/* ── Right Column ─────────────────────────────────────────────── */}
            <div className="space-y-6 lg:sticky lg:top-24">

              {/* Fee Card */}
              <div className="glass-card p-6">
                <h3 className="text-xl font-display font-bold text-primary mb-4 flex items-center gap-2">
                  <DollarSign className="w-5 h-5" /> Fee Structure
                </h3>
                {course.fees.length === 0 ? (
                  <p className="text-sm text-gray-600">Contact us for pricing.</p>
                ) : (
                  <div className="space-y-3">
                    {course.fees.map((fee, i) => (
                      <div key={i} className="rounded-xl border border-primary/20 bg-white p-4">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-xs font-semibold text-gray-900 uppercase tracking-wide">{fee.label}</p>
                          <p className="text-base font-bold text-primary">
                            {fee.amount === 'Free' || fee.amount === 0
                              ? 'Free'
                              : `${fee.currency} ${Number(fee.amount).toLocaleString()}`
                            }
                          </p>
                        </div>
                        {fee.description && <p className="text-xs text-gray-600">{fee.description}</p>}
                      </div>
                    ))}
                  </div>
                )}
                <div className="mt-5">
                  <Link
                    href={course.enrollmentLink || '/contact'}
                    target={course.enrollmentLink ? '_blank' : undefined}
                    rel={course.enrollmentLink ? 'noopener noreferrer' : undefined}
                    className="btn-primary w-full justify-center"
                  >
                    Enroll Now <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>

              {/* Instructor Card */}
              <div className="glass-card p-6">
                <h3 className="text-xl font-display font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" /> Your Instructor
                </h3>
                <div className="flex items-start gap-4">
                  {course.instructor?.image && (
                    <Image
                      src={course.instructor.image}
                      alt={course.instructor.name}
                      width={60}
                      height={60}
                      className="w-14 h-14 rounded-2xl object-cover shrink-0"
                    />
                  )}
                  <div>
                    <p className="font-bold text-gray-900">{course.instructor?.name}</p>
                    <p className="text-xs text-primary font-medium mb-3">{course.instructor?.designation}</p>
                    <div className="flex items-center gap-2">
                      {course.instructor?.email && (
                        <a href={`mailto:${course.instructor.email}`} className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-colors">
                          <Mail className="w-3.5 h-3.5 text-primary" />
                        </a>
                      )}
                      {course.instructor?.linkedin && (
                        <a href={course.instructor.linkedin} target="_blank" rel="noopener noreferrer" className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-colors">
                          <Linkedin className="w-3.5 h-3.5 text-primary" />
                        </a>
                      )}
                      {course.instructor?.github && (
                        <a href={course.instructor.github} target="_blank" rel="noopener noreferrer" className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-colors">
                          <Github className="w-3.5 h-3.5 text-primary" />
                        </a>
                      )}
                      {course.instructor?.facebook && (
                        <a href={course.instructor.facebook} target="_blank" rel="noopener noreferrer" className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-colors">
                          <Facebook className="w-3.5 h-3.5 text-primary" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Get Started */}
              <div className="glass-card p-6">
                <h3 className="text-xl font-display font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <ArrowRight className="w-5 h-5 text-primary" /> Have Questions?
                </h3>
                <p className="text-gray-900 text-sm leading-relaxed mb-5">
                  Reach out to us and we&apos;ll help you pick the right course for your goals.
                </p>
                <Link href="/contact" className="btn-primary w-full justify-center">
                  Contact Us <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

            </div>
          </div>
        </div>
      </section>

      <CTASection />
    </>
  );
}

