
import AnimatedCounter from '@/components/shared/AnimatedCounter';

// ── Types
type StatsData = {
  happyClients: number;
  projectsCompleted: number;
  clientRetention: number;
  foundedYear: number;
  yearsExperience: number;
};

// ── Fetch stats from DB (server component)
async function fetchStats(): Promise<StatsData> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/api/admin/stats`, {
      next: { revalidate: 3600 }, // 1 hour cache
    });
    if (!res.ok) throw new Error('Failed to fetch stats');
    return res.json();
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
                  <div className="hidden lg:block absolute right-0 top-0 h-full w-px bg-slate-100" />
                )}
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}