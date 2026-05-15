import { connectDB } from '@/lib/db';
import { ok, fail, readJson } from '@/lib/backend/route-utils';
import { SiteStats } from '@/models/SiteStats';
import { revalidatePath } from "next/cache";

export const dynamic = 'force-dynamic';

// ── GET — fetch current stats
export async function GET() {
  try {
    await connectDB();
    let stats = await SiteStats.findOne({ key: 'main' });

    // Auto-create if first time
    if (!stats) {
      stats = await SiteStats.create({
        key: 'main',
        happyClients: 80,
        projectsCompleted: 250,
        clientRetention: 98,
        foundedYear: 2020,
      });
    }

    
    return ok({
      happyClients:      stats.happyClients,
      projectsCompleted: stats.projectsCompleted,
      clientRetention:   stats.clientRetention,
      foundedYear:       stats.foundedYear,
      // Auto-calculated — not stored
      yearsExperience:   new Date().getFullYear() - stats.foundedYear,
      updatedAt:         stats.updatedAt,
    });
  } catch (error) {
    console.error('/api/admin/stats GET error:', error);
    return fail('Internal Server Error', 500);
  }
}

// ── PUT — update stats
export async function PUT(request: Request) {
  try {
    const body = await readJson<{
      happyClients?: number;
      projectsCompleted?: number;
      clientRetention?: number;
      foundedYear?: number;
    }>(request);

    // Validate
    if (body.happyClients !== undefined && (body.happyClients < 0 || !Number.isFinite(body.happyClients)))
      return fail('Invalid happyClients value.', 400);
    if (body.projectsCompleted !== undefined && (body.projectsCompleted < 0 || !Number.isFinite(body.projectsCompleted)))
      return fail('Invalid projectsCompleted value.', 400);
    if (body.clientRetention !== undefined && (body.clientRetention < 0 || body.clientRetention > 100 || !Number.isFinite(body.clientRetention)))
      return fail('clientRetention must be 0–100.', 400);
    if (body.foundedYear !== undefined && (body.foundedYear < 2000 || body.foundedYear > new Date().getFullYear() || !Number.isFinite(body.foundedYear)))
      return fail('Invalid foundedYear.', 400);

    await connectDB();
    const stats = await SiteStats.findOneAndUpdate(
      { key: 'main' },
      {
        $set: {
          ...(body.happyClients      !== undefined && { happyClients:      body.happyClients }),
          ...(body.projectsCompleted !== undefined && { projectsCompleted: body.projectsCompleted }),
          ...(body.clientRetention   !== undefined && { clientRetention:   body.clientRetention }),
          ...(body.foundedYear       !== undefined && { foundedYear:       body.foundedYear }),
        },
      },
      { upsert: true, new: true },
    );

    revalidatePath('/');
    revalidatePath('/about');
    return ok({
      happyClients:      stats.happyClients,
      projectsCompleted: stats.projectsCompleted,
      clientRetention:   stats.clientRetention,
      foundedYear:       stats.foundedYear,
      yearsExperience:   new Date().getFullYear() - stats.foundedYear,
      updatedAt:         stats.updatedAt,
    });
  } catch (error) {
    console.error('/api/admin/stats PUT error:', error);
    return fail('Internal Server Error', 500);
  }
}