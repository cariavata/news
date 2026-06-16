export interface CategoryInfo {
  id: string;
  name: string;
  order?: number;
}

export interface Inquiry {
  id: string;
  companyName: string;
  name: string;
  phone: string;
  email: string;
  message: string;
  createdAt: string; // ISO date string
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
  type?: 'image' | 'adsense';
  adsenseSlot?: string;
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
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  homeIntroText?: string;
  homeIntroEnabled?: boolean;
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
  views?: number; // Total article views
  doctorImage?: string; // Opt
  doctorSpecialty?: string; // Opt
  doctorName?: string; // Opt
  hospitalName?: string; // Opt
  cardNewsImages?: string[]; // Array of image URLs for card news. Order matters.
  likes?: number; // Likes for card news
}
