import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { Article, CategoryInfo, AdBanner, SeoSettings, CompanyPage, Inquiry } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { fallbackCategories, fallbackCompanyPages } from '../data/fallbackData';
import { getPublishedAutoArticles, getAutoArticleById } from '../lib/autoPublishEngine';
import { doc, setDoc, deleteDoc, getDocs, collection, getDoc, increment } from 'firebase/firestore';
import { db } from '../lib/firebase';
import {
  createArticleApi,
  updateArticleApi,
  deleteArticleApi,
  incrementArticleViewsApi,
  saveSeoSettingsApi,
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

export const cleanFirestoreData = (data: Record<string, any>): Record<string, any> => {
  if (!data || typeof data !== 'object') return {};
  const clean: Record<string, any> = {};
  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined) {
      if (Array.isArray(value)) {
        clean[key] = value.filter(item => item !== undefined);
      } else if (value && typeof value === 'object' && !(value instanceof Date)) {
        clean[key] = cleanFirestoreData(value);
      } else {
        clean[key] = value;
      }
    }
  }
  return clean;
};

export const sanitizeArticles = (articles: any[]): Article[] => {
  if (!Array.isArray(articles)) return [];
  return articles.filter(a => a && typeof a.id === 'string' && a.title) as Article[];
};

