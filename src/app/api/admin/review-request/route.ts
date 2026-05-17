import { connectDB } from '@/lib/db';
import { ok, fail, readJson, requireAdmin } from '@/lib/backend/route-utils';
import { ReviewToken } from '@/models/ReviewToken';
import { Portfolio } from '@/models/Portfolio';
import { sendEmailIfConfigured } from '@/lib/backend/email';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    if (!(await requireAdmin())) return fail('Unauthorized', 401);

    const body = await readJson<{
      clientEmail: string;
      clientName: string;
      projectSlug: string;
    }>(request);

    console.log('[review-request] body received:', JSON.stringify(body));

    if (!body.clientEmail || !body.clientName || !body.projectSlug) {
      console.log('[review-request] validation failed:', {
        clientEmail: body.clientEmail,
        clientName: body.clientName,
        projectSlug: body.projectSlug,
      });
      return fail('clientEmail, clientName and projectSlug are required.', 400);
    }

    await connectDB();

    // Find the project
    const project = await Portfolio.findOne({ slug: body.projectSlug }).lean<{
      _id: string; title: string; slug: string;
    }>();
    if (!project) return fail('Project not found.', 404);

    // Generate a unique token — expires in 7 days
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await ReviewToken.create({
      token,
      email:        body.clientEmail,
      clientName:   body.clientName,
      projectId:    project._id,
      projectTitle: project.title,
      used:         false,
      expiresAt,
    });

    // Build review link
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://trynextech.com';
    const reviewUrl = `${baseUrl}/review?token=${token}`;

    // Send email to client
    const html = buildReviewRequestEmail({
      clientName:   body.clientName,
      projectTitle: project.title,
      reviewUrl,
      expiresAt,
    });

    await sendEmailIfConfigured({
      to:      body.clientEmail,
      subject: `Share Your Experience — ${project.title} | Trynex Tech`,
      text:    `Hi ${body.clientName}, please share your review at: ${reviewUrl}`,
      html,
    });

    return ok({ message: 'Review request email sent successfully.' });
  } catch (error) {
    console.error('/api/admin/review-request POST error:', error);
    return fail('Internal Server Error', 500);
  }
}

// ── Email template
function buildReviewRequestEmail({
  clientName,
  projectTitle,
  reviewUrl,
  expiresAt,
}: {
  clientName: string;
  projectTitle: string;
  reviewUrl: string;
  expiresAt: Date;
}) {
  const expiry = expiresAt.toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  });

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/></head>
<body style="margin:0;padding:0;background:#060B18;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#060B18;padding:40px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#0D1526 0%,#060B18 100%);border-radius:16px 16px 0 0;padding:28px 40px 24px;border:1px solid #1A2540;border-bottom:none;text-align:center;">
            <div style="display:inline-block;background:linear-gradient(135deg,#00D4FF,#0080FF);padding:2px;border-radius:10px;margin-bottom:0;">
              <div style="background:#060B18;border-radius:8px;padding:8px 20px;">
                <span style="font-size:16px;font-weight:700;color:#ffffff;letter-spacing:1px;">TRYNEX</span>
                <span style="font-size:16px;font-weight:700;color:#00D4FF;letter-spacing:1px;">TECH</span>
              </div>
            </div>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="background:#0D1526;padding:32px 40px;border:1px solid #1A2540;border-top:none;border-bottom:none;">
            <div style="text-align:center;margin-bottom:24px;">
              <div style="width:56px;height:56px;background:rgba(0,212,255,0.1);border:1px solid rgba(0,212,255,0.3);border-radius:50%;display:inline-flex;align-items:center;justify-content:center;margin-bottom:12px;">
                <span style="font-size:26px;">⭐</span>
              </div>
              <h1 style="margin:0 0 6px;font-size:22px;font-weight:700;color:#ffffff;">We'd Love Your Feedback!</h1>
              <p style="margin:0;font-size:14px;color:#8892A4;">Your opinion matters to us</p>
            </div>

            <p style="font-size:14px;color:#8892A4;line-height:1.7;margin:0 0 20px;">
              Hi <strong style="color:#ffffff;">${clientName}</strong>,<br/><br/>
              Thank you for trusting Trynex Tech with your project —
              <strong style="color:#00D4FF;">${projectTitle}</strong>.
              We'd really appreciate it if you could take 2 minutes to share your experience working with us.
            </p>

            <div style="background:#060B18;border:1px solid rgba(0,212,255,0.2);border-radius:12px;padding:20px;margin-bottom:24px;text-align:center;">
              <p style="margin:0 0 16px;font-size:13px;color:#8892A4;">Click the button below to share your review</p>
              <a href="${reviewUrl}"
                style="display:inline-block;background:linear-gradient(135deg,#00D4FF,#0080FF);color:#060B18;font-size:14px;font-weight:700;padding:14px 32px;border-radius:8px;text-decoration:none;">
                ✍️ Write My Review
              </a>
              <p style="margin:16px 0 0;font-size:11px;color:#8892A4;">
                This link expires on <strong style="color:#ffffff;">${expiry}</strong> and can only be used once.
              </p>
            </div>

            <p style="font-size:12px;color:#8892A4;text-align:center;margin:0;">
              If the button doesn't work, copy this link:<br/>
              <a href="${reviewUrl}" style="color:#00D4FF;word-break:break-all;">${reviewUrl}</a>
            </p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#060B18;border-radius:0 0 16px 16px;padding:20px 40px;border:1px solid #1A2540;border-top:1px solid #1A2540;text-align:center;">
            <p style="margin:0 0 6px;font-size:12px;color:#8892A4;">This is an automated email from</p>
            <p style="margin:0;font-size:13px;font-weight:600;color:#ffffff;">
              <span style="color:#00D4FF;">Trynex</span> Tech &mdash; trynextech.com
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}