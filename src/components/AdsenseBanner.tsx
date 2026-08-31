import React, { useEffect, useRef, useState } from 'react';

interface AdsenseBannerProps {
  client: string;
  slot?: string;
  format?: string;
  responsive?: boolean;
  className?: string;
}

export default function AdsenseBanner({ 
  client, 
  slot = '6799823492', 
  format = 'auto', 
  responsive = true,
  className = ''
}: AdsenseBannerProps) {
  const adRef = useRef<HTMLModElement>(null);
  const pushedRef = useRef(false);
  const [adLoaded, setAdLoaded] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && !pushedRef.current) {
      const timer = setTimeout(() => {
        try {
          if (adRef.current && !adRef.current.getAttribute('data-ad-status')) {
            ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
            pushedRef.current = true;
            setAdLoaded(true);
          }
        } catch (e: any) {
          console.warn('Google AdSense push notice:', e.message);
        }
      }, 200);

      return () => clearTimeout(timer);
    }
  }, [client, slot]);

  return (
    <div className={`w-full overflow-hidden flex flex-col items-center justify-center min-h-[120px] ${className}`}>
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: 'block', width: '100%', minHeight: '100px' }}
        data-ad-client={client}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={responsive ? 'true' : 'false'}
      />
    </div>
  );
}

