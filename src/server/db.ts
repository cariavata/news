import mongoose from "mongoose";

// Disable command buffering so queries fail or return immediately if DB is not connected
mongoose.set("bufferCommands", false);

const MONGODB_URI = process.env.MONGODB_URI || "";

let isConnected = false;

export function isMongoConnected(): boolean {
  return isConnected && mongoose.connection.readyState === 1;
}

export async function connectDB() {
  if (isConnected && mongoose.connection.readyState === 1) return;
  if (!MONGODB_URI) {
    console.warn("⚠️ [MongoDB Warning] MONGODB_URI environment variable is not set. API calls will use fallback data.");
    return;
  }

  try {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    isConnected = true;
    console.log("✅ [MongoDB Connected] Successfully connected to MongoDB Atlas.");
  } catch (error) {
    isConnected = false;
    console.error("❌ [MongoDB Connection Error]", error);
  }
}

// Article Schema
const ArticleSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    excerpt: { type: String, default: "" },
    content: { type: String, default: "" },
    category: { type: String, default: "건강검진" },
    categoryId: { type: String, default: "checkup" },
    imageUrl: { type: String, default: "" },
    cardNewsImages: { type: [String], default: [] },
    author: { type: String, default: "데일리펄스" },
    views: { type: Number, default: 0 },
    likes: { type: Number, default: 0 },
    isFeatured: { type: Boolean, default: false },
    isTrending: { type: Boolean, default: false },
    isBreaking: { type: Boolean, default: false },
    doctorName: { type: String, default: "" },
    doctorSpecialty: { type: String, default: "" },
    hospitalName: { type: String, default: "" },
    doctorImage: { type: String, default: "" },
    createdAt: { type: String, default: () => new Date().toISOString() },
  },
  { timestamps: true }
);

// Category Schema
const CategorySchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
});

// Company Page Schema
const CompanyPageSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  content: { type: String, default: "" },
  updateTime: { type: String, default: () => new Date().toISOString() },
});

// SEO Settings Schema
const SeoSettingsSchema = new mongoose.Schema({
  id: { type: String, default: "seo", unique: true },
  title: { type: String, default: "" },
  description: { type: String, default: "" },
  keywords: { type: String, default: "" },
  robotsTxt: { type: String, default: "" },
  adsTxt: { type: String, default: "" },
  sitemapXml: { type: String, default: "" },
  rssXml: { type: String, default: "" },
  ogTitle: { type: String, default: "" },
  ogDescription: { type: String, default: "" },
  ogImage: { type: String, default: "" },
  naverSiteVerification: { type: String, default: "" },
  googleSiteVerification: { type: String, default: "" },
  googleAdsenseClient: { type: String, default: "" },
});

export const ArticleModel = mongoose.models.Article || mongoose.model("Article", ArticleSchema);
export const CategoryModel = mongoose.models.Category || mongoose.model("Category", CategorySchema);
export const CompanyPageModel = mongoose.models.CompanyPage || mongoose.model("CompanyPage", CompanyPageSchema);
export const SeoSettingsModel = mongoose.models.SeoSettings || mongoose.model("SeoSettings", SeoSettingsSchema);
