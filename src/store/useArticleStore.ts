import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Article, CategoryInfo, AdBanner, SeoSettings } from '../types';
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

      seoSettings: {
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
