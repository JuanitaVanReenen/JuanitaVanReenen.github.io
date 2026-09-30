import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json",
};

const ACTIVE = new Set(["INITIAL_PURCHASE","RENEWAL","PRODUCT_CHANGE","UNCANCELLATION","NON_RENEWING_PURCHASE","CANCELLATION","SUBSCRIPTION_PAUSED","SUBSCRIPTION_EXTENDED","REFUND_REVERSED"]);
const ENDED = new Set(["EXPIRATION"]);
const PAST_DUE = new Set(["BILLING_ISSUE"]);

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok",{headers:cors});
  if (req.method !== "POST") return new Response(JSON.stringify({error:"Method not allowed"}),{status:405,headers:cors});

  const expected = Deno.env.get("REVENUECAT_WEBHOOK_AUTH");
  if (!expected || req.headers.get("Authorization") !== expected) {
    return new Response(JSON.stringify({error:"Unauthorized"}),{status:401,headers:cors});
  }

  const url=Deno.env.get("SUPABASE_URL");
  const serviceKey=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if(!url||!serviceKey)return new Response(JSON.stringify({error:"Server configuration incomplete"}),{status:500,headers:cors});

  const body=await req.json();
  const event=body?.event||body;
  const userId=event?.app_user_id;
  const type=event?.type;
  if(!userId||!type)return new Response(JSON.stringify({error:"Invalid webhook payload"}),{status:400,headers:cors});

  const admin=createClient(url,serviceKey,{auth:{autoRefreshToken:false,persistSession:false}});
  const store=String(event?.store||"").toLowerCase();
  const productId=event?.product_id||null;
  const expires=event?.expiration_at_ms?new Date(Number(event.expiration_at_ms)).toISOString():null;

  if(!ACTIVE.has(type) && !PAST_DUE.has(type) && !ENDED.has(type)) {
    return new Response(JSON.stringify({ok:true,ignored:true,type}),{status:200,headers:cors});
  }

  let plan="free", status="inactive";
  if(ACTIVE.has(type)){plan="plus";status="active";}
  else if(PAST_DUE.has(type)){plan="plus";status="past_due";}
  else if(ENDED.has(type)){plan="free";status="inactive";}

  const {error}=await admin.from("subscriptions").upsert({
    user_id:userId,
    plan,
    status,
    current_period_ends_at:expires,
    store:store==="app_store"||store==="mac_app_store"?"apple":store==="play_store"?"google":null,
    product_id:productId,
    updated_at:new Date().toISOString()
  });
  if(error)return new Response(JSON.stringify({error:error.message}),{status:500,headers:cors});

  return new Response(JSON.stringify({ok:true}),{status:200,headers:cors});
});
