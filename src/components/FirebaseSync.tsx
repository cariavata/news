import { useEffect } from 'react';
import { collection, onSnapshot, doc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAppStore } from '../store/useArticleStore';

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

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: null,
      email: null,
      emailVerified: null,
      isAnonymous: true,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export default function FirebaseSync() {
  useEffect(() => {
    // Sync Articles
    const unsubArticles = onSnapshot(collection(db, 'articles'), (snapshot) => {
      const articles = snapshot.docs.map(doc => doc.data() as any);
      articles.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      useAppStore.setState({ articles });
    }, (error) => handleFirestoreError(error, OperationType.GET, 'articles'));
    
    // Sync Categories
    const unsubCategories = onSnapshot(collection(db, 'categories'), (snapshot) => {
      if (!snapshot.empty) {
        const categories = snapshot.docs.map(doc => doc.data() as any);
        useAppStore.setState({ categories });
      } else {
        const defaults = useAppStore.getState().categories;
        defaults.forEach(c => setDoc(doc(db, 'categories', c.id), c).catch(e => handleFirestoreError(e, OperationType.WRITE, 'categories')));
      }
    }, (error) => handleFirestoreError(error, OperationType.GET, 'categories'));

    // Sync Company Pages
    const unsubPages = onSnapshot(collection(db, 'companyPages'), (snapshot) => {
      if (!snapshot.empty) {
        const companyPages = snapshot.docs.map(doc => doc.data() as any);
        useAppStore.setState({ companyPages });
      } else {
        const defaults = useAppStore.getState().companyPages;
        defaults.forEach(p => setDoc(doc(db, 'companyPages', p.id), p).catch(e => handleFirestoreError(e, OperationType.WRITE, 'companyPages')));
      }
    }, (error) => handleFirestoreError(error, OperationType.GET, 'companyPages'));

    // Sync Ad Banners
    const unsubAdBanners = onSnapshot(collection(db, 'adBanners'), (snapshot) => {
      const adBanners = snapshot.docs.map(doc => doc.data() as any);
      useAppStore.setState({ adBanners });
    }, (error) => handleFirestoreError(error, OperationType.GET, 'adBanners'));

    // Sync Seo Settings
    const unsubSeo = onSnapshot(doc(db, 'settings', 'seo'), (docSnap) => {
      if (docSnap.exists()) {
        useAppStore.setState({ seoSettings: docSnap.data() as any });
      } else {
        setDoc(doc(db, 'settings', 'seo'), useAppStore.getState().seoSettings).catch(e => handleFirestoreError(e, OperationType.WRITE, 'settings/seo'));
      }
    }, (error) => handleFirestoreError(error, OperationType.GET, 'settings/seo'));
    
    return () => {
      unsubArticles();
      unsubCategories();
      unsubPages();
      unsubAdBanners();
      unsubSeo();
    };
  }, []);

  return null;
}
