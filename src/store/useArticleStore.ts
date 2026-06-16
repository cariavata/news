import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { Article, CategoryInfo, AdBanner, SeoSettings, CompanyPage, Inquiry } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../lib/firebase';
import { doc, setDoc, deleteDoc, updateDoc, increment, getDoc, query, orderBy, limit, startAfter, where, getDocs, collection } from 'firebase/firestore';

export interface AnalyticsData {
  dailyViews: Record<string, number>;
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

const logDbError = (context: string, error: any) => {
  const errMsg = error instanceof Error ? error.message : String(error);
  const isQuota = errMsg.toLowerCase().includes('quota') || 
                  errMsg.toLowerCase().includes('exhausted') || 
                  errMsg.toLowerCase().includes('limit exceeded') ||
                  errMsg.toLowerCase().includes('429');
  if (isQuota) {
    useAppStore.setState({ isQuotaExceeded: true });
    console.warn(`[NoSQL Quota Exceeded] ${context} was bypassed. Error: ${errMsg}`);
  } else {
    console.warn(`[NoSQL Warning] ${context}: ${errMsg}`);
  }
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
  addArticle: (article: Omit<Article, 'id' | 'createdAt'>) => void;
  updateArticle: (id: string, article: Partial<Article>) => void;
  deleteArticle: (id: string) => void;
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
  updateSeoSettings: (settings: SeoSettings) => void;

  isFirebaseSettingsLoaded: boolean;
  setFirebaseSettingsLoaded: (loaded: boolean) => void;

  isQuotaExceeded: boolean;
  setQuotaExceeded: (exceeded: boolean) => void;

  analytics: AnalyticsData;
  globalSearchKeywords: SearchKeywordData[];
  setGlobalSearchKeywords: (keywords: SearchKeywordData[]) => void;
  trackPageView: () => void;
  trackSearch: (keyword: string) => void;
  resetAnalytics: () => void;
}

const defaultCategories: CategoryInfo[] = [
  { id: 'checkup', name: '건강검진' },
  { id: 'womens-health', name: '여성건강' },
  { id: 'oriental-med', name: '한의학' },
  { id: 'spine-joint', name: '척추관절' },
  { id: 'cardnews', name: '카드뉴스' },
  { id: 'opinion', name: '오피니언' }
];

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      login: () => set({ isAuthenticated: true }),
      logout: () => set({ isAuthenticated: false }),

      categories: defaultCategories,
      addCategory: (name) => {
        const id = uuidv4();
        // Give new category an order to append it
        const currentCategories = useAppStore.getState().categories;
        const maxOrder = currentCategories.reduce((max, c) => Math.max(max, c.order ?? 999), -1);
        const order = maxOrder === -1 || maxOrder === 999 ? currentCategories.length : maxOrder + 1;
        const obj = { id, name, order };
        setDoc(doc(db, 'categories', id), obj).catch(e => logDbError("writing category", e));
        set((state) => ({ categories: [...state.categories, obj] }));
      },
      updateCategory: (id, updates) => {
        updateDoc(doc(db, 'categories', id), updates).catch(e => logDbError("updating category", e));
        set((state) => ({
          categories: state.categories.map(c => c.id === id ? { ...c, ...updates } : c)
        }));
      },
      deleteCategory: (id) => {
        deleteDoc(doc(db, 'categories', id)).catch(e => logDbError("deleting category", e));
        set((state) => ({ categories: state.categories.filter(c => c.id !== id) }));
      },

