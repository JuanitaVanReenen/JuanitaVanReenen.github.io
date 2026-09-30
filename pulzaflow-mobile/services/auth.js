import { supabase } from '../lib/supabase';

export async function signUp(email, password, username, displayName) {
  if (!email || !password || !username || !displayName) {
    return { data: null, error: new Error('Please complete all account fields.') };
  }
  const normalizedEmail = email.trim().toLowerCase();
  const normalizedUsername = username.trim().toLowerCase().replace(/^@+/, '');
  const normalizedDisplayName = displayName.trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
    return { data:null, error:new Error('Enter a valid email address.') };
  }
  if (!/^[a-z0-9_]{3,30}$/.test(normalizedUsername)) {
    return { data:null, error:new Error('Username must be 3–30 characters using lowercase letters, numbers, or underscores.') };
  }
  if (normalizedDisplayName.length < 1 || normalizedDisplayName.length > 60) {
    return { data:null, error:new Error('Display name must be 1–60 characters.') };
  }
  if (password.length < 8) {
    return { data: null, error: new Error('Password must be at least 8 characters.') };
  }
  return supabase.auth.signUp({
    email: normalizedEmail,
    password,
    options: { data: { username: normalizedUsername, display_name: normalizedDisplayName } },
  });
}

export async function signIn(email, password) {
  if (!email || !password) {
    return { data: null, error: new Error('Enter your email and password.') };
  }
  return supabase.auth.signInWithPassword({ email, password });
}

export async function signOut() {
  return supabase.auth.signOut();
}

export async function getSession() {
  return supabase.auth.getSession();
}
