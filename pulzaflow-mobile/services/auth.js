import { supabase } from '../lib/supabase';

export async function signUp(email, password, username, displayName) {
  return supabase.auth.signUp({
    email,
    password,
    options: { data: { username, display_name: displayName } },
  });
}

export async function signIn(email, password) {
  return supabase.auth.signInWithPassword({ email, password });
}

export async function signOut() {
  return supabase.auth.signOut();
}

export async function getSession() {
  return supabase.auth.getSession();
}
