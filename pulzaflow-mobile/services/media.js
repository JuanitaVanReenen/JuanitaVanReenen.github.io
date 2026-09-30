import * as ImagePicker from 'expo-image-picker';
import { decode } from 'base64-arraybuffer';
import { supabase } from '../lib/supabase';

export async function pickMedia() {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) {
    return { data: null, error: new Error('Media library permission is required.') };
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images','videos'],
    quality: 0.85,
    base64: true,
    allowsMultipleSelection: false,
  });

  if (result.canceled || !result.assets?.length) {
    return { data: null, error: null };
  }

  const asset = result.assets[0];
  return { data: asset, error: null };
}

export async function uploadMedia(userId, asset) {
  if (!asset) return { data: null, error: null };
  if (asset.fileSize && asset.fileSize > 50 * 1024 * 1024) {
    return { data: null, error: new Error('Please choose media smaller than 50 MB.') };
  }
  if (!asset.base64) {
    return { data: null, error: new Error('The selected media could not be read.') };
  }

  const extension = (asset.fileName?.split('.').pop() || (asset.type === 'video' ? 'mp4' : 'jpg')).toLowerCase();
  const path = userId + '/' + Date.now() + '.' + extension;
  const contentType = asset.mimeType || (asset.type === 'video' ? 'video/mp4' : 'image/jpeg');

  const upload = await supabase.storage
    .from('pulza-media')
    .upload(path, decode(asset.base64), {
      contentType,
      upsert: false,
    });

  if (upload.error) return { data: null, error: upload.error };
  return { data: { path, type: asset.type, contentType }, error: null };
}

export async function getMediaUrl(storagePath, expiresIn = 3600) {
  const { data, error } = await supabase.storage
    .from('pulza-media')
    .createSignedUrl(storagePath, expiresIn);
  return { data: data?.signedUrl || null, error };
}
