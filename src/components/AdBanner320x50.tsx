import React, { useEffect, useMemo, useState } from 'react';
import { getBannerConfig } from '../utils/rewardLink';

interface AdBanner320x50Props {
  className?: string;
}

export const AdBanner320x50: React.FC<AdBanner320x50Props> = ({ className = '' }) => {
  const [isOnline, setIsOnline] = useState<boolean>(() =>
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const config = getBannerConfig();

  const srcDoc = useMemo(() => {
    if (!config) return '';
    const safeKey = config.key.replace(/[^a-zA-Z0-9_-]/g, '');
    const safeSrc = config.scriptSrc;
    return `<!doctype html>
<html>
  <head>
    <meta charset="UTF-8" />
    <style>
      html, body {
        margin: 0;
        padding: 0;
        width: 320px;
        height: 50px;
        overflow: hidden;
        background: transparent;
        display: flex;
        align-items: center;
        justify-content: center;
      }
    </style>
  </head>
  <body>
    <script>
      atOptions = {
        'key' : '${safeKey}',
        'format' : 'iframe',
        'height' : 50,
        'width' : 320,
        'params' : {}
      };
    </script>
    <script data-cfasync="false" src="${safeSrc}"></script>
  </body>
</html>`;
  }, [config]);

  if (!config || !isOnline) {
    return null;
  }

  return (
    <div className={`w-full flex flex-col items-center justify-center ${className}`}>
      <div className="w-[320px] h-[50px] rounded-xl overflow-hidden bg-neutral-900/70 border border-neutral-800/80 flex items-center justify-center">
        <iframe
          title="Advertisement 320x50"
          srcDoc={srcDoc}
          width={320}
          height={50}
          scrolling="no"
          frameBorder={0}
          sandbox="allow-scripts allow-popups allow-popups-to-escape-sandbox"
          referrerPolicy="no-referrer-when-downgrade"
          className="w-[320px] h-[50px] border-0 block"
        />
      </div>
    </div>
  );
};
