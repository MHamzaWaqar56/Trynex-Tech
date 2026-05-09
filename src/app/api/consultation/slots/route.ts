

import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { ConsultationSlot } from '@/models/ConsultationSlot';
import { sendEmailIfConfigured } from '@/lib/backend/email';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

// Available time slots (9am - 6pm, 1hr each)
const AVAILABLE_TIMES = [
  '09:00', '10:00', '11:00', '12:00',
  '13:00', '14:00', '15:00', '16:00', '17:00', '18:00',
];

const bookingSchema = z.object({
  date: z.string().min(10),
  time: z.string().min(5),
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional().or(z.literal('')),
  service: z.string().min(1),
  message: z.string().optional().or(z.literal('')),
});

// GET /api/consultation/slots?date=2025-08-15
// Returns booked time slots for a specific date
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const date = searchParams.get('date');

    if (!date) {
      return NextResponse.json({ bookedSlots: [] });
    }

    await connectDB();
    const bookings = await ConsultationSlot.find({ date }).select('time status');

const bookedSlots = bookings
  .filter((b) => b.status !== 'cancelled')
  .map((b) => b.time);

const cancelledSlots = bookings
  .filter((b) => b.status === 'cancelled')
  .map((b) => b.time);

return NextResponse.json({ bookedSlots, cancelledSlots, availableTimes: AVAILABLE_TIMES });
  } catch (error) {
    console.error('GET /api/consultation/slots error:', error);
    return NextResponse.json({ bookedSlots: [], availableTimes: AVAILABLE_TIMES });
  }
}

