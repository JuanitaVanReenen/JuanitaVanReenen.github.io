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
  const maxBytes = asset.type === 'video' ? 50 * 1024 * 1024 : 10 * 1024 * 1024;
  if (asset.fileSize && asset.fileSize > maxBytes) {
    return { data: null, error: new Error(asset.type === 'video' ? 'Please choose a video smaller than 50 MB.' : 'Please choose an image smaller than 10 MB.') };
  }
  if (!asset.base64) {
    return { data: null, error: new Error('The selected media could not be read.') };
  }

  const allowedImageTypes = ['image/jpeg', 'image/png', 'image/webp'];
  const allowedVideoTypes = ['video/mp4', 'video/quicktime', 'video/webm'];
  const contentType = asset.mimeType || (asset.type === 'video' ? 'video/mp4' : 'image/jpeg');
  const allowedTypes = asset.type === 'video' ? allowedVideoTypes : allowedImageTypes;
  if (!allowedTypes.includes(contentType)) {
    return { data: null, error: new Error('This media format is not supported. Please choose a JPG, PNG, WebP, MP4, MOV, or WebM file.') };
  }

  const extension = (asset.fileName?.split('.').pop() || (asset.type === 'video' ? 'mp4' : 'jpg')).toLowerCase();
  const path = userId + '/' + Date.now() + '.' + extension;
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
