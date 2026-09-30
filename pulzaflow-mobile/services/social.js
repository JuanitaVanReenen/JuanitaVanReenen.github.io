import { supabase } from '../lib/supabase';

export async function reactToPulza(pulzaId, userId, reaction = 'like') {
  return supabase.from('reactions').upsert(
    { pulza_id: pulzaId, user_id: userId, reaction },
    { onConflict: 'pulza_id,user_id,reaction' }
  );
}

export async function removeReaction(pulzaId, userId, reaction = 'like') {
  return supabase.from('reactions').delete()
    .eq('pulza_id', pulzaId)
    .eq('user_id', userId)
    .eq('reaction', reaction);
}

export async function getComments(pulzaId) {
  return supabase.from('comments')
    .select('*, profiles(username,display_name,avatar_url)')
    .eq('pulza_id', pulzaId)
    .order('created_at', { ascending: true });
}

export async function addComment(pulzaId, userId, body) {
  return supabase.from('comments')
    .insert({ pulza_id: pulzaId, author_id: userId, body })
    .select()
    .single();
}

export async function voteOnPulza(pulzaId, optionId, userId) {
  return supabase.from('votes').upsert(
    { pulza_id: pulzaId, option_id: optionId, user_id: userId },
    { onConflict: 'pulza_id,user_id' }
  );
}

export function subscribeToPulza(pulzaId, callback) {
  return supabase.channel('pulza-' + pulzaId)
    .on('postgres_changes',
      { event: '*', schema: 'public', table: 'reactions', filter: 'pulza_id=eq.' + pulzaId },
      callback
    )
    .on('postgres_changes',
      { event: '*', schema: 'public', table: 'comments', filter: 'pulza_id=eq.' + pulzaId },
      callback
    )
    .on('postgres_changes',
      { event: '*', schema: 'public', table: 'votes', filter: 'pulza_id=eq.' + pulzaId },
      callback
    )
    .subscribe((status) => callback({ type: 'subscription_status', status }));
}
