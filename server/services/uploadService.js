import fs from 'fs/promises';
import path from 'path';
import { configureCloudinary, cloudinary } from '../config/cloudinary.js';

/**
 * If Cloudinary is configured, uploads local file and returns secure URL; otherwise returns local URL path.
 */
export async function resolveFileUrl(localFilePath, folder = 'onboarding') {
  const useCloudinary = configureCloudinary();

  if (!useCloudinary) {
    const relative = path.relative(path.join(process.cwd(), 'uploads'), localFilePath).replace(/\\/g, '/');
    const base = process.env.PUBLIC_BASE_URL || `http://localhost:${process.env.PORT || 5000}`;
    return { fileUrl: `${base}/uploads/${relative}`, publicId: null };
  }

  const result = await cloudinary.uploader.upload(localFilePath, { folder });
  await fs.unlink(localFilePath).catch(() => {});
  return { fileUrl: result.secure_url, publicId: result.public_id };
}