      articles: [],
      hasFetchedInitialArticles: false,
      categoryFetchStatus: {},
      fetchInitialArticles: async () => {
        const state = useAppStore.getState();
        if (state.hasFetchedInitialArticles) return;
        try {
          const q = query(collection(db, 'articles'), orderBy('createdAt', 'desc'), limit(50));
          const snap = await getDocs(q);
          const newArticles = snap.docs.map(d => ({ ...d.data(), id: d.id } as Article));
          set({ articles: newArticles, hasFetchedInitialArticles: true });
        } catch (error) {
          logDbError("fetching initial articles", error);
        }
      },
      fetchArticlesByCategory: async (categoryId: string, loadMore = false) => {
        const state = useAppStore.getState();
        const status = state.categoryFetchStatus[categoryId] || { hasFetchedInitial: false, lastVisible: null, hasMore: true };
        
        if (!loadMore && status.hasFetchedInitial) return;
        if (loadMore && !status.hasMore) return;

        try {
          let q = query(
            collection(db, 'articles'), 
            where('categoryId', '==', categoryId),
            orderBy('createdAt', 'desc'),
            limit(10)
          );

          if (loadMore && status.lastVisible) {
            q = query(q, startAfter(status.lastVisible));
          }

          const snap = await getDocs(q);
          const fetchedArticles = snap.docs.map(d => ({ ...d.data(), id: d.id } as Article));
          
          const newLastVisible = snap.docs.length > 0 ? snap.docs[snap.docs.length - 1] : null;
          const hasMore = snap.docs.length === 10;
          
          set((s) => {
            const existingIds = new Set(s.articles.map(a => a.id));
            const toAdd = fetchedArticles.filter(a => !existingIds.has(a.id));
            return {
              articles: [...s.articles, ...toAdd].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
              categoryFetchStatus: {
                ...s.categoryFetchStatus,
                [categoryId]: {
                  hasFetchedInitial: true,
                  lastVisible: newLastVisible,
                  hasMore
                }
              }
            };
          });
        } catch (error) {
          logDbError("fetching articles by category", error);
        }
      },
      fetchArticleById: async (id: string) => {
        const state = useAppStore.getState();
        if (state.articles.find(a => a.id === id)) return;
        try {
          const docRef = doc(db, 'articles', id);
          const snap = await getDoc(docRef);
          if (snap.exists()) {
            const article = { ...snap.data(), id: snap.id } as Article;
            set((s) => ({
              articles: [...s.articles, article].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            }));
          }
        } catch (error) {
          logDbError("fetching article by id", error);
        }
      },
      addArticle: (articleData) => {
        const currentArticles = useAppStore.getState().articles || [];
        const numericIds = currentArticles
          .filter(a => /^\d+$/.test(String(a.id)))
          .map(a => parseInt(a.id, 10));
        const maxId = numericIds.length > 0 ? Math.max(...numericIds) : 0;
        const id = String(maxId + 1);
        const obj = { ...articleData, id, createdAt: new Date().toISOString() };
        setDoc(doc(db, 'articles', id), obj).catch(e => logDbError("adding article", e));
        set((state) => ({ articles: [obj, ...state.articles] }));
      },
      updateArticle: (id, updatedArticle) => {
        // Strip undefined values to prevent Firebase FieldValue errors
        const safeUpdates = { ...updatedArticle };
        Object.keys(safeUpdates).forEach(key => {
          if (safeUpdates[key as keyof typeof safeUpdates] === undefined) {
            delete safeUpdates[key as keyof typeof safeUpdates];
          }
        });
        
        updateDoc(doc(db, 'articles', id), safeUpdates).catch(e => logDbError("updating article", e));
        set((state) => ({
          articles: state.articles.map(article => article.id === id ? { ...article, ...updatedArticle } : article)
        }));
      },
      deleteArticle: (id) => {
        deleteDoc(doc(db, 'articles', id)).catch(e => logDbError("deleting article", e));
        set((state) => ({ articles: state.articles.filter(article => article.id !== id) }));
      },
      incrementArticleViews: (id: string) => {
        // Optimistic update
        set((state) => ({
          articles: state.articles.map(article => 
            article.id === id ? { ...article, views: (article.views || 0) + 1 } : article
          )
        }));
        // Update in DB safely with increment
        updateDoc(doc(db, 'articles', id), { views: increment(1) }).catch(e => logDbError("incrementing views", e));
      },
      toggleArticleLike: (id: string, isLiking: boolean) => {
        const change = isLiking ? 1 : -1;
        set((state) => ({
          articles: state.articles.map(article => 
            article.id === id ? { ...article, likes: Math.max(0, (article.likes || 0) + change) } : article
          )
        }));
        // Update in DB safely with increment
        updateDoc(doc(db, 'articles', id), { likes: increment(change) }).catch(e => logDbError("toggling likes", e));
      },

      adBanners: [],
      addAdBanner: (bannerData) => {
        const id = uuidv4();
        const obj = { ...bannerData, id };
        setDoc(doc(db, 'adBanners', id), obj).catch(e => logDbError("adding ad banner", e));
        set((state) => ({ adBanners: [...state.adBanners, obj] }));
      },
      deleteAdBanner: (id) => {
        deleteDoc(doc(db, 'adBanners', id)).catch(e => logDbError("deleting ad banner", e));
        set((state) => ({ adBanners: state.adBanners.filter(b => b.id !== id) }));
      },

      companyPages: [
        { id: 'about', title: '소개', content: '회사 소개 내용입니다.' },
        { id: 'guidelines', title: '편집 가이드라인', content: '편집 가이드라인 내용입니다.' },
        { id: 'careers', title: '채용 정보', content: '채용 정보 내용입니다.' },
        { id: 'privacy', title: '개인정보 처리방침 및 약관', content: '약관 내용입니다.' },
      ],
      addCompanyPage: (pageData) => {
        const id = uuidv4();
        const obj = { ...pageData, id };
        setDoc(doc(db, 'companyPages', id), obj).catch(e => logDbError("adding page", e));
        set((state) => ({ companyPages: [...state.companyPages, obj] }));
      },
      updateCompanyPage: (id, pageData) => {
        updateDoc(doc(db, 'companyPages', id), pageData).catch(e => logDbError("updating page", e));
        set((state) => ({
          companyPages: state.companyPages.map(page => page.id === id ? { ...page, ...pageData } : page)
        }));
      },
      deleteCompanyPage: (id) => {
        deleteDoc(doc(db, 'companyPages', id)).catch(e => logDbError("deleting page", e));
        set((state) => ({ companyPages: state.companyPages.filter(p => p.id !== id) }));
      },

