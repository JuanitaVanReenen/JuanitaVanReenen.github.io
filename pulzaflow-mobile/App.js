import React,{useEffect,useState} from "react";
import {SafeAreaView,View,Text,Pressable,ScrollView,StyleSheet,TextInput,ActivityIndicator} from "react-native";
import {StatusBar} from "expo-status-bar";
import {supabase} from "./lib/supabase";
import {signIn,signUp,signOut} from "./services/auth";
import {getFeed,createPulza} from "./services/pulzas";

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

function AppShell({user}){
 const [tab,setTab]=useState("Home"),[mode,setMode]=useState("Post"),[text,setText]=useState(""),[posts,setPosts]=useState(seed),[saving,setSaving]=useState(false);
 useEffect(()=>{getFeed().then(({data})=>{if(data?.length)setPosts(data.map(p=>({name:p.profiles?.display_name||p.profiles?.username||"User",text:p.body,type:p.kind,likes:0,comments:0,options:p.pulza_options?.map(o=>o.option_text)})))});},[]);
 async function publish(){
  const v=text.trim();if(!v||saving)return;
  setSaving(true);
  const options=mode==="Pulza"?["I’m in","Maybe","Tell me more"]:[];
  const {data,error}=await createPulza(user.id,v,options);
  setSaving(false);
  if(error){setPosts([{name:"You",text:v,type:mode==="Pulza"?"pulza":"post",likes:0,comments:0,options},...posts]);}
  else setPosts([{name:"You",text:data.body,type:data.kind,likes:0,comments:0,options},...posts]);
  setText("");setTab("Home");
 }
 return <SafeAreaView style={s.safe}><StatusBar style="light"/>
  <View style={s.header}><Text style={s.logo}>Pulza<Text style={s.accent}>Flow</Text></Text><Text style={s.tag}>Social, with participation.</Text></View>
  <ScrollView contentContainerStyle={s.content}>
   {tab==="Home"&&<><Text style={s.kicker}>YOUR SOCIAL WORLD</Text><Text style={s.hero}>Don’t just post.{"\n"}<Text style={s.blue}>Start something.</Text></Text><Text style={s.muted}>Pulza Flow keeps the familiar social feed, then gives people a new way to participate.</Text>
    <View style={s.composer}><View style={s.row}>{["Post","Pulza"].map(x=><Pressable key={x} onPress={()=>setMode(x)} style={[s.type,mode===x&&s.typeOn]}><Text style={s.typeText}>{x}</Text></Pressable>)}</View>
     <TextInput value={text} onChangeText={setText} placeholder={mode==="Pulza"?"Start something people can participate in…":"Say something to your people…"} placeholderTextColor="#77839a" multiline style={s.input}/>
     <Pressable onPress={publish} style={s.primary}><Text style={s.primaryText}>{saving?"Saving…":"Publish"}</Text></Pressable>
    </View>
    {posts.map((p,i)=><View style={[s.card,p.type==="pulza"&&s.pulza]} key={i}><Text style={s.name}>{p.name}</Text><Text style={s.body}>{p.text}</Text>
     {p.type==="pulza"&&<>{(p.options||[]).map(o=><Pressable key={o} style={s.option}><Text style={s.optionText}>{o}</Text><Text style={s.count}>0</Text></Pressable>)}<Pressable style={s.primary}><Text style={s.primaryText}>Join this Pulza</Text></Pressable></>}
     <Text style={s.meta}>♡ {p.likes||0}   💬 {p.comments||0}</Text></View>)}</>}
   {tab==="Discover"&&<><Text style={s.kicker}>DISCOVER</Text><Text style={s.hero}>Find your people.</Text>{["#WeekendIdeas","#MadeIt","#TravelTalk"].map(x=><View style={s.card} key={x}><Text style={s.name}>{x}</Text><Text style={s.muted}>Explore conversations and Pulzas that are starting now.</Text></View>)}</>}
   {tab==="Create"&&<><Text style={s.kicker}>CREATE</Text><Text style={s.hero}>Make a post.{"\n"}Or make a Pulza.</Text><Text style={s.muted}>A normal post shares something. A Pulza gives people something to participate in.</Text></>}
   {tab==="Alerts"&&<><Text style={s.kicker}>NOTIFICATIONS</Text><Text style={s.hero}>What’s happening?</Text>{["Maya joined your Pulza","Daniel reacted to your post","Leila commented"].map(x=><View style={s.card} key={x}><Text style={s.name}>{x}</Text><Text style={s.meta}>Just now</Text></View>)}</>}
   {tab==="Profile"&&<><Text style={s.kicker}>PROFILE</Text><Text style={s.hero}>{user.user_metadata?.display_name||"Your Pulza Flow."}</Text><View style={s.card}><Text style={s.name}>@{user.user_metadata?.username||"user"}</Text><Text style={s.muted}>{user.email}</Text><Pressable onPress={signOut} style={s.secondary}><Text style={s.secondaryText}>Sign out</Text></Pressable></View></>}
  </ScrollView>
  <View style={s.nav}>{["Home","Discover","Create","Alerts","Profile"].map(x=><Pressable key={x} onPress={()=>setTab(x)} style={[s.navItem,tab===x&&s.navOn]}><Text style={[s.navText,tab===x&&s.navTextOn]}>{x}</Text></Pressable>)}</View>
 </SafeAreaView>
}

