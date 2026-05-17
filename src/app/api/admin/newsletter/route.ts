import { connectDB } from "@/lib/db";
import { fail, ok, requireAdmin } from "@/lib/backend/route-utils";
import { Newsletter } from "@/models/Newsletter";
import { sendEmailIfConfigured } from "@/lib/backend/email";

export const dynamic = "force-dynamic";

// GET — sab subscribers
export async function GET() {
  try {
    if (!(await requireAdmin())) return fail("Unauthorized", 401);
    await connectDB();
    const subscribers = await Newsletter.find({}).sort({ subscribedAt: -1 }).lean();
    return ok({ subscribers });
  } catch (error) {
    console.error("/api/admin/newsletter GET error:", error);
    return fail("Internal Server Error", 500);
  }
}

// POST — email blast bhejo
export async function POST(request: Request) {
  try {
    if (!(await requireAdmin())) return fail("Unauthorized", 401);

    const body = await request.json();
    const { subject, message, emails } = body as {
      subject: string; message: string; emails?: string[];
    };

    if (!subject || !message) return fail("Subject and message required.", 400);

    await connectDB();

    // Specific emails ya sab active subscribers
    const query = emails?.length
      ? { email: { $in: emails }, active: true }
      : { active: true };

    const subscribers = await Newsletter.find(query).lean();
    if (subscribers.length === 0) return fail("No active subscribers found.", 400);

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://trynextech.com';

    let sent = 0;
    let failed = 0;

    for (const sub of subscribers) {
      const unsubscribeUrl = `${baseUrl}/api/newsletter/unsubscribe?email=${encodeURIComponent(sub.email)}`;

      const html = `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/></head>
<body style="margin:0;padding:0;background:#060B18;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#060B18;padding:40px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#0D1526 0%,#060B18 100%);border-radius:16px 16px 0 0;padding:28px 40px 24px;border:1px solid #1A2540;border-bottom:none;text-align:center;">
            <div style="display:inline-block;background:linear-gradient(135deg,#00D4FF,#0080FF);padding:2px;border-radius:10px;">
              <div style="background:#060B18;border-radius:8px;padding:8px 20px;">
                <span style="font-size:16px;font-weight:700;color:#ffffff;letter-spacing:1px;">TRYNEX</span>
                <span style="font-size:16px;font-weight:700;color:#00D4FF;letter-spacing:1px;">TECH</span>
              </div>
            </div>
          </td>
        </tr>

        <!-- Content -->
        <tr>
          <td style="background:#0D1526;padding:32px 40px;border:1px solid #1A2540;border-top:none;border-bottom:none;">
            <div style="background:#060B18;border:1px solid #1A2540;border-radius:12px;padding:28px;">
              <p style="margin:0 0 20px;font-size:15px;color:#ffffff;line-height:1.8;white-space:pre-line;">${message}</p>
            </div>
            <div style="text-align:center;margin-top:24px;">
              <a href="https://trynextech.com" style="display:inline-block;background:linear-gradient(135deg,#00D4FF,#0080FF);color:#060B18;font-size:14px;font-weight:700;padding:12px 28px;border-radius:8px;text-decoration:none;">Visit Trynex Tech</a>
            </div>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#060B18;border-radius:0 0 16px 16px;padding:20px 40px;border:1px solid #1A2540;border-top:1px solid #1A2540;text-align:center;">
            <p style="margin:0 0 8px;font-size:12px;color:#8892A4;">You are receiving this because you subscribed to Trynex Tech updates.</p>
            <p style="margin:0;font-size:12px;">
              <a href="${unsubscribeUrl}" style="color:#8892A4;text-decoration:underline;">Unsubscribe</a>
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

      try {
        await sendEmailIfConfigured({
          to: sub.email,
          subject,
          text: message,
          html,
        });
        sent++;
      } catch {
        failed++;
      }
    }

    return ok({ message: `Sent: ${sent}, Failed: ${failed}`, sent, failed });
  } catch (error) {
    console.error("/api/admin/newsletter POST error:", error);
    return fail("Internal Server Error", 500);
  }
}

// DELETE — subscriber delete karo
export async function DELETE(request: Request) {
  try {
    if (!(await requireAdmin())) return fail("Unauthorized", 401);
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return fail("id required.", 400);

    await connectDB();
    await Newsletter.findByIdAndDelete(id);
    return ok({ message: "Subscriber deleted." });
  } catch (error) {
    console.error("/api/admin/newsletter DELETE error:", error);
    return fail("Internal Server Error", 500);
  }
}

// PATCH — unsubscribe/resubscribe
export async function PATCH(request: Request) {
  try {
    if (!(await requireAdmin())) return fail("Unauthorized", 401);
    const body = await request.json();
    const { id, active } = body as { id: string; active: boolean };
    if (!id) return fail("id required.", 400);

    await connectDB();
    const sub = await Newsletter.findByIdAndUpdate(id, { active }, { new: true }).lean();
    return ok({ subscriber: sub });
  } catch (error) {
    console.error("/api/admin/newsletter PATCH error:", error);
    return fail("Internal Server Error", 500);
  }
}