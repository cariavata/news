import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Article, CategoryInfo, AdBanner, SeoSettings, CompanyPage } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../lib/firebase';
import { doc, setDoc, deleteDoc, updateDoc } from 'firebase/firestore';

export interface AnalyticsData {
  dailyViews: Record<string, number>;
  keywords: Record<string, number>;
  devices: Record<string, number>;
}

interface AppState {
  isAuthenticated: boolean;
  login: () => void;
  logout: () => void;

  categories: CategoryInfo[];
  addCategory: (name: string) => void;
  deleteCategory: (id: string) => void;

  articles: Article[];
  addArticle: (article: Omit<Article, 'id' | 'createdAt'>) => void;
  updateArticle: (id: string, article: Partial<Article>) => void;
  deleteArticle: (id: string) => void;

  adBanners: AdBanner[];
  addAdBanner: (banner: Omit<AdBanner, "id">) => void;
  deleteAdBanner: (id: string) => void;

  companyPages: CompanyPage[];
  addCompanyPage: (page: Omit<CompanyPage, "id">) => void;
  updateCompanyPage: (id: string, page: Partial<CompanyPage>) => void;
  deleteCompanyPage: (id: string) => void;

  seoSettings: SeoSettings;
  updateSeoSettings: (settings: SeoSettings) => void;

  analytics: AnalyticsData;
  trackPageView: () => void;
  trackSearch: (keyword: string) => void;
  resetAnalytics: () => void;
}

const defaultCategories: CategoryInfo[] = [
  { id: 'spine-joint', name: '척추관절' },
  { id: 'womens-health', name: '여성건강' },
  { id: 'oriental-med', name: '한의학' },
  { id: 'checkup', name: '건강검진' }
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
        const obj = { id, name };
        setDoc(doc(db, 'categories', id), obj).catch(e => console.error("Error writing category: ", e));
        set((state) => ({ categories: [...state.categories, obj] }));
      },
      deleteCategory: (id) => {
        deleteDoc(doc(db, 'categories', id)).catch(e => console.error("Error deleting category: ", e));
        set((state) => ({ categories: state.categories.filter(c => c.id !== id) }));
      },

      articles: [],
      addArticle: (articleData) => {
        const id = uuidv4();
        const obj = { ...articleData, id, createdAt: new Date().toISOString() };
        setDoc(doc(db, 'articles', id), obj).catch(e => console.error("Error adding article: ", e));
        set((state) => ({ articles: [obj, ...state.articles] }));
      },
      updateArticle: (id, updatedArticle) => {
        updateDoc(doc(db, 'articles', id), updatedArticle).catch(e => console.error("Error updating article: ", e));
        set((state) => ({
          articles: state.articles.map(article => article.id === id ? { ...article, ...updatedArticle } : article)
        }));
      },
      deleteArticle: (id) => {
        deleteDoc(doc(db, 'articles', id)).catch(e => console.error("Error deleting article: ", e));
        set((state) => ({ articles: state.articles.filter(article => article.id !== id) }));
      },

      adBanners: [],
      addAdBanner: (bannerData) => {
        const id = uuidv4();
        const obj = { ...bannerData, id };
        setDoc(doc(db, 'adBanners', id), obj).catch(e => console.error("Error adding banner: ", e));
        set((state) => ({ adBanners: [...state.adBanners, obj] }));
      },
      deleteAdBanner: (id) => {
        deleteDoc(doc(db, 'adBanners', id)).catch(e => console.error("Error deleting banner: ", e));
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
        setDoc(doc(db, 'companyPages', id), obj).catch(e => console.error("Error adding page: ", e));
        set((state) => ({ companyPages: [...state.companyPages, obj] }));
      },
      updateCompanyPage: (id, pageData) => {
        updateDoc(doc(db, 'companyPages', id), pageData).catch(e => console.error("Error updating page: ", e));
        set((state) => ({
          companyPages: state.companyPages.map(page => page.id === id ? { ...page, ...pageData } : page)
        }));
      },
      deleteCompanyPage: (id) => {
        deleteDoc(doc(db, 'companyPages', id)).catch(e => console.error("Error deleting page: ", e));
        set((state) => ({ companyPages: state.companyPages.filter(p => p.id !== id) }));
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
        ogImage: ''
      },
      updateSeoSettings: (settings) => {
        setDoc(doc(db, 'settings', 'seo'), settings);
        set({ seoSettings: settings });
      },

      analytics: { dailyViews: {}, keywords: {}, devices: {} },
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
      trackSearch: (keyword) => set((state) => ({
        analytics: {
          ...state.analytics,
          keywords: {
            ...state.analytics.keywords,
            [keyword]: (state.analytics.keywords[keyword] || 0) + 1
          }
        }
      })),
      resetAnalytics: () => set({ 
        analytics: { dailyViews: {}, keywords: {}, devices: {} } 
      }),
    }),
    {
      name: 'daily-pulse-app-storage',
    }
  )
);
