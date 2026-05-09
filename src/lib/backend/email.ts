


import nodemailer from "nodemailer";

export async function sendEmailIfConfigured(options: {
  subject: string;
  text: string;
  html?: string;
  replyTo?: string;
  to?: string;
}) {
  const host = process.env.SMTP_HOST?.trim();
  const port = process.env.SMTP_PORT?.trim();
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS?.replace(/\s+/g, '');
  const from = (process.env.SMTP_FROM || user)?.trim();
  const to = (options.to || process.env.CONTACT_TO_EMAIL || process.env.NEXT_PUBLIC_CONTACT_EMAIL)?.trim();

  if (!host || !port || !user || !pass || !from || !to) return { sent: false };

  const transporter = nodemailer.createTransport({
    host, port: Number(port),
    secure: Number(port) === 465,
    auth: { user, pass },
  });

  await transporter.sendMail({
    from, to,
    replyTo: options.replyTo,
    subject: options.subject,
    text: options.text,
    html: options.html,
  });

  return { sent: true };
}

// ─── Shared HTML builder ──────────────────────────────────────────────────────

function emailRow(label: string, value: string, isLink = false) {
  return `
    <tr>
      <td style="padding:9px 0;border-bottom:1px solid #1A2540;">
        <span style="font-size:13px;color:#8892A4;">${label}</span>
      </td>
      <td style="padding:9px 0;border-bottom:1px solid #1A2540;text-align:right;">
        ${isLink
      ? `<a href="${value}" style="font-size:13px;font-weight:600;color:#00D4FF;text-decoration:none;">${value}</a>`
      : `<span style="font-size:13px;font-weight:600;color:#ffffff;">${value}</span>`
    }
      </td>
    </tr>`;
}

function emailBadge(text: string) {
  return `<span style="display:inline-block;background:rgba(0,212,255,0.1);border:1px solid rgba(0,212,255,0.2);border-radius:20px;padding:3px 12px;font-size:12px;font-weight:600;color:#00D4FF;">${text}</span>`;
}

