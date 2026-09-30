const POLICY_TERMS_VERSION = '1.0';

import React,{useEffect,useState} from "react";
import {SafeAreaView,View,Text,Pressable,ScrollView,StyleSheet,TextInput,ActivityIndicator,Image,Alert} from "react-native";
import {StatusBar} from "expo-status-bar";
import {supabase} from "./lib/supabase";
import {signIn,signUp,signOut} from "./services/auth";
import {requestAccountDeletion} from "./services/account";
import {getFeed,createPulza} from "./services/pulzas";
import {getMediaUrl,pickMedia} from "./services/media";
import {reactToPulza,removeReaction,getComments,addComment,voteOnPulza,subscribeToPulza} from "./services/social";
import {getNotifications,markNotificationRead,subscribeToNotifications} from "./services/notifications";
import {reportPulza,blockUser,unblockUser,getBlockedUsers} from "./services/moderation";
import {getSubscription,hasPlusAccess,subscriptionLabel,PLUS_PRODUCTS} from "./services/subscriptions";
import {configureBilling,purchasePlus,restorePurchases} from "./services/billing";
import {getProfile,updateProfile,pickAndUploadAvatar,getAvatarUrl} from "./services/profile";


function PolicyGate({user,onAccepted}) {
  const [busy,setBusy]=useState(false);
  const accept=async()=>{
    setBusy(true);
    const {error}=await supabase.from('policy_acceptances').insert({user_id:user.id,terms_version:POLICY_TERMS_VERSION,guidelines_version:POLICY_TERMS_VERSION});
    setBusy(false);
    if(!error) onAccepted();
  };
  return <SafeAreaView style={s.safe}><ScrollView contentContainerStyle={s.auth}>
    <Text style={s.title}>Welcome to PULZA FLOW</Text>
    <Text style={s.muted}>Before you create or participate in Pulzas, please accept the Terms of Use and Community Guidelines.</Text>
    <Text style={s.muted}>You do not need to provide a government ID to use PULZA FLOW.</Text>
    <Pressable style={s.button} disabled={busy} onPress={accept}><Text style={s.buttonText}>{busy?'Saving...':'Accept & Continue'}</Text></Pressable>
  </ScrollView></SafeAreaView>;
}
function AuthScreen(){
 const [signup,setSignup]=useState(false),[email,setEmail]=useState(""),[password,setPassword]=useState(""),[username,setUsername]=useState(""),[displayName,setDisplayName]=useState(""),[loading,setLoading]=useState(false),[error,setError]=useState("");
 async function submit(){
  setError("");setLoading(true);
  const result=signup?await signUp(email.trim(),password,username.trim(),displayName.trim()):await signIn(email.trim(),password);
  setLoading(false);
  if(result.error)setError(result.error.message);
  else if(signup&&!result.data?.session)setError("Check your email to confirm your account, then sign in.");
 }
 return <SafeAreaView style={s.safe}><StatusBar style="light"/><ScrollView contentContainerStyle={s.auth}><Text style={s.muted}>Sign up or sign in with your email and password. No government ID is required.</Text>
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

const seed=[];

function MediaPreview({media}){
 const [url,setUrl]=useState(null);
 useEffect(()=>{if(media?.storage_path)getMediaUrl(media.storage_path).then(r=>setUrl(r.data));},[media?.storage_path]);
 if(!url)return null;
 return media.media_type==="image"?<Image source={{uri:url}} style={s.media}/> : <View style={s.videoPlaceholder}><Text style={s.videoText}>▶ Video</Text></View>;
}

function AppShell({user}){
 const [subscription,setSubscription]=useState(null),[profile,setProfile]=useState(null),[profileBusy,setProfileBusy]=useState(false),[editingProfile,setEditingProfile]=useState(false),[profileName,setProfileName]=useState(""),[profileUsername,setProfileUsername]=useState(""),[profileBio,setProfileBio]=useState(""),[avatarUrl,setAvatarUrl]=useState(null),[selectedMedia,setSelectedMedia]=useState(null),[mediaBusy,setMediaBusy]=useState(false),[plusLoading,setPlusLoading]=useState(false),[blocked,setBlocked]=useState([]),[safetyPost,setSafetyPost]=useState(null),[safetyBusy,setSafetyBusy]=useState(false),[feedError,setFeedError]=useState(""),[tab,setTab]=useState("Home"),[mode,setMode]=useState("Post"),[text,setText]=useState(""),[posts,setPosts]=useState(seed),[saving,setSaving]=useState(false),[attach,setAttach]=useState(false),[commentsOpen,setCommentsOpen]=useState(null),[commentText,setCommentText]=useState(""),[commentRows,setCommentRows]=useState({}),[liked,setLiked]=useState({}),[voted,setVoted]=useState({}),[notifications,setNotifications]=useState([]);

 async function loadBlocks(){const {data,error}=await getBlockedUsers(user.id);if(!error)setBlocked((data||[]).map(b=>b.blocked_id));}
 useEffect(()=>{loadBlocks();getSubscription(user.id).then(({data})=>setSubscription(data));configureBilling(user.id);loadProfile();},[user.id]);
 async function loadProfile(){const {data,error}=await getProfile(user.id);if(!error&&data){setProfile(data);setProfileName(data.display_name||"");setProfileUsername(data.username||"");setProfileBio(data.bio||"");const a=await getAvatarUrl(data.avatar_url);setAvatarUrl(a.data||null);}}
 async function saveProfile(){setProfileBusy(true);const {data,error}=await updateProfile(user.id,{display_name:profileName,username:profileUsername,bio:profileBio});setProfileBusy(false);if(error){Alert.alert("Profile","Could not save your profile: "+error.message);return;}setProfile(data);setEditingProfile(false);}
 async function changeAvatar(){setProfileBusy(true);const r=await pickAndUploadAvatar(user.id);setProfileBusy(false);if(r.error){Alert.alert("Profile photo",r.error.message);return;}if(r.data){await loadProfile();}}
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

 async function attachMedia(){const r=await pickMedia();if(r.error){setFeedError(r.error.message);return;}if(r.data){setSelectedMedia(r.data);setFeedError("");}}\n async function publish(){
  const v=text.trim();if(!v||saving)return;
  setSaving(true);
  const options=mode==="Pulza"?["I’m in","Maybe","Tell me more"]:[];
  const {data,error}=await createPulza(user.id,v,options,selectedMedia,mode==="Pulza"?"pulza":"post");
  setSaving(false);
  if(!error){setText("");setSelectedMedia(null);setAttach(false);await loadFeed();setTab("Home");}
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
     <Pressable disabled={mediaBusy} onPress={attachMedia} style={s.secondary}><Text style={s.secondaryText}>{selectedMedia?"Media selected ✓":"Attach photo / video"}</Text></Pressable>{selectedMedia?<Text style={s.meta}>{selectedMedia.fileName||selectedMedia.type||"Media selected"} · ready to upload</Text>:null}<Pressable onPress={publish} style={s.primary}><Text style={s.primaryText}>{saving?"Saving…":"Publish"}</Text></Pressable>
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
   {tab==="Profile"&&<><Text style={s.kicker}>PROFILE</Text><View style={s.profileHead}>{avatarUrl?<Image source={{uri:avatarUrl}} style={s.avatar}/>:<View style={s.avatarEmpty}><Text style={s.avatarLetter}>{(profile?.display_name||user.user_metadata?.display_name||"P").charAt(0).toUpperCase()}</Text></View>}<Pressable disabled={profileBusy} onPress={changeAvatar} style={s.secondary}><Text style={s.secondaryText}>{profileBusy?"Saving…":"Change profile photo"}</Text></Pressable></View><View style={s.card}><Text style={s.name}>{profile?.display_name||user.user_metadata?.display_name||"Your Pulza Flow."}</Text><Text style={s.muted}>@{profile?.username||user.user_metadata?.username||"user"}</Text><Text style={s.muted}>{profile?.bio||"Add a short bio so people know you."}</Text><Text style={s.muted}>{user.email}</Text>{editingProfile?<><TextInput value={profileName} onChangeText={setProfileName} placeholder="Display name" placeholderTextColor="#77839a" style={s.input}/><TextInput value={profileUsername} onChangeText={setProfileUsername} autoCapitalize="none" placeholder="Username" placeholderTextColor="#77839a" style={s.input}/><TextInput value={profileBio} onChangeText={setProfileBio} placeholder="Bio" placeholderTextColor="#77839a" multiline style={s.input}/><Pressable disabled={profileBusy} onPress={saveProfile} style={s.primary}><Text style={s.primaryText}>{profileBusy?"Saving…":"Save profile"}</Text></Pressable><Pressable onPress={()=>setEditingProfile(false)} style={s.secondary}><Text style={s.secondaryText}>Cancel</Text></Pressable></>:<Pressable onPress={()=>setEditingProfile(true)} style={s.secondary}><Text style={s.secondaryText}>Edit profile</Text></Pressable><View style={s.card}><Text style={s.name}>PULZA FLOW PLUS</Text><Text style={s.muted}>Status: {subscriptionLabel(subscription)}</Text><Text style={s.muted}>Enhanced creation tools, creator controls and participation insights.</Text><Pressable disabled={plusLoading||hasPlusAccess(subscription)} onPress={async()=>{setPlusLoading(true);const r=await purchasePlus(user.id);setPlusLoading(false);if(r.ok){Alert.alert("PULZA FLOW PLUS","Purchase completed. Your PLUS access will appear after the subscription server sync.");const {data}=await getSubscription(user.id);if(data)setSubscription(data);}else Alert.alert("PLUS",""+(r.error?.message||"Unable to start the subscription."));}} style={s.primary}><Text style={s.primaryText}>{plusLoading?"Connecting…":hasPlusAccess(subscription)?"PLUS Active":"Get PLUS"}</Text></Pressable><Pressable disabled={plusLoading} onPress={async()=>{setPlusLoading(true);const r=await restorePurchases(user.id);setPlusLoading(false);if(r.ok){Alert.alert("Restored","Your purchases have been restored.");const {data}=await getSubscription(user.id);if(data)setSubscription(data);}else Alert.alert("Restore failed",r.error?.message||"Unable to restore purchases.");}} style={s.secondary}><Text style={s.secondaryText}>Restore purchases</Text></Pressable></View><Text style={[s.name,{marginTop:18}]}>Blocked accounts</Text>{blocked.length?blocked.map(id=><View key={id} style={s.actionRow}><Text style={[s.muted,{flex:1}]}>{id.slice(0,8)}…</Text><Pressable onPress={()=>restoreUser(id)} style={s.action}><Text style={s.actionText}>Unblock</Text></Pressable></View>):<Text style={s.muted}>No blocked accounts.</Text>}<Pressable onPress={signOut} style={s.secondary}><Text style={s.secondaryText}>Sign out</Text></Pressable><Pressable onPress={()=>Alert.alert("Delete account","This permanently deletes your PULZA FLOW account and associated data. Your app-store subscription must be cancelled separately.",[{text:"Cancel",style:"cancel"},{text:"Delete account",style:"destructive",onPress:async()=>{const {error}=await requestAccountDeletion();if(error){Alert.alert("Deletion failed",error.message);return;}await signOut();Alert.alert("Account deleted","Your PULZA FLOW account has been deleted.");}}])} style={s.secondary}><Text style={[s.secondaryText,{color:"#ff9a9a"}]}>Delete account</Text></Pressable></View></>}
  </ScrollView>
  <View style={s.nav}>{["Home","Discover","Create","Alerts","Profile"].map(x=><Pressable key={x} onPress={()=>setTab(x)} style={[s.navItem,tab===x&&s.navOn]}><Text style={[s.navText,tab===x&&s.navTextOn]}>{x}</Text></Pressable>)}</View>
 </SafeAreaView>
};

function RootApp(){
 const [session,setSession]=useState(null);
 const [loading,setLoading]=useState(true);
 const [accepted,setAccepted]=useState(false);
 const [policyLoading,setPolicyLoading]=useState(false);

 useEffect(()=>{
   let mounted=true;
   supabase.auth.getSession().then(({data})=>{if(mounted){setSession(data.session);setLoading(false);}});
   const {data:{subscription}}=supabase.auth.onAuthStateChange((_event,next)=>{if(mounted){setSession(next);setLoading(false);}});
   return()=>{mounted=false;subscription.unsubscribe();};
 },[]);

 useEffect(()=>{
   if(!session){setAccepted(false);return;}
   setPolicyLoading(true);
   supabase.from('policy_acceptances')
     .select('user_id')
     .eq('user_id',session.user.id)
     .eq('terms_version',POLICY_TERMS_VERSION)
     .eq('guidelines_version',POLICY_TERMS_VERSION)
     .maybeSingle()
     .then(({data,error})=>{
       setAccepted(!error && !!data);
       setPolicyLoading(false);
     });
 },[session?.user?.id]);

 if(loading||policyLoading)return <SafeAreaView style={s.safe}><ActivityIndicator size="large"/></SafeAreaView>;
 if(!session)return <AuthScreen/>;
 if(!accepted)return <PolicyGate user={session.user} onAccepted={()=>setAccepted(true)}/>;
 return <AppShell user={session.user}/>;
}

const s=StyleSheet.create({
 safe:{flex:1,backgroundColor:"#08111f"},
 auth:{flexGrow:1,justifyContent:"center",padding:24},
 title:{fontSize:28,fontWeight:"800",color:"#fff",marginBottom:18},
 logo:{fontSize:30,fontWeight:"900",color:"#fff"},
 accent:{color:"#4da3ff"},
 hero:{fontSize:30,fontWeight:"800",color:"#fff",marginTop:12,marginBottom:10},
 muted:{color:"#9aa8bd",fontSize:15,lineHeight:22,marginBottom:14},
 input:{backgroundColor:"#111d2d",borderWidth:1,borderColor:"#26364d",borderRadius:14,color:"#fff",padding:14,marginTop:10,minHeight:48},
 error:{color:"#ff8f8f",marginTop:10,lineHeight:20},
 primary:{backgroundColor:"#2f8cff",borderRadius:14,padding:14,alignItems:"center",marginTop:12},
 primaryText:{color:"#fff",fontWeight:"800",fontSize:15},
 secondary:{backgroundColor:"#142235",borderRadius:14,padding:13,alignItems:"center",marginTop:10},
 secondaryText:{color:"#cbd7e8",fontWeight:"700"},
 button:{backgroundColor:"#2f8cff",borderRadius:14,padding:15,alignItems:"center",marginTop:16},
 buttonText:{color:"#fff",fontWeight:"800"},
 switch:{padding:14,alignItems:"center"},
 switchText:{color:"#72b5ff",fontWeight:"700"},
 header:{paddingHorizontal:18,paddingTop:14,paddingBottom:10,borderBottomWidth:1,borderBottomColor:"#16243a"},
 tag:{color:"#75849b",fontSize:12,marginTop:3},
 content:{padding:18,paddingBottom:100},
 kicker:{color:"#6e86a5",fontSize:11,fontWeight:"800",letterSpacing:1.5,marginBottom:8},
 blue:{color:"#4da3ff"},
 composer:{backgroundColor:"#0d1929",borderRadius:18,padding:14,marginTop:18,marginBottom:18},
 row:{flexDirection:"row",alignItems:"center",gap:8},
 type:{paddingVertical:8,paddingHorizontal:14,borderRadius:20,backgroundColor:"#142235"},
 typeOn:{backgroundColor:"#2f8cff"},
 typeText:{color:"#fff",fontWeight:"700"},
 card:{backgroundColor:"#0d1929",borderRadius:18,padding:16,marginBottom:14},
 pulza:{borderWidth:1,borderColor:"#285b91"},
 name:{color:"#fff",fontWeight:"800",fontSize:15},
 body:{color:"#d9e3f0",fontSize:16,lineHeight:24,marginTop:10},
 actionRow:{flexDirection:"row",gap:10,marginTop:12,flexWrap:"wrap"},
 action:{paddingVertical:7,paddingHorizontal:10,borderRadius:10,backgroundColor:"#142235"},
 actionText:{color:"#8ec5ff",fontWeight:"700"},
 option:{flexDirection:"row",justifyContent:"space-between",alignItems:"center",backgroundColor:"#142235",padding:13,borderRadius:12,marginTop:8},
 optionOn:{borderWidth:1,borderColor:"#4da3ff"},
 optionText:{color:"#fff",flex:1},
 count:{color:"#8fb0d0",fontSize:12},
 comments:{marginTop:12,borderTopWidth:1,borderTopColor:"#1d2b40",paddingTop:12},
 commentTitle:{color:"#fff",fontWeight:"800",marginBottom:8},
 comment:{paddingVertical:8},
 commentBody:{color:"#cbd7e8",marginTop:2},
 meta:{color:"#6f8199",fontSize:12,marginTop:12},
 media:{width:"100%",height:220,borderRadius:14,marginTop:12},
 videoPlaceholder:{height:180,borderRadius:14,marginTop:12,backgroundColor:"#111d2d",alignItems:"center",justifyContent:"center"},
 videoText:{color:"#fff",fontWeight:"800"},
 nav:{position:"absolute",left:0,right:0,bottom:0,flexDirection:"row",backgroundColor:"#0a1524",borderTopWidth:1,borderTopColor:"#1b2b42",paddingVertical:8},
 navItem:{flex:1,alignItems:"center",paddingVertical:8},
 navOn:{backgroundColor:"#12253d",borderRadius:10,marginHorizontal:3},
 navText:{color:"#71839b",fontSize:11,fontWeight:"700"},
 navTextOn:{color:"#fff"},
 profileHead:{alignItems:"center",marginBottom:14},
 avatar:{width:104,height:104,borderRadius:52,marginBottom:10},
 avatarEmpty:{width:104,height:104,borderRadius:52,backgroundColor:"#1b304b",alignItems:"center",justifyContent:"center",marginBottom:10},
 avatarLetter:{fontSize:38,fontWeight:"900",color:"#fff"}
});

export default RootApp;
