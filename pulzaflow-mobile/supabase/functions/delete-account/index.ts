import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return new Response(JSON.stringify({error:"Method not allowed"}), {status:405,headers:cors});

  const authHeader = req.headers.get("Authorization") || "";
  if (!authHeader.startsWith("Bearer ")) return new Response(JSON.stringify({error:"Unauthorized"}), {status:401,headers:cors});

  const url = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !serviceKey) return new Response(JSON.stringify({error:"Server configuration incomplete"}), {status:500,headers:cors});

  const admin = createClient(url, serviceKey, {auth:{autoRefreshToken:false,persistSession:false}});
  const token = authHeader.replace("Bearer ","");
  const {data:{user},error:userError} = await admin.auth.getUser(token);
  if (userError || !user) return new Response(JSON.stringify({error:"Unauthorized"}), {status:401,headers:cors});

  // Remove media objects before the auth user is deleted; table cascades then
  // remove profile/content metadata. Never expose the service-role key to the app.
  const {data:media} = await admin.from("pulza_media").select("storage_path").eq("owner_id",user.id);
  if (media?.length) {
    await admin.storage.from("pulza-media").remove(media.map((m)=>m.storage_path));
  }

  const {error:deleteError} = await admin.auth.admin.deleteUser(user.id);
  if (deleteError) return new Response(JSON.stringify({error:deleteError.message}), {status:500,headers:cors});

  return new Response(JSON.stringify({ok:true}), {status:200,headers:cors});
});
