import { connectDB } from '@/lib/db';
import { fail, ok, readJson, requireAdmin } from '@/lib/backend/route-utils';
import { slugify } from '@/lib/utils';
import { CareerVacancy } from '@/models/CareerVacancy';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const careerVacancySchema = z.object({
  title: z.string().min(3),
  slug: z.string().optional(),
  department: z.string().min(2),
  location: z.string().min(2),
  employmentType: z.string().min(2),
  salary: z.string().optional().or(z.literal('')),
  description: z.string().min(20),
  responsibilities: z.array(z.string().min(1)).default([]),
  requirements: z.array(z.string().min(1)).default([]),
  perks: z.array(z.string().min(1)).default([]),
  applicationDeadline: z.string().optional().or(z.literal('')),
  featured: z.boolean().optional().default(false),
  open: z.boolean().optional().default(true),
  order: z.coerce.number().int().positive(),
});

export async function GET() {
  try {
    if (!(await requireAdmin())) {
      return fail('Unauthorized', 401);
    }

    await connectDB();
    const vacancies = await CareerVacancy.find({}).sort({ featured: -1, order: 1, createdAt: -1 }).lean();
    return ok({ vacancies });
  } catch (error) {
    console.error('/api/admin/careers GET error:', error);
    return fail('Internal Server Error', 500);
  }
}

export async function POST(request: Request) {
  try {
    if (!(await requireAdmin())) {
      return fail('Unauthorized', 401);
    }

    const body = await readJson<unknown>(request);
    const payload = body && typeof body === 'object' ? (body as Record<string, unknown>) : null;
    const normalizedBody = payload
      ? {
          ...payload,
          slug: typeof payload.slug === 'string' && payload.slug.trim()
            ? slugify(payload.slug)
            : typeof payload.title === 'string'
              ? slugify(payload.title)
              : undefined,
        }
      : body;

    const parsed = careerVacancySchema.safeParse(normalizedBody);
    if (!parsed.success) {
      return fail('Invalid career vacancy payload.', 400, { issues: parsed.error.flatten() });
    }

    await connectDB();
    const vacancy = await CareerVacancy.create(parsed.data);
    return ok({ vacancy }, 201);
  } catch (error) {
    console.error('/api/admin/careers POST error:', error);
    return fail('Internal Server Error', 500);
  }
}
