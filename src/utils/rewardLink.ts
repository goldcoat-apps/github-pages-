export const getRewardSmartLink = (): string => {
  if (typeof window !== 'undefined') {
    const link = (window as unknown as { __ADSTERRA_SMART_LINK__?: string }).__ADSTERRA_SMART_LINK__;
    if (link && link.trim().length > 0) {
      return link;
    }
  }
  return 'PASTE_SMART_LINK_HERE';
};
