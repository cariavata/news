import { useEffect } from 'react';
import { collection, onSnapshot, doc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAppStore } from '../store/useArticleStore';

export default function FirebaseSync() {
  useEffect(() => {
    // Sync Articles
    const unsubArticles = onSnapshot(collection(db, 'articles'), (snapshot) => {
      const articles = snapshot.docs.map(doc => doc.data() as any);
      articles.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      useAppStore.setState({ articles });
    });
    
    // Sync Categories
    const unsubCategories = onSnapshot(collection(db, 'categories'), (snapshot) => {
      if (!snapshot.empty) {
        const categories = snapshot.docs.map(doc => doc.data() as any);
        useAppStore.setState({ categories });
      } else {
        const defaults = useAppStore.getState().categories;
        defaults.forEach(c => setDoc(doc(db, 'categories', c.id), c));
      }
    });

    // Sync Company Pages
    const unsubPages = onSnapshot(collection(db, 'companyPages'), (snapshot) => {
      if (!snapshot.empty) {
        const companyPages = snapshot.docs.map(doc => doc.data() as any);
        useAppStore.setState({ companyPages });
      } else {
        const defaults = useAppStore.getState().companyPages;
        defaults.forEach(p => setDoc(doc(db, 'companyPages', p.id), p));
      }
    });

    // Sync Ad Banners
    const unsubAdBanners = onSnapshot(collection(db, 'adBanners'), (snapshot) => {
      const adBanners = snapshot.docs.map(doc => doc.data() as any);
      useAppStore.setState({ adBanners });
    });

    // Sync Seo Settings
    const unsubSeo = onSnapshot(doc(db, 'settings', 'seo'), (docSnap) => {
      if (docSnap.exists()) {
        useAppStore.setState({ seoSettings: docSnap.data() as any });
      } else {
        setDoc(doc(db, 'settings', 'seo'), useAppStore.getState().seoSettings);
      }
    });
    
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
