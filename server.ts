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
} from "./src/server/firestoreRest";

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
        firestoreArticles.sort((a: any, b: any) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
        return res.json(firestoreArticles);
      }
      if (isMongoConnected()) {
        const articles = await (ArticleModel as any).find().sort({ createdAt: -1 }).lean().exec();
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
      if (cats && cats.length > 0) return res.json(cats);
      if (isMongoConnected()) {
        const categories = await (CategoryModel as any).find().lean().exec();
        if (categories && categories.length > 0) return res.json(categories);
      }
      res.json(defaultCategories);
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
      const seo = await getFirestoreDocument("settings", "seo");
      if (seo) return seo;
      if (isMongoConnected()) {
        const mSeo = await (SeoSettingsModel as any).findOne({ id: "seo" }).lean().exec();
        if (mSeo) return mSeo as any;
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
    { id: 'cardnews', name: '카드뉴스' },
    { id: 'opinion', name: '오피니언' }
  ];

  const defaultCompanyPages = [
    { id: 'about', title: '소개', content: '데일리펄스는 독자 여러분께 정확하고 유용한 보건의료 뉴스 및 일상 건강 지식을 제공합니다.' },
    { id: 'guidelines', title: '편집 가이드라인', content: '독립적이고 객관적인 시각에서 팩트에 기반한 저널리즘을 준수합니다.' },
    { id: 'careers', title: '채용 정보', content: '데일리펄스와 함께 새로운 저널리즘의 미래를 만들어갈 인재를 기다립니다.' },
    { id: 'privacy', title: '개인정보 처리방침 및 약관', content: '고객님의 개인정보 보호를 최우선으로 생각합니다.' },
  ];

  const getArticles = async () => {
    try {
      const articles = await getFirestoreCollection("articles");
      if (articles && articles.length > 0) {
        return articles
          .filter((a: any) => a && a.id && !a.id.startsWith("fb-") && a.id !== "1" && a.id !== "2" && a.id !== "3")
          .sort((a: any, b: any) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
      }
      if (isMongoConnected()) {
        const mArticles = await (ArticleModel as any).find().sort({ createdAt: -1 }).limit(300).lean().exec();
        if (mArticles && mArticles.length > 0) {
          return mArticles.map((a: any) => ({
            ...a,
            id: a._id.toString()
          }));
        }
      }
    } catch (e) {
      console.error("Error fetching articles for SSR/XML:", e);
    }
    return [];
  };

  const getArticle = async (id: string) => {
    try {
      const doc = await getFirestoreDocument("articles", id);
      if (doc) return doc;
      if (isMongoConnected()) {
        const mArticle = await (ArticleModel as any).findById(id).lean().exec();
        if (mArticle) {
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
      if (categories && categories.length > 0) return categories;
      if (isMongoConnected()) {
        const mCategories = await (CategoryModel as any).find().lean().exec();
        if (mCategories && mCategories.length > 0) return mCategories as any[];
      }
    } catch (e) {
      console.error("Error fetching categories:", e);
    }
    return defaultCategories;
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

  app.get("/robots.txt", async (req, res) => {
    const seo = await getSeoSettings();
    const protocol = req.headers["x-forwarded-proto"] || req.protocol;
    const host = req.get("host");
    const hostUrl = `${protocol}://${host}`;
    let robotsContent = (seo && seo.robotsTxt) ? seo.robotsTxt : "User-agent: *\nAllow: /";
    if (!robotsContent.toLowerCase().includes("sitemap:")) {
      robotsContent += `\n\nSitemap: ${hostUrl}/sitemap.xml`;
    }
    res.type("text/plain").send(robotsContent);
  });

  app.get("/sitemap.xml", async (req, res) => {
    const protocol = req.headers["x-forwarded-proto"] || req.protocol;
    const host = req.get("host");
    const hostUrl = `${protocol}://${host}`;
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

        for (const article of articles) {
          const lastmod = article.createdAt ? article.createdAt.split("T")[0] : nowStr;
          xml += `  <url><loc>${hostUrl}/article/${article.id}</loc><lastmod>${lastmod}</lastmod><changefreq>weekly</changefreq><priority>0.8</priority></url>\n`;
        }
        for (const page of companyPages) {
          const lastmod = page.updateTime ? page.updateTime.split("T")[0] : nowStr;
          xml += `  <url><loc>${hostUrl}/info/${page.id}</loc><lastmod>${lastmod}</lastmod><changefreq>monthly</changefreq><priority>0.5</priority></url>\n`;
        }
        for (const cat of categories) {
          xml += `  <url><loc>${hostUrl}/category/${cat.id}</loc><lastmod>${nowStr}</lastmod><changefreq>weekly</changefreq><priority>0.6</priority></url>\n`;
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
    } else if (seo && seo.googleAdsenseClient) {
      let client = seo.googleAdsenseClient.trim();
      if (!client.startsWith("pub-") && client.startsWith("ca-pub-")) {
        client = client.replace("ca-pub-", "pub-");
      } else if (!client.startsWith("pub-")) {
        client = `pub-${client}`;
      }
      res.send(`google.com, ${client}, DIRECT, f08c47fec0942fa0`);
    } else {
      res.send("google.com, pub-6799823492487492, DIRECT, f08c47fec0942fa0");
    }
  });

  app.get("/rss.xml", async (req, res) => {
    const protocol = req.headers["x-forwarded-proto"] || req.protocol;
    const host = req.get("host");
    const hostUrl = `${protocol}://${host}`;
    const seo = await getSeoSettings();

    if (seo && seo.rssXml && seo.rssXml.trim().startsWith("<")) {
      res.type("application/xml; charset=utf-8").send(seo.rssXml);
    } else {
      try {
        const articles = await getArticles();
        const siteTitle = seo?.title || "DAILY PULSE | 신뢰할 수 있는 뉴스";
        const siteDesc = seo?.description || "우리 가족의 건강을 위한 가장 확실한 맥박, 건강 전문 미디어 데일리펄스입니다.";

        let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:atom="http://www.w3.org/2005/Atom">\n<channel>\n`;
        xml += `  <title><![CDATA[${siteTitle}]]></title>\n<link>${hostUrl}</link>\n<description><![CDATA[${siteDesc}]]></description>\n<language>ko-kr</language>\n`;
        xml += `  <pubDate>${toRfc822()}</pubDate>\n<lastBuildDate>${toRfc822()}</lastBuildDate>\n`;
        xml += `  <atom:link href="${hostUrl}/rss.xml" rel="self" type="application/rss+xml" />\n`;

        for (const article of articles) {
          const authorName = article.author || "데일리펄스";
          const rfcDate = toRfc822(article.createdAt);
          const articleUrl = `${hostUrl}/article/${article.id}`;
          const cleanDesc = (article.excerpt || article.content || "").replace(/<\/?[^>]+(>|$)/g, "").replace(/\s+/g, " ").trim().substring(0, 300);

          xml += `  <item>\n    <title><![CDATA[${article.title}]]></title>\n    <link>${articleUrl}</link>\n    <description><![CDATA[${cleanDesc}]]></description>\n    <dc:creator><![CDATA[${authorName}]]></dc:creator>\n    <pubDate>${rfcDate}</pubDate>\n    <guid isPermaLink="true">${articleUrl}</guid>\n  </item>\n`;
        }
        xml += `</channel>\n</rss>`;
        res.type("application/xml; charset=utf-8").send(xml);
      } catch (e) {
        console.error("Error generating dynamic RSS:", e);
        res.type("application/xml").status(500).send('<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>DAILY PULSE</title></channel></rss>');
      }
    }
  });

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
      const siteTitle = seo?.title || "DAILY PULSE - 핵심만 읽는 헬스케어 뉴스";
      const siteDesc = (seo?.description || "우리 가족의 건강을 위한 가장 확실한 맥박, 건강 전문 미디어 데일리펄스입니다.").replace(/\s+/g, ' ').trim();

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
        <header style="border-bottom: 1px solid #e2e8f0; background: #ffffff; padding: 12px 20px;">
          <div style="max-width: 1200px; margin: 0 auto; display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 15px;">
            <a href="/" style="font-size: 24px; font-weight: 900; color: #059669; text-decoration: none; letter-spacing: -0.5px;">DAILY PULSE</a>
            <nav style="display: flex; flex-wrap: wrap; gap: 16px; font-size: 15px; font-weight: 600;">
              <a href="/" style="color: #334155; text-decoration: none;">홈</a>
              ${allCategories.map(c => `<a href="/category/${c.id}" style="color: #334155; text-decoration: none;">${c.name}</a>`).join("\n              ")}
            </nav>
          </div>
        </header>
      `;

      const footerHtml = `
        <footer style="background: #0f172a; color: #94a3b8; padding: 40px 20px; margin-top: 60px; font-size: 14px;">
          <div style="max-width: 1200px; margin: 0 auto; display: flex; flex-wrap: wrap; justify-content: space-between; gap: 30px;">
            <div>
              <p style="font-size: 18px; font-weight: bold; color: #ffffff; margin-bottom: 10px;">DAILY PULSE</p>
              <p style="margin: 0; line-height: 1.6;">${siteDesc}</p>
            </div>
            <div style="display: flex; flex-wrap: wrap; gap: 20px;">
              ${companyPages.map(p => `<a href="/info/${p.id}" style="color: #cbd5e1; text-decoration: none;">${p.title}</a>`).join("\n              ")}
            </div>
          </div>
          <div style="max-width: 1200px; margin: 20px auto 0; padding-top: 20px; border-top: 1px solid #1e293b; text-align: center;">
            <p style="margin: 0;">© ${new Date().getFullYear()} DAILY PULSE. All rights reserved.</p>
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

          customTitle = `${article.title} | ${siteTitle}`;
          customDesc = (article.excerpt || article.content || "").replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').substring(0, 160).trim();
          customKeywords = `${catName}, 건강, 의료, 헬스케어, ${article.title}`;
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
              "name": article.author || "데일리펄스 편집국"
            }],
            "publisher": {
              "@type": "NewsMediaOrganization",
              "name": "DAILY PULSE",
              "url": hostUrl,
              "logo": {
                "@type": "ImageObject",
                "url": `${hostUrl}/favicon.ico`
              }
            }
          });

          jsonLdList.push({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
              { "@type": "ListItem", "position": 1, "name": "홈", "item": hostUrl },
              { "@type": "ListItem", "position": 2, "name": catName, "item": `${hostUrl}/category/${article.categoryId}` },
              { "@type": "ListItem", "position": 3, "name": article.title, "item": canonicalUrl }
            ]
          });

          bodyHtml = `
            ${navHtml}
            <main style="max-width: 860px; margin: 40px auto; padding: 0 20px; font-family: -apple-system, BlinkMacSystemFont, 'Malgun Gothic', '맑은 고딕', sans-serif;">
              <article>
                <header style="margin-bottom: 25px; border-bottom: 2px solid #f1f5f9; padding-bottom: 20px;">
                  <a href="/category/${article.categoryId}" style="display: inline-block; color: #059669; font-weight: 700; font-size: 15px; text-decoration: none; margin-bottom: 10px;">${catName}</a>
                  <h1 style="font-size: 30px; font-weight: 800; color: #0f172a; line-height: 1.35; margin: 8px 0 16px;">${article.title}</h1>
                  <div style="font-size: 14px; color: #64748b; display: flex; gap: 15px;">
                    <span>기자: <strong>${article.author || "데일리펄스"}</strong></span>
                    <span>작성일: ${article.createdAt ? new Date(article.createdAt).toLocaleDateString('ko-KR') : ""}</span>
                  </div>
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

        customTitle = `${catName} 뉴스 - 데일리펄스 | 최신 건강 정보`;
        customDesc = `데일리펄스 ${catName} 섹션입니다. ${catName} 관련 최신 보건의료 뉴스, 전문 칼럼 및 일상 건강 정보를 실시간으로 확인하세요.`;
        customKeywords = `${catName}, ${catName} 정보, 건강, 의료, 헬스케어, 데일리펄스`;

        jsonLdList.push({
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          "name": `${catName} 뉴스`,
          "description": customDesc,
          "url": canonicalUrl,
          "inLanguage": "ko-KR",
          "isPartOf": {
            "@type": "WebSite",
            "name": "DAILY PULSE",
            "url": hostUrl
          }
        });

        jsonLdList.push({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "홈", "item": hostUrl },
            { "@type": "ListItem", "position": 2, "name": catName, "item": canonicalUrl }
          ]
        });

        if (catArticles.length > 0) {
          jsonLdList.push({
            "@context": "https://schema.org",
            "@type": "ItemList",
            "itemListElement": catArticles.slice(0, 10).map((art, idx) => ({
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
              <h1 style="font-size: 28px; font-weight: 800; color: #0f172a; margin: 0;">${catName}</h1>
              <p style="font-size: 15px; color: #64748b; margin: 8px 0 0;">${catName} 관련 최신 건강 뉴스와 전문 의학 정보를 제공합니다.</p>
            </div>
            <section style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 24px;">
              ${catArticles.map(art => `
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
                      <span>${art.author || "기자"}</span>
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
          customTitle = `${page.title} - 데일리펄스`;
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
        customKeywords = "건강뉴스, 헬스케어, 보건의료, 의학칼럼, 건강검진, 여성건강, 한의학, 척추관절, 카드뉴스, 데일리펄스";

        jsonLdList.push({
          "@context": "https://schema.org",
          "@type": "WebSite",
          "name": "DAILY PULSE",
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
          "name": "DAILY PULSE",
          "url": hostUrl,
          "logo": `${hostUrl}/favicon.ico`,
          "description": siteDesc
        });

        if (allArticles.length > 0) {
          jsonLdList.push({
            "@context": "https://schema.org",
            "@type": "ItemList",
            "itemListElement": allArticles.slice(0, 10).map((art, idx) => ({
              "@type": "ListItem",
              "position": idx + 1,
              "url": `${hostUrl}/article/${art.id}`,
              "name": art.title
            }))
          });
        }

        const topArticles = allArticles.slice(0, 8);
        const heroArticle = topArticles[0];

        bodyHtml = `
          ${navHtml}
          <main style="max-width: 1200px; margin: 30px auto; padding: 0 20px; font-family: -apple-system, BlinkMacSystemFont, 'Malgun Gothic', '맑은 고딕', sans-serif;">
            ${heroArticle ? `
              <section style="margin-bottom: 40px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden;">
                <div style="display: flex; flex-direction: column; md:flex-row; gap: 20px;">
                  ${heroArticle.imageUrl ? `<a href="/article/${heroArticle.id}"><img src="${heroArticle.imageUrl}" alt="${heroArticle.title}" style="width: 100%; max-height: 400px; object-fit: cover;" /></a>` : ""}
                  <div style="padding: 24px;">
                    <span style="color: #059669; font-weight: 700; font-size: 14px;">주요 뉴스</span>
                    <h1 style="font-size: 26px; font-weight: 800; color: #0f172a; margin: 10px 0 14px; line-height: 1.4;">
                      <a href="/article/${heroArticle.id}" style="color: inherit; text-decoration: none;">${heroArticle.title}</a>
                    </h1>
                    <p style="font-size: 16px; color: #475569; line-height: 1.6; margin-bottom: 16px;">${heroArticle.excerpt || heroArticle.content || ""}</p>
                    <div style="font-size: 14px; color: #94a3b8;">${heroArticle.author || "기자"} · ${heroArticle.createdAt ? new Date(heroArticle.createdAt).toLocaleDateString('ko-KR') : ""}</div>
                  </div>
                </div>
              </section>
            ` : ""}

            <section style="margin-bottom: 40px;">
              <h2 style="font-size: 22px; font-weight: 800; color: #0f172a; border-left: 4px solid #059669; padding-left: 12px; margin-bottom: 20px;">최신 헬스케어 뉴스</h2>
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
                      <div style="font-size: 12px; color: #94a3b8; border-top: 1px solid #f8fafc; padding-top: 8px;">
                        ${art.author || "기자"} · ${art.createdAt ? new Date(art.createdAt).toLocaleDateString('ko-KR') : ""}
                      </div>
                    </div>
                  </article>
                `).join("\n                ")}
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
    <meta property="og:site_name" content="DAILY PULSE" />
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
