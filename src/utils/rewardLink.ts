export interface AdBannerConfig {
  key: string;
  scriptSrc: string;
}

const DEFAULT_BANNER_KEY = 'b5df36b88a360d2d4ec15b23465dda32';
const DEFAULT_BANNER_SRC = 'https://bauval.org/22/b5df36b88a360d2d4ec15b23465dda32';

export const getBannerConfig = (): AdBannerConfig | null => {
  if (typeof window === 'undefined') return null;

  const win = window as unknown as {
    __ADSTERRA_BANNER_KEY__?: string;
    __ADSTERRA_BANNER_SRC__?: string;
    __ADSTERRA_BANNER_HOST__?: string;
  };

  const key = (win.__ADSTERRA_BANNER_KEY__ || DEFAULT_BANNER_KEY).trim();
  if (!key || key === 'PASTE_BANNER_320X50_KEY_HERE') {
    return null;
  }

  let scriptSrc = (win.__ADSTERRA_BANNER_SRC__ || '').trim();
  if (!scriptSrc) {
    if (win.__ADSTERRA_BANNER_HOST__) {
      const host = win.__ADSTERRA_BANNER_HOST__
        .trim()
        .replace(/^https?:\/\//i, '')
        .replace(/\/+$/, '');
      scriptSrc = `https://${host}/${key}/invoke.js`;
    } else {
      scriptSrc = DEFAULT_BANNER_SRC;
    }
  }

  if (!/^https:\/\/[a-zA-Z0-9.-]+\/[a-zA-Z0-9/_.-]+$/.test(scriptSrc)) {
    return null;
  }

  return {
    key,
    scriptSrc,
  };
};
