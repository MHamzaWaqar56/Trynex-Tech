import { connectDB } from "@/lib/db";
import { contactSchema } from "@/lib/backend/validators";
import { fail, ok, readJson } from "@/lib/backend/route-utils";
import { buildContactEmail, sendEmailIfConfigured } from "@/lib/backend/email";
import { Contact } from "@/models/Contact";
import { Lead } from "@/models/Lead";

export const dynamic = "force-dynamic";

function shouldCreateLead(data: {
  subject?: string | null;
  service?: string | null;
  company?: string | null;
  budget?: string | null;
  deadline?: string | null;
  message: string;
}) {
  const searchText = [data.subject, data.service, data.company, data.budget, data.deadline, data.message]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  const hasQuoteSignal = Boolean(data.budget?.trim() || data.deadline?.trim());
  const hasLeadKeywords = /\b(quote|quotation|estimate|proposal|pricing|price|cost|budget|timeline|deadline|project|website|app|development|build)\b/.test(searchText);

  return hasQuoteSignal || hasLeadKeywords;
}

export async function POST(request: Request) {
  try {
    const body = await readJson<unknown>(request);
    const parsed = contactSchema.safeParse(body);

    if (!parsed.success) {
      return fail("Invalid contact payload.", 400, { issues: parsed.error.flatten() });
    }

    const data = parsed.data;

    await connectDB();
    const inquiryType = shouldCreateLead(data) ? "lead" : "message";
    const contact = await Contact.create({
      ...data,
      inquiryType,
      status: "new",
    });

    let lead = null;
    if (inquiryType === "lead") {
      lead = await Lead.create({
        name: data.name,
        email: data.email,
        phone: data.phone || undefined,
        company: data.company || undefined,
        service: data.service || "General Inquiry",
        budget: data.budget || undefined,
        deadline: data.deadline || undefined,
        message: data.message,
        leadType: "quote",
        status: "new",
      });
    }

    const subject = data.subject || (data.service ? `New inquiry: ${data.service}` : "New contact inquiry");

const { html } = buildContactEmail(data);
await sendEmailIfConfigured({
  subject,
  replyTo: data.email,
  text: `New contact from ${data.name} — ${data.email}`,
  html,
});

    return ok({ message: "Message sent.", contact, lead }, 201);
  } catch (error) {
    console.error("/api/contact POST error:", error);
    return fail("Internal Server Error", 500);
  }
}

