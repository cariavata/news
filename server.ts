import express from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import multer from "multer";
import { connectDB, isMongoConnected, ArticleModel, CategoryModel, CompanyPageModel, SeoSettingsModel } from "./src/server/db";
import { uploadToExternalStorage } from "./src/server/storage";
import {
  getFirestoreCollection,
  getFirestoreDocument,
  setFirestoreDocument,
  deleteFirestoreDocument
} from "./src/server/firestoreService";
import { getPublishedAutoArticles, getAutoArticleById } from "./src/lib/autoPublishEngine";

let currentDir = "";
try {
  currentDir = __dirname;
} catch {
  currentDir = path.dirname(fileURLToPath(import.meta.url));
}

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

async function startServer() {
  const app = express();
  app.set("trust proxy", true);
  app.use(express.json({ limit: "20mb" }));
  app.use(express.urlencoded({ extended: true, limit: "20mb" }));

  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
  const isProd = process.env.NODE_ENV === "production";

  // Static uploads directory for media files
  const uploadsDir = path.join(process.cwd(), "uploads");
  try {
    if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
  } catch (e) {}
  app.use("/uploads", express.static(uploadsDir));

  // Connect to MongoDB Atlas (if configured)
  await connectDB();

  // -------------------------------------------------------------
  // REST API Endpoints for Firestore, MongoDB & External Storage
  // -------------------------------------------------------------

  // Image upload API
  app.post("/api/upload", upload.array("images", 10), async (req, res) => {
    try {
      const files = req.files as Express.Multer.File[];
      if (!files || files.length === 0) {
        return res.status(400).json({ error: "No files uploaded" });
      }

      const uploadPromises = files.map(file => uploadToExternalStorage(file));
      const urls = await Promise.all(uploadPromises);

      res.json({ urls });
    } catch (error: any) {
      console.error("Upload API Error:", error);
      res.status(500).json({ error: error.message || "Failed to upload file" });
    }
  });

  // Articles API
  app.get("/api/articles", async (req, res) => {
    try {
      const firestoreArticles = await getFirestoreCollection("articles");
      if (firestoreArticles && firestoreArticles.length > 0) {
        const filtered = firestoreArticles.filter((a: any) => a.categoryId !== 'opinion' && a.category !== 'opinion');
        filtered.sort((a: any, b: any) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
        return res.json(filtered);
      }
      if (isMongoConnected()) {
        const articles = await (ArticleModel as any).find({ categoryId: { $ne: 'opinion' }, category: { $ne: 'opinion' } }).sort({ createdAt: -1 }).lean().exec();
        if (articles && articles.length > 0) {
          return res.json(articles.map((a: any) => ({
            ...a,
            id: a._id.toString()
          })));
        }
      }
      res.json([]);
    } catch (error: any) {
      res.json([]);
    }
  });

  app.get("/api/articles/:id", async (req, res) => {
    try {
      const doc = await getFirestoreDocument("articles", req.params.id);
      if (doc) return res.json(doc);

      if (isMongoConnected()) {
        const article = await (ArticleModel as any).findById(req.params.id).lean().exec();
        if (article) return res.json({ ...(article as any), id: (article as any)._id.toString() });
      }
      return res.status(404).json({ error: "Article not found" });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/articles", async (req, res) => {
    try {
      const articleData = req.body;
      const id = articleData.id || `art_${Date.now()}`;
      const savedDoc = await setFirestoreDocument("articles", id, { ...articleData, id });

      if (isMongoConnected()) {
        try {
          const article = new (ArticleModel as any)({ ...articleData, _id: id });
          await article.save();
        } catch (e) {}
      }

      res.status(201).json(savedDoc || { ...articleData, id });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.put("/api/articles/:id", async (req, res) => {
    try {
      const id = req.params.id;
      const updated = await setFirestoreDocument("articles", id, { ...req.body, id });

      if (isMongoConnected()) {
        try {
          await (ArticleModel as any).findByIdAndUpdate(id, req.body, { new: true }).lean().exec();
        } catch (e) {}
      }

      res.json(updated || { ...req.body, id });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/articles/:id", async (req, res) => {
    try {
      const id = req.params.id;
      await deleteFirestoreDocument("articles", id);

      if (isMongoConnected()) {
        try {
          await (ArticleModel as any).findByIdAndDelete(id).exec();
        } catch (e) {}
      }

      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Views / Likes increment API
  app.post("/api/articles/:id/views", async (req, res) => {
    try {
      const id = req.params.id;
      const current = await getFirestoreDocument("articles", id);
      if (current) {
        const views = (current.views || 0) + 1;
        await setFirestoreDocument("articles", id, { ...current, views });
        return res.json({ views });
      }
      if (isMongoConnected()) {
        const article = await (ArticleModel as any).findByIdAndUpdate(id, { $inc: { views: 1 } }, { new: true }).lean().exec();
        return res.json({ views: (article as any)?.views || 0 });
      }
      res.json({ views: 0 });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Categories API
  app.get("/api/categories", async (req, res) => {
    try {
      const cats = await getFirestoreCollection("categories");
      if (cats && cats.length > 0) return res.json(cats.filter((c: any) => c.id !== 'opinion'));
      if (isMongoConnected()) {
        const categories = await (CategoryModel as any).find({ _id: { $ne: 'opinion' } }).lean().exec();
        if (categories && categories.length > 0) return res.json(categories.filter((c: any) => c.id !== 'opinion'));
      }
      res.json(defaultCategories.filter(c => c.id !== 'opinion'));
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/categories/:id", async (req, res) => {
    try {
      const id = req.params.id;
      await deleteFirestoreDocument("categories", id);
      if (isMongoConnected()) {
        try {
          await (CategoryModel as any).findByIdAndDelete(id);
        } catch (e) {}
      }
      res.json({ success: true, id });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/categories", async (req, res) => {
    try {
      const id = req.body.id || `cat_${Date.now()}`;
      await setFirestoreDocument("categories", id, { ...req.body, id });
      if (isMongoConnected()) {
        try {
          const cat = new (CategoryModel as any)({ ...req.body, _id: id });
          await cat.save();
        } catch (e) {}
      }
      res.status(201).json({ ...req.body, id });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Company Pages API
  app.get("/api/company-pages", async (req, res) => {
    try {
      const pages = await getFirestoreCollection("companyPages");
      if (pages && pages.length > 0) return res.json(pages);
      if (isMongoConnected()) {
        const mPages = await (CompanyPageModel as any).find().lean().exec();
        if (mPages && mPages.length > 0) return res.json(mPages);
      }
      res.json(defaultCompanyPages);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.put("/api/company-pages/:id", async (req, res) => {
    try {
      const id = req.params.id;
      const updated = await setFirestoreDocument("companyPages", id, { ...req.body, id, updateTime: new Date().toISOString() });
      if (isMongoConnected()) {
        try {
          await (CompanyPageModel as any).findOneAndUpdate(
            { id },
            { ...req.body, updateTime: new Date().toISOString() },
            { upsert: true, new: true }
          ).lean().exec();
        } catch (e) {}
      }
      res.json(updated || { ...req.body, id });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Ad Banners API
  const defaultAdBanners = [
    {
      id: "ad-banner-1",
      imageUrl: "/banners/banner_spine_joint.svg",
      linkUrl: "/inquiry",
      type: "image"
    },
    {
      id: "ad-banner-2",
      imageUrl: "/banners/banner_health_checkup.svg",
      linkUrl: "/inquiry",
      type: "image"
    }
  ];

  app.get("/api/ad-banners", async (req, res) => {
    try {
      const banners = await getFirestoreCollection("adBanners");
      if (banners && banners.length > 0) return res.json(banners);
      res.json(defaultAdBanners);
    } catch (error: any) {
      res.json(defaultAdBanners);
    }
  });

  app.post("/api/ad-banners", async (req, res) => {
    try {
      const id = req.body.id || `ad_${Date.now()}`;
      await setFirestoreDocument("adBanners", id, { ...req.body, id, createdAt: new Date().toISOString() });
      res.status(201).json({ ...req.body, id });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/ad-banners/:id", async (req, res) => {
    try {
      const id = req.params.id;
      await deleteFirestoreDocument("adBanners", id);
      res.json({ success: true, id });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // SEO Settings API
  app.get("/api/seo", async (req, res) => {
    try {
      const seo = await getFirestoreDocument("settings", "seo");
      if (seo) return res.json(seo);
      if (isMongoConnected()) {
        let mSeo = await (SeoSettingsModel as any).findOne({ id: "seo" }).lean().exec();
        if (mSeo) return res.json(mSeo);
      }
      res.json({});
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/seo", async (req, res) => {
    try {
      const updated = await setFirestoreDocument("settings", "seo", { ...req.body, id: "seo" });
      if (isMongoConnected()) {
        try {
          await (SeoSettingsModel as any).findOneAndUpdate({ id: "seo" }, req.body, { upsert: true, new: true }).lean().exec();
        } catch (e) {}
      }
      res.json(updated || req.body);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // -------------------------------------------------------------
  // Helpers for SSR / Dynamic File Generation (Sitemap, RSS, SEO)
  // -------------------------------------------------------------

  const getSeoSettings = async () => {
    try {
      let seo = await getFirestoreDocument("settings", "seo");
      if (!seo && isMongoConnected()) {
        seo = await (SeoSettingsModel as any).findOne({ id: "seo" }).lean().exec();
      }
      if (seo) {
        const targetMainDesc = "정형외과 질환, 필수 건강검진, 산부인과 정보 등 일상생활에 꼭 필요한 최신 의학 뉴스와 알찬 정보를 누구나 알기 쉽게 전달합니다.";
        if (!seo.description || seo.description.includes('함께하세요') || seo.description.includes('매일 아침')) {
          seo.description = targetMainDesc;
        }
        if (!seo.ogDescription || seo.ogDescription.includes('함께하세요') || seo.ogDescription.includes('매일 아침')) {
          seo.ogDescription = targetMainDesc;
        }
        if (seo.googleAdsenseClient) {
          seo.googleAdsenseClient = "";
        }
        if (seo.adsTxt && (seo.adsTxt.includes('googlesyndication') || seo.adsTxt.includes('pagead2') || seo.adsTxt.includes('ca-pub-') || seo.adsTxt.includes('pub-'))) {
          seo.adsTxt = "";
        }
        return seo;
      }
    } catch (e) {
      console.error("Error fetching SEO settings:", e);
    }
    return null;
  };

  const defaultCategories = [
    { id: 'checkup', name: '건강검진' },
    { id: 'womens-health', name: '여성건강' },
    { id: 'oriental-med', name: '한의학' },
    { id: 'spine-joint', name: '척추관절' },
    { id: 'cardnews', name: '카드뉴스' }
  ];

  const defaultCompanyPages = [
    { id: 'about', title: '소개', content: '데일리펄스는 독자 여러분께 정확하고 유용한 보건의료 뉴스 및 일상 건강 지식을 제공합니다.' },
    { id: 'guidelines', title: '편집 가이드라인', content: '독립적이고 객관적인 시각에서 팩트에 기반한 저널리즘을 준수합니다.' },
    { id: 'careers', title: '채용 정보', content: '데일리펄스와 함께 새로운 저널리즘의 미래를 만들어갈 인재를 기다립니다.' },
    { id: 'privacy', title: '개인정보 처리방침 및 약관', content: '고객님의 개인정보 보호를 최우선으로 생각합니다.' },
  ];

  const getArticles = async () => {
    let list: any[] = [];
    try {
      const articles = await getFirestoreCollection("articles");
      if (articles && articles.length > 0) {
        list = articles
          .filter((a: any) => a && a.id && !a.id.startsWith("fb-") && a.id !== "1" && a.id !== "2" && a.id !== "3" && a.categoryId !== "opinion" && a.category !== "opinion");
      } else if (isMongoConnected()) {
        const mArticles = await (ArticleModel as any).find({ categoryId: { $ne: 'opinion' }, category: { $ne: 'opinion' } }).sort({ createdAt: -1 }).limit(300).lean().exec();
        if (mArticles && mArticles.length > 0) {
          list = mArticles.map((a: any) => ({
            ...a,
            id: a._id.toString()
          }));
        }
      }
    } catch (e) {
      console.error("Error fetching articles from DB:", e);
    }

    try {
      // Merge auto-published articles (up to 250 recent articles) so that all regional and medical topic articles are indexed
      const autoArticles = getPublishedAutoArticles(250);
      const existingIds = new Set(list.map((a) => a.id));
      for (const autoArt of autoArticles) {
        if (!existingIds.has(autoArt.id) && autoArt.categoryId !== 'opinion') {
          list.push(autoArt);
          existingIds.add(autoArt.id);
        }
      }
    } catch (e) {
      console.error("Error generating auto-articles for SSR/feeds:", e);
    }

    return list.sort((a: any, b: any) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
  };

  const getArticle = async (id: string) => {
    if (id && id.startsWith("auto-")) {
      try {
        const autoArt = getAutoArticleById(id);
        if (autoArt && autoArt.categoryId !== 'opinion') return autoArt;
      } catch (e) {}
    }
    try {
      const doc = await getFirestoreDocument("articles", id);
      if (doc && doc.categoryId !== 'opinion') return doc;
      if (isMongoConnected()) {
        const mArticle = await (ArticleModel as any).findById(id).lean().exec();
        if (mArticle && mArticle.categoryId !== 'opinion') {
          return {
            ...(mArticle as any),
            id: (mArticle as any)._id.toString()
          };
        }
      }
    } catch (e) {
      console.error("Error fetching single article for SEO:", e);
    }
    return null;
  };

  const getCompanyPages = async () => {
    try {
      const pages = await getFirestoreCollection("companyPages");
      if (pages && pages.length > 0) return pages;
      if (isMongoConnected()) {
        const mPages = await (CompanyPageModel as any).find().lean().exec();
        if (mPages && mPages.length > 0) return mPages as any[];
      }
    } catch (e) {
      console.error("Error fetching company pages:", e);
    }
    return defaultCompanyPages;
  };

  const getCategories = async () => {
    try {
      const categories = await getFirestoreCollection("categories");
      if (categories && categories.length > 0) return categories.filter((c: any) => c.id !== 'opinion');
      if (isMongoConnected()) {
        const mCategories = await (CategoryModel as any).find({ _id: { $ne: 'opinion' } }).lean().exec();
        if (mCategories && mCategories.length > 0) return (mCategories as any[]).filter((c: any) => c.id !== 'opinion');
      }
    } catch (e) {
      console.error("Error fetching categories:", e);
    }
    return defaultCategories.filter(c => c.id !== 'opinion');
  };

  const toRfc822 = (dateStr?: string) => {
    try {
      const d = dateStr ? new Date(dateStr) : new Date();
      if (isNaN(d.getTime())) return new Date().toUTCString();
      const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const kstTime = new Date(d.getTime() + (9 * 60 * 60 * 1000));
      return `${days[kstTime.getUTCDay()]}, ${String(kstTime.getUTCDate()).padStart(2, "0")} ${months[kstTime.getUTCMonth()]} ${kstTime.getUTCFullYear()} ${String(kstTime.getUTCHours()).padStart(2, "0")}:${String(kstTime.getUTCMinutes()).padStart(2, "0")}:${String(kstTime.getUTCSeconds()).padStart(2, "0")} +0900`;
    } catch {
      return new Date().toUTCString();
    }
  };

  // Static SEO verification routes
  app.get("/google:id.html", (req, res) => {
    res.type("text/html").send(`google-site-verification: google${req.params.id}.html`);
  });

  app.get("/naver:id.html", (req, res) => {
    res.type("text/html").send(`naver-site-verification: naver${req.params.id}.html`);
  });

  const DEFAULT_SITE_DOMAIN = "https://the-dailypulse.netlify.app";

  app.get("/robots.txt", async (req, res) => {
    const seo = await getSeoSettings();
    let robotsContent = (seo && seo.robotsTxt) ? seo.robotsTxt : "User-agent: *\nAllow: /";
    if (!robotsContent.toLowerCase().includes("sitemap:")) {
      robotsContent += `\n\nSitemap: ${DEFAULT_SITE_DOMAIN}/sitemap.xml`;
    }
    if (!robotsContent.toLowerCase().includes("rss:")) {
      robotsContent += `\nRSS: ${DEFAULT_SITE_DOMAIN}/rss.xml`;
    }
    res.type("text/plain").send(robotsContent);
  });

  app.get("/sitemap.xml", async (req, res) => {
    const hostUrl = DEFAULT_SITE_DOMAIN;
    const seo = await getSeoSettings();

    if (seo && seo.sitemapXml && seo.sitemapXml.trim().startsWith("<")) {
      res.type("application/xml; charset=utf-8").send(seo.sitemapXml);
    } else {
      try {
        const articles = await getArticles();
        const companyPages = await getCompanyPages();
        const categories = await getCategories();
        const nowStr = new Date().toISOString().split("T")[0];

        let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
        xml += `  <url><loc>${hostUrl}/</loc><lastmod>${nowStr}</lastmod><changefreq>always</changefreq><priority>1.0</priority></url>\n`;

        for (const cat of categories) {
          xml += `  <url><loc>${hostUrl}/category/${cat.id}</loc><lastmod>${nowStr}</lastmod><changefreq>daily</changefreq><priority>0.85</priority></url>\n`;
        }
        for (const article of articles) {
          const lastmod = article.createdAt ? article.createdAt.split("T")[0] : nowStr;
          xml += `  <url><loc>${hostUrl}/article/${article.id}</loc><lastmod>${lastmod}</lastmod><changefreq>weekly</changefreq><priority>0.8</priority></url>\n`;
        }
        for (const page of companyPages) {
          const lastmod = page.updateTime ? page.updateTime.split("T")[0] : nowStr;
          xml += `  <url><loc>${hostUrl}/info/${page.id}</loc><lastmod>${lastmod}</lastmod><changefreq>monthly</changefreq><priority>0.5</priority></url>\n`;
        }
        xml += `</urlset>`;
        res.type("application/xml; charset=utf-8").send(xml);
      } catch (e) {
        console.error("Error generating dynamic sitemap:", e);
        res.type("application/xml").status(500).send('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>');
      }
    }
  });

  app.get("/ads.txt", async (req, res) => {
    const seo = await getSeoSettings();
    res.type("text/plain");
    if (seo && seo.adsTxt && seo.adsTxt.trim()) {
      res.send(seo.adsTxt.trim());
    } else {
      res.send("# External programmatic ad networks are disabled.\n");
    }
  });

  const rssHandler = async (req: express.Request, res: express.Response) => {
    const hostUrl = DEFAULT_SITE_DOMAIN;
    const seo = await getSeoSettings();

    if (seo && seo.rssXml && seo.rssXml.trim().startsWith("<")) {
      res.type("application/xml; charset=utf-8").send(seo.rssXml);
    } else {
      try {
        const articles = await getArticles();
        const siteTitle = seo?.title || "더데일리펄스 | 의학 의료 뉴스 (DAILY PULSE)";
        const siteDesc = seo?.description || "정형외과 질환, 필수 건강검진, 산부인과 정보 등 일상생활에 꼭 필요한 최신 의학 뉴스와 알찬 정보를 누구나 알기 쉽게 전달합니다.";

        let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:atom="http://www.w3.org/2005/Atom">\n<channel>\n`;
        xml += `  <title><![CDATA[${siteTitle}]]></title>\n  <link>${hostUrl}</link>\n  <description><![CDATA[${siteDesc}]]></description>\n  <language>ko-kr</language>\n`;
        xml += `  <copyright><![CDATA[더데일리펄스 (DAILY PULSE). All rights reserved.]]></copyright>\n`;
        xml += `  <pubDate>${toRfc822()}</pubDate>\n  <lastBuildDate>${toRfc822()}</lastBuildDate>\n`;
        xml += `  <atom:link href="${hostUrl}/rss.xml" rel="self" type="application/rss+xml" />\n`;

        for (const article of articles) {
          const authorName = article.author || "더데일리펄스 의학전문팀";
          const rfcDate = toRfc822(article.createdAt);
          const articleUrl = `${hostUrl}/article/${article.id}`;
          const cleanDesc = (article.excerpt || article.content || "")
            .replace(/<\/?[^>]+(>|$)/g, "")
            .replace(/\s+/g, " ")
            .trim()
            .substring(0, 350);

          xml += `  <item>\n`;
          xml += `    <title><![CDATA[${article.title}]]></title>\n`;
          xml += `    <link>${articleUrl}</link>\n`;
          xml += `    <description><![CDATA[${cleanDesc}]]></description>\n`;
          if (article.categoryId) {
            xml += `    <category><![CDATA[${article.categoryId}]]></category>\n`;
          }
          xml += `    <dc:creator><![CDATA[${authorName}]]></dc:creator>\n`;
          xml += `    <pubDate>${rfcDate}</pubDate>\n`;
          xml += `    <guid isPermaLink="true">${articleUrl}</guid>\n`;
          xml += `  </item>\n`;
        }
        xml += `</channel>\n</rss>`;
        res.type("application/xml; charset=utf-8").send(xml);
      } catch (e) {
        console.error("Error generating dynamic RSS:", e);
        res.type("application/xml").status(500).send('<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>더데일리펄스 | 의학 의료 뉴스 (DAILY PULSE)</title></channel></rss>');
      }
    }
  };

  app.get("/rss.xml", rssHandler);
  app.get("/rss", rssHandler);
  app.get("/feed", rssHandler);

  app.get("/google:code.html", (req, res) => {
    const filename = req.path.replace(/^\//, "");
    res.type("text/html; charset=utf-8").send(`google-site-verification: ${filename}`);
  });

  app.get("/naver:code.html", (req, res) => {
    const filename = req.path.replace(/^\//, "");
    res.type("text/html; charset=utf-8").send(`naver-site-verification: ${filename}`);
  });

  let vite: any;
  if (!isProd) {
    const { createServer: createViteServer } = await import("vite");
    vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "custom",
    });
    app.use((req, res, next) => {
      vite.middlewares.handle(req, res, next);
    });
  } else {
    const distPath = currentDir;
    app.use(express.static(distPath, { index: false }));
  }

  // Handle HTML rendering and inject rich SEO & SSR pre-rendering
  const handleHtml = async (req: express.Request, res: express.Response) => {
    try {
      let template = fs.readFileSync(path.join(currentDir, "index.html"), "utf-8");
      if (!isProd && vite) {
        template = await vite.transformIndexHtml(req.url, template);
      }
      template = template.replace('<html lang="en">', '<html lang="ko">');

      const protocol = req.headers["x-forwarded-proto"] || req.protocol;
      const host = req.get("host");
      const hostUrl = `${protocol}://${host}`;
      const canonicalUrl = `${hostUrl}${req.path.split('?')[0]}`;
      const seo = await getSeoSettings();
      const siteTitle = seo?.title || "더데일리펄스 | 의학 의료 뉴스 (DAILY PULSE)";
      const siteDesc = (seo?.description || "정형외과 질환, 필수 건강검진, 산부인과 정보 등 일상생활에 꼭 필요한 최신 의학 뉴스와 알찬 정보를 누구나 알기 쉽게 전달합니다.").replace(/\s+/g, ' ').trim();

      const allCategories = await getCategories();
      const allArticles = await getArticles();
      const companyPages = await getCompanyPages();

      let customTitle = "";
      let customDesc = "";
      let customKeywords = "";
      let customOgImage = seo?.ogImage || "";
      let ogType = "website";
      let jsonLdList: any[] = [];
      let bodyHtml = "";

      const navHtml = `
        <header style="border-bottom: 1px solid #e2e8f0; background: #ffffff; padding: 14px 20px; position: sticky; top: 0; z-index: 50;">
          <div style="max-width: 1200px; margin: 0 auto; display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 15px;">
            <div>
              <a href="/" style="font-size: 22px; font-weight: 900; color: #059669; text-decoration: none; letter-spacing: -0.5px;">더데일리펄스 <span style="font-size: 14px; font-weight: 700; color: #64748b;">(DAILY PULSE)</span></a>
              <div style="font-size: 11px; color: #94a3b8; margin-top: 2px;">의학 의료 전문 뉴스 미디어</div>
            </div>
            <nav style="display: flex; flex-wrap: wrap; gap: 16px; font-size: 15px; font-weight: 600;">
              <a href="/" style="color: #0f172a; text-decoration: none;">홈</a>
              ${allCategories.map(c => `<a href="/category/${c.id}" style="color: #334155; text-decoration: none;">${c.name}</a>`).join("\n              ")}
            </nav>
          </div>
        </header>
      `;

      const footerHtml = `
        <footer style="background: #0f172a; color: #94a3b8; padding: 45px 20px; margin-top: 60px; font-size: 14px;">
          <div style="max-width: 1200px; margin: 0 auto; display: flex; flex-wrap: wrap; justify-content: space-between; gap: 30px;">
            <div style="max-width: 550px;">
              <p style="font-size: 18px; font-weight: bold; color: #ffffff; margin-bottom: 8px;">더데일리펄스 (DAILY PULSE)</p>
              <p style="font-size: 13px; color: #34d399; margin-bottom: 12px; font-weight: 600;">신뢰할 수 있는 보건의료·의학 전문 저널리즘</p>
              <p style="margin: 0; line-height: 1.6;">${siteDesc}</p>
            </div>
            <div>
              <p style="font-size: 14px; font-weight: bold; color: #ffffff; margin-bottom: 12px;">관련 문서 및 회사 정보</p>
              <div style="display: flex; flex-direction: column; gap: 8px;">
                ${companyPages.map(p => `<a href="/info/${p.id}" style="color: #cbd5e1; text-decoration: none;">• ${p.title}</a>`).join("\n                ")}
                <a href="/sitemap.xml" style="color: #94a3b8; text-decoration: none; font-size: 13px;">• 사이트맵 (Sitemap)</a>
                <a href="/rss.xml" style="color: #94a3b8; text-decoration: none; font-size: 13px;">• RSS 피드 (Naver/Google)</a>
              </div>
            </div>
          </div>
          <div style="max-width: 1200px; margin: 25px auto 0; padding-top: 20px; border-top: 1px solid #1e293b; text-align: center; font-size: 13px;">
            <p style="margin: 0;">© ${new Date().getFullYear()} 더데일리펄스 (DAILY PULSE). All rights reserved. 대한민국 보건의료 뉴스</p>
          </div>
        </footer>
      `;

      const articleMatch = req.path.match(/^\/article\/([^/]+)/);
      const categoryMatch = req.path.match(/^\/category\/([^/]+)/);
      const infoMatch = req.path.match(/^\/info\/([^/]+)/);

      if (articleMatch) {
        // --- Single Article Page ---
        const articleId = articleMatch[1];
        const article: any = await getArticle(articleId);
        if (article) {
          ogType = "article";
          const catObj = allCategories.find(c => c.id === article.categoryId);
          const catName = catObj ? catObj.name : (article.category || article.categoryId || "건강뉴스");

          customTitle = `${article.title} - 더데일리펄스 | 의학 의료 뉴스 (DAILY PULSE)`;
          customDesc = (article.excerpt || article.content || "").replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').substring(0, 160).trim();
          
          const tagsStr = Array.isArray(article.tags) ? article.tags.join(', ') : '';
          customKeywords = `${tagsStr ? tagsStr + ', ' : ''}${catName}, ${article.title}, 더데일리펄스, 데일리펄스, DAILY PULSE, Daily Pulse, 의학 의료 뉴스, 보건의료`;
          customOgImage = article.imageUrl || (article.cardNewsImages && article.cardNewsImages[0]) || customOgImage;

          jsonLdList.push({
            "@context": "https://schema.org",
            "@type": "NewsArticle",
            "mainEntityOfPage": {
              "@type": "WebPage",
              "@id": canonicalUrl
            },
            "headline": article.title,
            "description": customDesc,
            "image": customOgImage ? [customOgImage] : undefined,
            "datePublished": article.createdAt || new Date().toISOString(),
            "dateModified": article.updatedAt || article.createdAt || new Date().toISOString(),
            "author": [{
              "@type": "Person",
              "name": article.author || "더데일리펄스 의학전문팀"
            }],
            "publisher": {
              "@type": "NewsMediaOrganization",
              "name": "더데일리펄스 (DAILY PULSE)",
              "alternateName": "DAILY PULSE",
              "url": hostUrl,
              "logo": {
                "@type": "ImageObject",
                "url": `${hostUrl}/favicon.ico`
              }
            }
          });

          // Medical WebPage schema for search bots
          jsonLdList.push({
            "@context": "https://schema.org",
            "@type": "MedicalWebPage",
            "url": canonicalUrl,
            "name": article.title,
            "description": customDesc,
            "inLanguage": "ko-KR",
            "about": {
              "@type": "MedicalCondition",
              "name": catName
            }
          });

          jsonLdList.push({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
              { "@type": "ListItem", "position": 1, "name": "더데일리펄스", "item": hostUrl },
              { "@type": "ListItem", "position": 2, "name": catName, "item": `${hostUrl}/category/${article.categoryId}` },
              { "@type": "ListItem", "position": 3, "name": article.title, "item": canonicalUrl }
            ]
          });

          bodyHtml = `
            ${navHtml}
            <main style="max-width: 860px; margin: 40px auto; padding: 0 20px; font-family: -apple-system, BlinkMacSystemFont, 'Malgun Gothic', '맑은 고딕', sans-serif;">
              <article>
                <header style="margin-bottom: 25px; border-bottom: 2px solid #f1f5f9; padding-bottom: 20px;">
                  <a href="/category/${article.categoryId}" style="display: inline-block; color: #059669; font-weight: 700; font-size: 15px; text-decoration: none; margin-bottom: 10px;">• ${catName} 전문 리포트</a>
                  <h1 style="font-size: 28px; font-weight: 800; color: #0f172a; line-height: 1.35; margin: 8px 0 16px;">${article.title}</h1>
                  <div style="font-size: 14px; color: #64748b; display: flex; flex-wrap: wrap; gap: 15px;">
                    <span>작성: <strong>${article.author || "더데일리펄스 의학전문팀"}</strong></span>
                    <span>발행일: ${article.createdAt ? new Date(article.createdAt).toLocaleDateString('ko-KR') : ""}</span>
                    ${article.doctorName ? `<span>자문: <strong>${article.doctorName} 전문의 (${article.hospitalName || ''})</strong></span>` : ''}
                  </div>
                  ${article.tags && article.tags.length > 0 ? `
                    <div style="margin-top: 14px; display: flex; flex-wrap: wrap; gap: 6px;">
                      ${article.tags.map((t: string) => `<span style="background: #f1f5f9; color: #475569; padding: 3px 8px; border-radius: 4px; font-size: 12px;">#${t}</span>`).join(' ')}
                    </div>
                  ` : ''}
                </header>
                ${article.imageUrl ? `<div style="margin: 25px 0;"><img src="${article.imageUrl}" alt="${article.title}" style="width: 100%; max-height: 500px; object-fit: cover; border-radius: 12px;" /></div>` : ""}
                <div style="font-size: 17px; line-height: 1.85; color: #334155; margin-top: 25px; white-space: pre-line;">
                  ${article.content || article.excerpt || ""}
                </div>
              </article>
            </main>
            ${footerHtml}
          `;
        }
      } else if (categoryMatch) {
        // --- Category Listing Page ---
        const catId = categoryMatch[1];
        const catObj = allCategories.find(c => c.id === catId);
        const catName = catObj ? catObj.name : catId;
        const catArticles = allArticles.filter(a => a.categoryId === catId);

        customTitle = `${catName} 뉴스 및 지역 임상 치료 사례 - 더데일리펄스 | 의학 의료 뉴스`;
        customDesc = `더데일리펄스 ${catName} 섹션입니다. ${catName} 관련 최신 보건의료 뉴스, 지역별 실제 환자 임상 치료 사례 및 전문의 칼럼을 전달합니다.`;
        customKeywords = `${catName}, ${catName} 치료, ${catName} 증상, ${catName} 병원, 보건의료, 의학뉴스, 더데일리펄스, 데일리펄스, DAILY PULSE`;

        jsonLdList.push({
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          "name": `${catName} 뉴스`,
          "description": customDesc,
          "url": canonicalUrl,
          "inLanguage": "ko-KR",
          "isPartOf": {
            "@type": "WebSite",
            "name": "더데일리펄스 (DAILY PULSE)",
            "url": hostUrl
          }
        });

        jsonLdList.push({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "더데일리펄스", "item": hostUrl },
            { "@type": "ListItem", "position": 2, "name": catName, "item": canonicalUrl }
          ]
        });

        if (catArticles.length > 0) {
          jsonLdList.push({
            "@context": "https://schema.org",
            "@type": "ItemList",
            "itemListElement": catArticles.slice(0, 15).map((art, idx) => ({
              "@type": "ListItem",
              "position": idx + 1,
              "url": `${hostUrl}/article/${art.id}`,
              "name": art.title
            }))
          });
        }

        bodyHtml = `
          ${navHtml}
          <main style="max-width: 1200px; margin: 40px auto; padding: 0 20px; font-family: -apple-system, BlinkMacSystemFont, 'Malgun Gothic', '맑은 고딕', sans-serif;">
            <div style="border-bottom: 2px solid #059669; padding-bottom: 15px; margin-bottom: 30px;">
              <h1 style="font-size: 28px; font-weight: 800; color: #0f172a; margin: 0;">${catName} 전문 리포트 및 지역 임상 사례</h1>
              <p style="font-size: 15px; color: #64748b; margin: 8px 0 0;">${catName} 관련 최신 의학 지견, 지역별 환자 치료 경과 및 전문의 가이드를 제공합니다.</p>
            </div>
            <section style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 24px;">
              ${catArticles.slice(0, 30).map(art => `
                <article style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; display: flex; flex-direction: column;">
                  ${art.imageUrl ? `<a href="/article/${art.id}"><img src="${art.imageUrl}" alt="${art.title}" style="width: 100%; height: 190px; object-fit: cover;" /></a>` : ""}
                  <div style="padding: 18px; flex: 1; display: flex; flex-direction: column; justify-content: space-between;">
                    <div>
                      <h2 style="font-size: 18px; font-weight: 700; color: #0f172a; margin: 0 0 10px; line-height: 1.4;">
                        <a href="/article/${art.id}" style="color: inherit; text-decoration: none;">${art.title}</a>
                      </h2>
                      <p style="font-size: 14px; color: #64748b; margin: 0 0 15px; line-height: 1.6; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;">
                        ${art.excerpt || art.content || ""}
                      </p>
                    </div>
                    <div style="font-size: 13px; color: #94a3b8; display: flex; justify-content: space-between; border-top: 1px solid #f1f5f9; padding-top: 10px;">
                      <span>${art.author || "더데일리펄스 의학전문팀"}</span>
                      <span>${art.createdAt ? new Date(art.createdAt).toLocaleDateString('ko-KR') : ""}</span>
                    </div>
                  </div>
                </article>
              `).join("\n              ")}
            </section>
          </main>
          ${footerHtml}
        `;
      } else if (infoMatch) {
        // --- Info / Company Page ---
        const pageId = infoMatch[1];
        const page = companyPages.find(p => p.id === pageId);
        if (page) {
          customTitle = `${page.title} - 더데일리펄스 | 의학 의료 뉴스 (DAILY PULSE)`;
          customDesc = (page.content || "").replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').substring(0, 160).trim();

          jsonLdList.push({
            "@context": "https://schema.org",
            "@type": "AboutPage",
            "name": page.title,
            "description": customDesc,
            "url": canonicalUrl
          });

          bodyHtml = `
            ${navHtml}
            <main style="max-width: 800px; margin: 40px auto; padding: 0 20px; font-family: -apple-system, BlinkMacSystemFont, 'Malgun Gothic', '맑은 고딕', sans-serif;">
              <h1 style="font-size: 28px; font-weight: 800; color: #0f172a; border-bottom: 2px solid #059669; padding-bottom: 12px; margin-bottom: 24px;">${page.title}</h1>
              <div style="font-size: 16px; line-height: 1.8; color: #334155; white-space: pre-line;">
                ${page.content || ""}
              </div>
            </main>
            ${footerHtml}
          `;
        }
      } else {
        // --- Home Page ---
        customTitle = siteTitle;
        customDesc = siteDesc;
        customKeywords = "더데일리펄스, 데일리펄스, DAILY PULSE, Daily Pulse, The Daily Pulse, 의학 의료 뉴스, 보건의료, 건강검진, 여성건강, 척추관절, 한의학, 전문의 칼럼, 지역별 진료 사례, 질환별 치료 가이드";

        jsonLdList.push({
          "@context": "https://schema.org",
          "@type": "WebSite",
          "name": "더데일리펄스 | 의학 의료 뉴스",
          "alternateName": [
            "더데일리펄스",
            "데일리펄스",
            "DAILY PULSE",
            "Daily Pulse",
            "The Daily Pulse",
            "더데일리펄스 의학 의료 뉴스"
          ],
          "url": hostUrl,
          "description": siteDesc,
          "potentialAction": {
            "@type": "SearchAction",
            "target": `${hostUrl}/search?q={search_term_string}`,
            "query-input": "required name=search_term_string"
          }
        });

        jsonLdList.push({
          "@context": "https://schema.org",
          "@type": "NewsMediaOrganization",
          "name": "더데일리펄스 (DAILY PULSE)",
          "alternateName": "DAILY PULSE",
          "url": hostUrl,
          "logo": `${hostUrl}/favicon.ico`,
          "description": siteDesc
        });

        // Navigation elements for Naver & Google Sitelinks
        jsonLdList.push({
          "@context": "https://schema.org",
          "@type": "ItemList",
          "name": "더데일리펄스 주요 카테고리 및 관련 문서",
          "itemListElement": [
            ...allCategories.map((cat, idx) => ({
              "@type": "SiteNavigationElement",
              "position": idx + 1,
              "name": cat.name,
              "description": `${cat.name} 관련 최신 의학 뉴스와 지역별 임상 사례`,
              "url": `${hostUrl}/category/${cat.id}`
            })),
            ...companyPages.map((page, idx) => ({
              "@type": "SiteNavigationElement",
              "position": allCategories.length + idx + 1,
              "name": page.title,
              "description": `더데일리펄스 ${page.title}`,
              "url": `${hostUrl}/info/${page.id}`
            }))
          ]
        });

        if (allArticles.length > 0) {
          jsonLdList.push({
            "@context": "https://schema.org",
            "@type": "ItemList",
            "name": "더데일리펄스 최신 등록 기사 및 관련 문서 목록",
            "itemListElement": allArticles.slice(0, 20).map((art, idx) => ({
              "@type": "ListItem",
              "position": idx + 1,
              "url": `${hostUrl}/article/${art.id}`,
              "name": art.title
            }))
          });
        }

        const topArticles = allArticles.slice(0, 16);
        const heroArticle = topArticles[0];

        bodyHtml = `
          ${navHtml}
          <main style="max-width: 1200px; margin: 30px auto; padding: 0 20px; font-family: -apple-system, BlinkMacSystemFont, 'Malgun Gothic', '맑은 고딕', sans-serif;">
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px 24px; margin-bottom: 30px;">
              <h2 style="font-size: 20px; font-weight: 800; color: #0f172a; margin: 0 0 6px;">더데일리펄스 (DAILY PULSE) | 신뢰할 수 있는 보건의료·의학 뉴스</h2>
              <p style="font-size: 14px; color: #475569; margin: 0; line-height: 1.6;">${siteDesc}</p>
            </div>

            ${heroArticle ? `
              <section style="margin-bottom: 40px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden;">
                <div style="display: flex; flex-direction: column; md:flex-row; gap: 20px;">
                  ${heroArticle.imageUrl ? `<a href="/article/${heroArticle.id}"><img src="${heroArticle.imageUrl}" alt="${heroArticle.title}" style="width: 100%; max-height: 400px; object-fit: cover;" /></a>` : ""}
                  <div style="padding: 24px;">
                    <span style="color: #059669; font-weight: 700; font-size: 14px;">🔥 오늘의 핵심 헤드라인</span>
                    <h1 style="font-size: 26px; font-weight: 800; color: #0f172a; margin: 10px 0 14px; line-height: 1.4;">
                      <a href="/article/${heroArticle.id}" style="color: inherit; text-decoration: none;">${heroArticle.title}</a>
                    </h1>
                    <p style="font-size: 16px; color: #475569; line-height: 1.6; margin-bottom: 16px;">${heroArticle.excerpt || heroArticle.content || ""}</p>
                    <div style="font-size: 14px; color: #94a3b8;">${heroArticle.author || "더데일리펄스 의학전문팀"} · ${heroArticle.createdAt ? new Date(heroArticle.createdAt).toLocaleDateString('ko-KR') : ""}</div>
                  </div>
                </div>
              </section>
            ` : ""}

            <section style="margin-bottom: 40px;">
              <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 20px; border-bottom: 2px solid #059669; padding-bottom: 10px;">
                <h2 style="font-size: 22px; font-weight: 800; color: #0f172a; margin: 0;">📍 지역 임상 사례 및 최신 질환별 치료 리포트</h2>
                <span style="font-size: 13px; color: #64748b;">서울·수도권 및 전국 주요 거점 환자 치료 사례</span>
              </div>
              <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px;">
                ${topArticles.slice(1).map(art => `
                  <article style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; display: flex; flex-direction: column;">
                    ${art.imageUrl ? `<a href="/article/${art.id}"><img src="${art.imageUrl}" alt="${art.title}" style="width: 100%; height: 160px; object-fit: cover;" /></a>` : ""}
                    <div style="padding: 16px; flex: 1; display: flex; flex-direction: column; justify-content: space-between;">
                      <div>
                        <h3 style="font-size: 16px; font-weight: 700; color: #0f172a; margin: 0 0 8px; line-height: 1.4;">
                          <a href="/article/${art.id}" style="color: inherit; text-decoration: none;">${art.title}</a>
                        </h3>
                        <p style="font-size: 13px; color: #64748b; margin: 0 0 12px; line-height: 1.5; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
                          ${art.excerpt || art.content || ""}
                        </p>
                      </div>
                      <div style="font-size: 12px; color: #94a3b8; border-top: 1px solid #f8fafc; padding-top: 8px; display: flex; justify-content: space-between;">
                        <span>${art.author || "더데일리펄스"}</span>
                        <span>${art.createdAt ? new Date(art.createdAt).toLocaleDateString('ko-KR') : ""}</span>
                      </div>
                    </div>
                  </article>
                `).join("\n                ")}
              </div>
            </section>

            <section style="margin-bottom: 40px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px;">
              <h2 style="font-size: 20px; font-weight: 800; color: #0f172a; margin: 0 0 16px; border-left: 4px solid #059669; padding-left: 10px;">📚 카테고리별 관련 의학 문서 & 전문 가이드</h2>
              <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 16px;">
                ${allCategories.map(cat => {
                  const catCount = allArticles.filter(a => a.categoryId === cat.id).length;
                  return `
                    <div style="border: 1px solid #f1f5f9; border-radius: 8px; padding: 14px; background: #fafafa;">
                      <h4 style="margin: 0 0 6px; font-size: 16px;"><a href="/category/${cat.id}" style="color: #059669; text-decoration: none; font-weight: 700;">${cat.name} (${catCount}편)</a></h4>
                      <p style="margin: 0; font-size: 13px; color: #64748b;">${cat.name} 관련 최신 의학 소식과 임상 치료 사례를 확인하세요.</p>
                    </div>
                  `;
                }).join("\n                ")}
              </div>
            </section>
          </main>
          ${footerHtml}
        `;
      }

      const finalTitle = customTitle || siteTitle;
      const finalDesc = customDesc || siteDesc;
      const finalOgImage = customOgImage || `${hostUrl}/og-image.jpg`;

      // 1. Update Title
      template = template.replace(/<title>.*?<\/title>/i, `<title>${finalTitle}</title>`);

      // 2. Update Meta Description
      if (/<meta name="description"/i.test(template)) {
        template = template.replace(/<meta name="description" content=".*?"\s*\/?>/i, `<meta name="description" content="${finalDesc}" />`);
      } else {
        template = template.replace('</head>', `\n    <meta name="description" content="${finalDesc}" />\n  </head>`);
      }

      // 3. Inject Canonical URL & Robots Meta Tags
      const metaTagsToInject = `
    <link rel="canonical" href="${canonicalUrl}" />
    <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
    ${customKeywords ? `<meta name="keywords" content="${customKeywords}" />` : ''}
    <meta property="og:type" content="${ogType}" />
    <meta property="og:site_name" content="더데일리펄스 (DAILY PULSE)" />
    <meta property="og:title" content="${finalTitle}" />
    <meta property="og:description" content="${finalDesc}" />
    <meta property="og:url" content="${canonicalUrl}" />
    <meta property="og:image" content="${finalOgImage}" />
    <meta property="og:locale" content="ko_KR" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${finalTitle}" />
    <meta name="twitter:description" content="${finalDesc}" />
    <meta name="twitter:image" content="${finalOgImage}" />
      `.trim();

      template = template.replace('</head>', `\n    ${metaTagsToInject}\n  </head>`);

      // 4. Google Site Verification
      const googleVerification = seo?.googleSiteVerification || "57akzenSl71_GebyFfSJXrpeazAyphH49PDhUGOWR68";
      if (googleVerification) {
        if (/<meta name="google-site-verification"/i.test(template)) {
          template = template.replace(/<meta name="google-site-verification" content=".*?"\s*\/?>/i, `<meta name="google-site-verification" content="${googleVerification}" />`);
        } else {
          template = template.replace('</head>', `\n    <meta name="google-site-verification" content="${googleVerification}" />\n  </head>`);
        }
      }

      // 5. Naver Site Verification
      if (seo?.naverSiteVerification) {
        if (/<meta name="naver-site-verification"/i.test(template)) {
          template = template.replace(/<meta name="naver-site-verification" content=".*?"\s*\/?>/i, `<meta name="naver-site-verification" content="${seo.naverSiteVerification}" />`);
        } else {
          template = template.replace('</head>', `\n    <meta name="naver-site-verification" content="${seo.naverSiteVerification}" />\n  </head>`);
        }
      }

      // 6. JSON-LD Structured Data
      if (jsonLdList.length > 0) {
        const jsonLdHtml = jsonLdList.map(item => `\n    <script type="application/ld+json">\n${JSON.stringify(item, null, 2)}\n    </script>`).join("\n");
        template = template.replace('</head>', `${jsonLdHtml}\n  </head>`);
      }

      // 7. Custom Head Tags
      if (seo?.customHeadTags) {
        template = template.replace('</head>', `\n    ${seo.customHeadTags}\n  </head>`);
      }

      // 8. Pre-rendered HTML Body for Googlebot
      if (bodyHtml) {
        template = template.replace('<div id="root"></div>', `<div id="root">${bodyHtml}</div>`);
      }

      res.status(200).set({ 'Content-Type': 'text/html; charset=utf-8' }).end(template);
    } catch (e: any) {
      if (vite) vite.ssrFixStacktrace(e);
      console.error("HTML rendering error:", e);
      res.status(500).end(e.message);
    }
  };

  app.get("*", handleHtml);

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
