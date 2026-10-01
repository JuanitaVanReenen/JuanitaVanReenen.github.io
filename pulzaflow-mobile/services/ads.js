import mobileAds, { BannerAd, BannerAdSize, TestIds } from "react-native-google-mobile-ads";

let initialized = false;

export async function initializeAds() {
  if (initialized) return;
  await mobileAds().initialize();
  initialized = true;
}

export const BANNER_AD_UNIT_ID = __DEV__
  ? TestIds.BANNER
  : "ca-app-pub-REPLACE_WITH_YOUR_ADMOB_PUBLISHER_ID/REPLACE_WITH_YOUR_BANNER_UNIT_ID";

export { BannerAd, BannerAdSize, TestIds };
