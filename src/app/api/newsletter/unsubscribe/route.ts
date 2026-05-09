import { connectDB } from "@/lib/db";
import { Newsletter } from "@/models/Newsletter";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return new Response('Invalid unsubscribe link.', { status: 400 });
    }

    await connectDB();
    await Newsletter.findOneAndDelete({ email });

    return new Response(
      `<!DOCTYPE html>
<html><head><meta charset="UTF-8"/>
<style>
  body{margin:0;background:#060B18;font-family:'Segoe UI',Arial,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;}
  .card{background:#0D1526;border:1px solid #1A2540;border-radius:16px;padding:48px 40px;text-align:center;max-width:420px;width:90%;}
  h1{color:#fff;font-size:22px;margin:0 0 12px;}
  p{color:#8892A4;font-size:14px;margin:0 0 24px;line-height:1.6;}
  a{display:inline-block;background:linear-gradient(135deg,#00D4FF,#0080FF);color:#060B18;font-size:14px;font-weight:700;padding:12px 28px;border-radius:8px;text-decoration:none;}
</style>
</head>
<body>
  <div class="card">
    <div style="font-size:40px;margin-bottom:16px;">✅</div>
    <h1>Unsubscribed</h1>
    <p>You have been successfully unsubscribed from Trynex Tech newsletters. You will no longer receive emails from us.</p>
    <a href="https://trynextech.com">Back to Website</a>
  </div>
</body></html>`,
      { status: 200, headers: { 'Content-Type': 'text/html' } }
    );
  } catch (error) {
    console.error("/api/admin/newsletter/unsubscribe GET error:", error);
    return new Response('Something went wrong.', { status: 500 });
  }
}