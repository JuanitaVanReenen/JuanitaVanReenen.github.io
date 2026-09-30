import { Platform } from 'react-native';
import Purchases from 'react-native-purchases';

const ENTITLEMENT = 'pulza_flow_plus';
const IOS_KEY = process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY;
const ANDROID_KEY = process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY;

let configured = false;

export async function configureBilling(userId) {
  if (configured) return { ok: true };
  const apiKey = Platform.OS === 'ios' ? IOS_KEY : ANDROID_KEY;
  if (!apiKey) return { ok: false, error: new Error('RevenueCat public API key is not configured.') };
  try {
    await Purchases.configure({ apiKey, appUserID: userId });
    configured = true;
    return { ok: true };
  } catch (error) {
    return { ok: false, error };
  }
}

export async function getPlusOffering() {
  const { current } = await Purchases.getOfferings();
  return current || null;
}

export async function purchasePlus(userId) {
  const configuredResult = await configureBilling(userId);
  if (!configuredResult.ok) return configuredResult;
  try {
    const offering = await getPlusOffering();
    const pkg = offering?.monthly || offering?.annual || offering?.availablePackages?.[0];
    if (!pkg) return { ok: false, error: new Error('No PLUS product is configured yet.') };
    const result = await Purchases.purchasePackage(pkg);
    return { ok: true, customerInfo: result.customerInfo };
  } catch (error) {
    return { ok: false, error };
  }
}

export async function restorePurchases(userId) {
  const configuredResult = await configureBilling(userId);
  if (!configuredResult.ok) return configuredResult;
  try {
    return { ok: true, customerInfo: await Purchases.restorePurchases() };
  } catch (error) {
    return { ok: false, error };
  }
}

export { ENTITLEMENT };
