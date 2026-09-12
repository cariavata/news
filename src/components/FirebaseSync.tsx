import { useEffect } from 'react';
import { collection, onSnapshot, doc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAppStore, mergeWithAutoArticles, cleanFirestoreData } from '../store/useArticleStore';
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
        const loadedCats = ((current.categories && current.categories.length > 0) ? current.categories : (cached.categories || fallbackCategories)).filter((c: any) => c.id !== 'cardnews');
        useAppStore.setState({
          articles: (current.articles && current.articles.length > 0) ? current.articles : sanitizeArticles(cached.articles || []),
          categories: loadedCats,
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
            const merged = mergeWithAutoArticles(fetchedArticles);
            useAppStore.setState({ articles: merged, hasFetchedInitialArticles: true, lastFetchTime: Date.now() });
            try {
              localStorage.setItem('__firestore_fallback_cache__', JSON.stringify({
                articles: merged,
                categories: useAppStore.getState().categories,
                companyPages: useAppStore.getState().companyPages,
                adBanners: useAppStore.getState().adBanners,
                seoSettings: useAppStore.getState().seoSettings
              }));
            } catch (e) {}
          } else {
            const merged = mergeWithAutoArticles([]);
            useAppStore.setState({ articles: merged, hasFetchedInitialArticles: true, lastFetchTime: Date.now() });
          }
        },
        (error) => {
          handleFirestoreError(error, OperationType.LIST, 'articles');
        }
      );
      unsubscribes.push(unsubArticles);
    } catch (e) {
      const merged = mergeWithAutoArticles([]);
      useAppStore.setState({ articles: merged, hasFetchedInitialArticles: true });
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
              const found = mergedCategories.find((c: any) => c.id === d.id);
              if (!found) {
                mergedCategories.push(d);
              } else if (!found.name && d.name) {
                found.name = d.name;
              }
            });
            const filteredCategories = mergedCategories.filter((c: any) => c.id !== 'cardnews');
            filteredCategories.sort((a, b) => {
              const aOrder = a.order !== undefined ? a.order : (orderMap.has(a.id) ? orderMap.get(a.id)! : 999);
              const bOrder = b.order !== undefined ? b.order : (orderMap.has(b.id) ? orderMap.get(b.id)! : 999);
              return aOrder - bOrder;
            });
            useAppStore.setState({ categories: filteredCategories });

            // Remerge articles with active categories to guarantee auto-published articles for all preview categories (including opinion)
            const currentArticles = useAppStore.getState().articles;
            const remerged = mergeWithAutoArticles(currentArticles, filteredCategories);
            useAppStore.setState({ articles: remerged });
          } else {
            const cleanDefaults = defaultCats.filter(c => c.id !== 'cardnews');
            useAppStore.setState({ categories: cleanDefaults });
            const currentArticles = useAppStore.getState().articles;
            const remerged = mergeWithAutoArticles(currentArticles, cleanDefaults);
            useAppStore.setState({ articles: remerged });

            // Persist default preview categories to Firestore so they are published to DB
            cleanDefaults.forEach((cat, idx) => {
              setDoc(doc(db, 'categories', cat.id), cleanFirestoreData({ ...cat, order: idx }), { merge: true }).catch(() => {});
            });
          }
        },
        (error) => {
          handleFirestoreError(error, OperationType.LIST, 'categories');
        }
      );
      unsubscribes.push(unsubCategories);
    } catch (e) {
      const cleanDefaults = defaultCats.filter(c => c.id !== 'cardnews');
      useAppStore.setState({ categories: cleanDefaults });
      const currentArticles = useAppStore.getState().articles;
      const remerged = mergeWithAutoArticles(currentArticles, cleanDefaults);
      useAppStore.setState({ articles: remerged });
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
          const targetTitle = '데일리펄스 | 신뢰할 수 있는 보건의료 소식';
          const targetDescription = '정형외과 질환, 필수 건강검진, 산부인과 정보 등 일상생활에 꼭 필요한 최신 의학 뉴스와 알찬 정보를 누구나 알기 쉽게 전달합니다. 매일 아침, 신뢰할 수 있는 건강 소식으로 여러분의 활기찬 하루를 열어드리겠습니다. 지금 바로 데일리 펄스와 함께하세요!';
          
          if (seoSnap.exists()) {
            const data = seoSnap.data() as any;
            let needsUpdate = false;
            const updated = { ...data };

            if (!updated.siteName || updated.siteName === 'DAILY PULSE' || updated.siteName === '더데일리펄스') {
              updated.siteName = '데일리펄스';
              needsUpdate = true;
            }
            if (!updated.title || updated.title === 'DAILY PULSE' || updated.title.includes('DAILY PULSE') || updated.title === '더데일리펄스 | 신뢰할 수 있는 보건의료 소식') {
              updated.title = targetTitle;
              needsUpdate = true;
            }
            if (!updated.description || updated.description.includes('가장 확실한 맥박') || updated.description.includes('정확하고 믿을 수 있는 의료 정보') || updated.description.includes('신선하고 신뢰할 수 있으며')) {
              updated.description = targetDescription;
              needsUpdate = true;
            }
            if (!updated.ogTitle || updated.ogTitle === 'DAILY PULSE' || updated.ogTitle.includes('DAILY PULSE') || updated.ogTitle === '더데일리펄스 | 신뢰할 수 있는 보건의료 소식') {
              updated.ogTitle = targetTitle;
              needsUpdate = true;
            }
            if (!updated.ogDescription || updated.ogDescription.includes('가장 확실한 맥박') || updated.ogDescription.includes('정확하고 믿을 수 있는 의료 정보') || updated.ogDescription.includes('신선하고 신뢰할 수 있으며')) {
              updated.ogDescription = targetDescription;
              needsUpdate = true;
            }

            if (needsUpdate) {
              setDoc(doc(db, 'settings', 'seo'), updated, { merge: true }).catch(() => {});
            }

            useAppStore.setState(state => ({
              seoSettings: { ...state.seoSettings, ...updated },
              isFirebaseSettingsLoaded: true,
              lastFetchTime: Date.now()
            }));
          } else {
            const defaultSeo = {
              siteName: '데일리펄스',
              title: targetTitle,
              description: targetDescription,
              ogTitle: targetTitle,
              ogDescription: targetDescription,
              homeIntroText: targetDescription,
              homeIntroEnabled: true
            };
            setDoc(doc(db, 'settings', 'seo'), defaultSeo, { merge: true }).catch(() => {});
            useAppStore.setState(state => ({
              seoSettings: { ...state.seoSettings, ...defaultSeo },
              isFirebaseSettingsLoaded: true,
              lastFetchTime: Date.now()
            }));
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

    // 8. Real-time Analytics Statistics Listener (Cross-client Real Visitor Counts)
    try {
      const unsubAnalytics = onSnapshot(
        doc(db, 'analytics', 'summary'),
        (analyticsSnap) => {
          if (analyticsSnap.exists()) {
            const data = analyticsSnap.data() as any;
            
            // Clean up dot replacements in referrers and keywords
            const restoredReferrers: Record<string, Record<string, number>> = {};
            if (data.dailyReferrers) {
              for (const [dateKey, refs] of Object.entries(data.dailyReferrers as Record<string, Record<string, number>>)) {
                restoredReferrers[dateKey] = {};
                for (const [rKey, count] of Object.entries(refs || {})) {
                  const origKey = rKey.replace(/_/g, '.');
                  restoredReferrers[dateKey][origKey] = count;
                }
              }
            }

            useAppStore.setState(state => ({
              analytics: {
                dailyViews: data.dailyViews || {},
                dailyKeywords: data.dailyKeywords || {},
                dailyDevices: data.dailyDevices || {},
                dailyReferrers: Object.keys(restoredReferrers).length > 0 ? restoredReferrers : (data.dailyReferrers || {}),
                keywords: data.keywords || {},
                devices: data.devices || {}
              }
            }));
          }
        },
        (error) => {
          // Silent catch for analytics sync
        }
      );
      unsubscribes.push(unsubAnalytics);
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
