import { connectDB } from "@/lib/db";
import { fail, ok, readJson } from "@/lib/backend/route-utils";
import { trackSchema } from "@/lib/backend/validators";
import { TrackEvent } from "@/models/TrackEvent";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await readJson<unknown>(request);
    const parsed = trackSchema.safeParse(body);

    if (!parsed.success) {
      return fail("Invalid tracking payload.", 400, { issues: parsed.error.flatten() });
    }

    await connectDB();
    const event = await TrackEvent.create(parsed.data);

    return ok({ message: "Tracked.", event }, 201);
  } catch (error) {
    console.error("/api/track POST error:", error);
    return fail("Internal Server Error", 500);
  }
}
