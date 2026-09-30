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