      inquiries: [],
      addInquiry: (inquiryData) => {
        const id = uuidv4();
        const obj = { ...inquiryData, id, createdAt: new Date().toISOString() };
        setDoc(doc(db, 'inquiries', id), obj).catch(e => logDbError("adding inquiry", e));
        set((state) => ({ inquiries: [obj, ...state.inquiries] }));
      },
      deleteInquiry: (id) => {
        deleteDoc(doc(db, 'inquiries', id)).catch(e => logDbError("deleting inquiry", e));
        set((state) => ({ inquiries: state.inquiries.filter(i => i.id !== id) }));
      },
      deleteMultipleInquiries: (ids) => {
        ids.forEach(id => deleteDoc(doc(db, 'inquiries', id)).catch(e => logDbError("deleting inquiries", e)));
        set((state) => ({ inquiries: state.inquiries.filter(i => !ids.includes(i.id)) }));
      },

      seoSettings: {
        siteName: 'DAILY PULSE',
        logoUrl: '',
        title: '데일리 펄스 | 신뢰할 수 있는 뉴스',
        description: '연결된 세계에 신선하고 신뢰할 수 있으며 엄격하게 팩트 체크된 저널리즘을 제공합니다.',
        keywords: '뉴스, 건강, 척추관절, 여성건강, 한의학, 건강검진',
        naverSiteVerification: '',
        googleAdsenseClient: '',
        customHeadTags: '',
        robotsTxt: 'User-agent: *\nAllow: /',
        adsTxt: '',
        sitemapXml: '',
        rssXml: '',
        ogTitle: 'DAILY PULSE',
        ogDescription: '건강과 관련된 최신 뉴스를 전달합니다.',
        ogImage: '',
        homeIntroText: '연결된 세계에 신선하고 신뢰할 수 있으며 엄격하게 팩트 체크된 저널리즘을 제공합니다.',
        homeIntroEnabled: true
      },
      updateSeoSettings: (settings) => {
        setDoc(doc(db, 'settings', 'seo'), settings).catch(e => logDbError("updating SEO settings", e));
        set({ seoSettings: settings });
      },

      isFirebaseSettingsLoaded: false,
      setFirebaseSettingsLoaded: (loaded) => set({ isFirebaseSettingsLoaded: loaded }),

      isQuotaExceeded: false,
      setQuotaExceeded: (exceeded) => set({ isQuotaExceeded: exceeded }),

      analytics: { dailyViews: {}, keywords: {}, devices: {} },
      globalSearchKeywords: [],
      setGlobalSearchKeywords: (keywords) => set({ globalSearchKeywords: keywords }),
      trackPageView: () => {
        if (typeof window === 'undefined') return;
        set((state) => {
          const today = new Date().toISOString().split('T')[0];
          const isMobile = /Mobi|Android/i.test(navigator.userAgent);
          const isTablet = /iPad|Tablet/i.test(navigator.userAgent);
          const device = isTablet ? 'Tab' : isMobile ? 'Mo' : 'PC';
          
          return {
            analytics: {
              ...state.analytics,
              dailyViews: {
                ...state.analytics.dailyViews,
                [today]: (state.analytics.dailyViews[today] || 0) + 1
              },
              devices: {
                ...state.analytics.devices,
                [device]: (state.analytics.devices[device] || 0) + 1
              }
            }
          };
        });
      },
      trackSearch: (keyword) => {
        if (!keyword.trim()) return;
        const kw = keyword.trim();
        set((state) => ({
          analytics: {
            ...state.analytics,
            keywords: {
              ...state.analytics.keywords,
              [kw]: (state.analytics.keywords[kw] || 0) + 1
            }
          }
        }));
        
        // Sync to Firestore
        const docRef = doc(db, 'searchKeywords', kw);
        getDoc(docRef).then(docSnap => {
          if (!docSnap.exists()) {
            setDoc(docRef, {
              keyword: kw,
              count: 1,
              lastSearchedAt: new Date().toISOString(),
              createdAt: new Date().toISOString()
            });
          } else {
            updateDoc(docRef, {
              count: increment(1),
              lastSearchedAt: new Date().toISOString()
            });
          }
        }).catch(e => logDbError("tracking search keyword", e));
      },
      resetAnalytics: () => set({ 
        analytics: { dailyViews: {}, keywords: {}, devices: {} } 
      }),
    }),
    {
      name: 'daily-pulse-app-storage-v3',
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        analytics: state.analytics,
      })
    }
  )
);
