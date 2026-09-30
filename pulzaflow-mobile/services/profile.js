import * as ImagePicker from 'expo-image-picker';
import { decode } from 'base64-arraybuffer';
import { supabase } from '../lib/supabase';

const BUCKET = 'profile-avatars';

export async function getProfile(userId) {
  return supabase.from('profiles').select('id,username,display_name,bio,avatar_url').eq('id',userId).single();
}

export async function updateProfile(userId, changes) {
  return supabase.from('profiles').update({
    display_name: changes.display_name?.trim(),
    username: changes.username?.trim().toLowerCase(),
    bio: changes.bio?.trim() || '',
  }).eq('id', userId).select('id,username,display_name,bio,avatar_url').single();
}

export async function pickAndUploadAvatar(userId) {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) return { data: null, error: new Error('Photo library permission is required.') };

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    quality: 0.85,
    base64: true,
    allowsMultipleSelection: false,
    allowsEditing: true,
    aspect: [1, 1],
  });

  if (result.canceled || !result.assets?.length) return { data: null, error: null };

  const asset = result.assets[0];
  if (!asset.base64) return { data: null, error: new Error('The selected profile photo could not be read.') };
  if (asset.fileSize && asset.fileSize > 10 * 1024 * 1024) {
    return { data: null, error: new Error('Please choose a profile photo smaller than 10 MB.') };
  }

  const extension = (asset.fileName?.split('.').pop() || 'jpg').toLowerCase();
  const path = userId + '/' + Date.now() + '.' + extension;
  const contentType = asset.mimeType || 'image/jpeg';

  const upload = await supabase.storage.from(BUCKET).upload(path, decode(asset.base64), {
    contentType,
    upsert: false,
  });
  if (upload.error) return { data: null, error: upload.error };

  const { error } = await supabase.from('profiles').update({ avatar_url: path }).eq('id', userId);
  if (error) return { data: null, error };

  return { data: { path }, error: null };
}

export async function getAvatarUrl(path, expiresIn = 3600) {
  if (!path) return { data: null, error: null };
  const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(path, expiresIn);
  return { data: data?.signedUrl || null, error };
}
