export const ADSTERRA_SMART_LINK = 'https://auctionr.org/4/ca121db03e7f248f2c9356409de64707';

export const getRewardSmartLink = (): string => {
  if (typeof window !== 'undefined') {
    const link = (window as unknown as { __ADSTERRA_SMART_LINK__?: string }).__ADSTERRA_SMART_LINK__;
    if (link && link.trim().length > 0 && link !== 'PASTE_SMART_LINK_HERE') {
      return link;
    }
  }
  return ADSTERRA_SMART_LINK;
};
