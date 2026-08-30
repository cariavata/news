import { Storage } from "@google-cloud/storage";
import path from "path";
import fs from "fs";
import crypto from "crypto";

const bucketName = process.env.GCS_BUCKET_NAME || "";
let storage: Storage | null = null;

if (bucketName) {
  try {
    const config: any = {};
    if (process.env.GCS_PROJECT_ID) config.projectId = process.env.GCS_PROJECT_ID;
    if (process.env.GCS_KEYFILE_PATH) config.keyFilename = process.env.GCS_KEYFILE_PATH;
    if (process.env.GCS_CREDENTIALS_JSON) {
      config.credentials = JSON.parse(process.env.GCS_CREDENTIALS_JSON);
    }
    storage = new Storage(config);
    console.log(`✅ [GCS Initialized] Google Cloud Storage bucket target: ${bucketName}`);
  } catch (err) {
    console.error("❌ [GCS Initialization Error]", err);
  }
}

// Ensure local uploads directory exists
const UPLOADS_DIR = path.join(process.cwd(), "uploads");
try {
  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  }
} catch (e) {
  console.warn("Could not create uploads directory:", e);
}

/**
 * Uploads a file buffer to Google Cloud Storage or local disk storage.
 */
export async function uploadToExternalStorage(file: Express.Multer.File): Promise<string> {
  const ext = path.extname(file.originalname) || ".jpg";
  const filename = `${Date.now()}-${crypto.randomBytes(6).toString("hex")}${ext}`;

  // 1. If GCS is configured, upload to bucket
  if (storage && bucketName) {
    try {
      const uniqueName = `uploads/${filename}`;
      const bucket = storage.bucket(bucketName);
      const gcsFile = bucket.file(uniqueName);

      await gcsFile.save(file.buffer, {
        contentType: file.mimetype,
        resumable: false,
        public: true,
        metadata: {
          cacheControl: "public, max-age=31536000",
        },
      });

      return `https://storage.googleapis.com/${bucketName}/${uniqueName}`;
    } catch (error) {
      console.error("❌ [GCS Upload Error] Falling back to disk storage:", error);
    }
  }

  // 2. Save to local disk uploads directory and serve via Express
  try {
    const localFilePath = path.join(UPLOADS_DIR, filename);
    fs.writeFileSync(localFilePath, file.buffer);
    return `/uploads/${filename}`;
  } catch (diskError) {
    console.error("❌ [Disk Save Error] Falling back to Data URL:", diskError);
  }

  // 3. Fallback: Base64 Data URL
  const base64 = file.buffer.toString("base64");
  return `data:${file.mimetype};base64,${base64}`;
}
