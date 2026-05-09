import { connectDB } from "@/lib/db";
import { pricingCustomSchema } from "@/lib/backend/validators";
import { fail, ok, readJson } from "@/lib/backend/route-utils";
import { buildQuoteEmail, sendEmailIfConfigured } from "@/lib/backend/email";
import { Lead } from "@/models/Lead";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await readJson<unknown>(request);
    const parsed = pricingCustomSchema.safeParse(body);

    if (!parsed.success) {
      return fail("Invalid custom pricing payload.", 400, { issues: parsed.error.flatten() });
    }

    await connectDB();
    const data = parsed.data;

    const lead = await Lead.create({
      name: data.name,
      email: data.email,
      company: data.company,
      service: data.service || "Custom Package",
      budget: data.budget,
      deadline: data.deadline,
      message: data.message,
      leadType: "custom-pricing",
      status: "new",
    });

    
const { html } = buildQuoteEmail({
  name: data.name,
  email: data.email,
  phone: data.phone || undefined,
  company: data.company || undefined,
  service: data.service || 'Custom Package',
  budget: data.budget || undefined,
  deadline: data.deadline || undefined,
  message: data.message,
}, 'custom-pricing');

await sendEmailIfConfigured({
  subject: `Custom pricing request: ${data.service || "General"}`,
  replyTo: data.email,
  text: `Custom pricing from ${data.name}`,
  html,
});

    return ok({ message: "Custom pricing request submitted.", lead }, 201);
  } catch (error) {
    console.error("/api/pricing/custom POST error:", error);
    return fail("Internal Server Error", 500);
  }
}