

import { Readable } from "node:stream";
import { fail, ok, requireAdmin } from "@/lib/backend/route-utils";
import { configureCloudinary, getCloudinaryConfigStatus } from "@/lib/backend/cloudinary";

export const dynamic = "force-dynamic";

async function uploadFileToCloudinary(file: File, folder?: string) {
  const cloudinary = configureCloudinary();
  const buffer = Buffer.from(await file.arrayBuffer());

  return new Promise<{ secure_url: string; public_id: string }>((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: folder || "trynex", resource_type: "auto" },
      (error, result) => {
        if (error) { reject(error); return; }
        if (!result) { reject(new Error("Cloudinary upload returned no result.")); return; }
        resolve({ secure_url: result.secure_url, public_id: result.public_id });
      }
    );
    Readable.from(buffer).pipe(uploadStream);
  });
}

export async function POST(request: Request) {
  try {
    if (!(await requireAdmin())) return fail("Unauthorized", 401);

    const status = getCloudinaryConfigStatus();
    if (!status.cloudName || !status.apiKey || !status.apiSecret) {
      return fail("Cloudinary is not configured.", 500);
    }

    const formData = await request.formData();
    const folder = typeof formData.get("folder") === "string" ? formData.get("folder") as string : undefined;

    // Multiple files support
    const files = formData.getAll("file").filter((f): f is File => f instanceof File);

    if (files.length === 0) return fail("File is required.", 400);

    // Sequential upload — timeout se bachne k liye
    const results = [];
    for (const file of files) {
      const result = await uploadFileToCloudinary(file, folder);
      results.push(result);
    }

    // Single file — purana response format
    if (results.length === 1) {
      return ok({ message: "File uploaded.", asset: results[0] }, 201);
    }

    // Multiple files
    return ok({ message: "Files uploaded.", assets: results }, 201);

  } catch (error) {
    console.error("/api/admin/upload POST error:", error);
    return fail("Internal Server Error", 500);
  }
}