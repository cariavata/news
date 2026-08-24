import { useEffect } from 'react';
import { collection, onSnapshot, doc, setDoc, updateDoc, deleteDoc, getDocs, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAppStore } from '../store/useArticleStore';
import { fallbackArticles, getFreshFallbackArticles, fallbackCategories, fallbackCompanyPages } from '../data/fallbackData';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: any;
}

const getFallbackArticles = () => [
  {
    id: "1",
    title: "의료계 핫이슈를 한눈에! 데일리펄스 건강 뉴스 브리핑",
    excerpt: "오늘의 주요 보건의료 이슈와 유용한 건강 정리를 쉽게 전달해 드립니다.",
    content: "우리 가족의 건강을 위한 쉽고 유익한 의학 지식을 일상에서 바로 활용하실 수 있도록 자세히 공유하고자 합니다. 최근 보건 복지 정책부터 일상 예방 꿀팁까지 정확한 정보로 보답하겠습니다.",
    categoryId: "checkup",
    imageUrl: "",
    createdAt: "2026-06-12T09:00:00.000Z",
    author: "데일리펄스",
    views: 1240,
    likes: 85,
    isFeatured: true,
    isTrending: true,
    isBreaking: true
  },
  {
    id: "2",
    title: "현대인의 고질병 목·허리 통증 완화하기: 척추관절 자가 케어 가이드",
    excerpt: "오래 앉아 일하는 직장인들을 위한 실생활 올바른 자세와 틈새 스트레칭 팁을 전합니다.",
    content: "잘못된 자세로 인한 디스크 탈출증 및 척추 관절 증후군을 복잡한 이론 대신 매일 3분씩 실천할 수 있는 쉬운 맨몸 회복 훈련으로 정리했습니다. 꾸준한 거북목 예방 스트레칭이 건강한 척추 수명을 늘립니다.",
    categoryId: "spine-joint",
    imageUrl: "",
    createdAt: "2026-06-11T14:30:00.000Z",
    author: "데일리펄스",
    views: 890,
    likes: 42,
    isFeatured: false,
    isTrending: true,
    isBreaking: false
  },
  {
    id: "3",
    title: "건강검진 결과표 완벽 해독법: 나에게 꼭 필요한 검사항목 알아보기",
    excerpt: "복잡한 의학 용어와 숫자로 가득한 종합 건강검진 결과표에서 주의해야 할 핵심 항목을 짚어봅니다.",
    content: "혈압, 콜레스테롤, 공복혈당 수치 등 기초 만성 질환 지표의 정상 범위를 해설하고, 나이대별 맞춤형 추가 정밀검진 가이드라인을 알려 드립니다. 미리 발견하고 예방하는 것이 무엇보다 전인적 건강의 첫걸음입니다.",
    categoryId: "checkup",
    imageUrl: "",
    createdAt: "2026-06-10T10:15:00.000Z",
    author: "데일리펄스",
    views: 1560,
    likes: 112,
    isFeatured: false,
    isTrending: false,
    isBreaking: false
  }
];

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errMsg = error instanceof Error ? error.message : String(error);
  
  const isQuota = errMsg.toLowerCase().includes('quota') || 
                  errMsg.toLowerCase().includes('exhausted') || 
                  errMsg.toLowerCase().includes('limit exceeded') ||
                  errMsg.toLowerCase().includes('429');

  if (isQuota) {
    useAppStore.setState({ isFirebaseSettingsLoaded: true });
    
    // Attempt to load from offline cache first
    try {
      if (path === 'multiple') {
        const cachedStr = localStorage.getItem('__firestore_fallback_cache__');
        if (cachedStr) {
          const cached = JSON.parse(cachedStr);
          useAppStore.setState({
            articles: cached.articles || [],
            categories: cached.categories || [],
            companyPages: cached.companyPages || [],
            adBanners: cached.adBanners || [],
            globalSearchKeywords: cached.globalSearchKeywords || [],
            inquiries: cached.inquiries || [],
            seoSettings: cached.seoSettings || useAppStore.getState().seoSettings
          });
          console.warn(`[Offline Mode] Restored data from local cache.`);
          return;
        }
      }
    } catch (e) {}

    // Provide fallback states to prevent empty UI
    if (path === 'multiple' || path === 'articles') {
      const currentArticles = useAppStore.getState().articles;
      if (!currentArticles || currentArticles.length === 0) {
        useAppStore.setState({ articles: fallbackArticles, hasFetchedInitialArticles: true });
      }
    } 
    if (path === 'multiple' || path === 'categories') {
      const currentCats = useAppStore.getState().categories;
      if (!currentCats || currentCats.length === 0) {
        useAppStore.setState({ categories: fallbackCategories });
      }
    } 
    if (path === 'multiple' || path === 'companyPages') {
      const currentPages = useAppStore.getState().companyPages;
      if (!currentPages || currentPages.length === 0) {
        useAppStore.setState({ companyPages: fallbackCompanyPages });
      }
    }

    console.warn(`[Offline Mode] DB limit reached on path '${path}'. Serving backup content gracefully.`);
    return;
  }

  const errInfo: FirestoreErrorInfo = {
    error: errMsg,
    authInfo: {
      userId: null,
      email: null,
      emailVerified: null,
      isAnonymous: true,
    },
    operationType,
    path
  };

  if (errMsg.includes('unavailable') || errMsg.includes('offline') || errMsg.includes('Could not reach')) {
    console.warn('Firestore is temporarily offline. Continuing with last cached state.');
    return;
  }

  console.error('Database connection message: ', JSON.stringify(errInfo));
}

