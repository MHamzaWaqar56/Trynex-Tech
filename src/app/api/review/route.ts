import { connectDB } from '@/lib/db';
import { ok, fail, readJson } from '@/lib/backend/route-utils';
import { ReviewToken } from '@/models/ReviewToken';
import { Testimonial } from '@/models/Testimonial';
import { Portfolio } from '@/models/Portfolio';

export const dynamic = 'force-dynamic';

// ── GET /api/review?token=xxx — validate token
export async function GET(request: Request) {
  try {
    const url   = new URL(request.url);
    const token = url.searchParams.get('token') || '';

    if (!token) return fail('Token is required.', 400);

    await connectDB();

    const record = await ReviewToken.findOne({ token }).lean<{
      _id: string;
      email: string;
      clientName: string;
      projectId: string;
      projectTitle: string;
      used: boolean;
      expiresAt: Date;
    }>();

    if (!record)                         return ok({ status: 'invalid' });
    if (record.used)                     return ok({ status: 'used' });
    if (new Date() > record.expiresAt)   return ok({ status: 'expired' });

    // Fetch project to get service (optional)
    const project = await Portfolio.findById(record.projectId).lean<{ service?: string }>().catch(() => null);

    return ok({
      status:       'valid',
      clientName:   record.clientName,
      projectTitle: record.projectTitle,
      service:      project?.service || '',
    });
  } catch (error) {
    console.error('/api/review GET error:', error);
    return fail('Internal Server Error', 500);
  }
}

// ── POST /api/review — submit testimonial
export async function POST(request: Request) {
  try {
    const body = await readJson<{
      token: string;
      name: string;
      company: string;
      role?: string;
      rating: number;
      review: string;
      service?: string;
    }>(request);

    if (!body.token)   return fail('Token is required.', 400);
    if (!body.name)    return fail('Name is required.', 400);
    if (!body.company) return fail('Company is required.', 400);
    if (!body.review)  return fail('Review is required.', 400);

    await connectDB();

    const record = await ReviewToken.findOne({ token: body.token }).lean<{
      _id: string;
      used: boolean;
      expiresAt: Date;
      projectId: string;
    }>();

    if (!record)                       return fail('Invalid token.', 400);
    if (record.used)                   return fail('This link has already been used.', 400);
    if (new Date() > record.expiresAt) return fail('This link has expired.', 400);

    // Create testimonial (pending approval)
    const testimonial = await Testimonial.create({
      name:     body.name,
      company:  body.company,
      role:     body.role  || '',
      rating:   Math.min(5, Math.max(1, Number(body.rating) || 5)),
      review:   body.review,
      service:  body.service || '',
      approved: false,
    });

    // Link testimonial to portfolio project
    await Portfolio.findByIdAndUpdate(record.projectId, { testimonial: testimonial._id });

    // Mark token as used
    await ReviewToken.findByIdAndUpdate(record._id, { used: true });

    return ok({ message: 'Review submitted successfully.' }, 201);
  } catch (error) {
    console.error('/api/review POST error:', error);
    return fail('Internal Server Error', 500);
  }
}
