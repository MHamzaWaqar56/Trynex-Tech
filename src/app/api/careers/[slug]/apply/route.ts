import { connectDB } from '@/lib/db';
import { fail, ok } from '@/lib/backend/route-utils';
import { configureCloudinary, getCloudinaryConfigStatus } from '@/lib/backend/cloudinary';
import { sendEmailIfConfigured, buildNewApplicationAdminEmail } from '@/lib/backend/email';
import { CareerVacancy } from '@/models/CareerVacancy';
import { CareerApplication } from '@/models/CareerApplication';
import { isDeadlineExpired } from '@/lib/careers';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

type Params = { slug: string };

async function uploadFileToCloudinary(file: File, folder?: string) {
  const cloudinary = configureCloudinary();
  const buffer = Buffer.from(await file.arrayBuffer());
  const base64 = buffer.toString('base64');
  const dataUri = `data:${file.type || 'application/octet-stream'};base64,${base64}`;

  const result = await cloudinary.uploader.upload(dataUri, {
    folder: folder || 'trynex/careers',
    resource_type: 'auto',
    timeout: 120000,
  });

  return {
    secure_url: result.secure_url,
    public_id: result.public_id,
    format: result.format,
  };
}

export async function POST(request: Request, { params }: { params: Promise<Params> }) {
  try {
    const { slug } = await params;
    const formData = await request.formData();
    const fullName = String(formData.get('fullName') || '').trim();
    const email = String(formData.get('email') || '').trim();
    const coverLetter = String(formData.get('coverLetter') || '').trim();
    const vacancySlug = slug;
    const phone = String(formData.get('phone') || '').trim();
    const linkedin = String(formData.get('linkedin') || '').trim();
    const portfolioUrl = String(formData.get('portfolioUrl') || '').trim();
    const yearsOfExperience = String(formData.get('yearsOfExperience') || '').trim();
    const cv = formData.get('cv');

    if (!fullName || !email || !coverLetter || !(cv instanceof File)) {
      return fail('Missing required application fields.', 400);
    }

    if (cv.size > 5 * 1024 * 1024) {
      return fail('CV file is too large. Maximum allowed size is 5 MB.', 400);
    }

    const status = getCloudinaryConfigStatus();
    if (!status.cloudName || !status.apiKey || !status.apiSecret) {
      return fail('Cloudinary is not configured.', 500);
    }

    await connectDB();
    const vacancy = await CareerVacancy.findOne({ slug: vacancySlug, open: true }).exec();
    if (!vacancy) {
      return fail('Vacancy not found.', 404);
    }

    if (isDeadlineExpired(vacancy.applicationDeadline)) {
      return fail('Application deadline has expired.', 410);
    }

    const uploadedCv = await uploadFileToCloudinary(cv, 'trynex/careers/cv');

    const application = await CareerApplication.create({
      vacancyId: vacancy._id,
      vacancySlug: vacancy.slug,
      vacancyTitle: vacancy.title,
      fullName,
      email,
      phone: phone || undefined,
      linkedin: linkedin || undefined,
      portfolioUrl: portfolioUrl || undefined,
      yearsOfExperience: yearsOfExperience || undefined,
      coverLetter,
      cvUrl: uploadedCv.secure_url,
      cvName: cv.name,
      status: 'new',
    });

    // Send admin notification email (fire & forget — don't fail the request if email fails)
    const { html, text } = buildNewApplicationAdminEmail({
      fullName,
      email,
      phone: phone || undefined,
      linkedin: linkedin || undefined,
      portfolioUrl: portfolioUrl || undefined,
      yearsOfExperience: yearsOfExperience || undefined,
      coverLetter,
      vacancyTitle: vacancy.title,
      cvUrl: uploadedCv.secure_url,
    });

    sendEmailIfConfigured({
      subject: `New Application: ${vacancy.title} — ${fullName}`,
      text,
      html,
      replyTo: email,
    }).catch((err) => console.error('Admin notification email failed:', err));

    return ok({ message: 'Application submitted.', application }, 201);
  } catch (error) {
    console.error('/api/careers/[slug]/apply POST error:', error);
    return fail('Internal Server Error', 500);
  }
}




