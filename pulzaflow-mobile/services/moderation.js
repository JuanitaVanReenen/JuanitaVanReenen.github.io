import { supabase } from '../lib/supabase';

export async function reportPulza(reporterId, pulzaId, reason) {
  return supabase.from('reports').insert({
    reporter_id: reporterId,
    pulza_id: pulzaId,
    reason,
  });
}

export async function reportUser(reporterId, reportedUserId, reason) {
  return supabase.from('reports').insert({
    reporter_id: reporterId,
    reported_user_id: reportedUserId,
    reason,
  });
}

export async function blockUser(blockerId, blockedId) {
  return supabase.from('blocks').insert({
    blocker_id: blockerId,
    blocked_id: blockedId,
  });
}

export async function unblockUser(blockerId, blockedId) {
  return supabase.from('blocks')
    .delete()
    .eq('blocker_id', blockerId)
    .eq('blocked_id', blockedId);
}
