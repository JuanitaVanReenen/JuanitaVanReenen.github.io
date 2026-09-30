import { supabase } from '../lib/supabase';
import { uploadMedia } from './media';

export async function getFeed(limit = 30) {
  return supabase
    .from('pulzas')
    .select('*, profiles(username,display_name,avatar_url), pulza_options(*), pulza_media(*)')
    .order('created_at', { ascending: false })
    .limit(limit);
}

export async function createPulza(authorId, body, options = [], mediaAsset = null, kind = 'pulza') {
  const { data: pulza, error } = await supabase
    .from('pulzas')
    .insert({ author_id: authorId, body, kind })
    .select()
    .single();

  if (error || !pulza) return { data: null, error };

  if (options.length) {
    const rows = options.map((option, index) => ({
      pulza_id: pulza.id,
      option_text: option,
      position: index,
    }));
    const result = await supabase.from('pulza_options').insert(rows);
    if (result.error) return { data: pulza, error: result.error };
  }

  if (mediaAsset) {
    const upload = await uploadMedia(authorId, mediaAsset);
    if (upload.error) return { data: pulza, error: upload.error };

    if (upload.data) {
      const mediaResult = await supabase.from('pulza_media').insert({
        pulza_id: pulza.id,
        owner_id: authorId,
        storage_path: upload.data.path,
        media_type: upload.data.type === 'video' ? 'video' : 'image',
        mime_type: upload.data.contentType,
      });
      if (mediaResult.error) return { data: pulza, error: mediaResult.error };
    }
  }

  return { data: pulza, error: null };
}

export async function addComment(pulzaId, authorId, body) {
  return supabase.from('comments').insert({
    pulza_id: pulzaId,
    author_id: authorId,
    body,
  }).select().single();
}

export async function vote(pulzaId, optionId, userId) {
  return supabase.from('votes').upsert(
    { pulza_id: pulzaId, option_id: optionId, user_id: userId },
    { onConflict: 'pulza_id,user_id' }
  );
}
