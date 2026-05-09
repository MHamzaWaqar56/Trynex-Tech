import { connectDB } from "@/lib/db";
import { fail, ok, requireAdmin, readJson } from "@/lib/backend/route-utils";
import { buildLeadStatusEmail, sendEmailIfConfigured } from "@/lib/backend/email";
import { Lead } from "@/models/Lead";

export const dynamic = "force-dynamic";

type Params = { id: string };
type LeadNotification = {
  name: string;
  email: string;
  service: string;
  budget?: string;
  deadline?: string;
  status: string;
};

type LeadStatus = 'new' | 'contacted' | 'in-progress' | 'done' | 'closed';

function buildStatusEmail(lead: LeadNotification, status: LeadStatus) {
  const templates: Record<Exclude<LeadStatus, 'new'>, { subject: string; intro: string; body: string[] }> = {
    contacted: {
      subject: 'We received your request',
      intro: 'We received your request',
      body: [
        'Our team will contact you soon.',
        'We are reviewing your request and will get back to you shortly.',
      ],
    },
    'in-progress': {
      subject: 'Your request is now in progress',
      intro: 'Your request is now in progress',
      body: [
        'Our team has started working on your request.',
        'We will share updates as progress moves forward.',
      ],
    },
    done: {
      subject: 'Your request is completed',
      intro: 'Your request is completed',
      body: [
        'The requested work has been completed.',
        'If you need any adjustments, feel free to reply to this email.',
      ],
    },
    closed: {
      subject: 'Your request has been closed',
      intro: 'Your request has been closed',
      body: [
        'This request has been marked as closed in our system.',
        'If you need further assistance, you can always reach out again.',
      ],
    },
  };

  const template = templates[status as Exclude<LeadStatus, 'new'>];

  return {
    subject: template.subject,
    text: [
      `Hi ${lead.name},`,
      '',
      template.intro,
      ...template.body,
      '',
      `Service: ${lead.service}`,
      lead.budget ? `Budget: ${lead.budget}` : null,
      lead.deadline ? `Deadline: ${lead.deadline}` : null,
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
      return fail("Unauthorized", 401);
    }

    const body = await readJson<{ status?: LeadStatus }>(request);
    const status = body.status;

    if (!status || !['new', 'contacted', 'in-progress', 'done', 'closed'].includes(status)) {
      return fail("Invalid lead status.", 400);
    }

    await connectDB();
    const { id } = await params;
    const existingLead = await Lead.findById(id).lean<LeadNotification | null>();

    if (!existingLead) {
      return fail("Lead not found.", 404);
    }

    const lead = await Lead.findByIdAndUpdate(id, { status }, { new: true }).lean<LeadNotification | null>();

    if (!lead) {
      return fail("Lead not found.", 404);
    }

    if (existingLead.status !== status) {
      try {
        if (status === 'new') {
          return ok({ lead, notificationSent: false });
        }

        const email = buildStatusEmail(lead, status as Exclude<LeadStatus, 'new'>);
        const { html } = buildLeadStatusEmail({
  name: lead.name,
  service: lead.service,
  status: status,
});

const notification = await sendEmailIfConfigured({
  to: lead.email,
  subject: email.subject,
  text: email.text,
  html,
});

        return ok({ lead, notificationSent: notification.sent === true });
      } catch (emailError) {
        console.error("Failed to send lead status notification email:", emailError);
      }
    }

    return ok({ lead, notificationSent: false });
  } catch (error) {
    console.error("/api/admin/lead/[id] PUT error:", error);
    return fail("Internal Server Error", 500);
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<Params> }) {
  try {
    if (!(await requireAdmin())) {
      return fail("Unauthorized", 401);
    }

    await connectDB();
    const { id } = await params;
    const lead = await Lead.findByIdAndDelete(id).lean();

    if (!lead) {
      return fail("Lead not found.", 404);
    }

    return ok({ message: "Deleted.", lead });
  } catch (error) {
    console.error("/api/admin/lead/[id] DELETE error:", error);
    return fail("Internal Server Error", 500);
  }
}