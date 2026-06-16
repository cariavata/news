import React, { useEffect, useRef } from 'react';

interface AdsenseBannerProps {
  client: string;
  slot: string;
  format?: string;
  responsive?: boolean;
}

export default function AdsenseBanner({ client, slot, format = 'auto', responsive = true }: AdsenseBannerProps) {
  const adRef = useRef<HTMLModElement>(null);
  const pushedCount = useRef(0);

  useEffect(() => {
    // Only push if not already pushed by this component instance
    if (typeof window !== 'undefined' && pushedCount.current === 0) {
      // Small timeout to ensure DOM is ready and Avoid strict mode double-firing racing
      const timer = setTimeout(() => {
        if (adRef.current && !adRef.current.getAttribute('data-ad-status')) {
            try {
              ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
            } catch (e: any) {
              console.warn('AdSense push error:', e.message);
            }
        }
      }, 300);
      pushedCount.current += 1;
      return () => clearTimeout(timer);
    }
  }, []);

  return (
    <ins
      ref={adRef}
      className="adsbygoogle"
      style={{ display: 'block', width: '100%', height: '100%' }}
      data-ad-client={client}
      data-ad-slot={slot}
      data-ad-format={format}
      data-full-width-responsive={responsive ? 'true' : 'false'}
    />
  );
}
