import React,{useEffect,useState} from "react";
import {SafeAreaView,View,Text,Pressable,ScrollView,StyleSheet,TextInput,ActivityIndicator,Image,Alert} from "react-native";
import {StatusBar} from "expo-status-bar";
import {supabase} from "./lib/supabase";
import {signIn,signUp,signOut} from "./services/auth";
import {getFeed,createPulza} from "./services/pulzas";
import {getMediaUrl} from "./services/media";
import {reactToPulza,removeReaction,getComments,addComment,voteOnPulza,subscribeToPulza} from "./services/social";
import {getNotifications,markNotificationRead,subscribeToNotifications} from "./services/notifications";
import {reportPulza,blockUser,unblockUser,getBlockedUsers} from "./services/moderation";

function AuthScreen(){
 const [signup,setSignup]=useState(false),[email,setEmail]=useState(""),[password,setPassword]=useState(""),[username,setUsername]=useState(""),[displayName,setDisplayName]=useState(""),[loading,setLoading]=useState(false),[error,setError]=useState("");
 async function submit(){
  setError("");setLoading(true);
  const result=signup?await signUp(email.trim(),password,username.trim(),displayName.trim()):await signIn(email.trim(),password);
  setLoading(false);
  if(result.error)setError(result.error.message);
  else if(signup&&!result.data?.session)setError("Check your email to confirm your account, then sign in.");
 }
 return <SafeAreaView style={s.safe}><StatusBar style="light"/><ScrollView contentContainerStyle={s.auth}>
  <Text style={s.logo}>Pulza<Text style={s.accent}>Flow</Text></Text>
  <Text style={s.hero}>{signup?"Create your account.":"Welcome back."}</Text>
  <Text style={s.muted}>Social, with participation.</Text>
  {signup&&<><TextInput value={displayName} onChangeText={setDisplayName} placeholder="Display name" placeholderTextColor="#77839a" style={s.input}/><TextInput value={username} onChangeText={setUsername} autoCapitalize="none" placeholder="Username" placeholderTextColor="#77839a" style={s.input}/></>}
  <TextInput value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" placeholder="Email" placeholderTextColor="#77839a" style={s.input}/>
  <TextInput value={password} onChangeText={setPassword} secureTextEntry placeholder="Password" placeholderTextColor="#77839a" style={s.input}/>
  {error?<Text style={s.error}>{error}</Text>:null}
  <Pressable disabled={loading} onPress={submit} style={s.primary}>{loading?<ActivityIndicator/>:<Text style={s.primaryText}>{signup?"Create account":"Sign in"}</Text>}</Pressable>
  <Pressable onPress={()=>{setSignup(!signup);setError("")}} style={s.switch}><Text style={s.switchText}>{signup?"Already have an account? Sign in":"New to Pulza Flow? Create an account"}</Text></Pressable>
 </ScrollView></SafeAreaView>
}

const seed=[{name:"Maya",text:"The sky looked unreal tonight. 🌅",type:"post",likes:42,comments:8},{name:"Daniel",text:"Finally finished the thing I kept putting off. ✨",type:"post",likes:71,comments:14},{name:"Leila",text:"I have Saturday free. What should we do?",type:"pulza",options:["Beach day","Brunch","Road trip"],likes:18,comments:23}];

function MediaPreview({media}){
 const [url,setUrl]=useState(null);
 useEffect(()=>{if(media?.storage_path)getMediaUrl(media.storage_path).then(r=>setUrl(r.data));},[media?.storage_path]);
 if(!url)return null;
 return media.media_type==="image"?<Image source={{uri:url}} style={s.media}/> : <View style={s.videoPlaceholder}><Text style={s.videoText}>▶ Video</Text></View>;
}

