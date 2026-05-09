import { connectDB } from '@/lib/db';
import { fail, ok, readJson, requireAdmin } from '@/lib/backend/route-utils';
import { slugify } from '@/lib/utils';
import { CareerVacancy } from '@/models/CareerVacancy';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

type Params = { id: string };

const careerVacancySchema = z.object({
  title: z.string().min(3).optional(),
  slug: z.string().optional(),
  department: z.string().min(2).optional(),
  location: z.string().min(2).optional(),
  employmentType: z.string().min(2).optional(),
  salary: z.string().optional().or(z.literal('')),
  description: z.string().min(20).optional(),
  responsibilities: z.array(z.string().min(1)).optional(),
  requirements: z.array(z.string().min(1)).optional(),
  perks: z.array(z.string().min(1)).optional(),
  applicationDeadline: z.string().optional().or(z.literal('')),
  featured: z.boolean().optional(),
  open: z.boolean().optional(),
  order: z.coerce.number().int().positive().optional(),
});

export async function PUT(request: Request, { params }: { params: Promise<Params> }) {
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
    const { id } = await params;
    const vacancy = await CareerVacancy.findByIdAndUpdate(id, parsed.data, { new: true }).lean();

    if (!vacancy) {
      return fail('Vacancy not found.', 404);
    }

    return ok({ vacancy });
  } catch (error) {
    console.error('/api/admin/careers/[id] PUT error:', error);
    return fail('Internal Server Error', 500);
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<Params> }) {
  try {
    if (!(await requireAdmin())) {
      return fail('Unauthorized', 401);
    }

    await connectDB();
    const { id } = await params;
    const vacancy = await CareerVacancy.findByIdAndDelete(id).lean();

    if (!vacancy) {
      return fail('Vacancy not found.', 404);
    }

    return ok({ message: 'Deleted.', vacancy });
  } catch (error) {
    console.error('/api/admin/careers/[id] DELETE error:', error);
    return fail('Internal Server Error', 500);
  }
}
