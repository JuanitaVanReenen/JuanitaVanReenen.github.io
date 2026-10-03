import mobileAds, { BannerAd, BannerAdSize, TestIds } from "react-native-google-mobile-ads";

let initialized = false;

export async function initializeAds() {
  if (initialized) return;
  await mobileAds().initialize();
  initialized = true;
}

export const PRODUCTION_ADS_ENABLED = false;

export const BANNER_AD_UNIT_ID = __DEV__
  ? TestIds.BANNER
  : null;

export function AdBanner() {
  if (!__DEV__ && !PRODUCTION_ADS_ENABLED) return null;
  return (
    <BannerAd
      unitId={BANNER_AD_UNIT_ID || TestIds.BANNER}
      size={BannerAdSize.BANNER}
      requestOptions={{ requestNonPersonalizedAdsOnly: true }}
    />
  );
}

export { BannerAd, BannerAdSize, TestIds };
