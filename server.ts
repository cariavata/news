import express from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

let currentDir = "";
try {
  currentDir = __dirname;
} catch {
  // Fallback for ES Modules in development
  currentDir = path.dirname(fileURLToPath(import.meta.url));
}

async function startServer() {
  const app = express();
  app.set("trust proxy", true);
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
  const isProd = process.env.NODE_ENV === "production";
  
  // Read config for Firestore
  let firebaseConfig: any = {};
  try {
    let configPath = path.join(process.cwd(), 'firebase-applet-config.json');
    if (!fs.existsSync(configPath)) {
      configPath = path.join(currentDir, 'firebase-applet-config.json');
      if (!fs.existsSync(configPath)) {
        configPath = path.join(currentDir, '..', 'firebase-applet-config.json');
      }
    }
    firebaseConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    console.log("Successfully loaded firebase-applet-config.json from:", configPath);
  } catch (e) {
    console.error("Could not read firebase-applet-config.json", e);
  }

  const getSeoSettings = async () => {
    try {
      if (!firebaseConfig.projectId || !firebaseConfig.firestoreDatabaseId) return null;
      const url = `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/${firebaseConfig.firestoreDatabaseId}/documents/settings/seo`;
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        if (data && data.fields) {
          const fields = data.fields;
          return {
            title: fields.title?.stringValue || '',
            description: fields.description?.stringValue || '',
            keywords: fields.keywords?.stringValue || '',
            robotsTxt: fields.robotsTxt?.stringValue || '',
            adsTxt: fields.adsTxt?.stringValue || '',
            sitemapXml: fields.sitemapXml?.stringValue || '',
            rssXml: fields.rssXml?.stringValue || '',
            ogTitle: fields.ogTitle?.stringValue || '',
            ogDescription: fields.ogDescription?.stringValue || '',
            ogImage: fields.ogImage?.stringValue || '',
            naverSiteVerification: fields.naverSiteVerification?.stringValue || '',
            googleAdsenseClient: fields.googleAdsenseClient?.stringValue || ''
          };
        }
      }
    } catch (e) {
      console.error("Error fetching SEO settings:", e);
    }
    return null;
  };

  const getFallbackArticles = () => [
    {
      id: "1",
      title: "의료계 핫이슈를 한눈에! 데일리펄스 건강 뉴스 브리핑",
      excerpt: "오늘의 주요 보건의료 이슈와 유용한 건강 정리를 쉽게 전달해 드립니다.",
      content: "우리 가족의 건강을 위한 쉽고 유익한 의학 지식을 일상에서 바로 활용하실 수 있도록 자세히 공유하고자 합니다. 최근 보건 복지 정책부터 일상 예방 꿀팁까지 정확한 정보로 보답하겠습니다.",
      category: "건강검진",
      createdAt: "2026-06-12T09:00:00.000Z",
      updateTime: "2026-06-12T09:00:00.000Z",
      author: "데일리펄스"
    },
    {
      id: "2",
      title: "현대인의 고질병 목·허리 통증 완화하기: 척추관절 자가 케어 가이드",
      excerpt: "오래 앉아 일하는 직장인들을 위한 실생활 올바른 자세와 틈새 스트레칭 팁을 전합니다.",
      content: "잘못된 자세로 인한 디스크 탈출증 및 척추 관절 증후군을 복잡한 이론 대신 매일 3분씩 실천할 수 있는 쉬운 맨몸 회복 훈련으로 정리했습니다. 꾸준한 거북목 예방 스트레칭이 건강한 척추 수명을 늘립니다.",
      category: "척추관절",
      createdAt: "2026-06-11T14:30:00.000Z",
      updateTime: "2026-06-11T14:30:00.000Z",
      author: "데일리펄스"
    },
    {
      id: "3",
      title: "건강검진 결과표 완벽 해독법: 나에게 꼭 필요한 검사항목 알아보기",
      excerpt: "복잡한 의학 용어와 숫자로 가득한 종합 건강검진 결과표에서 주의해야 할 핵심 항목을 짚어봅니다.",
      content: "혈압, 콜레스테롤, 공복혈당 수치 등 기초 만성 질환 지표의 정상 범위를 해설하고, 나이대별 맞춤형 추가 정밀검진 가이드라인을 알려 드립니다. 미리 발견하고 예방하는 것이 무엇보다 전인적 건강의 첫걸음입니다.",
      category: "건강검진",
      createdAt: "2026-06-10T10:15:00.000Z",
      updateTime: "2026-06-10T10:15:00.000Z",
      author: "데일리펄스"
    }
  ];

  const getFallbackCompanyPages = () => [
    { id: 'about', title: '소개', content: '회사 소개 내용입니다.', updateTime: "2026-06-12T09:00:00.000Z" },
    { id: 'guidelines', title: '편집 가이드라인', content: '편집 가이드라인 내용입니다.', updateTime: "2026-06-12T09:00:00.000Z" },
    { id: 'careers', title: '채용 정보', content: '채용 정보 내용입니다.', updateTime: "2026-06-12T09:00:00.000Z" },
    { id: 'privacy', title: '개인정보 처리방침 및 약관', content: '약관 내용입니다.', updateTime: "2026-06-12T09:00:00.000Z" },
  ];

  const getFallbackCategories = () => [
    { id: 'checkup', name: '건강검진' },
    { id: 'womens-health', name: '여성건강' },
    { id: 'oriental-med', name: '한의학' },
    { id: 'spine-joint', name: '척추관절' },
    { id: 'cardnews', name: '카드뉴스' },
    { id: 'opinion', name: '오피니언' }
  ];

  const getArticles = async () => {
    try {
      if (!firebaseConfig.projectId || !firebaseConfig.firestoreDatabaseId) return getFallbackArticles();
      const url = `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/${firebaseConfig.firestoreDatabaseId}/documents/articles?pageSize=300`;
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        if (data && data.documents && data.documents.length > 0) {
          return data.documents.map((doc: any) => {
            const id = doc.name.split("/").pop() || "";
            const fields = doc.fields || {};
            return {
              id,
              title: fields.title?.stringValue || "",
              excerpt: fields.excerpt?.stringValue || "",
              content: fields.content?.stringValue || "",
              category: fields.category?.stringValue || fields.categoryId?.stringValue || "건강/의학",
              createdAt: fields.createdAt?.stringValue || doc.createTime,
              updateTime: doc.updateTime,
              author: fields.author?.stringValue || "데일리펄스"
            };
          });
        }
      }
    } catch (e) {
      console.error("Error fetching articles for XML, using fallback:", e);
    }
    return getFallbackArticles();
  };

  const getCompanyPages = async () => {
    try {
      if (!firebaseConfig.projectId || !firebaseConfig.firestoreDatabaseId) return getFallbackCompanyPages();
      const url = `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/${firebaseConfig.firestoreDatabaseId}/documents/companyPages`;
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        if (data && data.documents && data.documents.length > 0) {
          return data.documents.map((doc: any) => {
            const id = doc.name.split("/").pop() || "";
            const fields = doc.fields || {};
            return {
              id,
              title: fields.title?.stringValue || "",
              content: fields.content?.stringValue || "",
              updateTime: doc.updateTime
            };
          });
        }
      }
    } catch (e) {
      console.error("Error fetching company pages for XML, using fallback:", e);
    }
    return getFallbackCompanyPages();
  };

  const getCategories = async () => {
    try {
      if (!firebaseConfig.projectId || !firebaseConfig.firestoreDatabaseId) return getFallbackCategories();
      const url = `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/${firebaseConfig.firestoreDatabaseId}/documents/categories`;
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        if (data && data.documents && data.documents.length > 0) {
          return data.documents.map((doc: any) => {
            const id = doc.name.split("/").pop() || "";
            const fields = doc.fields || {};
            return {
              id,
              name: fields.name?.stringValue || ""
            };
          });
        }
      }
    } catch (e) {
      console.error("Error fetching categories for XML, using fallback:", e);
    }
    return getFallbackCategories();
  };

  const toRfc822 = (dateStr?: string) => {
    try {
      const d = dateStr ? new Date(dateStr) : new Date();
      if (isNaN(d.getTime())) {
        return new Date().toUTCString();
      }
      
      // Convert to KST (UTC+9) for robust compatibility with Korean search portals (Naver)
      const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      
      const kstTime = new Date(d.getTime() + (9 * 60 * 60 * 1000));
      
      const dayName = days[kstTime.getUTCDay()];
      const dayVal = String(kstTime.getUTCDate()).padStart(2, "0");
      const monthName = months[kstTime.getUTCMonth()];
      const year = kstTime.getUTCFullYear();
      const hours = String(kstTime.getUTCHours()).padStart(2, "0");
      const minutes = String(kstTime.getUTCMinutes()).padStart(2, "0");
      const seconds = String(kstTime.getUTCSeconds()).padStart(2, "0");
      
      return `${dayName}, ${dayVal} ${monthName} ${year} ${hours}:${minutes}:${seconds} +0900`;
    } catch {
      return new Date().toUTCString();
    }
  };

  // Serve dynamic files
  app.get("/robots.txt", async (req, res) => {
    const seo = await getSeoSettings();
    const robotsContent = (seo && seo.robotsTxt) ? seo.robotsTxt : "User-agent: *\nAllow: /";
    res.type("text/plain");
    res.send(robotsContent);
  });

  app.get("/sitemap.xml", async (req, res) => {
    const protocol = req.headers["x-forwarded-proto"] || req.protocol;
    const host = req.get("host");
    const hostUrl = `${protocol}://${host}`;

    const seo = await getSeoSettings();
    if (seo && seo.sitemapXml && seo.sitemapXml.trim().startsWith("<")) {
      res.type("application/xml; charset=utf-8");
      res.send(seo.sitemapXml);
    } else {
      // Generate dynamically
      try {
        const articles = await getArticles();
        const companyPages = await getCompanyPages();
        const categories = await getCategories();
        const nowStr = new Date().toISOString().split("T")[0];

        let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
        xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

        // Home
        xml += `  <url>\n`;
        xml += `    <loc>${hostUrl}/</loc>\n`;
        xml += `    <lastmod>${nowStr}</lastmod>\n`;
        xml += `    <changefreq>always</changefreq>\n`;
        xml += `    <priority>1.0</priority>\n`;
        xml += `  </url>\n`;

        // Articles
        for (const article of articles) {
          const lastmod = article.updateTime ? article.updateTime.split("T")[0] : nowStr;
          xml += `  <url>\n`;
          xml += `    <loc>${hostUrl}/article/${article.id}</loc>\n`;
          xml += `    <lastmod>${lastmod}</lastmod>\n`;
          xml += `    <changefreq>weekly</changefreq>\n`;
          xml += `    <priority>0.8</priority>\n`;
          xml += `  </url>\n`;
        }

        // Company Pages
        for (const page of companyPages) {
          const lastmod = page.updateTime ? page.updateTime.split("T")[0] : nowStr;
          xml += `  <url>\n`;
          xml += `    <loc>${hostUrl}/info/${page.id}</loc>\n`;
          xml += `    <lastmod>${lastmod}</lastmod>\n`;
          xml += `    <changefreq>monthly</changefreq>\n`;
          xml += `    <priority>0.5</priority>\n`;
          xml += `  </url>\n`;
        }

        // Categories
        for (const cat of categories) {
          xml += `  <url>\n`;
          xml += `    <loc>${hostUrl}/category/${cat.id}</loc>\n`;
          xml += `    <lastmod>${nowStr}</lastmod>\n`;
          xml += `    <changefreq>weekly</changefreq>\n`;
          xml += `    <priority>0.6</priority>\n`;
          xml += `  </url>\n`;
        }

        xml += `</urlset>`;
        res.type("application/xml; charset=utf-8");
        res.send(xml);
      } catch (e) {
        console.error("Error generating dynamic sitemap:", e);
        res.type("application/xml");
        res.status(500).send('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>');
      }
    }
  });

  app.get("/ads.txt", async (req, res) => {
    const seo = await getSeoSettings();
    res.type("text/plain");
    res.send((seo && seo.adsTxt) ? seo.adsTxt : "");
  });

  app.get("/rss.xml", async (req, res) => {
    const protocol = req.headers["x-forwarded-proto"] || req.protocol;
    const host = req.get("host");
    const hostUrl = `${protocol}://${host}`;

    const seo = await getSeoSettings();
    if (seo && seo.rssXml && seo.rssXml.trim().startsWith("<")) {
      res.type("application/xml; charset=utf-8");
      res.send(seo.rssXml);
    } else {
      // Generate dynamically
      try {
        const articles = await getArticles();
        const siteTitle = seo?.title || "데일리 펄스 | 신뢰할 수 있는 뉴스";
        const siteDesc = seo?.description || "우리 가족의 건강을 위한 가장 확실한 맥박, 건강 전문 미디어 데일리펄스입니다.";

        let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
        xml += `<rss version="2.0"\n`;
        xml += `     xmlns:dc="http://purl.org/dc/elements/1.1/"\n`;
        xml += `     xmlns:atom="http://www.w3.org/2005/Atom">\n`;
        xml += `<channel>\n`;
        xml += `  <title><![CDATA[${siteTitle}]]></title>\n`;
        xml += `  <link>${hostUrl}</link>\n`;
        xml += `  <description><![CDATA[${siteDesc}]]></description>\n`;
        xml += `  <language>ko-kr</language>\n`;
        xml += `  <pubDate>${toRfc822()}</pubDate>\n`;
        xml += `  <lastBuildDate>${toRfc822()}</lastBuildDate>\n`;
        xml += `  <atom:link href="${hostUrl}/rss.xml" rel="self" type="application/rss+xml" />\n`;

        for (const article of articles) {
          const authorName = article.author || "데일리펄스";
          const rfcDate = toRfc822(article.createdAt);
          const articleUrl = `${hostUrl}/article/${article.id}`;
          
          // Sanitize description: strip HTML elements, correct multiple/nested tags, and trim it properly.
          const rawDesc = article.excerpt || article.content || "";
          const cleanDesc = rawDesc
            .replace(/<\/?[^>]+(>|$)/g, "") // Strip HTML / XML tags completely
            .replace(/\s+/g, " ")           // Normalize spacing
            .trim()
            .substring(0, 300);            // Limit character count safely

          xml += `  <item>\n`;
          xml += `    <title><![CDATA[${article.title}]]></title>\n`;
          xml += `    <link>${articleUrl}</link>\n`;
          xml += `    <description><![CDATA[${cleanDesc}]]></description>\n`;
          xml += `    <dc:creator><![CDATA[${authorName}]]></dc:creator>\n`;
          xml += `    <pubDate>${rfcDate}</pubDate>\n`;
          xml += `    <guid isPermaLink="true">${articleUrl}</guid>\n`;
          xml += `  </item>\n`;
        }

        xml += `</channel>\n`;
        xml += `</rss>`;
        
        res.type("application/xml; charset=utf-8");
        res.send(xml);
      } catch (e) {
        console.error("Error generating dynamic RSS:", e);
        res.type("application/xml");
        res.status(500).send('<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>DAILY PULSE</title></channel></rss>');
      }
    }
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
    // In production, serve dist files (from the same directory as server.cjs)
    const distPath = currentDir;
    const staticMiddleware = express.static(distPath, { index: false }); // Disable automatic index.html serving
    app.use(staticMiddleware);
  }

  // Handle HTML rendering and inject SEO
  const handleHtml = async (req: express.Request, res: express.Response) => {
    try {
      let template: string;
      
      if (!isProd) {
        template = fs.readFileSync(path.join(currentDir, "index.html"), "utf-8");
        template = await vite.transformIndexHtml(req.url, template);
      } else {
        template = fs.readFileSync(path.join(currentDir, "index.html"), "utf-8");
      }

      const seo = await getSeoSettings();
      if (seo) {
        // Inject SEO into template
        if (seo.title) {
          template = template.replace(/<title>.*?<\/title>/i, `<title>${seo.title}</title>`);
        }
        
        let metaTagsToInject = "";
        
        // Handle description (remove newlines/multi-spaces)
        const descriptionToUse = (seo.description || "건강과 관련된 최신 뉴스와 알찬 정보를 지금 바로 확인하세요.").replace(/\s+/g, ' ').trim();
        if (/<meta name="description"/i.test(template)) {
          template = template.replace(/<meta name="description" content=".*?"\s*\/?>/i, `<meta name="description" content="${descriptionToUse}" />`);
        } else {
          metaTagsToInject += `\n    <meta name="description" content="${descriptionToUse}" />`;
        }

        // Handle keywords
        if (seo.keywords) {
          if (/<meta name="keywords"/i.test(template)) {
            template = template.replace(/<meta name="keywords" content=".*?"\s*\/?>/i, `<meta name="keywords" content="${seo.keywords}" />`);
          } else {
            metaTagsToInject += `\n    <meta name="keywords" content="${seo.keywords}" />`;
          }
        }

        // Handle og:title
        const ogTitleToUse = seo.ogTitle || seo.title || "DAILY PULSE";
        if (/<meta property="og:title"/i.test(template)) {
          template = template.replace(/<meta property="og:title" content=".*?"\s*\/?>/i, `<meta property="og:title" content="${ogTitleToUse}" />`);
        } else {
          metaTagsToInject += `\n    <meta property="og:title" content="${ogTitleToUse}" />`;
        }

        // Handle og:description
        const ogDescriptionToUse = (seo.ogDescription || seo.description || "건강과 관련된 최신 뉴스와 알찬 정보를 지금 바로 확인하세요.").replace(/\s+/g, ' ').trim();
        if (/<meta property="og:description"/i.test(template)) {
          template = template.replace(/<meta property="og:description" content=".*?"\s*\/?>/i, `<meta property="og:description" content="${ogDescriptionToUse}" />`);
        } else {
          metaTagsToInject += `\n    <meta property="og:description" content="${ogDescriptionToUse}" />`;
        }

        // Handle naverSiteVerification
        let navToken = "a9a11caab39330cf1a67069dc1c487ed49b767c4"; // default fallback
        if (seo.naverSiteVerification) {
          const match = seo.naverSiteVerification.match(/content=["']([^"']+)["']/i);
          if (match) navToken = match[1];
          else navToken = seo.naverSiteVerification.replace(/<[^>]+>/g, '').trim() || navToken;
        }
        if (/<meta name="naver-site-verification"/i.test(template)) {
          template = template.replace(/<meta name="naver-site-verification" content=".*?"\s*\/?>/i, `<meta name="naver-site-verification" content="${navToken}" />`);
        } else {
          metaTagsToInject += `\n    <meta name="naver-site-verification" content="${navToken}" />`;
        }
        
        if (metaTagsToInject) {
          template = template.replace('</head>', `${metaTagsToInject}\n  </head>`);
        }
      } else {
        // Fallback default description to fix Naver issue if no SEO settings exist
        const defaultDesc = "건강과 관련된 최신 뉴스와 알찬 정보를 지금 바로 확인하세요.";
        if (template.includes('name="description"')) {
          template = template.replace(/<meta name="description" content=".*?"\s*\/?>/i, `<meta name="description" content="${defaultDesc}" />`);
        } else {
          template = template.replace('</head>', `\n    <meta name="description" content="${defaultDesc}" />\n  </head>`);
        }
      }

      res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
    } catch (e: any) {
      if (vite) {
        vite.ssrFixStacktrace(e);
      }
      console.error(e);
      res.status(500).end(e.message);
    }
  };

  // For Express v4, wildcard is `*`
  app.get("*", handleHtml);

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
