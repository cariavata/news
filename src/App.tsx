import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HelmetProvider, Helmet } from 'react-helmet-async';
import Home from './pages/Home';
import AdminDashboard from './pages/AdminDashboard';
import ArticleForm from './pages/ArticleForm';
import AdminLayout from './components/AdminLayout';
import AdminLogin from './pages/AdminLogin';
import ProtectedRoute from './components/ProtectedRoute';
import AdminCategories from './pages/AdminCategories';
import AdminAds from './pages/AdminAds';
import AdminSEO from './pages/AdminSEO';
import AdminAnalytics from './pages/AdminAnalytics';
import AdminOpinions from './pages/AdminOpinions';
import ArticleDetail from './pages/ArticleDetail';
import CategoryView from './pages/CategoryView';
import SearchResults from './pages/SearchResults';
import AdminCompanyPages from './pages/AdminCompanyPages';
import AdminCompanyPageForm from './pages/AdminCompanyPageForm';
import CompanyPageView from './pages/CompanyPageView';
import AdminInquiries from './pages/AdminInquiries';
import ScrollToTop from './components/ScrollToTop';
import FirebaseSync from './components/FirebaseSync';
import { useAppStore } from './store/useArticleStore';

export default function App() {
  const seoSettings = useAppStore(state => state.seoSettings);
  const isFirebaseSettingsLoaded = useAppStore(state => state.isFirebaseSettingsLoaded);

  const getNaverToken = (input?: string) => {
    if (!input) return 'a9a11caab39330cf1a67069dc1c487ed49b767c4';
    const match = input.match(/content=["']([^"']+)["']/i);
    if (match) return match[1];
    return input.replace(/<[^>]+>/g, '').trim() || input.trim() || 'a9a11caab39330cf1a67069dc1c487ed49b767c4';
  };

  const navToken = getNaverToken(seoSettings.naverSiteVerification);
  
  // Replace newlines and multi-spaces with simple single space for description to prevent parser errors in crawlers
  const cleanDescription = (seoSettings.description || '건강과 관련된 최신 뉴스와 알찬 정보를 지금 바로 확인하세요.').replace(/\s+/g, ' ').trim();
  const cleanOgDescription = (seoSettings.ogDescription || seoSettings.description || '건강과 관련된 최신 뉴스와 알찬 정보를 지금 바로 확인하세요.').replace(/\s+/g, ' ').trim();

  return (
    <HelmetProvider>
      <FirebaseSync />
      
      <Helmet>
        <title>{seoSettings.title || 'DAILY PULSE'}</title>
        <meta name="description" content={cleanDescription} />
        {seoSettings.keywords && <meta name="keywords" content={seoSettings.keywords} />}
        
        {/* Open Graph Tags for SNS Share */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content={seoSettings.ogTitle || seoSettings.title || 'DAILY PULSE'} />
        <meta property="og:description" content={cleanOgDescription} />
        {seoSettings.ogImage && <meta property="og:image" content={seoSettings.ogImage} />}
        {seoSettings.siteName && <meta property="og:site_name" content={seoSettings.siteName} />}

        {navToken && (
          <meta name="naver-site-verification" content={navToken} />
        )}
        {seoSettings.googleAdsenseClient && (
          <meta name="google-adsense-account" content={seoSettings.googleAdsenseClient} />
        )}
      </Helmet>
      
      {seoSettings.googleAdsenseClient && (
        <Helmet>
          <script async src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${seoSettings.googleAdsenseClient}`} crossOrigin="anonymous"></script>
        </Helmet>
      )}

      {!isFirebaseSettingsLoaded ? (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-4">
          <div className="w-10 h-10 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin"></div>
          <span className="text-slate-400 font-medium tracking-wide text-sm">로딩중...</span>
        </div>
      ) : (
        <>
          
          <BrowserRouter>
            <ScrollToTop />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/search" element={<SearchResults />} />
              <Route path="/article/:id" element={<ArticleDetail />} />
              <Route path="/category/:categoryId" element={<CategoryView />} />
              <Route path="/info/:id" element={<CompanyPageView />} />
              <Route path="/admin/login" element={<AdminLogin />} />
              
              {/* Admin Routes */}
              <Route element={<ProtectedRoute />}>
                <Route path="/admin" element={<AdminLayout />}>
                  <Route index element={<AdminDashboard />} />
                  <Route path="analytics" element={<AdminAnalytics />} />
                  <Route path="categories" element={<AdminCategories />} />
                  <Route path="opinions" element={<AdminOpinions />} />
                  <Route path="company-pages" element={<AdminCompanyPages />} />
                  <Route path="company-pages/new" element={<AdminCompanyPageForm />} />
                  <Route path="company-pages/edit/:id" element={<AdminCompanyPageForm />} />
                  <Route path="inquiries" element={<AdminInquiries />} />
                  <Route path="ads" element={<AdminAds />} />
                  <Route path="seo" element={<AdminSEO />} />
                  <Route path="article/new" element={<ArticleForm />} />
                  <Route path="article/:id" element={<ArticleForm />} />
                </Route>
              </Route>
            </Routes>
          </BrowserRouter>
        </>
      )}
    </HelmetProvider>
  );
}
