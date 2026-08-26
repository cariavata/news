import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { Article, CategoryInfo, AdBanner, SeoSettings, CompanyPage, Inquiry } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { fallbackCategories, fallbackCompanyPages } from '../data/fallbackData';
import { doc, setDoc, updateDoc, deleteDoc, getDocs, collection, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import {
  createArticleApi,
  updateArticleApi,
  deleteArticleApi,
  incrementArticleViewsApi,
  saveSeoSettingsApi,
  fetchSeoSettingsApi
} from '../lib/api';

export interface AnalyticsData {
  dailyViews: Record<string, number>;
  dailyKeywords: Record<string, Record<string, number>>;
  dailyDevices: Record<string, Record<string, number>>;
  dailyReferrers: Record<string, Record<string, number>>;
  keywords: Record<string, number>;
  devices: Record<string, number>;
}

export interface SearchKeywordData {
  id: string;
  keyword: string;
  count: number;
  lastSearchedAt: string;
  createdAt?: string;
}

export const sanitizeArticles = (articles: any[]): Article[] => {
  if (!Array.isArray(articles)) return [];
  return articles.filter(a => a && typeof a.id === 'string' && !a.id.startsWith('fb-') && a.id !== '1' && a.id !== '2' && a.id !== '3') as Article[];
};

export const ensureFallbackContent = () => {
  const state = useAppStore.getState();
  let articlesToSet = sanitizeArticles(state.articles);

  if (!articlesToSet || articlesToSet.length === 0) {
    try {
      const cachedStr = localStorage.getItem('__firestore_fallback_cache__');
      if (cachedStr) {
        const cached = JSON.parse(cachedStr);
        if (cached.articles && cached.articles.length > 0) {
          articlesToSet = sanitizeArticles(cached.articles);
        }
      }
    } catch (e) {}
  }

  useAppStore.setState({
    articles: articlesToSet || [],
    categories: state.categories && state.categories.length > 0 ? state.categories : fallbackCategories,
    companyPages: state.companyPages && state.companyPages.length > 0 ? state.companyPages : fallbackCompanyPages,
    isFirebaseSettingsLoaded: true,
    hasFetchedInitialArticles: true
  });
};

interface AppState {
  isAuthenticated: boolean;
  login: () => void;
  logout: () => void;

  categories: CategoryInfo[];
  addCategory: (name: string) => void;
  updateCategory: (id: string, updates: Partial<CategoryInfo>) => void;
  deleteCategory: (id: string) => void;

  articles: Article[];
  hasFetchedInitialArticles: boolean;
  categoryFetchStatus: Record<string, { hasFetchedInitial: boolean, lastVisible: any, hasMore: boolean }>;
  fetchInitialArticles: () => Promise<void>;
  fetchArticlesByCategory: (categoryId: string, loadMore?: boolean) => Promise<void>;
  fetchArticleById: (id: string) => Promise<void>;
  addArticle: (article: Omit<Article, 'id' | 'createdAt'>) => Promise<void>;
  updateArticle: (id: string, article: Partial<Article>) => Promise<void>;
  deleteArticle: (id: string) => Promise<void>;
  incrementArticleViews: (id: string) => void;
  toggleArticleLike: (id: string, isLiking: boolean) => void;

  adBanners: AdBanner[];
  addAdBanner: (banner: Omit<AdBanner, "id">) => void;
  deleteAdBanner: (id: string) => void;

  companyPages: CompanyPage[];
  addCompanyPage: (page: Omit<CompanyPage, "id">) => void;
  updateCompanyPage: (id: string, page: Partial<CompanyPage>) => void;
  deleteCompanyPage: (id: string) => void;

  inquiries: Inquiry[];
  addInquiry: (inquiryData: Omit<Inquiry, 'id' | 'createdAt'>) => void;
  deleteInquiry: (id: string) => void;
  deleteMultipleInquiries: (ids: string[]) => void;

  seoSettings: SeoSettings;
  updateSeoSettings: (settings: SeoSettings) => Promise<void>;

  isFirebaseSettingsLoaded: boolean;
  lastFetchTime: number;
  setFirebaseSettingsLoaded: (loaded: boolean) => void;

  analytics: AnalyticsData;
  globalSearchKeywords: SearchKeywordData[];
  setGlobalSearchKeywords: (keywords: SearchKeywordData[]) => void;
  trackPageView: () => void;
  trackSearch: (keyword: string) => void;
  resetAnalytics: () => void;
}

export const generateSeedAnalyticsData = (): AnalyticsData => {
  const dailyViews: Record<string, number> = {};
  const dailyKeywords: Record<string, Record<string, number>> = {};
  const dailyDevices: Record<string, Record<string, number>> = {};
  const dailyReferrers: Record<string, Record<string, number>> = {};
  const keywords: Record<string, number> = {
    '건강검진 항목': 184,
    '척추관절 디스크': 142,
    '여성건강 영양제': 118,
    '한의학 침치료': 95,
    '고혈압 수치 기준': 88,
    '당뇨 예방 음식': 76,
    '거북목 스트레칭': 64,
  };
  const devices: Record<string, number> = { 'Mo': 3820, 'PC': 2410, 'Tab': 450 };

  const today = new Date();
  for (let i = 365; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    
    const dayOfWeek = d.getDay();
    const base = (dayOfWeek === 0 || dayOfWeek === 6) ? 140 : 220;
    const pseudoRandom = Math.floor(Math.sin(i * 12.34) * 45) + Math.floor(Math.cos(i * 5.67) * 30);
    const count = Math.max(85, base + pseudoRandom);
    
    dailyViews[dateStr] = count;
    dailyDevices[dateStr] = {
      'Mo': Math.floor(count * 0.62),
      'PC': Math.floor(count * 0.33),
      'Tab': Math.floor(count * 0.05)
    };
    dailyReferrers[dateStr] = {
      'naver.com': Math.floor(count * 0.48),
      'google.com': Math.floor(count * 0.34),
      'daum.net': Math.floor(count * 0.10),
      '직접 유입': Math.floor(count * 0.08)
    };
  }

  return { dailyViews, dailyKeywords, dailyDevices, dailyReferrers, keywords, devices };
};

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      login: () => set({ isAuthenticated: true }),
      logout: () => set({ isAuthenticated: false }),

      categories: fallbackCategories,
      addCategory: (name) => {
        const id = uuidv4();
        const currentCategories = useAppStore.getState().categories;
        const maxOrder = currentCategories.reduce((max, c) => Math.max(max, c.order ?? 999), -1);
        const order = maxOrder === -1 || maxOrder === 999 ? currentCategories.length : maxOrder + 1;
        const obj = { id, name, order };
        set((state) => ({ categories: [...state.categories, obj] }));
      },
      updateCategory: (id, updates) => {
        set((state) => ({
          categories: state.categories.map(c => c.id === id ? { ...c, ...updates } : c)
        }));
      },
      deleteCategory: (id) => {
        set((state) => ({ categories: state.categories.filter(c => c.id !== id) }));
      },

      articles: [],
      hasFetchedInitialArticles: false,
      categoryFetchStatus: {},
      fetchInitialArticles: async () => {
        try {
          const snapshot = await getDocs(collection(db, 'articles'));
          if (!snapshot.empty) {
            const raw = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
            const fetched = sanitizeArticles(raw);
            fetched.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
            set({ articles: fetched, hasFetchedInitialArticles: true, lastFetchTime: Date.now() });
          } else {
            set({ articles: [], hasFetchedInitialArticles: true, lastFetchTime: Date.now() });
          }
        } catch (error) {
          console.warn("fetchInitialArticles Firestore error:", error);
          set({ hasFetchedInitialArticles: true });
        }
      },
      fetchArticlesByCategory: async (_categoryId: string) => {
        // Articles are loaded and synchronized via Firestore real-time listener and fetchInitialArticles
      },
      fetchArticleById: async (id: string) => {
        const state = useAppStore.getState();
        if (state.articles.find(a => a.id === id)) return;
        try {
          const docSnap = await getDoc(doc(db, 'articles', id));
          if (docSnap.exists()) {
            const article = { ...docSnap.data(), id: docSnap.id } as Article;
            if (!article.id.startsWith('fb-') && article.id !== '1' && article.id !== '2' && article.id !== '3') {
              set((s) => ({ articles: [article, ...s.articles.filter(a => a.id !== id)] }));
            }
          }
        } catch (error) {
          console.warn("fetchArticleById error:", error);
        }
      },
      addArticle: async (articleData) => {
        const id = uuidv4();
        const obj = { ...articleData, id, createdAt: new Date().toISOString() } as Article;
        set((state) => {
          const newArticles = [obj, ...state.articles];
          newArticles.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
          return { articles: newArticles };
        });
        try {
          await setDoc(doc(db, 'articles', id), obj);
        } catch (error) {
          console.warn("addArticle Firestore error:", error);
        }
        try {
          await createArticleApi(obj);
        } catch (error) {
          console.warn("addArticle API error:", error);
        }
      },
      updateArticle: async (id, updatedArticle) => {
        set((state) => {
          const updated = state.articles.map(article => article.id === id ? { ...article, ...updatedArticle } : article);
          updated.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
          return { articles: updated };
        });
        try {
          await updateDoc(doc(db, 'articles', id), updatedArticle);
        } catch (error) {
          console.warn("updateArticle Firestore error:", error);
        }
        try {
          await updateArticleApi(id, updatedArticle);
        } catch (error) {
          console.warn("updateArticle API error:", error);
        }
      },
      deleteArticle: async (id) => {
        set((state) => ({ articles: state.articles.filter(article => article.id !== id) }));
        try {
          await deleteDoc(doc(db, 'articles', id));
        } catch (error) {
          console.warn("deleteArticle Firestore error:", error);
        }
        try {
          await deleteArticleApi(id);
        } catch (error) {
          console.warn("deleteArticle API error:", error);
        }
      },
      incrementArticleViews: (id: string) => {
        set((state) => ({
          articles: state.articles.map(article => 
            article.id === id ? { ...article, views: (article.views || 0) + 1 } : article
          )
        }));
        incrementArticleViewsApi(id);
      },
      toggleArticleLike: (id: string, isLiking: boolean) => {
        const change = isLiking ? 1 : -1;
        set((state) => ({
          articles: state.articles.map(article => 
            article.id === id ? { ...article, likes: Math.max(0, (article.likes || 0) + change) } : article
          )
        }));
      },

      adBanners: [],
      addAdBanner: async (bannerData) => {
        const id = uuidv4();
        const obj = { ...bannerData, id };
        set((state) => ({ adBanners: [...state.adBanners, obj] }));
        try {
          await setDoc(doc(db, 'adBanners', id), obj);
        } catch (e) {
          console.warn("addAdBanner Firestore error:", e);
        }
      },
      deleteAdBanner: async (id) => {
        set((state) => ({ adBanners: state.adBanners.filter(b => b.id !== id) }));
        try {
          await deleteDoc(doc(db, 'adBanners', id));
        } catch (e) {
          console.warn("deleteAdBanner Firestore error:", e);
        }
      },

      companyPages: fallbackCompanyPages,
      addCompanyPage: async (pageData) => {
        const id = uuidv4();
        const obj = { ...pageData, id };
        set((state) => ({ companyPages: [...state.companyPages, obj] }));
        try {
          await setDoc(doc(db, 'companyPages', id), obj);
        } catch (e) {
          console.warn("addCompanyPage Firestore error:", e);
        }
      },
      updateCompanyPage: async (id, pageData) => {
        set((state) => ({
          companyPages: state.companyPages.map(page => page.id === id ? { ...page, ...pageData } : page)
        }));
        try {
          await updateDoc(doc(db, 'companyPages', id), pageData);
        } catch (e) {
          console.warn("updateCompanyPage Firestore error:", e);
        }
      },
      deleteCompanyPage: async (id) => {
        set((state) => ({ companyPages: state.companyPages.filter(page => page.id !== id) }));
        try {
          await deleteDoc(doc(db, 'companyPages', id));
        } catch (e) {
          console.warn("deleteCompanyPage Firestore error:", e);
        }
      },

      inquiries: [],
      addInquiry: async (inquiryData) => {
        const id = uuidv4();
        const obj = { ...inquiryData, id, createdAt: new Date().toISOString(), status: 'unread' as const };
        set((state) => ({ inquiries: [obj, ...state.inquiries] }));
        try {
          await setDoc(doc(db, 'inquiries', id), obj);
        } catch (e) {
          console.warn("addInquiry Firestore error:", e);
        }
      },
      deleteInquiry: async (id) => {
        set((state) => ({ inquiries: state.inquiries.filter(i => i.id !== id) }));
        try {
          await deleteDoc(doc(db, 'inquiries', id));
        } catch (e) {
          console.warn("deleteInquiry Firestore error:", e);
        }
      },
      deleteMultipleInquiries: async (ids) => {
        const idSet = new Set(ids);
        set((state) => ({ inquiries: state.inquiries.filter(i => !idSet.has(i.id)) }));
        for (const id of ids) {
          try {
            await deleteDoc(doc(db, 'inquiries', id));
          } catch (e) {
            console.warn("deleteMultipleInquiries Firestore error:", e);
          }
        }
      },

      seoSettings: {
        siteName: "DAILY PULSE",
        logoUrl: "",
        customHeadTags: "",
        title: "DAILY PULSE | 신뢰할 수 있는 보건의료 소식",
        description: "우리 가족의 건강을 위한 가장 확실한 맥박, 건강 전문 미디어 데일리펄스입니다.",
        keywords: "건강, 의학, 보건, 의료, 건강검진, 여성건강, 한의학, 척추관절, 카드뉴스, 오피니언",
        robotsTxt: "User-agent: *\nAllow: /\nSitemap: https://the-dailypulse.netlify.app/sitemap.xml",
        adsTxt: "",
        sitemapXml: "",
        rssXml: "",
        ogTitle: "DAILY PULSE | 신뢰할 수 있는 보건의료 소식",
        ogDescription: "우리 가족의 건강을 위한 가장 확실한 맥박, 건강 전문 미디어 데일리펄스입니다.",
        ogImage: "",
        naverSiteVerification: "d060eade5473b610c0645fe41bbce092e0917fad",
        googleSiteVerification: "57akzenSl71_GebyFfSJXrpeazAyphH49PDhUGOWR68",
        googleAdsenseClient: ""
      },
      updateSeoSettings: async (settings) => {
        set({ seoSettings: settings });
        try {
          await setDoc(doc(db, 'settings', 'seo'), settings, { merge: true });
        } catch (e) {
          console.warn("Save SEO settings Firestore error:", e);
        }
        try {
          await saveSeoSettingsApi(settings);
        } catch (e) {
          console.warn("Save SEO settings error:", e);
        }
      },

      isFirebaseSettingsLoaded: true,
      lastFetchTime: 0,
      setFirebaseSettingsLoaded: (loaded) => set({ isFirebaseSettingsLoaded: loaded }),

      analytics: generateSeedAnalyticsData(),
      globalSearchKeywords: [],
      setGlobalSearchKeywords: (keywords) => set({ globalSearchKeywords: keywords }),
      trackPageView: () => {
        const todayStr = new Date().toISOString().split('T')[0];
        set((state) => {
          const dailyViews = { ...state.analytics.dailyViews };
          dailyViews[todayStr] = (dailyViews[todayStr] || 0) + 1;
          return { analytics: { ...state.analytics, dailyViews } };
        });
      },
      trackSearch: (keyword) => {
        if (!keyword.trim()) return;
        const kw = keyword.trim();
        set((state) => {
          const keywords = { ...state.analytics.keywords };
          keywords[kw] = (keywords[kw] || 0) + 1;
          return { analytics: { ...state.analytics, keywords } };
        });
      },
      resetAnalytics: () => {
        const emptyAnalytics = { dailyViews: {}, dailyKeywords: {}, dailyDevices: {}, dailyReferrers: {}, keywords: {}, devices: {} };
        set({ analytics: emptyAnalytics });
      }
    }),
    {
      name: 'daily-pulse-storage',
      storage: createJSONStorage(() => ({
        getItem: (name) => {
          try {
            return localStorage.getItem(name);
          } catch {
            return null;
          }
        },
        setItem: (name, value) => {
          try {
            localStorage.setItem(name, value);
          } catch (e) {
            console.warn("localStorage quota exceeded or unavailable. Skipping caching state.", e);
          }
        },
        removeItem: (name) => {
          try {
            localStorage.removeItem(name);
          } catch {}
        }
      })),
      partialize: (state) => ({
        articles: sanitizeArticles(state.articles),
        categories: state.categories,
        adBanners: state.adBanners,
        companyPages: state.companyPages,
        seoSettings: state.seoSettings,
        inquiries: state.inquiries,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.articles = sanitizeArticles(state.articles || []);
          if (state.articles.length > 0) {
            state.hasFetchedInitialArticles = true;
          }
        }
      }
    }
  )
);
