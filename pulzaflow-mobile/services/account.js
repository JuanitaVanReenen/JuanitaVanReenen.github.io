import { supabase } from '../lib/supabase';

/*
 * Account deletion must run server-side because Supabase Auth admin deletion
 * requires a privileged key. The mobile client only invokes the protected
 * Edge Function and never receives a service-role/secret key.
 */
export async function requestAccountDeletion() {
  return supabase.functions.invoke('delete-account', {
    method: 'POST',
    body: {},
  });
}


// Production deletion must be executed by a trusted server/Edge Function.
// This client helper intentionally fails closed until that endpoint is deployed.
export async function deleteMyAccount() {
  throw new Error('Account deletion endpoint is not deployed yet.');
}