function AppShell({user}){
 const [blocked,setBlocked]=useState([]),[safetyPost,setSafetyPost]=useState(null),[safetyBusy,setSafetyBusy]=useState(false),[feedError,setFeedError]=useState(""),[tab,setTab]=useState("Home"),[mode,setMode]=useState("Post"),[text,setText]=useState(""),[posts,setPosts]=useState(seed),[saving,setSaving]=useState(false),[attach,setAttach]=useState(false),[commentsOpen,setCommentsOpen]=useState(null),[commentText,setCommentText]=useState(""),[commentRows,setCommentRows]=useState({}),[liked,setLiked]=useState({}),[voted,setVoted]=useState({}),[notifications,setNotifications]=useState([]);

 async function loadBlocks(){const {data,error}=await getBlockedUsers(user.id);if(!error)setBlocked((data||[]).map(b=>b.blocked_id));}
 useEffect(()=>{loadBlocks();},[user.id]);
 async function loadFeed(){
  const {data,error}=await getFeed();
  if(error){setFeedError(error.message);return;}setFeedError("");if(data) setPosts(data.map(p=>({id:p.id,authorId:p.author_id,name:p.profiles?.display_name||p.profiles?.username||"User",text:p.body,type:p.kind,likes:0,comments:0,options:p.pulza_options||[],media:p.pulza_media||[]})));
 }
 useEffect(()=>{loadFeed();},[]);
 useEffect(()=>{
  if(tab==="Alerts") getNotifications(user.id).then(({data})=>setNotifications(data||[]));
 },[tab,user.id]);
 useEffect(()=>{
  if(!commentsOpen)return;
  getComments(commentsOpen).then(({data})=>setCommentRows(r=>({...r,[commentsOpen]:data||[]})));
  const channel=subscribeToPulza(commentsOpen,()=>{getComments(commentsOpen).then(({data})=>setCommentRows(r=>({...r,[commentsOpen]:data||[]})));});
  return()=>channel?.unsubscribe?.();
 },[commentsOpen]);
 useEffect(()=>{
  const channel=subscribeToNotifications(user.id,(payload)=>{
   setNotifications(n=>[payload.new,...n]);
  });
  return()=>channel?.unsubscribe?.();
 },[user.id]);

 async function publish(){
  const v=text.trim();if(!v||saving)return;
  setSaving(true);
  const options=mode==="Pulza"?["I’m in","Maybe","Tell me more"]:[];
  const {data,error}=await createPulza(user.id,v,options,attach);
  setSaving(false);
  if(!error){setText("");setAttach(false);await loadFeed();setTab("Home");}
  else {setFeedError("Publish failed: "+error.message);}
 }
 async function submitReport(post){
  Alert.alert("Report Pulza","Send this Pulza to moderation for review?",[
   {text:"Cancel",style:"cancel"},
   {text:"Report",onPress:async()=>{setSafetyBusy(true);const {error}=await reportPulza(user.id,post.id,"Inappropriate content");setSafetyBusy(false);Alert.alert(error?"Report failed":"Report submitted",error?.message||"Thank you. This Pulza has been reported.");}}
  ]);
 }
 function confirmBlock(post){
  if(!post.authorId||post.authorId===user.id)return;
  Alert.alert("Block user","Hide this person's Pulzas from your feed?",[
   {text:"Cancel",style:"cancel"},
   {text:"Block",style:"destructive",onPress:async()=>{setSafetyBusy(true);const {error}=await blockUser(user.id,post.authorId);setSafetyBusy(false);if(error)Alert.alert("Could not block",error.message);else setBlocked(ids=>[...new Set([...ids,post.authorId])]);}}
  ]);
 }
 async function restoreUser(id){
  const {error}=await unblockUser(user.id,id);
  if(error)Alert.alert("Could not unblock",error.message);
  else setBlocked(ids=>ids.filter(x=>x!==id));
 }
 async function toggleLike(post){
  if(!post.id||post.id.startsWith("local-"))return;
  if(liked[post.id]){await removeReaction(post.id,user.id);setLiked(x=>({...x,[post.id]:false}));}
  else{await reactToPulza(post.id,user.id);setLiked(x=>({...x,[post.id]:true}));}
 }
 async function submitComment(){
  const body=commentText.trim();if(!commentsOpen||!body)return;
  const {error}=await addComment(commentsOpen,user.id,body);
  if(!error){setCommentText("");const {data}=await getComments(commentsOpen);setCommentRows(r=>({...r,[commentsOpen]:data||[]}));}
 }
 async function chooseVote(post,option){
  if(!post.id||post.id.startsWith("local-")||voted[post.id])return;
  const {error}=await voteOnPulza(post.id,option.id,user.id);
  if(!error)setVoted(x=>({...x,[post.id]:option.id}));
 }
 return <SafeAreaView style={s.safe}><StatusBar style="light"/>
  <View style={s.header}><Text style={s.logo}>Pulza<Text style={s.accent}>Flow</Text></Text><Text style={s.tag}>Social, with participation.</Text></View>
  <ScrollView contentContainerStyle={s.content}>
   {tab==="Home"&&<><Text style={s.kicker}>YOUR SOCIAL WORLD</Text><Text style={s.hero}>Don’t just post.{"\n"}<Text style={s.blue}>Start something.</Text></Text><Text style={s.muted}>Pulza Flow keeps the familiar social feed, then gives people a new way to participate.</Text>
    <View style={s.composer}><View style={s.row}>{["Post","Pulza"].map(x=><Pressable key={x} onPress={()=>setMode(x)} style={[s.type,mode===x&&s.typeOn]}><Text style={s.typeText}>{x}</Text></Pressable>)}</View>
     <TextInput value={text} onChangeText={setText} placeholder={mode==="Pulza"?"Start something people can participate in…":"Say something to your people…"} placeholderTextColor="#77839a" multiline style={s.input}/>
     <Pressable onPress={()=>setAttach(!attach)} style={s.secondary}><Text style={s.secondaryText}>{attach?"Media attached ✓":"Attach photo / video"}</Text></Pressable><Pressable onPress={publish} style={s.primary}><Text style={s.primaryText}>{saving?"Saving…":"Publish"}</Text></Pressable>
    </View>
    {feedError?<Text style={s.error}>{feedError}</Text>:null}
    {posts.filter(p=>!blocked.includes(p.authorId)).map((p,i)=><View style={[s.card,p.type==="pulza"&&s.pulza]} key={p.id||i}><View style={s.row}><Text style={[s.name,{flex:1}]}>{p.name}</Text>{p.id&&!String(p.id).startsWith("local-")?<Pressable disabled={safetyBusy} onPress={()=>setSafetyPost(safetyPost===p.id?null:p.id)}><Text style={s.actionText}>•••</Text></Pressable>:null}</View>{safetyPost===p.id?<View style={s.actionRow}><Pressable onPress={()=>{setSafetyPost(null);submitReport(p);}} style={s.action}><Text style={s.actionText}>Report Pulza</Text></Pressable>{p.authorId!==user.id?<Pressable onPress={()=>{setSafetyPost(null);confirmBlock(p);}} style={s.action}><Text style={s.actionText}>Block user</Text></Pressable>:null}</View>:null}<Text style={s.body}>{p.text}</Text>{p.media?.map((m,j)=><MediaPreview key={m.id||j} media={m}/>)}
     {p.type==="pulza"&&<>{(p.options||[]).map(o=><Pressable key={o.id||o.option_text} onPress={()=>chooseVote(p,o)} style={[s.option,voted[p.id]===o.id&&s.optionOn]}><Text style={s.optionText}>{o.option_text}</Text><Text style={s.count}>{voted[p.id]===o.id?"✓":"Vote"}</Text></Pressable>)}</>}
     <View style={s.actionRow}><Pressable onPress={()=>toggleLike(p)} style={s.action}><Text style={s.actionText}>{liked[p.id]?"♥":"♡"} Like</Text></Pressable><Pressable onPress={()=>setCommentsOpen(commentsOpen===p.id?null:p.id)} style={s.action}><Text style={s.actionText}>💬 Comment</Text></Pressable></View>
     {commentsOpen===p.id&&<View style={s.comments}><Text style={s.commentTitle}>Comments</Text>{(commentRows[p.id]||[]).map(c=><View key={c.id} style={s.comment}><Text style={s.name}>{c.profiles?.display_name||c.profiles?.username||"User"}</Text><Text style={s.commentBody}>{c.body}</Text></View>)}<TextInput value={commentText} onChangeText={setCommentText} placeholder="Write a comment…" placeholderTextColor="#77839a" style={s.input}/><Pressable onPress={submitComment} style={s.primary}><Text style={s.primaryText}>Comment</Text></Pressable></View>}
     <Text style={s.meta}>{liked[p.id]?"♥":"♡"}   💬 {(commentRows[p.id]||[]).length||p.comments||0}</Text></View>)}</>}
   {tab==="Discover"&&<><Text style={s.kicker}>DISCOVER</Text><Text style={s.hero}>Find your people.</Text>{["#WeekendIdeas","#MadeIt","#TravelTalk"].map(x=><View style={s.card} key={x}><Text style={s.name}>{x}</Text><Text style={s.muted}>Explore conversations and Pulzas that are starting now.</Text></View>)}</>}
   {tab==="Create"&&<><Text style={s.kicker}>CREATE</Text><Text style={s.hero}>Make a post.{"\n"}Or make a Pulza.</Text><Text style={s.muted}>A normal post shares something. A Pulza gives people something to participate in.</Text></>}
   {tab==="Alerts"&&<><Text style={s.kicker}>NOTIFICATIONS</Text><Text style={s.hero}>What’s happening?</Text>{notifications.length?notifications.map(n=><Pressable key={n.id} onPress={()=>markNotificationRead(n.id,user.id)} style={s.card}><Text style={s.name}>{n.profiles?.display_name||n.profiles?.username||"Someone"}</Text><Text style={s.body}>{n.type||"Activity"} on your Pulza</Text><Text style={s.meta}>{n.read_at?"Read":"New"} · {new Date(n.created_at).toLocaleString()}</Text></Pressable>):<Text style={s.muted}>No notifications yet.</Text>}</>}
   {tab==="Profile"&&<><Text style={s.kicker}>PROFILE</Text><Text style={s.hero}>{user.user_metadata?.display_name||"Your Pulza Flow."}</Text><View style={s.card}><Text style={s.name}>@{user.user_metadata?.username||"user"}</Text><Text style={s.muted}>{user.email}</Text><Text style={[s.name,{marginTop:18}]}>Blocked accounts</Text>{blocked.length?blocked.map(id=><View key={id} style={s.actionRow}><Text style={[s.muted,{flex:1}]}>{id.slice(0,8)}…</Text><Pressable onPress={()=>restoreUser(id)} style={s.action}><Text style={s.actionText}>Unblock</Text></Pressable></View>):<Text style={s.muted}>No blocked accounts.</Text>}<Pressable onPress={signOut} style={s.secondary}><Text style={s.secondaryText}>Sign out</Text></Pressable></View></>}
  </ScrollView>
  <View style={s.nav}>{["Home","Discover","Create","Alerts","Profile"].map(x=><Pressable key={x} onPress={()=>setTab(x)} style={[s.navItem,tab===x&&s.navOn]}><Text style={[s.navText,tab===x&&s.navTextOn]}>{x}</Text></Pressable>)}</View>
 </SafeAreaView>
};