export interface CategoryInfo {
  id: string;
  name: string;
}

export interface CompanyPage {
  id: string;
  title: string;
  content: string;
}

export interface AdBanner {
  id: string;
  imageUrl: string;
  linkUrl: string;
}

export interface SeoSettings {
  siteName: string;
  logoUrl: string;
  title: string;
  description: string;
  keywords: string;
  naverSiteVerification: string;
  googleAdsenseClient: string;
  customHeadTags: string;
  robotsTxt?: string;
  adsTxt?: string;
  sitemapXml?: string;
  rssXml?: string;
}

export interface Article {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  categoryId: string;
  imageUrl: string;
  author: string;
  createdAt: string; // ISO date string
  isFeatured: boolean; // Shows in the main hero section
  isTrending: boolean; // Shows in the sidebar most read
  isBreaking: boolean; // Shows in the top breaking ticker
}