// POST /api/consultation/slots — book a slot
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = bookingSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid booking data.', issues: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const { date, time, name, email, phone, service, message } = parsed.data;

    await connectDB();

    // Check if slot already booked
    const existing = await ConsultationSlot.findOne({ date, time, status: { $ne: 'cancelled' } });
    if (existing) {
      return NextResponse.json(
        { error: 'This slot is already booked. Please choose another time.' },
        { status: 409 },
      );
    }

    // Create booking
    await ConsultationSlot.create({ date, time, name, email, phone, service, message });


    // Send email notification, but never fail the booking if SMTP is down.
    try {
     const formattedDate = new Date(date).toLocaleDateString('en-US', {
  weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
});

const timeLabel: Record<string, string> = {
  '09:00': '9:00 AM', '10:00': '10:00 AM', '11:00': '11:00 AM',
  '12:00': '12:00 PM', '13:00': '1:00 PM', '14:00': '2:00 PM',
  '15:00': '3:00 PM', '16:00': '4:00 PM', '17:00': '5:00 PM',
  '18:00': '6:00 PM',
};

const htmlEmail = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>New Consultation Booking</title>
</head>
<body style="margin:0;padding:0;background:#060B18;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#060B18;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#0D1526 0%,#060B18 100%);border-radius:16px 16px 0 0;padding:36px 40px;border:1px solid #1A2540;border-bottom:none;text-align:center;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding-bottom:20px;">
                    <div style="display:inline-block;background:linear-gradient(135deg,#00D4FF,#FF6B35);padding:2px;border-radius:12px;">
                      <div style="background:#060B18;border-radius:10px;padding:10px 24px;">
                        <span style="font-size:18px;font-weight:700;color:#ffffff;letter-spacing:1px;">TRYNEX</span>
                        <span style="font-size:18px;font-weight:700;color:#00D4FF;letter-spacing:1px;">TECH</span>
                      </div>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td align="center">
                    <div style="width:56px;height:56px;background:rgba(0,212,255,0.1);border:1px solid rgba(0,212,255,0.3);border-radius:50%;display:inline-flex;align-items:center;justify-content:center;margin-bottom:16px;">
                      <span style="font-size:24px;">📅</span>
                    </div>
                    <h1 style="margin:0;font-size:24px;font-weight:700;color:#ffffff;">New Consultation Booked</h1>
                    <p style="margin:8px 0 0;font-size:14px;color:#8892A4;">A client has scheduled a free strategy session</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Booking Summary Card -->
          <tr>
            <td style="background:#0D1526;padding:0 40px;border:1px solid #1A2540;border-top:none;border-bottom:none;">
              <table width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0;">
                <tr>
                  <td style="background:rgba(0,212,255,0.05);border:1px solid rgba(0,212,255,0.15);border-radius:12px;padding:24px;">
                    <p style="margin:0 0 16px;font-size:11px;font-weight:600;color:#00D4FF;letter-spacing:2px;text-transform:uppercase;">Booking Details</p>
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding:8px 0;border-bottom:1px solid #1A2540;">
                          <span style="font-size:13px;color:#8892A4;">📅 Date</span>
                        </td>
                        <td style="padding:8px 0;border-bottom:1px solid #1A2540;text-align:right;">
                          <span style="font-size:13px;font-weight:600;color:#ffffff;">${formattedDate}</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:8px 0;border-bottom:1px solid #1A2540;">
                          <span style="font-size:13px;color:#8892A4;">🕐 Time</span>
                        </td>
                        <td style="padding:8px 0;border-bottom:1px solid #1A2540;text-align:right;">
                          <span style="font-size:13px;font-weight:600;color:#ffffff;">${timeLabel[time] || time}</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:8px 0;">
                          <span style="font-size:13px;color:#8892A4;">⚙️ Service</span>
                        </td>
                        <td style="padding:8px 0;text-align:right;">
                          <span style="display:inline-block;background:rgba(0,212,255,0.1);border:1px solid rgba(0,212,255,0.2);border-radius:20px;padding:3px 12px;font-size:12px;font-weight:600;color:#00D4FF;">${service}</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Client Info -->
          <tr>
            <td style="background:#0D1526;padding:0 40px;border:1px solid #1A2540;border-top:none;border-bottom:none;">
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
                <tr>
                  <td style="background:#060B18;border:1px solid #1A2540;border-radius:12px;padding:24px;">
                    <p style="margin:0 0 16px;font-size:11px;font-weight:600;color:#8892A4;letter-spacing:2px;text-transform:uppercase;">Client Information</p>
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding:8px 0;border-bottom:1px solid #1A2540;">
                          <span style="font-size:13px;color:#8892A4;">👤 Name</span>
                        </td>
                        <td style="padding:8px 0;border-bottom:1px solid #1A2540;text-align:right;">
                          <span style="font-size:13px;font-weight:600;color:#ffffff;">${name}</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:8px 0;border-bottom:1px solid #1A2540;">
                          <span style="font-size:13px;color:#8892A4;">📧 Email</span>
                        </td>
                        <td style="padding:8px 0;border-bottom:1px solid #1A2540;text-align:right;">
                          <a href="mailto:${email}" style="font-size:13px;font-weight:600;color:#00D4FF;text-decoration:none;">${email}</a>
                        </td>
                      </tr>
                      ${phone ? `
                      <tr>
                        <td style="padding:8px 0;border-bottom:1px solid #1A2540;">
                          <span style="font-size:13px;color:#8892A4;">📱 Phone</span>
                        </td>
                        <td style="padding:8px 0;border-bottom:1px solid #1A2540;text-align:right;">
                          <span style="font-size:13px;font-weight:600;color:#ffffff;">${phone}</span>
                        </td>
                      </tr>` : ''}
                      ${message ? `
                      <tr>
                        <td colspan="2" style="padding:12px 0 0;">
                          <span style="font-size:11px;color:#8892A4;letter-spacing:1px;text-transform:uppercase;">Message</span>
                          <p style="margin:8px 0 0;font-size:13px;color:#ffffff;line-height:1.6;background:rgba(255,255,255,0.03);border-radius:8px;padding:12px;">${message}</p>
                        </td>
                      </tr>` : ''}
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- CTA Button -->
          <tr>
            <td style="background:#0D1526;padding:0 40px 32px;border:1px solid #1A2540;border-top:none;border-bottom:none;text-align:center;">
              <a href="mailto:${email}?subject=Re: Consultation on ${formattedDate} at ${timeLabel[time] || time}"
                style="display:inline-block;background:linear-gradient(135deg,#00D4FF,#0080FF);color:#060B18;font-size:14px;font-weight:700;padding:14px 32px;border-radius:8px;text-decoration:none;letter-spacing:0.5px;">
                Reply to Client
              </a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#060B18;border-radius:0 0 16px 16px;padding:24px 40px;border:1px solid #1A2540;border-top:none;text-align:center;">
              <p style="margin:0 0 8px;font-size:12px;color:#8892A4;">This is an automated notification from</p>
              <p style="margin:0;font-size:13px;font-weight:600;color:#ffffff;">
                <span style="color:#00D4FF;">Trynex</span> Tech — trynextech.com
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

await sendEmailIfConfigured({
  subject: `New Consultation Booking — ${formattedDate} at ${timeLabel[time] || time}`,
  replyTo: email,
  text: [
    `New consultation booking`,
    `Name: ${name}`,
    `Email: ${email}`,
    phone ? `Phone: ${phone}` : null,
    `Service: ${service}`,
    `Date: ${formattedDate}`,
    `Time: ${timeLabel[time] || time}`,
    message ? `Message: ${message}` : null,
  ].filter(Boolean).join('\n'),
  html: htmlEmail,
});
    } catch (emailError) {
      console.error('POST /api/consultation/slots email notification failed:', emailError);
    }

    return NextResponse.json({ message: 'Consultation booked successfully!' }, { status: 201 });
  } catch (error: any) {
    // MongoDB duplicate key error (race condition)
    if (error?.code === 11000) {
      return NextResponse.json(
        { error: 'This slot was just booked by someone else. Please choose another time.' },
        { status: 409 },
      );
    }
    console.error('POST /api/consultation/slots error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
