import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json",
};

const allowed = new Set(["reviewed","resolved","dismissed","content_removed","user_restricted","user_suspended"]);

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok",{headers:cors});
  if (req.method !== "POST") return new Response(JSON.stringify({error:"Method not allowed"}),{status:405,headers:cors});

  const auth = req.headers.get("Authorization") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  if (!token) return new Response(JSON.stringify({error:"Unauthorized"}),{status:401,headers:cors});

  const url=Deno.env.get("SUPABASE_URL");
  const serviceKey=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if(!url||!serviceKey)return new Response(JSON.stringify({error:"Server configuration incomplete"}),{status:500,headers:cors});

  const admin=createClient(url,serviceKey,{auth:{autoRefreshToken:false,persistSession:false}});
  const {data:{user},error:userError}=await admin.auth.getUser(token);
  if(userError||!user)return new Response(JSON.stringify({error:"Unauthorized"}),{status:401,headers:cors});

  const {data:role}=await admin.from("moderator_roles").select("role").eq("user_id",user.id).maybeSingle();
  if(!role)return new Response(JSON.stringify({error:"Forbidden"}),{status:403,headers:cors});

  const body=await req.json();
  const action=String(body?.action||"");
  const reportId=body?.report_id||null;
  const pulzaId=body?.pulza_id||null;
  const targetUserId=body?.target_user_id||null;
  const note=String(body?.note||"").slice(0,2000);

  if(!allowed.has(action))return new Response(JSON.stringify({error:"Invalid moderation action"}),{status:400,headers:cors});

  if(action==="content_removed"){
    if(!pulzaId)return new Response(JSON.stringify({error:"pulza_id required"}),{status:400,headers:cors});
    const {error}=await admin.from("pulzas").delete().eq("id",pulzaId);
    if(error)return new Response(JSON.stringify({error:error.message}),{status:500,headers:cors});
  }
  if(action==="user_restricted"||action==="user_suspended"){
    if(!targetUserId)return new Response(JSON.stringify({error:"target_user_id required"}),{status:400,headers:cors});
    const status=action==="user_suspended"?"suspended":"restricted";
    const {error}=await admin.from("profiles").update({account_status:status}).eq("id",targetUserId);
    if(error)return new Response(JSON.stringify({error:error.message}),{status:500,headers:cors});
  }

  if(reportId){
    const reportStatus=action==="reviewed"?"reviewing":action==="resolved"||action==="content_removed"||action==="user_restricted"||action==="user_suspended"?"resolved":action==="dismissed"?"dismissed":null;
    if(reportStatus){
      const {error}=await admin.from("reports").update({status:reportStatus}).eq("id",reportId);
      if(error)return new Response(JSON.stringify({error:error.message}),{status:500,headers:cors});
    }
  }

  const {data:logged,error:logError}=await admin.from("moderation_actions").insert({
    moderator_id:user.id,report_id:reportId,pulza_id:pulzaId,target_user_id:targetUserId,action,note
  }).select("id").single();
  if(logError)return new Response(JSON.stringify({error:logError.message}),{status:500,headers:cors});

  return new Response(JSON.stringify({ok:true,action_id:logged.id}),{status:200,headers:cors});
});