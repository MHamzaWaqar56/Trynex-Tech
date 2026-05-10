
import { connectDB } from "@/lib/db";
import { fail, ok, readJson } from "@/lib/backend/route-utils";
import { newsletterSchema } from "@/lib/backend/validators";
import { Newsletter } from "@/models/Newsletter";
import { buildNewsletterEmail, buildSubscriberWelcomeEmail, sendEmailIfConfigured } from "@/lib/backend/email";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await readJson<unknown>(request);
    const parsed = newsletterSchema.safeParse(body);

    if (!parsed.success) {
      return fail("Invalid newsletter payload.", 400, { issues: parsed.error.flatten() });
    }

    await connectDB();
    const { email } = parsed.data;

    // ── Duplicate check
    const existing = await Newsletter.findOne({ email });
    if (existing) {
      return fail("This email is already subscribed.", 409);
    }

    const subscriber = await Newsletter.create({
      email,
      active: true,
      subscribedAt: new Date(),
    });

    // ── Admin notification email
    const { html: adminHtml } = buildNewsletterEmail(email);
    const adminResult = await sendEmailIfConfigured({
      subject: "New newsletter subscription",
      text: `Newsletter subscription: ${email}`,
      html: adminHtml,
    });
    console.log("[newsletter] admin email result:", adminResult);

    // ── User welcome email with unsubscribe link
    const { html: userHtml } = buildSubscriberWelcomeEmail(email);
    const userResult = await sendEmailIfConfigured({
      to: email,
      subject: "Welcome to Trynex Tech Newsletter!",
      text: `Thank you for subscribing to Trynex Tech newsletter. To unsubscribe, visit: ${process.env.NEXT_PUBLIC_SITE_URL || 'https://trynextech.com'}/api/newsletter/unsubscribe?email=${encodeURIComponent(email)}`,
      html: userHtml,
    });
    console.log("[newsletter] user email result:", userResult);

    return ok({ message: "Subscribed.", subscriber }, 201);
  } catch (error) {
    console.error("/api/newsletter POST error:", error);
    return fail("Internal Server Error", 500);
  }
}