export const mergeWithAutoArticles = (rawArticles: Article[]): Article[] => {
  const autoArticles = getPublishedAutoArticles(180);
  const articleMap = new Map<string, Article>();
  const nowTime = Date.now();

  // 1. Add auto-published articles (only those whose publish time has arrived)
  autoArticles.forEach(a => {
    if (new Date(a.createdAt || 0).getTime() <= nowTime) {
      articleMap.set(a.id, a);
    }
  });

  // 2. User-authored articles override or blend in (skip stale stored auto- articles to use fresh engine)
  if (Array.isArray(rawArticles)) {
    rawArticles.forEach(a => {
      if (a && a.id && a.title && !a.id.startsWith('auto-')) {
        articleMap.set(a.id, a);
      }
    });
  }

  const merged = Array.from(articleMap.values());
  merged.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
  return merged;
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

  const mergedArticles = mergeWithAutoArticles(articlesToSet || []);

  useAppStore.setState({
    articles: mergedArticles,
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
  addCategory: (name: string) => Promise<void>;
  updateCategory: (id: string, updates: Partial<CategoryInfo>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;

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
  addAdBanner: (banner: Omit<AdBanner, "id">) => Promise<void>;
  deleteAdBanner: (id: string) => Promise<void>;

  companyPages: CompanyPage[];
  addCompanyPage: (page: Omit<CompanyPage, "id">) => Promise<void>;
  updateCompanyPage: (id: string, page: Partial<CompanyPage>) => Promise<void>;
  deleteCompanyPage: (id: string) => Promise<void>;

  inquiries: Inquiry[];
  addInquiry: (inquiryData: Omit<Inquiry, 'id' | 'createdAt'>) => Promise<void>;
  deleteInquiry: (id: string) => Promise<void>;
  deleteMultipleInquiries: (ids: string[]) => Promise<void>;

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

export const getDeviceType = (): 'Mo' | 'PC' | 'Tab' => {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return 'PC';
  const ua = navigator.userAgent || '';
  if (/iPad|Tablet|(Android(?!.*Mobile))/i.test(ua)) return 'Tab';
  if (/Mobile|Android|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua)) return 'Mo';
  return 'PC';
};

export const getReferrerDomain = (): string => {
  if (typeof document === 'undefined' || !document.referrer) return 'direct';
  try {
    const url = new URL(document.referrer);
    const host = url.hostname.toLowerCase();
    if (host.includes('naver.com')) return 'naver.com';
    if (host.includes('google.')) return 'google.com';
    if (host.includes('daum.net')) return 'daum.net';
    if (host.includes('kakao.com')) return 'kakao.com';
    if (host.includes('instagram.com')) return 'instagram.com';
    if (host.includes('facebook.com')) return 'facebook.com';
    if (host.includes('youtube.com')) return 'youtube.com';
    if (host.includes('the-dailypulse.netlify.app') || host.includes('localhost') || host.includes('run.app')) {
      return 'internal';
    }
    return host;
  } catch {
    return 'direct';
  }
};

export const getInitialAnalyticsData = (): AnalyticsData => {
  return {
    dailyViews: {},
    dailyKeywords: {},
    dailyDevices: {},
    dailyReferrers: {},
    keywords: {},
    devices: {}
  };
};

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      login: () => set({ isAuthenticated: true }),
      logout: () => set({ isAuthenticated: false }),

      categories: fallbackCategories,
      addCategory: async (name) => {
        const id = uuidv4();
        const currentCategories = useAppStore.getState().categories;
        const maxOrder = currentCategories.reduce((max, c) => Math.max(max, c.order ?? 999), -1);
        const order = maxOrder === -1 || maxOrder === 999 ? currentCategories.length : maxOrder + 1;
        const obj = { id, name, order };
        set((state) => ({ categories: [...state.categories, obj] }));
        try {
          await setDoc(doc(db, 'categories', id), cleanFirestoreData(obj));
        } catch (e) {
          console.warn("addCategory Firestore error:", e);
        }
      },
      updateCategory: async (id, updates) => {
        const cleanUpdates = cleanFirestoreData(updates);
        set((state) => ({
          categories: state.categories.map(c => c.id === id ? { ...c, ...cleanUpdates } : c)
        }));
        try {
          await setDoc(doc(db, 'categories', id), cleanUpdates, { merge: true });
        } catch (e) {
          console.warn("updateCategory Firestore error:", e);
        }
      },
      deleteCategory: async (id) => {
        set((state) => ({ categories: state.categories.filter(c => c.id !== id) }));
        try {
          await deleteDoc(doc(db, 'categories', id));
        } catch (e) {
          console.warn("deleteCategory Firestore error:", e);
        }
      },

      articles: [],
      hasFetchedInitialArticles: true,
      categoryFetchStatus: {},
      fetchInitialArticles: async () => {
        try {
          const snapshot = await getDocs(collection(db, 'articles'));
          if (!snapshot.empty) {
            const raw = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
            const fetched = sanitizeArticles(raw);
            const merged = mergeWithAutoArticles(fetched);
            set({ articles: merged, hasFetchedInitialArticles: true, lastFetchTime: Date.now() });
          } else {
            const merged = mergeWithAutoArticles([]);
            set({ articles: merged, hasFetchedInitialArticles: true, lastFetchTime: Date.now() });
          }
        } catch (error) {
          console.warn("fetchInitialArticles Firestore error:", error);
          const current = useAppStore.getState().articles;
          const merged = mergeWithAutoArticles(current);
          set({ articles: merged, hasFetchedInitialArticles: true });
        }
      },
      fetchArticlesByCategory: async (_categoryId: string) => {},
      fetchArticleById: async (id: string) => {
        const state = useAppStore.getState();
        if (state.articles.find(a => a.id === id)) return;

        // Check if it's an auto-published article
        if (id.startsWith('auto-')) {
          const autoArt = getAutoArticleById(id);
          if (autoArt) {
            set((s) => ({ articles: [autoArt, ...s.articles.filter(a => a.id !== id)] }));
            return;
          }
        }

        try {
          const docSnap = await getDoc(doc(db, 'articles', id));
          if (docSnap.exists()) {
            const article = { ...docSnap.data(), id: docSnap.id } as Article;
            if (article && article.title) {
              set((s) => ({ articles: [article, ...s.articles.filter(a => a.id !== id)] }));
            }
          }
        } catch (error) {
          console.warn("fetchArticleById error:", error);
        }
      },
      addArticle: async (articleData) => {
        const id = (articleData as any).id || uuidv4();
        const rawObj = {
          ...articleData,
          id,
          createdAt: (articleData as any).createdAt || new Date().toISOString(),
          views: articleData.views || 0,
          likes: articleData.likes || 0,
        };
        const cleanObj = cleanFirestoreData(rawObj);
        const obj = cleanObj as Article;

        // 1. Immediate UI update
        set((state) => {
          const filtered = state.articles.filter(a => a.id !== id);
          const newArticles = [obj, ...filtered];
          newArticles.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
          return { articles: newArticles, hasFetchedInitialArticles: true };
        });

        // 2. Direct Firestore storage
        try {
          await setDoc(doc(db, 'articles', id), cleanObj);
        } catch (error) {
          console.error("addArticle Firestore error:", error);
        }

        // 3. Keep fallback cache synced
        try {
          const current = useAppStore.getState().articles;
          localStorage.setItem('__firestore_fallback_cache__', JSON.stringify({
            articles: current,
            categories: useAppStore.getState().categories,
            companyPages: useAppStore.getState().companyPages,
            adBanners: useAppStore.getState().adBanners,
            seoSettings: useAppStore.getState().seoSettings
          }));
        } catch (e) {}

        // 4. API notification if server active
        try {
          await createArticleApi(obj);
        } catch (error) {}
      },
      updateArticle: async (id, updatedArticle) => {
        const cleanUpdates = cleanFirestoreData(updatedArticle);
        set((state) => {
          const updated = state.articles.map(article => article.id === id ? { ...article, ...cleanUpdates } : article);
          updated.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
          return { articles: updated };
        });

        try {
          await setDoc(doc(db, 'articles', id), cleanUpdates, { merge: true });
        } catch (error) {
          console.error("updateArticle Firestore error:", error);
        }

        try {
          const current = useAppStore.getState().articles;
          localStorage.setItem('__firestore_fallback_cache__', JSON.stringify({
            articles: current,
            categories: useAppStore.getState().categories,
            companyPages: useAppStore.getState().companyPages,
            adBanners: useAppStore.getState().adBanners,
            seoSettings: useAppStore.getState().seoSettings
          }));
        } catch (e) {}

        try {
          await updateArticleApi(id, cleanUpdates);
        } catch (error) {}
      },
      deleteArticle: async (id) => {
        set((state) => ({ articles: state.articles.filter(article => article.id !== id) }));
        try {
          await deleteDoc(doc(db, 'articles', id));
        } catch (error) {
          console.error("deleteArticle Firestore error:", error);
        }

        try {
          const current = useAppStore.getState().articles.filter(a => a.id !== id);
          localStorage.setItem('__firestore_fallback_cache__', JSON.stringify({
            articles: current,
            categories: useAppStore.getState().categories,
            companyPages: useAppStore.getState().companyPages,
            adBanners: useAppStore.getState().adBanners,
            seoSettings: useAppStore.getState().seoSettings
          }));
        } catch (e) {}

        try {
          await deleteArticleApi(id);
        } catch (error) {}
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
        const cleanObj = cleanFirestoreData(obj);
        set((state) => ({ adBanners: [...state.adBanners, cleanObj as AdBanner] }));
        try {
          await setDoc(doc(db, 'adBanners', id), cleanObj);
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
        const cleanObj = cleanFirestoreData(obj);
        set((state) => ({ companyPages: [...state.companyPages, cleanObj as CompanyPage] }));
        try {
          await setDoc(doc(db, 'companyPages', id), cleanObj);
        } catch (e) {
          console.warn("addCompanyPage Firestore error:", e);
        }
      },
      updateCompanyPage: async (id, pageData) => {
        const cleanUpdates = cleanFirestoreData(pageData);
        set((state) => ({
          companyPages: state.companyPages.map(page => page.id === id ? { ...page, ...cleanUpdates } : page)
        }));
        try {
          await setDoc(doc(db, 'companyPages', id), cleanUpdates, { merge: true });
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
        const cleanObj = cleanFirestoreData(obj);
        set((state) => ({ inquiries: [cleanObj as Inquiry, ...state.inquiries] }));
        try {
          await setDoc(doc(db, 'inquiries', id), cleanObj);
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
        adsTxt: "google.com, pub-6799823492487492, DIRECT, f08c47fec0942fa0",
        naverSiteVerification: "a9a11caab39330cf1a67069dc1c487ed49b767c4",
        googleSiteVerification: "",
        googleAdsenseClient: "ca-pub-6799823492487492",
        ogTitle: "DAILY PULSE | 신뢰할 수 있는 보건의료 소식",
        ogDescription: "우리 가족의 건강을 위한 가장 확실한 맥박, 건강 전문 미디어 데일리펄스입니다.",
        ogImage: ""
      },
      updateSeoSettings: async (settings) => {
        const cleanObj = cleanFirestoreData(settings);
        set({ seoSettings: cleanObj as SeoSettings });
        try {
          await setDoc(doc(db, 'settings', 'seo'), cleanObj, { merge: true });
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

      analytics: getInitialAnalyticsData(),
      globalSearchKeywords: [],
      setGlobalSearchKeywords: (keywords) => set({ globalSearchKeywords: keywords }),
      trackPageView: async () => {
        const todayStr = new Date().toISOString().split('T')[0];
        const device = getDeviceType();
        const referrer = getReferrerDomain();

        // Update local memory state immediately
        set((state) => {
          const dailyViews = { ...(state.analytics?.dailyViews || {}) };
          dailyViews[todayStr] = (dailyViews[todayStr] || 0) + 1;

          const dailyDevices = { ...(state.analytics?.dailyDevices || {}) };
          const dayDev = { ...(dailyDevices[todayStr] || {}) };
          dayDev[device] = (dayDev[device] || 0) + 1;
          dailyDevices[todayStr] = dayDev;

          const devices = { ...(state.analytics?.devices || {}) };
          devices[device] = (devices[device] || 0) + 1;

          const dailyReferrers = { ...(state.analytics?.dailyReferrers || {}) };
          if (referrer !== 'internal') {
            const dayRef = { ...(dailyReferrers[todayStr] || {}) };
            dayRef[referrer] = (dayRef[referrer] || 0) + 1;
            dailyReferrers[todayStr] = dayRef;
          }

          return {
            analytics: {
              dailyViews,
              dailyKeywords: state.analytics?.dailyKeywords || {},
              dailyDevices,
              dailyReferrers,
              keywords: state.analytics?.keywords || {},
              devices
            }
          };
        });

        // Persist real-time visitor event to Firestore database
        try {
          const safeRefKey = referrer !== 'internal' ? referrer.replace(/[\.\#\$\[\]\/]/g, '_') : null;
          const updatePayload: any = {
            [`dailyViews.${todayStr}`]: increment(1),
            [`dailyDevices.${todayStr}.${device}`]: increment(1),
            [`devices.${device}`]: increment(1),
            lastVisitedAt: new Date().toISOString()
          };
          if (safeRefKey) {
            updatePayload[`dailyReferrers.${todayStr}.${safeRefKey}`] = increment(1);
          }
          await setDoc(doc(db, 'analytics', 'summary'), updatePayload, { merge: true });
        } catch (e) {
          // Silent catch for offline or restricted Firestore
        }
      },
      trackSearch: async (keyword) => {
        if (!keyword.trim()) return;
        const kw = keyword.trim();
        const todayStr = new Date().toISOString().split('T')[0];
        const safeKwKey = kw.replace(/[\.\#\$\[\]\/]/g, '_');

        set((state) => {
          const keywords = { ...(state.analytics?.keywords || {}) };
          keywords[kw] = (keywords[kw] || 0) + 1;

          const dailyKeywords = { ...(state.analytics?.dailyKeywords || {}) };
          const dayKw = { ...(dailyKeywords[todayStr] || {}) };
          dayKw[kw] = (dayKw[kw] || 0) + 1;
          dailyKeywords[todayStr] = dayKw;

          return {
            analytics: {
              ...state.analytics,
              keywords,
              dailyKeywords
            }
          };
        });

        try {
          await setDoc(doc(db, 'analytics', 'summary'), {
            [`keywords.${safeKwKey}`]: increment(1),
            [`dailyKeywords.${todayStr}.${safeKwKey}`]: increment(1),
            lastSearchedAt: new Date().toISOString()
          }, { merge: true });
        } catch (e) {}
      },
      resetAnalytics: async () => {
        const emptyAnalytics: AnalyticsData = {
          dailyViews: {},
          dailyKeywords: {},
          dailyDevices: {},
          dailyReferrers: {},
          keywords: {},
          devices: {}
        };
        set({ analytics: emptyAnalytics });
        try {
          await setDoc(doc(db, 'analytics', 'summary'), {
            dailyViews: {},
            dailyKeywords: {},
            dailyDevices: {},
            dailyReferrers: {},
            keywords: {},
            devices: {},
            resetAt: new Date().toISOString()
          });
        } catch (e) {}
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
        analytics: state.analytics,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.articles = sanitizeArticles(state.articles || []);
          state.hasFetchedInitialArticles = true;
          state.isFirebaseSettingsLoaded = true;
          // Clear any remaining legacy seed/mock data (detected by > 100 entries or mock keywords)
          if (state.analytics?.dailyViews && Object.keys(state.analytics.dailyViews).length > 60) {
            state.analytics = getInitialAnalyticsData();
          }
        }
      }
    }
  )
);
