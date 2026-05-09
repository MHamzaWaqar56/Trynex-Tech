import { connectDB } from '@/lib/db';
import { fail, ok, readJson, requireAdmin } from '@/lib/backend/route-utils';
import { buildConsultationStatusEmail, sendEmailIfConfigured } from '@/lib/backend/email';
import { ConsultationSlot } from '@/models/ConsultationSlot';

export const dynamic = 'force-dynamic';

type Params = { id: string };
type ConsultationStatus = 'pending' | 'confirmed' | 'cancelled';
type ConsultationBooking = {
  name: string;
  email: string;
  date: string;
  time: string;
  service: string;
  message?: string;
  status: ConsultationStatus;
};

function buildStatusEmail(booking: {
  name: string;
  date: string;
  time: string;
  service: string;
  message?: string;
}, status: ConsultationStatus) {
  const templates: Record<Exclude<ConsultationStatus, 'pending'>, { subject: string; intro: string }> = {
    confirmed: {
      subject: `Trynex Tech Consultation Confirmed — ${booking.date} at ${booking.time}`,
      intro: 'Your consultation booking has been confirmed by our team.',
    },
    cancelled: {
      subject: `Trynex Tech Consultation Update — ${booking.date} at ${booking.time}`,
      intro: 'Your consultation booking has been cancelled by our team.',
    },
  };

  const template = templates[status as Exclude<ConsultationStatus, 'pending'>];

  return {
    subject: template.subject,
    text: [
      `Hi ${booking.name},`,
      '',
      template.intro,
      '',
      `Service: ${booking.service}`,
      `Date: ${booking.date}`,
      `Time: ${booking.time}`,
      booking.message ? `Message: ${booking.message}` : null,
      '',
      status === 'confirmed'
        ? 'Next steps: our team will reach out if we need any details before your consultation. If you need to reschedule, simply reply to this email and share your preferred time.'
        : 'Next steps: if you would like to reschedule, reply to this email with a few preferred times or book a new consultation slot from the website.',
      '',
      'Best regards,',
      'Trynex Tech Team',
    ]
      .filter(Boolean)
      .join('\n'),
  };
}

export async function PUT(request: Request, { params }: { params: Promise<Params> }) {
  try {
    if (!(await requireAdmin())) {
      return fail('Unauthorized', 401);
    }

    const body = await readJson<{ status?: ConsultationStatus }>(request);
    const status = body.status;

    if (!status || !['pending', 'confirmed', 'cancelled'].includes(status)) {
      return fail('Invalid consultation status.', 400);
    }

    await connectDB();
    const { id } = await params;
    const existing = (await ConsultationSlot.findById(id).lean()) as ConsultationBooking | null;

    if (!existing) {
      return fail('Consultation not found.', 404);
    }

    const consultation = (await ConsultationSlot.findByIdAndUpdate(id, { status }, { new: true }).lean()) as ConsultationBooking | null;

    if (!consultation) {
      return fail('Consultation not found.', 404);
    }

    if (existing.status !== status && status !== 'pending') {
      try {
        const email = buildStatusEmail(consultation, status);
        const { html } = buildConsultationStatusEmail({
  name: consultation.name,
  date: consultation.date,
  time: consultation.time,
  service: consultation.service,
}, status as 'confirmed' | 'cancelled');

const notification = await sendEmailIfConfigured({
  to: consultation.email,
  subject: email.subject,
  text: email.text,
  html,
});

        return ok({ consultation, notificationSent: notification.sent === true });
      } catch (emailError) {
        console.error('/api/admin/consultations/[id] email notification failed:', emailError);
      }
    }

    return ok({ consultation, notificationSent: false });
  } catch (error) {
    console.error('/api/admin/consultations/[id] PUT error:', error);
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
    const consultation = await ConsultationSlot.findByIdAndDelete(id).lean();

    if (!consultation) {
      return fail('Consultation not found.', 404);
    }

    return ok({ message: 'Deleted.', consultation });
  } catch (error) {
    console.error('/api/admin/consultations/[id] DELETE error:', error);
    return fail('Internal Server Error', 500);
  }
}