function emailWrap(content: string) {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/></head>
<body style="margin:0;padding:0;background:#060B18;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#060B18;padding:40px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

        <!-- Logo Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#0D1526 0%,#060B18 100%);border-radius:16px 16px 0 0;padding:28px 40px 24px;border:1px solid #1A2540;border-bottom:none;text-align:center;">
            <div style="display:inline-block;background:linear-gradient(135deg,#00D4FF,#FF6B35);padding:2px;border-radius:10px;margin-bottom:0;">
              <div style="background:#060B18;border-radius:8px;padding:8px 20px;">
                <span style="font-size:16px;font-weight:700;color:#ffffff;letter-spacing:1px;">TRYNEX</span>
                <span style="font-size:16px;font-weight:700;color:#00D4FF;letter-spacing:1px;">TECH</span>
              </div>
            </div>
          </td>
        </tr>

        ${content}

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

// ─── Email Templates ──────────────────────────────────────────────────────────

export function buildContactEmail(data: {
  name: string; email: string; phone?: string; company?: string;
  service?: string; budget?: string; deadline?: string;
  subject?: string; message: string;
}) {
  const html = emailWrap(`
    <!-- Title -->
    <tr>
      <td style="background:#0D1526;padding:24px 40px 0;border:1px solid #1A2540;border-top:none;border-bottom:none;text-align:center;">
        <div style="width:48px;height:48px;background:rgba(0,212,255,0.1);border:1px solid rgba(0,212,255,0.3);border-radius:50%;display:inline-flex;align-items:center;justify-content:center;margin-bottom:12px;">
          <span style="font-size:22px;">✉️</span>
        </div>
        <h1 style="margin:0 0 6px;font-size:22px;font-weight:700;color:#ffffff;">New Contact Inquiry</h1>
        <p style="margin:0 0 20px;font-size:14px;color:#8892A4;">Someone submitted the contact form</p>
      </td>
    </tr>
    <!-- Details -->
    <tr>
      <td style="background:#0D1526;padding:0 40px 28px;border:1px solid #1A2540;border-top:none;border-bottom:none;">
        <div style="background:#060B18;border:1px solid #1A2540;border-radius:12px;padding:20px;">
          <p style="margin:0 0 14px;font-size:11px;font-weight:600;color:#8892A4;letter-spacing:2px;text-transform:uppercase;">Contact Details</p>
          <table width="100%" cellpadding="0" cellspacing="0">
            ${emailRow('👤 Name', data.name)}
            ${emailRow('📧 Email', `mailto:${data.email}`, true)}
            ${data.phone ? emailRow('📱 Phone', data.phone) : ''}
            ${data.company ? emailRow('🏢 Company', data.company) : ''}
            ${data.service ? `<tr><td style="padding:9px 0;border-bottom:1px solid #1A2540;"><span style="font-size:13px;color:#8892A4;">⚙️ Service</span></td><td style="padding:9px 0;border-bottom:1px solid #1A2540;text-align:right;">${emailBadge(data.service)}</td></tr>` : ''}
            ${data.budget ? emailRow('💰 Budget', data.budget) : ''}
            ${data.deadline ? emailRow('📅 Deadline', data.deadline) : ''}
          </table>
          ${data.message ? `
          <div style="margin-top:16px;border-top:1px solid #1A2540;padding-top:16px;">
            <p style="margin:0 0 8px;font-size:11px;color:#8892A4;letter-spacing:1px;text-transform:uppercase;">Message</p>
            <p style="margin:0;font-size:13px;color:#ffffff;line-height:1.7;background:rgba(255,255,255,0.03);border-radius:8px;padding:12px;">${data.message}</p>
          </div>` : ''}
        </div>
        <div style="text-align:center;margin-top:20px;">
          <a href="mailto:${data.email}?subject=Re: ${data.subject || 'Your Inquiry'}" style="display:inline-block;background:linear-gradient(135deg,#00D4FF,#0080FF);color:#060B18;font-size:14px;font-weight:700;padding:12px 28px;border-radius:8px;text-decoration:none;">Reply to Client</a>
        </div>
      </td>
    </tr>`);

  return { html };
}

export function buildNewsletterEmail(email: string) {
  const html = emailWrap(`
    <tr>
      <td style="background:#0D1526;padding:24px 40px 32px;border:1px solid #1A2540;border-top:none;border-bottom:none;text-align:center;">
        <div style="width:48px;height:48px;background:rgba(0,212,255,0.1);border:1px solid rgba(0,212,255,0.3);border-radius:50%;display:inline-flex;align-items:center;justify-content:center;margin-bottom:12px;">
          <span style="font-size:22px;">📬</span>
        </div>
        <h1 style="margin:0 0 6px;font-size:22px;font-weight:700;color:#ffffff;">New Newsletter Subscriber</h1>
        <p style="margin:0 0 20px;font-size:14px;color:#8892A4;">Someone joined your mailing list</p>
        <div style="background:#060B18;border:1px solid rgba(0,212,255,0.2);border-radius:12px;padding:16px 24px;display:inline-block;">
          <p style="margin:0;font-size:15px;font-weight:600;color:#00D4FF;">${email}</p>
        </div>
      </td>
    </tr>`);
  return { html };
}


export function buildSubscriberWelcomeEmail(email: string) {
  const unsubscribeUrl = `https://trynextech.com/api/newsletter/unsubscribe?email=${encodeURIComponent(email)}`;

  const html = emailWrap(`
    <tr>
      <td style="background:#0D1526;padding:32px 40px 0;border:1px solid #1A2540;border-top:none;border-bottom:none;text-align:center;">
        <div style="width:56px;height:56px;background:rgba(0,212,255,0.1);border:1px solid rgba(0,212,255,0.3);border-radius:50%;display:inline-flex;align-items:center;justify-content:center;margin-bottom:16px;">
          <span style="font-size:28px;">🎉</span>
        </div>
        <h1 style="margin:0 0 8px;font-size:24px;font-weight:700;color:#ffffff;">Welcome to Trynex Tech!</h1>
        <p style="margin:0 0 24px;font-size:15px;color:#8892A4;line-height:1.7;">
          You're now subscribed to our newsletter. Get ready for expert insights on Web Development, AI, SEO, and Data Science — delivered straight to your inbox.
        </p>
      </td>
    </tr>

    <!-- What to expect -->
    <tr>
      <td style="background:#0D1526;padding:0 40px 28px;border:1px solid #1A2540;border-top:none;border-bottom:none;">
        <div style="background:#060B18;border:1px solid rgba(0,212,255,0.15);border-radius:12px;padding:20px 24px;margin-bottom:20px;">
          <p style="margin:0 0 16px;font-size:11px;font-weight:600;color:#00D4FF;letter-spacing:2px;text-transform:uppercase;">What You'll Receive</p>
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="padding:10px 0;border-bottom:1px solid #1A2540;">
                <span style="font-size:18px;">⚡</span>
                <span style="font-size:13px;color:#ffffff;font-weight:600;margin-left:10px;">Weekly Tech Insights</span>
                <p style="margin:4px 0 0 28px;font-size:12px;color:#8892A4;">Curated articles & tutorials from our team</p>
              </td>
            </tr>
            <tr>
              <td style="padding:10px 0;border-bottom:1px solid #1A2540;">
                <span style="font-size:18px;">🔔</span>
                <span style="font-size:13px;color:#ffffff;font-weight:600;margin-left:10px;">Early Blog Access</span>
                <p style="margin:4px 0 0 28px;font-size:12px;color:#8892A4;">Be the first to read new posts</p>
              </td>
            </tr>
            <tr>
              <td style="padding:10px 0;">
                <span style="font-size:18px;">🚫</span>
                <span style="font-size:13px;color:#ffffff;font-weight:600;margin-left:10px;">No Spam, Ever</span>
                <p style="margin:4px 0 0 28px;font-size:12px;color:#8892A4;">We respect your inbox & privacy</p>
              </td>
            </tr>
          </table>
        </div>

        <!-- CTA -->
        <div style="text-align:center;margin-bottom:24px;">
          <a href="https://trynextech.com/blog" style="display:inline-block;background:linear-gradient(135deg,#00D4FF,#0080FF);color:#060B18;font-size:14px;font-weight:700;padding:13px 32px;border-radius:8px;text-decoration:none;">
            Read Latest Blogs →
          </a>
        </div>

        <!-- Unsubscribe -->
        <div style="border-top:1px solid #1A2540;padding-top:20px;text-align:center;">
          <p style="margin:0;font-size:12px;color:#8892A4;line-height:1.8;">
            Don't want to receive these emails?<br/>
            <a href="${unsubscribeUrl}" style="color:#8892A4;text-decoration:underline;font-size:12px;">
              Unsubscribe here
            </a>
          </p>
        </div>
      </td>
    </tr>
  `);

  return { html };
}

export function buildQuoteEmail(data: {
  name: string; email: string; phone?: string; company?: string;
  service: string; budget?: string; deadline?: string; message: string;
}, type: 'quote' | 'custom-pricing' = 'quote') {
  const icon = type === 'custom-pricing' ? '💎' : '📋';
  const title = type === 'custom-pricing' ? 'Custom Pricing Request' : 'Quote Request';

  const html = emailWrap(`
    <tr>
      <td style="background:#0D1526;padding:24px 40px 0;border:1px solid #1A2540;border-top:none;border-bottom:none;text-align:center;">
        <div style="width:48px;height:48px;background:rgba(255,107,53,0.1);border:1px solid rgba(255,107,53,0.3);border-radius:50%;display:inline-flex;align-items:center;justify-content:center;margin-bottom:12px;">
          <span style="font-size:22px;">${icon}</span>
        </div>
        <h1 style="margin:0 0 6px;font-size:22px;font-weight:700;color:#ffffff;">${title}</h1>
        <p style="margin:0 0 20px;font-size:14px;color:#8892A4;">A client has requested a quote</p>
      </td>
    </tr>
    <tr>
      <td style="background:#0D1526;padding:0 40px 28px;border:1px solid #1A2540;border-top:none;border-bottom:none;">
        <div style="background:rgba(255,107,53,0.05);border:1px solid rgba(255,107,53,0.15);border-radius:12px;padding:20px;margin-bottom:16px;">
          <p style="margin:0 0 14px;font-size:11px;font-weight:600;color:#FF6B35;letter-spacing:2px;text-transform:uppercase;">Project Details</p>
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr><td style="padding:9px 0;border-bottom:1px solid #1A2540;"><span style="font-size:13px;color:#8892A4;">⚙️ Service</span></td><td style="padding:9px 0;border-bottom:1px solid #1A2540;text-align:right;">${emailBadge(data.service)}</td></tr>
            ${data.budget ? emailRow('💰 Budget', data.budget) : ''}
            ${data.deadline ? emailRow('📅 Deadline', data.deadline) : ''}
          </table>
        </div>
        <div style="background:#060B18;border:1px solid #1A2540;border-radius:12px;padding:20px;">
          <p style="margin:0 0 14px;font-size:11px;font-weight:600;color:#8892A4;letter-spacing:2px;text-transform:uppercase;">Client Info</p>
          <table width="100%" cellpadding="0" cellspacing="0">
            ${emailRow('👤 Name', data.name)}
            ${emailRow('📧 Email', `mailto:${data.email}`, true)}
            ${data.phone ? emailRow('📱 Phone', data.phone) : ''}
            ${data.company ? emailRow('🏢 Company', data.company) : ''}
          </table>
          ${data.message ? `
          <div style="margin-top:16px;border-top:1px solid #1A2540;padding-top:16px;">
            <p style="margin:0 0 8px;font-size:11px;color:#8892A4;letter-spacing:1px;text-transform:uppercase;">Message</p>
            <p style="margin:0;font-size:13px;color:#ffffff;line-height:1.7;background:rgba(255,255,255,0.03);border-radius:8px;padding:12px;">${data.message}</p>
          </div>` : ''}
        </div>
        <div style="text-align:center;margin-top:20px;">
          <a href="mailto:${data.email}?subject=Re: ${title} - ${data.service}" style="display:inline-block;background:linear-gradient(135deg,#FF6B35,#CC4F1F);color:#ffffff;font-size:14px;font-weight:700;padding:12px 28px;border-radius:8px;text-decoration:none;">Reply to Client</a>
        </div>
      </td>
    </tr>`);

  return { html };
}

export function buildConsultationStatusEmail(booking: {
  name: string; date: string; time: string; service: string;
}, status: 'confirmed' | 'cancelled') {
  const isConfirmed = status === 'confirmed';
  const color = isConfirmed ? '#00D4FF' : '#FF6B35';
  const bgColor = isConfirmed ? 'rgba(0,212,255,0.1)' : 'rgba(255,107,53,0.1)';
  const borderColor = isConfirmed ? 'rgba(0,212,255,0.3)' : 'rgba(255,107,53,0.3)';
  const icon = isConfirmed ? '✅' : '❌';
  const title = isConfirmed ? 'Consultation Confirmed!' : 'Consultation Cancelled';
  const message = isConfirmed
    ? 'Your consultation has been confirmed by our team. We look forward to speaking with you!'
    : 'Unfortunately, your consultation has been cancelled. Please feel free to book another slot.';

  const html = emailWrap(`
    <tr>
      <td style="background:#0D1526;padding:24px 40px 0;border:1px solid #1A2540;border-top:none;border-bottom:none;text-align:center;">
        <div style="width:56px;height:56px;background:${bgColor};border:1px solid ${borderColor};border-radius:50%;display:inline-flex;align-items:center;justify-content:center;margin-bottom:12px;">
          <span style="font-size:26px;">${icon}</span>
        </div>
        <h1 style="margin:0 0 6px;font-size:22px;font-weight:700;color:#ffffff;">${title}</h1>
        <p style="margin:0 0 20px;font-size:14px;color:#8892A4;">${message}</p>
      </td>
    </tr>
    <tr>
      <td style="background:#0D1526;padding:0 40px 28px;border:1px solid #1A2540;border-top:none;border-bottom:none;">
        <div style="background:rgba(0,0,0,0.2);border:1px solid ${borderColor};border-radius:12px;padding:20px;">
          <p style="margin:0 0 14px;font-size:11px;font-weight:600;color:${color};letter-spacing:2px;text-transform:uppercase;">Booking Details</p>
          <table width="100%" cellpadding="0" cellspacing="0">
            ${emailRow('👤 Name', booking.name)}
            ${emailRow('📅 Date', booking.date)}
            ${emailRow('🕐 Time', booking.time)}
            <tr><td style="padding:9px 0;"><span style="font-size:13px;color:#8892A4;">⚙️ Service</span></td><td style="padding:9px 0;text-align:right;">${emailBadge(booking.service)}</td></tr>
          </table>
        </div>
        ${isConfirmed ? `
        <div style="text-align:center;margin-top:20px;">
          <a href="https://trynextech.com/consultation" style="display:inline-block;background:linear-gradient(135deg,#00D4FF,#0080FF);color:#060B18;font-size:14px;font-weight:700;padding:12px 28px;border-radius:8px;text-decoration:none;">View Consultation Page</a>
        </div>` : `
        <div style="text-align:center;margin-top:20px;">
          <a href="https://trynextech.com/consultation" style="display:inline-block;background:linear-gradient(135deg,#FF6B35,#CC4F1F);color:#ffffff;font-size:14px;font-weight:700;padding:12px 28px;border-radius:8px;text-decoration:none;">Book Another Slot</a>
        </div>`}
      </td>
    </tr>`);

  return { html };
}

export function buildLeadStatusEmail(lead: {
  name: string; service: string; status: string;
}) {
  const statusMap: Record<string, { icon: string; color: string; bg: string; border: string; title: string; message: string }> = {
    contacted: {
      icon: '📞', color: '#00D4FF', bg: 'rgba(0,212,255,0.1)', border: 'rgba(0,212,255,0.3)',
      title: 'We Received Your Request',
      message: 'Our team has received your inquiry and will contact you soon.',
    },
    'in-progress': {
      icon: '⚡', color: '#FF6B35', bg: 'rgba(255,107,53,0.1)', border: 'rgba(255,107,53,0.3)',
      title: 'Your Request Is In Progress',
      message: 'Our team has started working on your request. We will share updates shortly.',
    },
    done: {
      icon: '✅', color: '#4ade80', bg: 'rgba(74,222,128,0.1)', border: 'rgba(74,222,128,0.3)',
      title: 'Your Request Is Completed',
      message: 'The requested work has been completed. Feel free to reply if you need any adjustments.',
    },
    closed: {
      icon: '🔒', color: '#8892A4', bg: 'rgba(136,146,164,0.1)', border: 'rgba(136,146,164,0.3)',
      title: 'Request Closed',
      message: 'Your request has been marked as closed. Thank you for choosing Trynex Tech.',
    },
  };

  const s = statusMap[lead.status] || statusMap['contacted'];

  const html = emailWrap(`
    <tr>
      <td style="background:#0D1526;padding:24px 40px 28px;border:1px solid #1A2540;border-top:none;border-bottom:none;text-align:center;">
        <div style="width:56px;height:56px;background:${s.bg};border:1px solid ${s.border};border-radius:50%;display:inline-flex;align-items:center;justify-content:center;margin-bottom:12px;">
          <span style="font-size:26px;">${s.icon}</span>
        </div>
        <h1 style="margin:0 0 6px;font-size:22px;font-weight:700;color:#ffffff;">${s.title}</h1>
        <p style="margin:0 0 20px;font-size:14px;color:#8892A4;">Hi ${lead.name}, here's your request update</p>
        <div style="background:${s.bg};border:1px solid ${s.border};border-radius:12px;padding:16px 24px;display:inline-block;margin-bottom:16px;">
          <p style="margin:0 0 4px;font-size:11px;color:${s.color};letter-spacing:2px;text-transform:uppercase;">Service</p>
          <p style="margin:0;font-size:15px;font-weight:600;color:#ffffff;">${lead.service}</p>
        </div>
        <p style="margin:0;font-size:14px;color:#8892A4;line-height:1.6;">${s.message}</p>
        <div style="margin-top:20px;">
          <a href="https://trynextech.com/contact" style="display:inline-block;background:linear-gradient(135deg,#00D4FF,#0080FF);color:#060B18;font-size:14px;font-weight:700;padding:12px 28px;border-radius:8px;text-decoration:none;">Contact Us</a>
        </div>
      </td>
    </tr>`);

  return { html };
}

export function buildApplicationStatusEmail(application: {
  fullName: string; vacancyTitle: string; status: string;
}) {
  const statusMap: Record<string, { icon: string; color: string; bg: string; border: string; title: string; message: string }> = {
    reviewed: {
      icon: '👀', color: '#00D4FF', bg: 'rgba(0,212,255,0.1)', border: 'rgba(0,212,255,0.3)',
      title: 'Application Under Review',
      message: 'Our team is currently reviewing your application. We will get back to you soon.',
    },
    shortlisted: {
      icon: '🌟', color: '#FF6B35', bg: 'rgba(255,107,53,0.1)', border: 'rgba(255,107,53,0.3)',
      title: 'You Have Been Shortlisted!',
      message: 'Congratulations! You have been shortlisted for this position. Our team will contact you with next steps.',
    },
    rejected: {
      icon: '😔', color: '#8892A4', bg: 'rgba(136,146,164,0.1)', border: 'rgba(136,146,164,0.3)',
      title: 'Application Update',
      message: 'Thank you for your interest. After careful review, we have decided to move forward with other candidates. We encourage you to apply for future openings.',
    },
    hired: {
      icon: '🎉', color: '#4ade80', bg: 'rgba(74,222,128,0.1)', border: 'rgba(74,222,128,0.3)',
      title: 'Welcome to Trynex Tech!',
      message: 'Congratulations! We are thrilled to offer you this position. Our team will reach out with the next steps to get you onboarded.',
    },
  };

  const s = statusMap[application.status] || statusMap['reviewed'];

  const html = emailWrap(`
    <tr>
      <td style="background:#0D1526;padding:24px 40px 28px;border:1px solid #1A2540;border-top:none;border-bottom:none;text-align:center;">
        <div style="width:56px;height:56px;background:${s.bg};border:1px solid ${s.border};border-radius:50%;display:inline-flex;align-items:center;justify-content:center;margin-bottom:12px;">
          <span style="font-size:26px;">${s.icon}</span>
        </div>
        <h1 style="margin:0 0 6px;font-size:22px;font-weight:700;color:#ffffff;">${s.title}</h1>
        <p style="margin:0 0 20px;font-size:14px;color:#8892A4;">Hi ${application.fullName}</p>
        <div style="background:${s.bg};border:1px solid ${s.border};border-radius:12px;padding:16px 24px;display:inline-block;margin-bottom:16px;">
          <p style="margin:0 0 4px;font-size:11px;color:${s.color};letter-spacing:2px;text-transform:uppercase;">Position</p>
          <p style="margin:0;font-size:15px;font-weight:600;color:#ffffff;">${application.vacancyTitle}</p>
        </div>
        <p style="margin:0;font-size:14px;color:#8892A4;line-height:1.6;">${s.message}</p>
        <div style="margin-top:20px;">
          <a href="https://trynextech.com/careers" style="display:inline-block;background:linear-gradient(135deg,#00D4FF,#0080FF);color:#060B18;font-size:14px;font-weight:700;padding:12px 28px;border-radius:8px;text-decoration:none;">View Open Positions</a>
        </div>
      </td>
    </tr>`);

  return { html };
}




export function buildNewApplicationAdminEmail(data: {
  fullName: string;
  email: string;
  phone?: string;
  linkedin?: string;
  portfolioUrl?: string;
  yearsOfExperience?: string;
  coverLetter: string;
  vacancyTitle: string;
  cvUrl: string;
}) {
  const html = emailWrap(`
    <tr>
      <td style="background:#0D1526;padding:24px 40px 0;border:1px solid #1A2540;border-top:none;border-bottom:none;text-align:center;">
        <div style="width:48px;height:48px;background:rgba(0,212,255,0.1);border:1px solid rgba(0,212,255,0.3);border-radius:50%;display:inline-flex;align-items:center;justify-content:center;margin-bottom:12px;">
          <span style="font-size:22px;">📋</span>
        </div>
        <h1 style="margin:0 0 6px;font-size:22px;font-weight:700;color:#ffffff;">New Job Application</h1>
        <p style="margin:0 0 8px;font-size:14px;color:#8892A4;">Someone has applied for a position at Trynex Tech</p>
        <div style="margin-bottom:20px;">${emailBadge(data.vacancyTitle)}</div>
      </td>
    </tr>
    <tr>
      <td style="background:#0D1526;padding:0 40px 28px;border:1px solid #1A2540;border-top:none;border-bottom:none;">
        <div style="background:rgba(0,0,0,0.2);border:1px solid rgba(0,212,255,0.15);border-radius:12px;padding:20px;">
          <p style="margin:0 0 14px;font-size:11px;font-weight:600;color:#00D4FF;letter-spacing:2px;text-transform:uppercase;">Applicant Details</p>
          <table width="100%" cellpadding="0" cellspacing="0">
            ${emailRow('👤 Full Name', data.fullName)}
            ${emailRow('📧 Email', data.email)}
            ${data.phone ? emailRow('📱 Phone', data.phone) : ''}
            ${data.yearsOfExperience ? emailRow('💼 Experience', data.yearsOfExperience + ' years') : ''}
            ${data.linkedin ? emailRow('🔗 LinkedIn', data.linkedin, true) : ''}
            ${data.portfolioUrl ? emailRow('🌐 Portfolio', data.portfolioUrl, true) : ''}
          </table>
        </div>
        ${data.coverLetter ? `
        <div style="margin-top:16px;background:rgba(0,0,0,0.2);border:1px solid #1A2540;border-radius:12px;padding:20px;">
          <p style="margin:0 0 10px;font-size:11px;font-weight:600;color:#8892A4;letter-spacing:2px;text-transform:uppercase;">Cover Letter</p>
          <p style="margin:0;font-size:13px;color:#ffffff;line-height:1.8;white-space:pre-line;">${data.coverLetter}</p>
        </div>` : ''}
        <div style="margin-top:20px;text-align:center;">
          <a href="${data.cvUrl}" style="display:inline-block;background:linear-gradient(135deg,#00D4FF,#0080FF);color:#060B18;font-size:14px;font-weight:700;padding:12px 28px;border-radius:8px;text-decoration:none;margin-right:10px;">⬇ Download CV</a>
          <a href="mailto:${data.email}?subject=Re: Application for ${data.vacancyTitle}" style="display:inline-block;background:linear-gradient(135deg,#FF6B35,#CC4F1F);color:#ffffff;font-size:14px;font-weight:700;padding:12px 28px;border-radius:8px;text-decoration:none;">✉ Reply to Applicant</a>
        </div>
      </td>
    </tr>`);
 
  const text = `New application for: ${data.vacancyTitle}\n\nName: ${data.fullName}\nEmail: ${data.email}${data.phone ? `\nPhone: ${data.phone}` : ''}${data.yearsOfExperience ? `\nExperience: ${data.yearsOfExperience} years` : ''}${data.linkedin ? `\nLinkedIn: ${data.linkedin}` : ''}${data.portfolioUrl ? `\nPortfolio: ${data.portfolioUrl}` : ''}\n\nCover Letter:\n${data.coverLetter}\n\nCV: ${data.cvUrl}`;
 
  return { html, text };
}
 




