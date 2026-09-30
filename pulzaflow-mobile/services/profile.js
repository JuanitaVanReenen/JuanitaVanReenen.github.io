import { supabase } from '../lib/supabase';

export async function getProfile(userId) {
  return supabase.from('profiles').select('id,username,display_name,bio,avatar_url').eq('id',userId).single();
}

export async function getProfileByUsername(username) {
  return supabase.from('profiles').select('id,username,display_name,bio,avatar_url').eq('username',username.replace(/^@+/,'').toLowerCase()).single();
}

export async function updateProfile(userId, changes) {
  const displayName = changes.display_name?.trim() || '';
  const username = changes.username?.trim().toLowerCase().replace(/^@+/, '') || '';
  const bio = changes.bio?.trim() || '';
  if (!displayName) return { data:null, error:new Error('Display name is required.') };
  if (!/^[a-z0-9_]{3,30}$/.test(username)) return { data:null, error:new Error('Username must be 3–30 characters using lowercase letters, numbers, or underscores.') };
  if (bio.length > 160) return { data:null, error:new Error('Bio must be 160 characters or fewer.') };
  return supabase.from('profiles').update({
    display_name: displayName,
    username,
    bio,
  }).eq('id',userId).select('id,username,display_name,bio,avatar_url').single();
}

export async function getFollowStatus(userId, profileId) {
  if (userId === profileId) return { data: false, error: null };
  const { data, error } = await supabase.from('follows').select('follower_id').eq('follower_id',userId).eq('following_id',profileId).maybeSingle();
  return { data: !!data, error };
}

export async function followUser(userId, profileId) {
  if (userId === profileId) return { data: null, error: new Error('You cannot follow your own profile.') };
  return supabase.from('follows').insert({ follower_id:userId, following_id:profileId });
}

export async function unfollowUser(userId, profileId) {
  return supabase.from('follows').delete().eq('follower_id',userId).eq('following_id',profileId);
}

export async function getFollowCounts(profileId) {
  const [followers, following] = await Promise.all([
    supabase.from('follows').select('*',{count:'exact',head:true}).eq('following_id',profileId),
    supabase.from('follows').select('*',{count:'exact',head:true}).eq('follower_id',profileId),
  ]);
  return { data:{followers:followers.count||0,following:following.count||0}, error:followers.error||following.error };
}

export async function pickAndUploadAvatar(userId) {
  const { data: ImagePicker } = await import('expo-image-picker');
  const { decode } = await import('base64-arraybuffer');
  const { permission } = await (async()=>({permission:await ImagePicker.requestMediaLibraryPermissionsAsync()}))();
  if (!permission.granted) return { data:null,error:new Error('Photo library permission is required.') };
  const result=await ImagePicker.launchImageLibraryAsync({mediaTypes:['images'],quality:0.85,base64:true,allowsMultipleSelection:false,allowsEditing:true,aspect:[1,1]});
  if(result.canceled||!result.assets?.length)return {data:null,error:null};
  const asset=result.assets[0];
  if(!asset.base64)return{data:null,error:new Error('The selected profile photo could not be read.')};
  if(asset.fileSize&&asset.fileSize>10*1024*1024)return{data:null,error:new Error('Please choose a profile photo smaller than 10 MB.')};
  const extension=(asset.fileName?.split('.').pop()||'jpg').toLowerCase();
  const path=userId+'/'+Date.now()+'.'+extension;
  const contentType=asset.mimeType||'image/jpeg';
  const upload=await supabase.storage.from('profile-avatars').upload(path,decode(asset.base64),{contentType,upsert:false});
  if(upload.error)return{data:null,error:upload.error};
  const {error}=await supabase.from('profiles').update({avatar_url:path}).eq('id',userId);
  if(error)return{data:null,error};
  return{data:{path},error:null};
}

export async function getAvatarUrl(path,expiresIn=3600) {
  if(!path)return{data:null,error:null};
  const {data,error}=await supabase.storage.from('profile-avatars').createSignedUrl(path,expiresIn);
  return{data:data?.signedUrl||null,error};
}
