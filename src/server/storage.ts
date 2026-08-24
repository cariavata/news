import { Storage } from "@google-cloud/storage";
import path from "path";
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

/**
 * Uploads a file buffer to Google Cloud Storage or returns a Data URI fallback.
 */
export async function uploadToExternalStorage(file: Express.Multer.File): Promise<string> {
  const ext = path.extname(file.originalname) || ".jpg";
  const uniqueName = `uploads/${Date.now()}-${crypto.randomBytes(6).toString("hex")}${ext}`;

  if (storage && bucketName) {
    try {
      const bucket = storage.bucket(bucketName);
      const gcsFile = bucket.file(uniqueName);

      await gcsFile.save(file.buffer, {
        contentType: file.mimetype,
        resumable: false,
        public: true, // Make public for web access
        metadata: {
          cacheControl: "public, max-age=31536000",
        },
      });

      // Public URL
      return `https://storage.googleapis.com/${bucketName}/${uniqueName}`;
    } catch (error) {
      console.error("❌ [GCS Upload Error] Falling back to Data URL:", error);
    }
  }

  // Fallback if GCS is not configured or fails: Base64 Data URL or public external URL
  const base64 = file.buffer.toString("base64");
  return `data:${file.mimetype};base64,${base64}`;
}