export default function FirebaseSync() {
  useEffect(() => {
    let isMounted = true;
    
    const loadFirebaseData = async () => {
      const state = useAppStore.getState();
      const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes cache
      
      const isCacheValid = (Date.now() - state.lastFetchTime) < CACHE_TTL_MS;
      
      // If we are fully loaded, cache is valid, and user isn't logged in (admins need fresh data), we skip.
      if (state.isFirebaseSettingsLoaded && state.categories.length > 0 && state.articles.length > 0 && isCacheValid && !state.isAuthenticated) {
        return; 
      }

      try {
        // Sync Articles
        try {
          const articlesSnap = await getDocs(collection(db, 'articles'));
          let fetchedArticles: any[] = [];
          const currentLocal = useAppStore.getState().articles || [];

          if (!articlesSnap.empty) {
            fetchedArticles = articlesSnap.docs.map(doc => ({ ...doc.data(), id: doc.id }) as any);
            fetchedArticles.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
            useAppStore.setState({ articles: fetchedArticles, hasFetchedInitialArticles: true });
          } else {
            useAppStore.setState({ articles: currentLocal, hasFetchedInitialArticles: true });
          }
        } catch (e) {
          console.warn("Error fetching articles from Firestore:", e);
          useAppStore.setState({ hasFetchedInitialArticles: true });
        }

        // Sync Categories
        const catSnap = await getDocs(collection(db, 'categories'));
        const defaultCats = [
          { id: 'checkup', name: '건강검진' },
          { id: 'womens-health', name: '여성건강' },
          { id: 'oriental-med', name: '한의학' },
          { id: 'spine-joint', name: '척추관절' },
          { id: 'cardnews', name: '카드뉴스' },
          { id: 'opinion', name: '오피니언' }
        ];
        const orderMap = new Map(defaultCats.map((c, i) => [c.id, i]));
        
        if (!catSnap.empty) {
          const categories = catSnap.docs.map(doc => ({ ...doc.data(), id: doc.id }) as any);
          const mergedCategories = [...categories];
          defaultCats.forEach(d => {
            if (!mergedCategories.find((c: any) => c.id === d.id)) {
              mergedCategories.push(d);
            }
          });
          mergedCategories.sort((a, b) => {
            const aOrder = a.order !== undefined ? a.order : (orderMap.has(a.id) ? orderMap.get(a.id)! : 999);
            const bOrder = b.order !== undefined ? b.order : (orderMap.has(b.id) ? orderMap.get(b.id)! : 999);
            return aOrder - bOrder;
          });
          useAppStore.setState({ categories: mergedCategories });
        } else {
          useAppStore.setState({ categories: defaultCats });
        }

        // Sync Company Pages
        const pagesSnap = await getDocs(collection(db, 'companyPages'));
        const defaultPages = [
          { id: 'about', title: '소개', content: '회사 소개 내용입니다.' },
          { id: 'guidelines', title: '편집 가이드라인', content: '편집 가이드라인 내용입니다.' },
          { id: 'careers', title: '채용 정보', content: '채용 정보 내용입니다.' },
          { id: 'privacy', title: '개인정보 처리방침 및 약관', content: '약관 내용입니다.' },
        ];
        if (!pagesSnap.empty) {
          const companyPages = pagesSnap.docs.map(doc => ({ ...doc.data(), id: doc.id }) as any);
          const mergedPages = [...companyPages];
          defaultPages.forEach(d => {
            if (!mergedPages.find((p: any) => p.id === d.id)) {
              mergedPages.push(d);
            }
          });
          useAppStore.setState({ companyPages: mergedPages });
        } else {
          useAppStore.setState({ companyPages: defaultPages });
        }

        // Sync Ad Banners
        const adSnap = await getDocs(collection(db, 'adBanners'));
        const adBanners = adSnap.docs.map(doc => ({ ...doc.data(), id: doc.id }) as any);
        useAppStore.setState({ adBanners });

        // Sync Search Keywords
        const kwSnap = await getDocs(collection(db, 'searchKeywords'));
        if (!kwSnap.empty) {
          const keywords = kwSnap.docs.map(doc => ({ ...doc.data(), id: doc.id }) as any);
          useAppStore.getState().setGlobalSearchKeywords(keywords);
        }

        // Sync Inquiries
        const inqSnap = await getDocs(collection(db, 'inquiries'));
        const inquiries = inqSnap.docs.map(doc => ({ ...doc.data(), id: doc.id }) as any);
        inquiries.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        useAppStore.setState({ inquiries });

        // Sync Analytics
        try {
          const analyticsSnap = await getDoc(doc(db, 'analytics', 'global'));
          if (analyticsSnap.exists()) {
            const remoteAnalytics = analyticsSnap.data() as any;
            if (remoteAnalytics && remoteAnalytics.dailyViews) {
              useAppStore.setState(s => ({
                analytics: {
                  dailyViews: { ...s.analytics.dailyViews, ...remoteAnalytics.dailyViews },
                  dailyKeywords: { ...s.analytics.dailyKeywords, ...remoteAnalytics.dailyKeywords },
                  dailyDevices: { ...s.analytics.dailyDevices, ...remoteAnalytics.dailyDevices },
                  dailyReferrers: { ...s.analytics.dailyReferrers, ...remoteAnalytics.dailyReferrers },
                  keywords: { ...s.analytics.keywords, ...remoteAnalytics.keywords },
                  devices: { ...s.analytics.devices, ...remoteAnalytics.devices }
                }
              }));
            }
          }
        } catch(e) {}

        // Sync Seo Settings
        const seoSnap = await getDoc(doc(db, 'settings', 'seo'));
        if (seoSnap.exists()) {
          const data = seoSnap.data() as any;
          useAppStore.setState(state => ({
            seoSettings: { ...state.seoSettings, ...data },
            isFirebaseSettingsLoaded: true,
            lastFetchTime: Date.now()
          }));
        } else {
          useAppStore.setState({ isFirebaseSettingsLoaded: true, lastFetchTime: Date.now() });
        }

        // Write successful full sync to local storage cache for offline mode
        try {
          const updatedState = useAppStore.getState();
          localStorage.setItem('__firestore_fallback_cache__', JSON.stringify({
            articles: updatedState.articles,
            categories: updatedState.categories,
            companyPages: updatedState.companyPages,
            adBanners: updatedState.adBanners,
            globalSearchKeywords: updatedState.globalSearchKeywords,
            inquiries: updatedState.inquiries,
            seoSettings: updatedState.seoSettings
          }));
        } catch (e) {}
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, 'multiple');
      }
    };

    loadFirebaseData();
  }, []);

  return null;
}
