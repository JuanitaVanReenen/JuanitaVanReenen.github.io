import { supabase } from '../lib/supabase';

export async function getSubscription(userId) {
  return supabase.from('subscriptions').select('*').eq('user_id', userId).maybeSingle();
}

export function hasPlusAccess(subscription) {
  if (!subscription || subscription.plan !== 'plus') return false;
  if (!['trialing','active'].includes(subscription.status)) return false;
  const end = subscription.current_period_ends_at || subscription.trial_ends_at;
  return !end || new Date(end).getTime() > Date.now();
}


export const PLUS_PRODUCTS = {
  iosMonthly: 'com.pulzaflow.plus.monthly',
  iosAnnual: 'com.pulzaflow.plus.annual',
  android: 'pulza_flow_plus',
};

export function subscriptionLabel(subscription) {
  if (!subscription || subscription.plan !== 'plus') return 'Free';
  if (subscription.status === 'trialing') return 'PLUS trial';
  if (subscription.status === 'active') return 'PLUS';
  return 'Free';
}

export async function refreshEntitlement(userId) {
  // StoreKit / Google Play verification must update the server-side
  // subscriptions row before this client treats PLUS as active.
  return getSubscription(userId);
}