export default function App(){
 const [session,setSession]=useState(null);
 useEffect(()=>{supabase.auth.getSession().then(({data})=>setSession(data.session));const {data:{subscription}}=supabase.auth.onAuthStateChange((_event,next)=>setSession(next));return()=>subscription.unsubscribe()},[]);
 return session?<AppShell user={session.user}/>:<AuthScreen/>;
}

const s=StyleSheet.create({
 safe:{flex:1,backgroundColor:"#090d18"},auth:{padding:24,paddingTop:70,flexGrow:1,justifyContent:"center"},header:{padding:18,borderBottomWidth:1,borderBottomColor:"#2a354b"},logo:{fontSize:26,fontWeight:"900",color:"#f7f9ff"},accent:{color:"#ff6fae"},tag:{fontSize:11,color:"#9da9bd",marginTop:2},content:{padding:18,paddingBottom:110},kicker:{fontSize:11,fontWeight:"900",letterSpacing:2,color:"#ff6fae",marginTop:8},hero:{fontSize:34,lineHeight:37,fontWeight:"900",color:"#f7f9ff",marginTop:8},blue:{color:"#70d8ff"},muted:{color:"#9da9bd",lineHeight:22,marginTop:8},composer:{backgroundColor:"#121a2b",borderColor:"#2a354b",borderWidth:1,borderRadius:20,padding:14,marginTop:18},row:{flexDirection:"row",gap:8},type:{flex:1,borderWidth:1,borderColor:"#2a354b",borderRadius:12,padding:10,alignItems:"center"},typeOn:{borderColor:"#ff6fae",backgroundColor:"#ff6fae18"},typeText:{color:"#f7f9ff",fontWeight:"800"},input:{minHeight:52,color:"#f7f9ff",backgroundColor:"#0b1120",borderRadius:14,padding:12,marginVertical:10,textAlignVertical:"top"},primary:{backgroundColor:"#ff6fae",borderRadius:12,padding:12,alignItems:"center",marginTop:8},primaryText:{color:"#180812",fontWeight:"900"},secondary:{borderWidth:1,borderColor:"#2a354b",borderRadius:12,padding:12,alignItems:"center",marginTop:14},secondaryText:{color:"#f7f9ff",fontWeight:"800"},switch:{padding:16,alignItems:"center"},switchText:{color:"#70d8ff",fontWeight:"700"},error:{color:"#ff8a9b",marginTop:6},card:{backgroundColor:"#121a2b",borderColor:"#2a354b",borderWidth:1,borderRadius:20,padding:16,marginTop:12},pulza:{borderColor:"#ff6fae77"},name:{color:"#f7f9ff",fontWeight:"900",fontSize:16},body:{color:"#f7f9ff",fontSize:16,lineHeight:23,marginVertical:12},option:{flexDirection:"row",justifyContent:"space-between",borderWidth:1,borderColor:"#2a354b",borderRadius:12,padding:12,marginTop:7},optionText:{color:"#f7f9ff",fontWeight:"700"},count:{color:"#70d8ff",fontWeight:"900"},meta:{color:"#77839a",fontSize:11,marginTop:10},nav:{position:"absolute",bottom:0,left:0,right:0,flexDirection:"row",backgroundColor:"#090d18f5",borderTopWidth:1,borderTopColor:"#2a354b",padding:8},navItem:{flex:1,padding:10,alignItems:"center",borderRadius:12},navOn:{backgroundColor:"#171f31"},navText:{color:"#7f8ca4",fontSize:11,fontWeight:"800"},navTextOn:{color:"#fff"}
});