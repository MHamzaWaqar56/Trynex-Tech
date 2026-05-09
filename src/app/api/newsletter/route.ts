// import { connectDB } from "@/lib/db";
// import { fail, ok, readJson } from "@/lib/backend/route-utils";
// import { newsletterSchema } from "@/lib/backend/validators";
// import { Newsletter } from "@/models/Newsletter";
// import { buildNewsletterEmail, sendEmailIfConfigured } from "@/lib/backend/email";

// export const dynamic = "force-dynamic";

// export async function POST(request: Request) {
//   try {
//     const body = await readJson<unknown>(request);
//     const parsed = newsletterSchema.safeParse(body);

//     if (!parsed.success) {
//       return fail("Invalid newsletter payload.", 400, { issues: parsed.error.flatten() });
//     }

//     await connectDB();
//     const { email } = parsed.data;

//     const subscriber = await Newsletter.findOneAndUpdate(
//       { email },
//       { email, active: true, subscribedAt: new Date() },
//       { upsert: true, new: true },
//     );

//    const { html } = buildNewsletterEmail(email);
// await sendEmailIfConfigured({
//   subject: "New newsletter subscription",
//   text: `Newsletter subscription: ${email}`,
//   html,
// });

//     return ok({ message: "Subscribed.", subscriber }, 201);
//   } catch (error) {
//     console.error("/api/newsletter POST error:", error);
//     return fail("Internal Server Error", 500);
//   }
// }





import { connectDB } from "@/lib/db";
import { fail, ok, readJson } from "@/lib/backend/route-utils";
import { newsletterSchema } from "@/lib/backend/validators";
import { Newsletter } from "@/models/Newsletter";
import {
  buildNewsletterEmail,
  buildSubscriberWelcomeEmail,
  sendEmailIfConfigured,
} from "@/lib/backend/email";

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

    const subscriber = await Newsletter.findOneAndUpdate(
      { email },
      { email, active: true, subscribedAt: new Date() },
      { upsert: true, new: true },
    );

    // 1. Admin ko notify karo (existing)
    const { html: adminHtml } = buildNewsletterEmail(email);
    await sendEmailIfConfigured({
      subject: "New newsletter subscription",
      text: `Newsletter subscription: ${email}`,
      html: adminHtml,
    });

    // 2. Subscriber ko welcome email bhejo with unsubscribe link
    const { html: welcomeHtml } = buildSubscriberWelcomeEmail(email);
    await sendEmailIfConfigured({
      subject: "Welcome to Trynex Tech Newsletter! 🎉",
      text: `Welcome to Trynex Tech Newsletter! To unsubscribe, visit: https://trynextech.com/api/newsletter/unsubscribe?email=${encodeURIComponent(email)}`,
      html: welcomeHtml,
      to: email, // subscriber ka email
    });

    return ok({ message: "Subscribed.", subscriber }, 201);
  } catch (error) {
    console.error("/api/newsletter POST error:", error);
    return fail("Internal Server Error", 500);
  }
}