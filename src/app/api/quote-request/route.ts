import { connectDB } from "@/lib/db";
import { fail, ok, readJson } from "@/lib/backend/route-utils";
import { buildQuoteEmail, sendEmailIfConfigured } from "@/lib/backend/email";
import { quoteRequestSchema } from "@/lib/backend/validators";
import { Lead } from "@/models/Lead";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await readJson<unknown>(request);
    const parsed = quoteRequestSchema.safeParse(body);

    if (!parsed.success) {
      return fail("Invalid quote request payload.", 400, { issues: parsed.error.flatten() });
    }

    const data = parsed.data;

    await connectDB();
    const lead = await Lead.create({
      ...data,
      leadType: "quote",
      status: "new",
    });

    const { html } = buildQuoteEmail(data, 'quote');
await sendEmailIfConfigured({
  subject: `Quote request: ${data.service}`,
  replyTo: data.email,
  text: `Quote request from ${data.name}`,
  html,
});

    return ok({ message: "Quote request submitted.", lead }, 201);
  } catch (error) {
    console.error("/api/quote-request POST error:", error);
    return fail("Internal Server Error", 500);
  }
}
