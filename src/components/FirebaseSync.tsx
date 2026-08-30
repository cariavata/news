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

const sanitizeArticles = (articles: any[]): any[] => {
  if (!Array.isArray(articles)) return [];
  return articles.filter(a => a && typeof a.id === 'string' && a.title);
};

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errMsg = error instanceof Error ? error.message : String(error);
  
  const isQuota = errMsg.toLowerCase().includes('quota') || 
                  errMsg.toLowerCase().includes('exhausted') || 
                  errMsg.toLowerCase().includes('limit exceeded') ||
                  errMsg.toLowerCase().includes('429');

  const isStreamCancelled = errMsg.toLowerCase().includes('cancelled') ||
                            errMsg.toLowerCase().includes('disconnecting idle stream');

  if (isStreamCancelled) {
    // Benign gRPC stream idle timeout / disconnect
    return;
  }

  if (isQuota) {
    useAppStore.setState({ isFirebaseSettingsLoaded: true, hasFetchedInitialArticles: true });
    
    // Attempt to load from offline cache first
    try {
      const cachedStr = localStorage.getItem('__firestore_fallback_cache__');
      if (cachedStr) {
        const cached = JSON.parse(cachedStr);
        const current = useAppStore.getState();
        useAppStore.setState({
          articles: (current.articles && current.articles.length > 0) ? current.articles : sanitizeArticles(cached.articles || []),
          categories: (current.categories && current.categories.length > 0) ? current.categories : (cached.categories || fallbackCategories),
          companyPages: (current.companyPages && current.companyPages.length > 0) ? current.companyPages : (cached.companyPages || fallbackCompanyPages),
          adBanners: (current.adBanners && current.adBanners.length > 0) ? current.adBanners : (cached.adBanners || []),
          seoSettings: cached.seoSettings || current.seoSettings,
          hasFetchedInitialArticles: true,
          isFirebaseSettingsLoaded: true
        });
        return;
      }
    } catch (e) {}

    // Provide default categories/pages if empty
    const current = useAppStore.getState();
    if (!current.categories || current.categories.length === 0) {
      useAppStore.setState({ categories: fallbackCategories });
    }
    if (!current.companyPages || current.companyPages.length === 0) {
      useAppStore.setState({ companyPages: fallbackCompanyPages });
    }

    useAppStore.setState({ hasFetchedInitialArticles: true });
    return;
  }

  if (errMsg.includes('unavailable') || errMsg.includes('offline') || errMsg.includes('Could not reach')) {
    useAppStore.setState({ hasFetchedInitialArticles: true, isFirebaseSettingsLoaded: true });
    return;
  }

  console.warn(`Firestore sync notification (${path}):`, errMsg);
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
            useAppStore.setState({ hasFetchedInitialArticles: true, lastFetchTime: Date.now() });
          }
        },
        (error) => {
          handleFirestoreError(error, OperationType.LIST, 'articles');
        }
      );
      unsubscribes.push(unsubArticles);
    } catch (e) {
      useAppStore.setState({ hasFetchedInitialArticles: true });
    }

    // 2. Real-time Categories Listener
    const defaultCats = fallbackCategories;
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
        (error) => {
          handleFirestoreError(error, OperationType.LIST, 'categories');
        }
      );
      unsubscribes.push(unsubCategories);
    } catch (e) {
      useAppStore.setState({ categories: defaultCats });
    }

    // 3. Real-time Company Pages Listener
    const defaultPages = fallbackCompanyPages;
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
        (error) => {
          handleFirestoreError(error, OperationType.LIST, 'companyPages');
        }
      );
      unsubscribes.push(unsubPages);
    } catch (e) {
      useAppStore.setState({ companyPages: defaultPages });
    }

    // 4. Real-time Ad Banners Listener
    try {
      const unsubAds = onSnapshot(
        collection(db, 'adBanners'),
        (adSnap) => {
          const adBanners = adSnap.docs.map(doc => ({ ...doc.data(), id: doc.id }) as any);
          useAppStore.setState({ adBanners });
        },
        (error) => {
          handleFirestoreError(error, OperationType.LIST, 'adBanners');
        }
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
        (error) => {
          handleFirestoreError(error, OperationType.LIST, 'searchKeywords');
        }
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
          handleFirestoreError(error, OperationType.GET, 'settings/seo');
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
        (error) => {
          handleFirestoreError(error, OperationType.LIST, 'inquiries');
        }
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
