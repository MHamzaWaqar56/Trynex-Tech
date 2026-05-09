import { connectDB } from "@/lib/db";
import { fail, ok, readJson } from "@/lib/backend/route-utils";
import { Blog } from "@/models/Blog";
import { Contact } from "@/models/Contact";
import { Lead } from "@/models/Lead";
import { Portfolio } from "@/models/Portfolio";
import { Testimonial } from "@/models/Testimonial";
import { TrackEvent } from "@/models/TrackEvent";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await connectDB();

    const [projects, clients, blogPosts, testimonials, contacts, leads] = await Promise.all([
      Portfolio.countDocuments({}),
      Contact.distinct("email").then((emails) => emails.length),
      Blog.countDocuments({ published: true }),
      Testimonial.countDocuments({ approved: true }),
      Contact.countDocuments({}),
      Lead.countDocuments({}),
    ]);

    return ok({
      projects,
      clients,
      blogPosts,
      testimonials,
      contacts,
      leads,
      experienceYears: 5,
    });
  } catch (error) {
    console.error("/api/stats GET error:", error);
    return fail("Internal Server Error", 500);
  }
}

export async function POST(request: Request) {
  try {
    const body = await readJson<{ event?: string; path?: string; referrer?: string; metadata?: Record<string, unknown> }>(request);
    if (!body.event) {
      return fail("Event is required.", 400);
    }

    await connectDB();
    await TrackEvent.create({
      event: body.event,
      path: body.path,
      referrer: body.referrer,
      metadata: body.metadata,
    });

    return ok({ message: "Tracked." }, 201);
  } catch (error) {
    console.error("/api/stats POST error:", error);
    return fail("Internal Server Error", 500);
  }
}
