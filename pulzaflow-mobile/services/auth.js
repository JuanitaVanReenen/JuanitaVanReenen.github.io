import { supabase } from '../lib/supabase';

export async function signUp(email, password, username, displayName) {
  if (!email || !password || !username || !displayName) {
    return { data: null, error: new Error('Please complete all account fields.') };
  }
  if (password.length < 8) {
    return { data: null, error: new Error('Password must be at least 8 characters.') };
  }
  return supabase.auth.signUp({
    email,
    password,
    options: { data: { username, display_name: displayName } },
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
