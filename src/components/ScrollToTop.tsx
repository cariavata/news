import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAppStore } from '../store/useArticleStore';

export default function ScrollToTop() {
  const { pathname } = useLocation();
  const trackPageView = useAppStore(state => state.trackPageView);

  useEffect(() => {
    window.scrollTo(0, 0);
    // Ignore admin routes for analytics
    if (!pathname.startsWith('/admin')) {
      trackPageView();
    }
  }, [pathname, trackPageView]);

  return null;
}
