import { prisma } from "$lib/server/db";
import sharp from "sharp";
import crypto from "crypto";
import path from "path";
import fs from "fs/promises";

const UPLOAD_DIR = path.join(process.cwd(), "static", "uploads");
const MAX_WIDTH = 1920;
const THUMBNAIL_WIDTH = 400;
const MAX_FILE_SIZE = 1 * 1024 * 1024; // 1MB
const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

async function ensureUploadDir(): Promise<void> {
  await fs.mkdir(UPLOAD_DIR, { recursive: true });
}

function generateFilename(originalName: string): string {
  const ext = path.extname(originalName) || ".webp";
  const hash = crypto.randomBytes(16).toString("hex");
  return `${hash}${ext}`;
}

export function deriveThumbFilename(mainFilename: string): string {
  const base = path.basename(mainFilename, path.extname(mainFilename));
  return `thumb_${base}.jpg`;
}

export interface UploadResult {
  id: string;
  filename: string;
  mimeType: string;
  size: number;
  url: string;
  thumbnailUrl: string | null;
  width: number;
  height: number;
  createdAt: Date;
}

export async function uploadImage(file: File): Promise<UploadResult> {
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    throw new Error(
      `Unsupported file type: ${file.type}. Allowed: ${ALLOWED_MIME_TYPES.join(", ")}`,
    );
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new Error(
      `File too large: ${file.size} bytes. Max: ${MAX_FILE_SIZE} bytes`,
    );
  }

  await ensureUploadDir();

  const buffer = Buffer.from(await file.arrayBuffer());
  const isGif = file.type === "image/gif";

  // Process main image — resize to max width, convert to webp (except GIF)
  let mainProcessor = sharp(buffer).resize(MAX_WIDTH, null, {
    withoutEnlargement: true,
    fit: "inside",
  });

  let finalMimeType: string;
  if (isGif) {
    // Keep GIF as-is, just resize
    finalMimeType = "image/gif";
  } else {
    // Convert non-GIF to webp for web optimization
    mainProcessor = mainProcessor.webp({ quality: 85 });
    finalMimeType = "image/webp";
  }

  const mainFilename = generateFilename(file.name);
  // Adjust extension for webp conversion
  const finalMainFilename = isGif
    ? mainFilename
    : mainFilename.replace(/\.[^.]+$/, ".webp");
  const mainPath = path.join(UPLOAD_DIR, finalMainFilename);
  await mainProcessor.toFile(mainPath);

  // Get final dimensions
  const mainMeta = await sharp(mainPath).metadata();
  const width = mainMeta.width ?? 0;
  const height = mainMeta.height ?? 0;

  // Generate thumbnail — skip for GIF (animated thumbnail useless)
  let thumbnailUrl: string | null = null;

  if (!isGif) {
    const thumbFilename = deriveThumbFilename(finalMainFilename);
    const thumbPath = path.join(UPLOAD_DIR, thumbFilename);
    await sharp(buffer)
      .resize(THUMBNAIL_WIDTH, null, {
        withoutEnlargement: true,
        fit: "inside",
      })
      .jpeg({ quality: 80 })
      .toFile(thumbPath);
    thumbnailUrl = `/uploads/${thumbFilename}`;
  }

  // Save metadata to database
  const upload = await prisma.upload.create({
    data: {
      filename: finalMainFilename,
      mimeType: finalMimeType,
      size: file.size,
    },
  });

  return {
    id: upload.id,
    filename: finalMainFilename,
    mimeType: finalMimeType,
    size: file.size,
    url: `/uploads/${finalMainFilename}`,
    thumbnailUrl,
    width,
    height,
    createdAt: upload.createdAt,
  };
}

export async function deleteImage(id: string): Promise<void> {
  const upload = await prisma.upload.findUnique({ where: { id } });
  if (!upload) {
    throw new Error("Upload not found");
  }

  const mainPath = path.join(UPLOAD_DIR, upload.filename);
  const thumbFilename = deriveThumbFilename(upload.filename);
  const thumbPath = path.join(UPLOAD_DIR, thumbFilename);

  // Delete files, ignore errors if they don't exist
  await Promise.allSettled([fs.unlink(mainPath), fs.unlink(thumbPath)]);

  await prisma.upload.delete({ where: { id } });
}

export function getImageUrl(filename: string): string {
  return `/uploads/${filename}`;
}
