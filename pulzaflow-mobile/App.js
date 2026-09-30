import React,{useState} from "react";
import {SafeAreaView,View,Text,Pressable,ScrollView,TextInput,StyleSheet} from "react-native";
import {StatusBar} from "expo-status-bar";

const seed=[
 {name:"Maya",text:"The sky looked unreal tonight. 🌅",type:"post",likes:42,comments:8},
 {name:"Daniel",text:"Finally finished the thing I kept putting off. ✨",type:"post",likes:71,comments:14},
 {name:"Leila",text:"I have Saturday free. What should we do?",type:"pulza",options:["Beach day","Brunch","Road trip"],likes:18,comments:23}
];

export default function App(){
 const [tab,setTab]=useState("Home"),[mode,setMode]=useState("Post"),[text,setText]=useState(""),[posts,setPosts]=useState(seed);
 function publish(){
  const v=text.trim(); if(!v)return;
  setPosts([{name:"You",text:v,type:mode==="Pulza"?"pulza":"post",likes:0,comments:0,options:mode==="Pulza"?["I’m in","Maybe","Tell me more"]:undefined},...posts]);
  setText("");setTab("Home");
 }
 return <SafeAreaView style={s.safe}><StatusBar style="light"/>
  <View style={s.header}><Text style={s.logo}>Pulza<Text style={s.accent}>Flow</Text></Text><Text style={s.tag}>Social, with participation.</Text></View>
  <ScrollView contentContainerStyle={s.content}>
   {tab==="Home"&&<><Text style={s.kicker}>YOUR SOCIAL WORLD</Text><Text style={s.hero}>Don’t just post.{"
"}<Text style={s.blue}>Start something.</Text></Text><Text style={s.muted}>Pulza Flow keeps the familiar social feed, then gives people a new way to participate.</Text>
    <View style={s.composer}><View style={s.row}>{["Post","Pulza"].map(x=><Pressable key={x} onPress={()=>setMode(x)} style={[s.type,mode===x&&s.typeOn]}><Text style={s.typeText}>{x}</Text></Pressable>)}</View>
     <TextInput value={text} onChangeText={setText} placeholder={mode==="Pulza"?"Start something people can participate in…":"Say something to your people…"} placeholderTextColor="#77839a" multiline style={s.input}/>
     <Pressable onPress={publish} style={s.primary}><Text style={s.primaryText}>Publish</Text></Pressable>
    </View>
    {posts.map((p,i)=><View style={[s.card,p.type==="pulza"&&s.pulza]} key={i}><Text style={s.name}>{p.name}</Text><Text style={s.body}>{p.text}</Text>
     {p.type==="pulza"&&<>{p.options.map(o=><Pressable key={o} style={s.option}><Text style={s.optionText}>{o}</Text><Text style={s.count}>0</Text></Pressable>)}<Pressable style={s.primary}><Text style={s.primaryText}>Join this Pulza</Text></Pressable></>}
     <Text style={s.meta}>♡ {p.likes}   💬 {p.comments}</Text></View>)}</>}
   {tab==="Discover"&&<><Text style={s.kicker}>DISCOVER</Text><Text style={s.hero}>Find your people.</Text>{["#WeekendIdeas","#MadeIt","#TravelTalk"].map(x=><View style={s.card} key={x}><Text style={s.name}>{x}</Text><Text style={s.muted}>Explore conversations and Pulzas that are starting now.</Text></View>)}</>}
   {tab==="Create"&&<><Text style={s.kicker}>CREATE</Text><Text style={s.hero}>Make a post.{"
"}Or make a Pulza.</Text><Text style={s.muted}>A normal post shares something. A Pulza gives people something to participate in.</Text></>}
   {tab==="Alerts"&&<><Text style={s.kicker}>NOTIFICATIONS</Text><Text style={s.hero}>What’s happening?</Text>{["Maya joined your Pulza","Daniel reacted to your post","Leila commented"].map(x=><View style={s.card} key={x}><Text style={s.name}>{x}</Text><Text style={s.meta}>Just now</Text></View>)}</>}
   {tab==="Profile"&&<><Text style={s.kicker}>PROFILE</Text><Text style={s.hero}>Your Pulza Flow.</Text><View style={s.card}><Text style={s.name}>You</Text><Text style={s.muted}>Your profile, creations, participation and future Plus status will live here.</Text></View></>}
  </ScrollView>
  <View style={s.nav}>{["Home","Discover","Create","Alerts","Profile"].map(x=><Pressable key={x} onPress={()=>setTab(x)} style={[s.navItem,tab===x&&s.navOn]}><Text style={[s.navText,tab===x&&s.navTextOn]}>{x}</Text></Pressable>)}</View>
 </SafeAreaView>
}

const s=StyleSheet.create({
 safe:{flex:1,backgroundColor:"#090d18"},header:{padding:18,borderBottomWidth:1,borderBottomColor:"#2a354b"},logo:{fontSize:26,fontWeight:"900",color:"#f7f9ff"},accent:{color:"#ff6fae"},tag:{fontSize:11,color:"#9da9bd",marginTop:2},
 content:{padding:18,paddingBottom:110},kicker:{fontSize:11,fontWeight:"900",letterSpacing:2,color:"#ff6fae",marginTop:8},hero:{fontSize:34,lineHeight:37,fontWeight:"900",color:"#f7f9ff",marginTop:8},blue:{color:"#70d8ff"},muted:{color:"#9da9bd",lineHeight:22,marginTop:8},
 composer:{backgroundColor:"#121a2b",borderColor:"#2a354b",borderWidth:1,borderRadius:20,padding:14,marginTop:18},row:{flexDirection:"row",gap:8},type:{flex:1,borderWidth:1,borderColor:"#2a354b",borderRadius:12,padding:10,alignItems:"center"},typeOn:{borderColor:"#ff6fae",backgroundColor:"#ff6fae18"},typeText:{color:"#f7f9ff",fontWeight:"800"},
 input:{minHeight:80,color:"#f7f9ff",backgroundColor:"#0b1120",borderRadius:14,padding:12,marginVertical:10,textAlignVertical:"top"},primary:{backgroundColor:"#ff6fae",borderRadius:12,padding:12,alignItems:"center",marginTop:8},primaryText:{color:"#180812",fontWeight:"900"},
 card:{backgroundColor:"#121a2b",borderColor:"#2a354b",borderWidth:1,borderRadius:20,padding:16,marginTop:12},pulza:{borderColor:"#ff6fae77"},name:{color:"#f7f9ff",fontWeight:"900",fontSize:16},body:{color:"#f7f9ff",fontSize:16,lineHeight:23,marginVertical:12},option:{flexDirection:"row",justifyContent:"space-between",borderWidth:1,borderColor:"#2a354b",borderRadius:12,padding:12,marginTop:7},optionText:{color:"#f7f9ff",fontWeight:"700"},count:{color:"#70d8ff",fontWeight:"900"},meta:{color:"#77839a",fontSize:11,marginTop:10},
 nav:{position:"absolute",bottom:0,left:0,right:0,flexDirection:"row",backgroundColor:"#090d18f5",borderTopWidth:1,borderTopColor:"#2a354b",padding:8},navItem:{flex:1,padding:10,alignItems:"center",borderRadius:12},navOn:{backgroundColor:"#171f31"},navText:{color:"#7f8ca4",fontSize:11,fontWeight:"800"},navTextOn:{color:"#fff"}
});