import express from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import multer from "multer";
import { connectDB, isMongoConnected, ArticleModel, CategoryModel, CompanyPageModel, SeoSettingsModel } from "./src/server/db";
import { uploadToExternalStorage } from "./src/server/storage";

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

  // Connect to MongoDB Atlas
  await connectDB();

  // -------------------------------------------------------------
  // REST API Endpoints for MongoDB & External Storage
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
      if (!isMongoConnected()) return res.json(getFallbackArticles());
      const articles = await (ArticleModel as any).find().sort({ createdAt: -1 }).lean().exec();
      if (articles && articles.length > 0) {
        return res.json(articles.map((a: any) => ({
          ...a,
          id: a._id.toString()
        })));
      }
      res.json(getFallbackArticles());
    } catch (error: any) {
      res.json(getFallbackArticles());
    }
  });

  app.get("/api/articles/:id", async (req, res) => {
    try {
      if (!isMongoConnected()) return res.status(404).json({ error: "Article not found" });
      const article = await (ArticleModel as any).findById(req.params.id).lean().exec();
      if (!article) return res.status(404).json({ error: "Article not found" });
      res.json({ ...(article as any), id: (article as any)._id.toString() });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/articles", async (req, res) => {
    try {
      if (!isMongoConnected()) return res.status(503).json({ error: "Database not connected" });
      const article = new (ArticleModel as any)(req.body);
      await article.save();
      const obj = article.toObject();
      res.status(201).json({ ...obj, id: obj._id.toString() });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.put("/api/articles/:id", async (req, res) => {
    try {
      if (!isMongoConnected()) return res.status(503).json({ error: "Database not connected" });
      const article = await (ArticleModel as any).findByIdAndUpdate(req.params.id, req.body, { new: true }).lean().exec();
      if (!article) return res.status(404).json({ error: "Article not found" });
      res.json({ ...(article as any), id: (article as any)._id.toString() });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/articles/:id", async (req, res) => {
    try {
      if (!isMongoConnected()) return res.status(503).json({ error: "Database not connected" });
      await (ArticleModel as any).findByIdAndDelete(req.params.id).exec();
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Views / Likes increment API
  app.post("/api/articles/:id/views", async (req, res) => {
    try {
      if (!isMongoConnected()) return res.json({ views: 0 });
      const article = await (ArticleModel as any).findByIdAndUpdate(req.params.id, { $inc: { views: 1 } }, { new: true }).lean().exec();
      res.json({ views: (article as any)?.views || 0 });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Categories API
  app.get("/api/categories", async (req, res) => {
    try {
      if (!isMongoConnected()) return res.json([]);
      const categories = await (CategoryModel as any).find().lean().exec();
      res.json(categories);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/categories", async (req, res) => {
    try {
      if (!isMongoConnected()) return res.status(503).json({ error: "Database not connected" });
      const cat = new (CategoryModel as any)(req.body);
      await cat.save();
      res.status(201).json(cat.toObject());
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Company Pages API
  app.get("/api/company-pages", async (req, res) => {
    try {
      if (!isMongoConnected()) return res.json([]);
      const pages = await (CompanyPageModel as any).find().lean().exec();
      res.json(pages);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.put("/api/company-pages/:id", async (req, res) => {
    try {
      if (!isMongoConnected()) return res.status(503).json({ error: "Database not connected" });
      const page = await (CompanyPageModel as any).findOneAndUpdate(
        { id: req.params.id },
        { ...req.body, updateTime: new Date().toISOString() },
        { upsert: true, new: true }
      ).lean().exec();
      res.json(page);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // SEO Settings API
  app.get("/api/seo", async (req, res) => {
    try {
      if (!isMongoConnected()) return res.json({});
      let seo = await (SeoSettingsModel as any).findOne({ id: "seo" }).lean().exec();
      if (!seo) {
        const newSeo = new (SeoSettingsModel as any)({ id: "seo" });
        await newSeo.save();
        seo = newSeo.toObject();
      }
      res.json(seo);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/seo", async (req, res) => {
    try {
      if (!isMongoConnected()) return res.status(503).json({ error: "Database not connected" });
      const seo = await (SeoSettingsModel as any).findOneAndUpdate({ id: "seo" }, req.body, { upsert: true, new: true }).lean().exec();
      res.json(seo);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // -------------------------------------------------------------
  // Helpers for SSR / Dynamic File Generation (Sitemap, RSS, SEO)
  // -------------------------------------------------------------

  const getSeoSettings = async () => {
    if (!isMongoConnected()) return null;
    try {
      const seo = await (SeoSettingsModel as any).findOne({ id: "seo" }).lean().exec();
      if (seo) return seo as any;
    } catch (e) {
      console.error("Error fetching SEO settings from MongoDB:", e);
    }
    return null;
  };

  const getFallbackArticles = () => [
    {
      id: "fb-1",
      title: "의료계 핫이슈를 한눈에! 데일리펄스 건강 뉴스 브리핑",
      excerpt: "오늘의 주요 보건의료 이슈와 유용한 건강 정리를 쉽게 전달해 드립니다.",
      content: "우리 가족의 건강을 위한 쉽고 유익한 의학 지식을 일상에서 바로 활용하실 수 있도록 자세히 공유하고자 합니다. 최근 보건 복지 정책부터 일상 예방 꿀팁까지 정확한 정보로 보답하겠습니다.\n\n자세한 정보는 공식 보건복지부 사이트(https://www.mohw.go.kr)를 통해 확인하실 수 있습니다.",
      categoryId: "checkup",
      imageUrl: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1200&q=80",
      createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
      author: "데일리펄스 편집국",
      views: 1240,
      likes: 85,
      isFeatured: true,
      isTrending: true,
      isBreaking: true
    },
    {
      id: "fb-2",
      title: "현대인의 고질병 목·허리 통증 완화하기: 척추관절 자가 케어 가이드",
      excerpt: "오래 앉아 일하는 직장인들을 위한 실생활 올바른 자세와 틈새 스트레칭 팁을 전합니다.",
      content: "잘못된 자세로 인한 디스크 탈출증 및 척추 관절 증후군을 복잡한 이론 대신 매일 3분씩 실천할 수 있는 쉬운 맨몸 회복 훈련으로 정리했습니다. 꾸준한 거북목 예방 스트레칭이 건강한 척추 수명을 늘립니다.",
      categoryId: "spine-joint",
      imageUrl: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=800&q=80",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 1).toISOString(),
      author: "김지훈 기자",
      views: 890,
      likes: 42,
      isFeatured: true,
      isTrending: true,
      isBreaking: false
    },
    {
      id: "fb-3",
      title: "건강검진 결과표 완벽 해독법: 나에게 꼭 필요한 검사항목 알아보기",
      excerpt: "복잡한 의학 용어와 숫자로 가득한 종합 건강검진 결과표에서 주의해야 할 핵심 항목을 짚어봅니다.",
      content: "혈압, 콜레스테롤, 공복혈당 수치 등 기초 만성 질환 지표의 정상 범위를 해설하고, 나이대별 맞춤형 추가 정밀검진 가이드라인을 알려 드립니다. 미리 발견하고 예방하는 것이 무엇보다 전인적 건강의 첫걸음입니다.",
      categoryId: "checkup",
      imageUrl: "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=800&q=80",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
      author: "박서연 기자",
      views: 1560,
      likes: 112,
      isFeatured: true,
      isTrending: false,
      isBreaking: false
    },
    {
      id: "fb-4",
      title: "[카드뉴스] 한눈에 보는 여름철 온열질환 예방 수칙 5가지",
      excerpt: "무더운 날씨 온열질환 대처법과 수분 섭취 가이드를 한눈에 파악하세요.",
      content: "1. 야외 활동 시 물을 자주 마시기\n2. 가장 무더운 시간대(12시~17시) 야외활동 자제하기\n3. 외출 시 햇볕을 가리고 밝은색의 가벼운 옷 착용하기\n4. 현기증, 두통 등 이상 증상이 나타나면 즉시 시원한 곳에서 휴식하기\n5. 주위에 온열질환자 발생 시 119 구급대에 신고하고 시원한 곳으로 이동시키기",
      categoryId: "cardnews",
      imageUrl: "https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=800&q=80",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
      author: "데일리펄스 디자인팀",
      views: 2100,
      likes: 180,
      isFeatured: false,
      isTrending: true,
      isBreaking: false
    },
    {
      id: "fb-5",
      title: "[오피니언] 디지털 시대, 내 몸의 신호에 귀 기울이는 지혜",
      excerpt: "스마트폰과 모니터 앞에서의 일상이 길어진 시대, 우리의 인체 반응을 이해하는 시각.",
      content: "현대 의학의 눈부신 발전에도 불구하고, 가장 강력한 건강 관리의 시작은 자신의 신체 변화에 일찍 관심을 갖는 것입니다. 정기 검진과 적절한 운동, 그리고 마음의 휴식이 어우러질 때 진정한 수명 연장과 삶의 질 향상이 이루어집니다.",
      categoryId: "opinion",
      imageUrl: "https://images.unsplash.com/photo-1582750433449-648ed127bb54?auto=format&fit=crop&w=800&q=80",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
      author: "이수현 전문의",
      doctorName: "이수현",
      doctorSpecialty: "내과 전문의 / 의학박사",
      hospitalName: "서울중앙내과의원",
      doctorImage: "https://images.unsplash.com/photo-1594824813566-78a930777176?auto=format&fit=crop&w=300&q=80",
      views: 740,
      likes: 65,
      isFeatured: false,
      isTrending: false,
      isBreaking: false
    },
    {
      id: "fb-6",
      title: "여성 호르몬 불균형 신호와 만성 피로 극복을 위한 영양 생활습관",
      excerpt: "생리 불순, 수면 장애, 무기력감 등 생체 리듬을 깨뜨리는 호르몬 변화에 대응하는 솔루션.",
      content: "30~40대 여성들이 자주 경험하는 만성 피로와 호르몬 변화는 식습관 가이드와 비타민D, 마그네슘 등 필요한 영양소를 조화롭게 섭취하는 것만으로도 큰 개선 효과를 기대할 수 있습니다.",
      categoryId: "womens-health",
      imageUrl: "https://images.unsplash.com/photo-1512290900673-3e110b9385d5?auto=format&fit=crop&w=800&q=80",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
      author: "최윤정 기자",
      views: 1120,
      likes: 95,
      isFeatured: false,
      isTrending: true,
      isBreaking: false
    },
    {
      id: "fb-7",
      title: "면역력 강화와 체질 개선을 돕는 한의학 체질별 보약 다이어리",
      excerpt: "환절기 기력 회복과 신체 균형을 잡아주는 한의학 전통 처방과 생활 요법.",
      content: "태음인, 소음인, 소양인, 태양인 등 각 체질별 특성에 맞춘 약재 조율과 뜸, 침 치료 기법을 소개합니다. 체질에 적합한 수면 습관과 음식 선택법이 건강을 유지하는 지름길입니다.",
      categoryId: "oriental-med",
      imageUrl: "https://images.unsplash.com/photo-1514733670139-4d87a1941d55?auto=format&fit=crop&w=800&q=80",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
      author: "정민우 한의사",
      views: 980,
      likes: 71,
      isFeatured: false,
      isTrending: false,
      isBreaking: false
    }
  ];

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
    if (isMongoConnected()) {
      try {
        const articles = await (ArticleModel as any).find().sort({ createdAt: -1 }).limit(300).lean().exec();
        if (articles && articles.length > 0) {
          return articles.map((a: any) => ({
            ...a,
            id: a._id.toString()
          }));
        }
      } catch (e) {
        console.error("Error fetching articles for XML, using fallback:", e);
      }
    }
    return getFallbackArticles();
  };

  const getArticle = async (id: string) => {
    if (isMongoConnected()) {
      try {
        const article = await (ArticleModel as any).findById(id).lean().exec();
        if (article) {
          return {
            ...(article as any),
            id: (article as any)._id.toString()
          };
        }
      } catch (e) {
        console.error("Error fetching single article for SEO:", e);
      }
    }
    return getFallbackArticles().find(a => a.id === id) || null;
  };

  const getCompanyPages = async () => {
    if (isMongoConnected()) {
      try {
        const pages = await (CompanyPageModel as any).find().lean().exec();
        if (pages && pages.length > 0) {
          return pages as any[];
        }
      } catch (e) {
        console.error("Error fetching company pages:", e);
      }
    }
    return defaultCompanyPages;
  };

  const getCategories = async () => {
    if (isMongoConnected()) {
      try {
        const categories = await (CategoryModel as any).find().lean().exec();
        if (categories && categories.length > 0) {
          return categories as any[];
        }
      } catch (e) {
        console.error("Error fetching categories:", e);
      }
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
      res.send("");
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
