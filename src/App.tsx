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
import ArticleDetail from './pages/ArticleDetail';
import CategoryView from './pages/CategoryView';
import SearchResults from './pages/SearchResults';
import AdminCompanyPages from './pages/AdminCompanyPages';
import AdminCompanyPageForm from './pages/AdminCompanyPageForm';
import CompanyPageView from './pages/CompanyPageView';
import ScrollToTop from './components/ScrollToTop';
import { useAppStore } from './store/useArticleStore';

export default function App() {
  const seoSettings = useAppStore(state => state.seoSettings);

  return (
    <HelmetProvider>
      <Helmet>
        <title>{seoSettings.title}</title>
        <meta name="description" content={seoSettings.description} />
        <meta name="keywords" content={seoSettings.keywords} />
        {seoSettings.naverSiteVerification && (
          <meta name="naver-site-verification" content={seoSettings.naverSiteVerification} />
        )}
        {seoSettings.googleAdsenseClient && (
          <meta name="google-adsense-account" content={seoSettings.googleAdsenseClient} />
        )}
      </Helmet>
      
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
              <Route path="company-pages" element={<AdminCompanyPages />} />
              <Route path="company-pages/new" element={<AdminCompanyPageForm />} />
              <Route path="company-pages/edit/:id" element={<AdminCompanyPageForm />} />
              <Route path="ads" element={<AdminAds />} />
              <Route path="seo" element={<AdminSEO />} />
              <Route path="article/new" element={<ArticleForm />} />
              <Route path="article/:id" element={<ArticleForm />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </HelmetProvider>
  );
}
