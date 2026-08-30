import { useEffect } from 'react';
import { collection, onSnapshot, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAppStore } from '../store/useArticleStore';
import { fallbackCategories, fallbackCompanyPages } from '../data/fallbackData';

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

const sanitizeArticles = (articles: any[]): any[] => {
  if (!Array.isArray(articles)) return [];
  return articles.filter(a => a && typeof a.id === 'string' && !a.id.startsWith('fb-') && a.id !== '1' && a.id !== '2' && a.id !== '3');
};

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
            articles: sanitizeArticles(cached.articles || []),
            categories: cached.categories || [],
            companyPages: cached.companyPages || [],
            adBanners: cached.adBanners || [],
            globalSearchKeywords: cached.globalSearchKeywords || [],
            inquiries: cached.inquiries || [],
            seoSettings: cached.seoSettings || useAppStore.getState().seoSettings,
            hasFetchedInitialArticles: true
          });
          console.warn(`[Offline Mode] Restored data from local cache.`);
          return;
        }
      }
    } catch (e) {}

    // Provide default categories/pages if empty
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

    useAppStore.setState({ hasFetchedInitialArticles: true });
    console.warn(`[Offline Mode] DB limit reached on path '${path}'.`);
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
    const unsubscribes: (() => void)[] = [];

    // 1. Real-time Articles Listener
    try {
      const unsubArticles = onSnapshot(
        collection(db, 'articles'),
        (snapshot) => {
          if (!snapshot.empty) {
            const raw = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }) as any);
            const fetchedArticles = sanitizeArticles(raw);
            fetchedArticles.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
            useAppStore.setState({ articles: fetchedArticles, hasFetchedInitialArticles: true, lastFetchTime: Date.now() });
            try {
              localStorage.setItem('__firestore_fallback_cache__', JSON.stringify({
                articles: fetchedArticles,
                categories: useAppStore.getState().categories,
                companyPages: useAppStore.getState().companyPages,
                adBanners: useAppStore.getState().adBanners,
                seoSettings: useAppStore.getState().seoSettings
              }));
            } catch (e) {}
          } else {
            const current = useAppStore.getState().articles;
            if (!current || current.length === 0) {
              useAppStore.setState({ hasFetchedInitialArticles: true, lastFetchTime: Date.now() });
            } else {
              useAppStore.setState({ hasFetchedInitialArticles: true, lastFetchTime: Date.now() });
            }
          }
        },
        (error) => {
          console.warn("Real-time articles subscription error:", error);
          handleFirestoreError(error, OperationType.LIST, 'articles');
          useAppStore.setState({ hasFetchedInitialArticles: true });
        }
      );
      unsubscribes.push(unsubArticles);
    } catch (e) {
      console.warn("Could not attach articles listener:", e);
      useAppStore.setState({ hasFetchedInitialArticles: true });
    }

    // 2. Real-time Categories Listener
    const defaultCats = [
      { id: 'checkup', name: '건강검진' },
      { id: 'womens-health', name: '여성건강' },
      { id: 'oriental-med', name: '한의학' },
      { id: 'spine-joint', name: '척추관절' },
      { id: 'cardnews', name: '카드뉴스' },
      { id: 'opinion', name: '오피니언' }
    ];
    const orderMap = new Map(defaultCats.map((c, i) => [c.id, i]));

    try {
      const unsubCategories = onSnapshot(
        collection(db, 'categories'),
        (catSnap) => {
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
        },
        (error) => console.warn("Real-time categories error:", error)
      );
      unsubscribes.push(unsubCategories);
    } catch (e) {
      console.warn("Could not attach categories listener:", e);
    }

    // 3. Real-time Company Pages Listener
    const defaultPages = [
      { id: 'about', title: '소개', content: '데일리펄스는 독자 여러분께 정확하고 유용한 보건의료 뉴스 및 일상 건강 지식을 제공합니다.' },
      { id: 'guidelines', title: '편집 가이드라인', content: '독립적이고 객관적인 시각에서 팩트에 기반한 저널리즘을 준수합니다.' },
      { id: 'careers', title: '채용 정보', content: '데일리펄스와 함께 새로운 저널리즘의 미래를 만들어갈 인재를 기다립니다.' },
      { id: 'privacy', title: '개인정보 처리방침 및 약관', content: '고객님의 개인정보 보호를 최우선으로 생각합니다.' },
    ];
    try {
      const unsubPages = onSnapshot(
        collection(db, 'companyPages'),
        (pagesSnap) => {
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
        },
        (error) => console.warn("Real-time pages error:", error)
      );
      unsubscribes.push(unsubPages);
    } catch (e) {
      console.warn("Could not attach pages listener:", e);
    }

    // 4. Real-time Ad Banners Listener
    try {
      const unsubAds = onSnapshot(
        collection(db, 'adBanners'),
        (adSnap) => {
          const adBanners = adSnap.docs.map(doc => ({ ...doc.data(), id: doc.id }) as any);
          useAppStore.setState({ adBanners });
        },
        (error) => console.warn("Real-time ads error:", error)
      );
      unsubscribes.push(unsubAds);
    } catch (e) {}

    // 5. Real-time Search Keywords Listener
    try {
      const unsubKeywords = onSnapshot(
        collection(db, 'searchKeywords'),
        (kwSnap) => {
          if (!kwSnap.empty) {
            const keywords = kwSnap.docs.map(doc => ({ ...doc.data(), id: doc.id }) as any);
            useAppStore.getState().setGlobalSearchKeywords(keywords);
          }
        },
        (error) => console.warn("Real-time keywords error:", error)
      );
      unsubscribes.push(unsubKeywords);
    } catch (e) {}

    // 6. Real-time SEO Settings Listener
    try {
      const unsubSeo = onSnapshot(
        doc(db, 'settings', 'seo'),
        (seoSnap) => {
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
        },
        (error) => {
          console.warn("Real-time SEO settings error:", error);
          useAppStore.setState({ isFirebaseSettingsLoaded: true });
        }
      );
      unsubscribes.push(unsubSeo);
    } catch (e) {
      useAppStore.setState({ isFirebaseSettingsLoaded: true });
    }

    // 7. Real-time Inquiries Listener
    try {
      const unsubInquiries = onSnapshot(
        collection(db, 'inquiries'),
        (inqSnap) => {
          const inquiries = inqSnap.docs.map(doc => ({ ...doc.data(), id: doc.id }) as any);
          inquiries.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          useAppStore.setState({ inquiries });
        },
        (error) => console.warn("Real-time inquiries error:", error)
      );
      unsubscribes.push(unsubInquiries);
    } catch (e) {}

    // Cleanup all subscriptions when component unmounts
    return () => {
      unsubscribes.forEach(unsub => {
        try {
          unsub();
        } catch (e) {}
      });
    };
  }, []);

  return null;
}

