import { supabase } from '../lib/supabase';

export async function getNotifications(userId) {
  return supabase.from('notifications')
    .select('*, profiles!notifications_actor_id_fkey(username,display_name,avatar_url)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(50);
}

export async function markNotificationRead(notificationId, userId) {
  return supabase.from('notifications')
    .update({ read_at: new Date().toISOString() })
    .eq('id', notificationId)
    .eq('user_id', userId);
}

export function subscribeToNotifications(userId, callback) {
  return supabase.channel('notifications-' + userId)
    .on('postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'notifications', filter: 'user_id=eq.' + userId },
      callback
    )
    .subscribe();
}
