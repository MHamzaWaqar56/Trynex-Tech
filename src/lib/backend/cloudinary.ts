import { v2 as cloudinary } from "cloudinary";

let configured = false;

export function configureCloudinary() {
  if (configured) return cloudinary;

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error("Cloudinary credentials are not fully configured.");
  }

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });

  configured = true;
  return cloudinary;
}

export function getCloudinaryConfigStatus() {
  return {
    cloudName: Boolean(process.env.CLOUDINARY_CLOUD_NAME),
    apiKey: Boolean(process.env.CLOUDINARY_API_KEY),
    apiSecret: Boolean(process.env.CLOUDINARY_API_SECRET),
  };
}
