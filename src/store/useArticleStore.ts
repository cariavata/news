import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Article, CategoryInfo, AdBanner, SeoSettings, CompanyPage } from '../types';
import { v4 as uuidv4 } from 'uuid';

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
      addCategory: (name) => set((state) => ({
        categories: [...state.categories, { id: uuidv4(), name }]
      })),
      deleteCategory: (id) => set((state) => ({
        categories: state.categories.filter(c => c.id !== id)
      })),

      articles: [],
      addArticle: (articleData) => set((state) => ({
        articles: [{ ...articleData, id: uuidv4(), createdAt: new Date().toISOString() }, ...state.articles]
      })),
      updateArticle: (id, updatedArticle) => set((state) => ({
        articles: state.articles.map(article => article.id === id ? { ...article, ...updatedArticle } : article)
      })),
      deleteArticle: (id) => set((state) => ({
        articles: state.articles.filter(article => article.id !== id)
      })),

      adBanners: [],
      addAdBanner: (bannerData) => set((state) => ({
        adBanners: [...state.adBanners, { ...bannerData, id: uuidv4() }]
      })),
      deleteAdBanner: (id) => set((state) => ({
        adBanners: state.adBanners.filter(b => b.id !== id)
      })),

      companyPages: [
        { id: 'about', title: '소개', content: '회사 소개 내용입니다.' },
        { id: 'guidelines', title: '편집 가이드라인', content: '편집 가이드라인 내용입니다.' },
        { id: 'careers', title: '채용 정보', content: '채용 정보 내용입니다.' },
        { id: 'privacy', title: '개인정보 처리방침 및 약관', content: '약관 내용입니다.' },
      ],
      addCompanyPage: (pageData) => set((state) => ({
        companyPages: [...state.companyPages, { ...pageData, id: uuidv4() }]
      })),
      updateCompanyPage: (id, pageData) => set((state) => ({
        companyPages: state.companyPages.map(page => page.id === id ? { ...page, ...pageData } : page)
      })),
      deleteCompanyPage: (id) => set((state) => ({
        companyPages: state.companyPages.filter(p => p.id !== id)
      })),

      seoSettings: {
        siteName: 'DAILY PULSE',
        logoUrl: '',
        title: '데일리 펄스 | 신뢰할 수 있는 뉴스',
        description: '연결된 세계에 신선하고 신뢰할 수 있으며 엄격하게 팩트 체크된 저널리즘을 제공합니다.',
        keywords: '뉴스, 건강, 척추관절, 여성건강, 한의학, 건강검진',
        naverSiteVerification: '',
        googleAdsenseClient: '',
        customHeadTags: ''
      },
      updateSeoSettings: (settings) => set({ seoSettings: settings }),
    }),
    {
      name: 'daily-pulse-app-storage',
    }
  )
);
