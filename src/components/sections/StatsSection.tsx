
import AnimatedCounter from '@/components/shared/AnimatedCounter';
import { connectDB } from '@/lib/db';
import { SiteStats } from '@/models/SiteStats';

// ── Types
type StatsData = {
  happyClients: number;
  projectsCompleted: number;
  clientRetention: number;
  foundedYear: number;
  yearsExperience: number;
};

async function fetchStats(): Promise<StatsData> {
  try {
    await connectDB();
    const stats = await SiteStats.findOne({ key: 'main' }).lean<StatsData | null>();

    if (!stats) {
      throw new Error('Stats document not found');
    }

    return {
      happyClients: stats.happyClients,
      projectsCompleted: stats.projectsCompleted,
      clientRetention: stats.clientRetention,
      foundedYear: stats.foundedYear,
      yearsExperience: new Date().getFullYear() - stats.foundedYear,
    };
  } catch {
    // Fallback defaults if API fails
    return {
      happyClients:      80,
      projectsCompleted: 250,
      clientRetention:   98,
      foundedYear:       2020,
      yearsExperience:   new Date().getFullYear() - 2020,
    };
  }
}

export default async function StatsSection() {
  const stats = await fetchStats();

  const statItems = [
    {
      end:         stats.projectsCompleted,
      suffix:      '+',
      label:       'Projects Completed',
      description: 'Across industries',
    },
    {
      end:         stats.happyClients,
      suffix:      '+',
      label:       'Happy Clients',
      description: 'Worldwide',
    },
    {
      end:         stats.yearsExperience,
      suffix:      ' yr',
      label:       'Year Experience',
      description: 'In the industry',
    },
    {
      end:         stats.clientRetention,
      suffix:      '%',
      label:       'Client Retention',
      description: 'They come back',
    },
  ];

  return (
    <section className="py-12 bg-white">
      <div className="container-custom">

        <div className="mb-4">
          <span className="section-badge">Our Impact</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
          <h2 className="section-title">
            Results that <span className="gradient-text">Build trust</span>
          </h2>
          <p className="text-gray-900 text-base max-w-md">
            A quick snapshot of the delivery, retention, and experience behind our work.
          </p>
        </div>

        {/* Card */}
        <div
          className="rounded-2xl bg-white p-10 md:p-14"
          style={{ boxShadow: '0 4px 40px rgba(0,212,255,0.08), 0 1px 3px rgba(0,0,0,0.06)' }}
        >
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {statItems.map((stat, i) => (
              <div key={stat.label} className="relative text-center lg:text-left">
                <AnimatedCounter
                  end={stat.end}
                  suffix={stat.suffix}
                  label={stat.label}
                  description={stat.description}
                />
                {/* Vertical divider */}
                {i < statItems.length - 1 && (
                  <div className="hidden lg:block absolute right-0 top-0 h-full w-px bg-gray-100" />
                )}
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}