
import Image from 'next/image';
import { Brain } from 'lucide-react';
import { connectDB } from '@/lib/db';
import { TeamMember } from '@/models/TeamMember';

// ── Fetch team count dynamically from DB
async function fetchTeamCount(): Promise<number> {
  try {
    await connectDB();
    const count = await TeamMember.countDocuments();
    return count > 0 ? count : 5; // fallback to 5 if DB empty
  } catch {
    return 5;
  }
}

export default async function WhoWeAreSection() {
  const teamCount = await fetchTeamCount();

  return (
    <>
      <section className="py-12 bg-white">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

            {/* Left */}
            <div>
              <div className="mb-4">
                <span className="section-badge">
                  <Brain className="h-4 w-4 inline mr-1 animate-pulse" /> Who We Are
                </span>
              </div>
              <h2 className="section-title mb-6">
                Building the Future with{' '}
                <span className="gradient-text">Passion & Purpose</span>
              </h2>
              <p className="text-gray-900 leading-relaxed mb-5 text-justify">
                Founded in 2025, Trynex Tech started with a simple mission — help
                Pakistani businesses compete in the global digital market. Today,
                we&apos;re a team of{' '}
                <span className="text-gray-900 font-semibold">{teamCount}+ specialists</span>{' '}
                delivering cutting-edge technology solutions to clients worldwide.
              </p>
              <p className="text-gray-900 leading-relaxed mb-8">
                We believe that great technology should be{' '}
                <span className="text-gray-900 font-semibold">
                  accessible, understandable, and impactful.
                </span>{' '}
                That&apos;s why we focus on building long-term partnerships, not just projects.
              </p>
            </div>

            {/* Right — Image */}
            <div className="relative">
              <div className="rounded-2xl overflow-hidden portfolio-card">
                <Image
                  src="https://res.cloudinary.com/da8lxpc3h/image/upload/v1777477044/trynex-about_p5oggs.jpg"
                  alt="Trynex Tech team at work"
                  width={600}
                  height={450}
                  className="w-full h-auto object-cover"
                  priority
                />
                {/* Overlay badge */}
                <div
                  className="absolute bottom-4 left-4 bg-white rounded-xl px-4 py-3 flex items-center gap-3"
                  style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                >
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  <span className="text-sm font-semibold text-gray-900">
                    Since 2025 — Trusted Worldwide
                  </span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>
    </>
  );
}