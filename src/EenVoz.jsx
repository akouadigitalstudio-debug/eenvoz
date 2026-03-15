'use client';
import { useState, useEffect, useRef, useCallback } from "react";

// ─────────────────────────────────────────────────────────────
// DESIGN TOKENS
// ─────────────────────────────────────────────────────────────
const C = {
  bg:"#04040C", card:"#09091A", card2:"#0D0D22",
  border:"#14142A", brigh:"#1E1E38",
  red:"#FF1744", gold:"#FFD600", cyan:"#00E5FF",
  green:"#00E676", purple:"#D500F9",
  orange:"#FF6D00", pink:"#FF4081",
  text:"#F0F0FF", dim:"#4A4A6A", ghost:"#1A1A30",
  bronze:"#CD7F32", silver:"#C0C0C0",
};

const CAT = {
  amour:"#FF1744", argent:"#FFD600", amitié:"#D500F9",
  famille:"#00E676", société:"#00E5FF",
  vérité:"#FF6D00", relations:"#FF4081",
};

// ─────────────────────────────────────────────────────────────
// BADGES
// ─────────────────────────────────────────────────────────────
const BADGES = [
  { id:"first",    icon:"⚡", label:"Premier pas",  desc:"Première réponse",      color:C.cyan,   req:p=>p.votes>=1 },
  { id:"bronze",   icon:"🥉", label:"Bronze",        desc:"7 jours de suite",      color:C.bronze, req:p=>p.bestStreak>=7 },
  { id:"silver",   icon:"🥈", label:"Argent",        desc:"30 jours de suite",     color:C.silver, req:p=>p.bestStreak>=30 },
  { id:"gold",     icon:"🥇", label:"Or",            desc:"100 jours de suite",    color:C.gold,   req:p=>p.bestStreak>=100 },
  { id:"voice",    icon:"🎤", label:"Vocaliste",     desc:"10 vocaux envoyés",     color:C.purple, req:p=>p.voicesSent>=10 },
  { id:"sharer",   icon:"🔥", label:"Viral",         desc:"20 partages",           color:C.red,    req:p=>p.shares>=20 },
  { id:"social",   icon:"🌍", label:"Ambassadeur",   desc:"5 amis invités",        color:C.green,  req:p=>p.invited>=5 },
  { id:"streak3",  icon:"🔥", label:"3 jours",       desc:"3 jours consécutifs",   color:C.orange, req:p=>p.streak>=3 },
  { id:"streak10", icon:"💥", label:"10 jours",      desc:"10 jours consécutifs",  color:C.red,    req:p=>p.streak>=10 },
  { id:"century",  icon:"💯", label:"Centenaire",    desc:"100 réponses totales",  color:C.gold,   req:p=>p.votes>=100 },
];
const earnedBadges = p => BADGES.filter(b=>b.req(p));

// ─────────────────────────────────────────────────────────────
// LEADERBOARD DATA
// ─────────────────────────────────────────────────────────────
const LEADERBOARD_BASE = [
  { name:"Aminata K.", city:"Abidjan",    flag:"🇨🇮", pts:2840, streak:34, votes:182, shares:47 },
  { name:"Djibril M.", city:"Dakar",      flag:"🇸🇳", pts:2105, streak:21, votes:143, shares:31 },
  { name:"Fatou S.",   city:"Paris",      flag:"🇫🇷", pts:1980, streak:18, votes:128, shares:28 },
  { name:"Marco R.",   city:"Amsterdam",  flag:"🇳🇱", pts:1760, streak:15, votes:112, shares:19 },
  { name:"Yann D.",    city:"Lyon",       flag:"🇫🇷", pts:1540, streak:12, votes:99,  shares:15 },
  { name:"Aïcha B.",   city:"Casablanca", flag:"🇲🇦", pts:1320, streak:9,  votes:87,  shares:12 },
  { name:"Carlos M.",  city:"Madrid",     flag:"🇪🇸", pts:1180, streak:8,  votes:78,  shares:9  },
];

// ─────────────────────────────────────────────────────────────
// I18N
// ─────────────────────────────────────────────────────────────
const I18N = {
  fr:{
    tagline:"Une question. Ta vraie réponse. Chaque jour.",
    start:"RÉPONDRE MAINTENANT",
    qod:"Question du jour", orVoice:"OU",
    voiceBtn:"RÉPONDRE EN VOCAL · MAX 10S",
    recording:"Enregistrement", holdRecord:"Maintiens pour enregistrer",
    maxVoice:"Max 5 vocaux/jour",
    world:"Monde", city:"Ville", country:"Pays",
    popularVoices:"Écouter les réponses du monde entier",
    shareBtn:"PARTAGER MON RÉSULTAT",
    next:"Question suivante →",
    copyLink:"Copier le lien", copied:"Copié !",
    myAnswer:"Ma réponse", shareTitle:"Partage ton avis",
    shareHint:"Défie tes amis 🔥",
    home:"Accueil", profile:"Profil", admin:"Admin",
    listen:"Écouter", stop:"Stop", flag:"Signaler", anon:"Anonyme",
    sponsoredBy:"Sponsorisé par",
    inviteCode:"Mon lien d'invitation",
    inviteCopied:"Lien copié !",
    answered:"personnes ont répondu aujourd'hui",
    live:"EN DIRECT",
    majority:p=>`${p}% pensent comme toi 🔥`,
    split:p=>`Les avis sont partagés — ${p}% dans ta camp`,
    minority:p=>`Seulement ${p}% pensent comme toi 💎`,
    opts:["OUI","NON","ÇA DÉPEND"],
    streakLabel:"Streak",
    streakKeep:"🔥 Tu gardes ton streak !",
    streakNew:n=>`🔥 Nouveau streak : ${n} jours !`,
    streakStart:"🔥 Streak lancé ! Reviens demain.",
    bestStreak:"Meilleur streak",
    todayDone:"Tu as déjà répondu aujourd'hui ✅",
    notifTitle:"EenVoz",
    notifBody:"Nouvelle question du jour 🎤",
    notifEnable:"🔔 Activer les notifications",
    badgesTitle:"Badges",
    leaderboard:"Classement",
    weeklyTop:"Top de la semaine",
    currentStreak:"Streak actuel",
    longestStreak:"Meilleur streak",
    totalPoints:"Points",
    totalAnswers:"Réponses",
    totalVoices:"Vocaux",
    totalShares:"Partages",
    history:"Historique",
    inviteTitle:"Invite tes amis",
    inviteDesc:n=>`+${n} pts par ami qui rejoint`,
    rankLabel:"Rang",
    shareOn:"Partager sur",
    resultsTitle:"Résultats mondiaux",
    voicesTitle:"Voix du monde",
    voiceCount:n=>`${n} réponses vocales aujourd'hui`,
  },
  en:{
    tagline:"One question. Your real answer. Every day.",
    start:"ANSWER NOW",
    qod:"Today's question", orVoice:"OR",
    voiceBtn:"VOICE REPLY · MAX 10S",
    recording:"Recording", holdRecord:"Hold to record",
    maxVoice:"Max 5 voices/day",
    world:"World", city:"City", country:"Country",
    popularVoices:"Listen to voices from around the world",
    shareBtn:"SHARE MY RESULT",
    next:"Next question →",
    copyLink:"Copy link", copied:"Copied!",
    myAnswer:"My answer", shareTitle:"Share your opinion",
    shareHint:"Challenge your friends 🔥",
    home:"Home", profile:"Profile", admin:"Admin",
    listen:"Listen", stop:"Stop", flag:"Report", anon:"Anonymous",
    sponsoredBy:"Sponsored by",
    inviteCode:"My invite link",
    inviteCopied:"Link copied!",
    answered:"people answered today",
    live:"LIVE",
    majority:p=>`${p}% agree with you 🔥`,
    split:p=>`Opinions split — you're in the ${p}% camp`,
    minority:p=>`Only ${p}% agree with you 💎`,
    opts:["YES","NO","DEPENDS"],
    streakLabel:"Streak",
    streakKeep:"🔥 Streak maintained!",
    streakNew:n=>`🔥 New streak: ${n} days!`,
    streakStart:"🔥 Streak started! Come back tomorrow.",
    bestStreak:"Best streak",
    todayDone:"Already answered today ✅",
    notifTitle:"EenVoz",
    notifBody:"New question of the day 🎤",
    notifEnable:"🔔 Enable notifications",
    badgesTitle:"Badges",
    leaderboard:"Leaderboard",
    weeklyTop:"Top of the week",
    currentStreak:"Current streak",
    longestStreak:"Best streak",
    totalPoints:"Points",
    totalAnswers:"Answers",
    totalVoices:"Voices",
    totalShares:"Shares",
    history:"History",
    inviteTitle:"Invite friends",
    inviteDesc:n=>`+${n} pts per friend who joins`,
    rankLabel:"Rank",
    shareOn:"Share on",
    resultsTitle:"Global results",
    voicesTitle:"Voices of the world",
    voiceCount:n=>`${n} voice replies today`,
  },
  es:{
    tagline:"Una pregunta. Tu respuesta real. Cada día.",
    start:"RESPONDER AHORA",
    qod:"Pregunta del día", orVoice:"O",
    voiceBtn:"RESPUESTA DE VOZ · MÁX 10S",
    recording:"Grabando", holdRecord:"Mantén para grabar",
    maxVoice:"Máx 5 voces/día",
    world:"Mundo", city:"Ciudad", country:"País",
    popularVoices:"Escuchar respuestas del mundo",
    shareBtn:"COMPARTIR MI RESULTADO",
    next:"Siguiente →",
    copyLink:"Copiar enlace", copied:"¡Copiado!",
    myAnswer:"Mi respuesta", shareTitle:"Comparte tu opinión",
    shareHint:"Reta a tus amigos 🔥",
    home:"Inicio", profile:"Perfil", admin:"Admin",
    listen:"Escuchar", stop:"Parar", flag:"Denunciar", anon:"Anónimo",
    sponsoredBy:"Patrocinado por",
    inviteCode:"Mi enlace de invitación",
    inviteCopied:"¡Enlace copiado!",
    answered:"personas respondieron hoy",
    live:"EN VIVO",
    majority:p=>`${p}% piensan como tú 🔥`,
    split:p=>`Opiniones divididas — tú con el ${p}%`,
    minority:p=>`Solo ${p}% piensa como tú 💎`,
    opts:["SÍ","NO","DEPENDE"],
    streakLabel:"Racha",
    streakKeep:"🔥 ¡Racha mantenida!",
    streakNew:n=>`🔥 ¡Nueva racha: ${n} días!`,
    streakStart:"🔥 ¡Racha iniciada! Vuelve mañana.",
    bestStreak:"Mejor racha",
    todayDone:"Ya respondiste hoy ✅",
    notifTitle:"EenVoz",
    notifBody:"Nueva pregunta del día 🎤",
    notifEnable:"🔔 Activar notificaciones",
    badgesTitle:"Insignias", leaderboard:"Clasificación",
    weeklyTop:"Top de la semana",
    currentStreak:"Racha actual", longestStreak:"Mejor racha",
    totalPoints:"Puntos", totalAnswers:"Respuestas", totalVoices:"Voces", totalShares:"Compartidos",
    history:"Historial", inviteTitle:"Invitar amigos",
    inviteDesc:n=>`+${n} pts por amigo que se une`,
    rankLabel:"Rango", shareOn:"Compartir en",
    resultsTitle:"Resultados globales",
    voicesTitle:"Voces del mundo", voiceCount:n=>`${n} respuestas de voz hoy`,
  },
  pt:{
    tagline:"Uma pergunta. Sua resposta real. Todo dia.",
    start:"RESPONDER AGORA",
    qod:"Pergunta do dia", orVoice:"OU",
    voiceBtn:"RESPOSTA EM VOZ · MÁX 10S",
    recording:"Gravando", holdRecord:"Segure para gravar",
    maxVoice:"Máx 5 vozes/dia",
    world:"Mundo", city:"Cidade", country:"País",
    popularVoices:"Ouvir respostas do mundo",
    shareBtn:"COMPARTILHAR MEU RESULTADO",
    next:"Próxima →",
    copyLink:"Copiar link", copied:"Copiado!",
    myAnswer:"Minha resposta", shareTitle:"Compartilhe sua opinião",
    shareHint:"Desafie seus amigos 🔥",
    home:"Início", profile:"Perfil", admin:"Admin",
    listen:"Ouvir", stop:"Parar", flag:"Denunciar", anon:"Anônimo",
    sponsoredBy:"Patrocinado por",
    inviteCode:"Meu link de convite",
    inviteCopied:"Link copiado!",
    answered:"pessoas responderam hoje",
    live:"AO VIVO",
    majority:p=>`${p}% pensam como você 🔥`,
    split:p=>`Opiniões divididas — você com os ${p}%`,
    minority:p=>`Só ${p}% pensa como você 💎`,
    opts:["SIM","NÃO","DEPENDE"],
    streakLabel:"Sequência", streakKeep:"🔥 Sequência mantida!",
    streakNew:n=>`🔥 Nova sequência: ${n} dias!`,
    streakStart:"🔥 Sequência iniciada! Volte amanhã.",
    bestStreak:"Melhor sequência", todayDone:"Já respondeu hoje ✅",
    notifTitle:"EenVoz", notifBody:"Nova pergunta do dia 🎤",
    notifEnable:"🔔 Ativar notificações",
    badgesTitle:"Medalhas", leaderboard:"Classificação",
    weeklyTop:"Top da semana",
    currentStreak:"Sequência atual", longestStreak:"Melhor sequência",
    totalPoints:"Pontos", totalAnswers:"Respostas", totalVoices:"Vozes", totalShares:"Partilhados",
    history:"Histórico", inviteTitle:"Convidar amigos",
    inviteDesc:n=>`+${n} pts por amigo que entrar`,
    rankLabel:"Posição", shareOn:"Compartilhar no",
    resultsTitle:"Resultados globais",
    voicesTitle:"Vozes do mundo", voiceCount:n=>`${n} respostas de voz hoje`,
  },
  nl:{
    tagline:"Één vraag. Jouw eerlijke antwoord. Elke dag.",
    start:"NU ANTWOORDEN",
    qod:"Vraag van de dag", orVoice:"OF",
    voiceBtn:"SPRAAKANTWOORD · MAX 10S",
    recording:"Opnemen", holdRecord:"Ingedrukt houden",
    maxVoice:"Max 5 spraak/dag",
    world:"Wereld", city:"Stad", country:"Land",
    popularVoices:"Luister naar stemmen van de wereld",
    shareBtn:"DEEL MIJN RESULTAAT",
    next:"Volgende →",
    copyLink:"Link kopiëren", copied:"Gekopieerd!",
    myAnswer:"Mijn antwoord", shareTitle:"Deel je mening",
    shareHint:"Daag je vrienden uit 🔥",
    home:"Start", profile:"Profiel", admin:"Admin",
    listen:"Luisteren", stop:"Stop", flag:"Melden", anon:"Anoniem",
    sponsoredBy:"Gesponsord door",
    inviteCode:"Mijn uitnodigingslink",
    inviteCopied:"Link gekopieerd!",
    answered:"mensen hebben vandaag geantwoord",
    live:"LIVE",
    majority:p=>`${p}% denkt zoals jij 🔥`,
    split:p=>`Meningen verdeeld — jij bij de ${p}%`,
    minority:p=>`Slechts ${p}% denkt zoals jij 💎`,
    opts:["JA","NEE","HANGT AF"],
    streakLabel:"Reeks", streakKeep:"🔥 Reeks behouden!",
    streakNew:n=>`🔥 Nieuwe reeks: ${n} dagen!`,
    streakStart:"🔥 Reeks gestart! Kom morgen terug.",
    bestStreak:"Beste reeks", todayDone:"Al geantwoord vandaag ✅",
    notifTitle:"EenVoz", notifBody:"Nieuwe vraag van de dag 🎤",
    notifEnable:"🔔 Meldingen inschakelen",
    badgesTitle:"Badges", leaderboard:"Ranglijst",
    weeklyTop:"Top van de week",
    currentStreak:"Huidige reeks", longestStreak:"Beste reeks",
    totalPoints:"Punten", totalAnswers:"Antwoorden", totalVoices:"Spraak", totalShares:"Gedeeld",
    history:"Geschiedenis", inviteTitle:"Vrienden uitnodigen",
    inviteDesc:n=>`+${n} pts per vriend die meedoet`,
    rankLabel:"Rang", shareOn:"Delen op",
    resultsTitle:"Wereldwijde resultaten",
    voicesTitle:"Stemmen van de wereld", voiceCount:n=>`${n} spraak vandaag`,
  },
};
const SUPPORTED_LANGS=["fr","en","es","nl"];
function detectLang(){
  if(typeof navigator==="undefined")return"fr";
  const l=navigator.language?.split("-")[0]?.toLowerCase();
  return SUPPORTED_LANGS.includes(l)?l:"fr";
}

// ─────────────────────────────────────────────────────────────
// DATA — questions multilingues (FR / EN / ES / NL)
// ─────────────────────────────────────────────────────────────
const QUESTIONS=[
  {
    id:"q1", cat:"amour", sponsor:null,
    text:{
      fr:"Peut-on aimer deux personnes en même temps ?",
      en:"Can you love two people at the same time?",
      es:"¿Se puede amar a dos personas al mismo tiempo?",
      nl:"Kun je twee mensen tegelijk liefhebben?",
    },
  },
  {
    id:"q2", cat:"argent", sponsor:{name:"MoneyApp"},
    text:{
      fr:"L'argent rend-il vraiment heureux ?",
      en:"Does money really make you happy?",
      es:"¿El dinero da la felicidad de verdad?",
      nl:"Maakt geld je echt gelukkig?",
    },
  },
  {
    id:"q3", cat:"vérité", sponsor:null,
    text:{
      fr:"Tu pardonnerais une trahison ?",
      en:"Would you forgive a betrayal?",
      es:"¿Perdonarías una traición?",
      nl:"Zou jij verraad vergeven?",
    },
  },
  {
    id:"q4", cat:"famille", sponsor:null,
    text:{
      fr:"La famille passe toujours avant les amis ?",
      en:"Does family always come before friends?",
      es:"¿La familia siempre va antes que los amigos?",
      nl:"Gaat familie altijd vóór vrienden?",
    },
  },
  {
    id:"q5", cat:"société", sponsor:null,
    text:{
      fr:"Les réseaux sociaux font plus de mal que de bien ?",
      en:"Do social networks do more harm than good?",
      es:"¿Las redes sociales hacen más daño que bien?",
      nl:"Doen sociale media meer kwaad dan goed?",
    },
  },
  {
    id:"q6", cat:"relations", sponsor:null,
    text:{
      fr:"Un homme doit payer au premier rendez-vous ?",
      en:"Should a man pay on the first date?",
      es:"¿Debe pagar el hombre en la primera cita?",
      nl:"Moet een man betalen op een eerste date?",
    },
  },
  {
    id:"q7", cat:"vérité", sponsor:null,
    text:{
      fr:"On peut changer vraiment sa personnalité ?",
      en:"Can you truly change your personality?",
      es:"¿Se puede cambiar de verdad la personalidad?",
      nl:"Kun je echt je persoonlijkheid veranderen?",
    },
  },
  {
    id:"q8", cat:"amitié", sponsor:null,
    text:{
      fr:"Tu couperais les ponts après une seule trahison ?",
      en:"Would you cut ties after just one betrayal?",
      es:"¿Cortarías el contacto tras una sola traición?",
      nl:"Zou je de banden verbreken na één verraad?",
    },
  },
  {
    id:"q9", cat:"amour", sponsor:null,
    text:{
      fr:"L'amour à distance peut vraiment fonctionner ?",
      en:"Can a long-distance relationship really work?",
      es:"¿Una relación a distancia puede funcionar de verdad?",
      nl:"Kan een lange-afstandsrelatie echt werken?",
    },
  },
  {
    id:"q10", cat:"argent", sponsor:null,
    text:{
      fr:"Les riches méritent-ils leur richesse ?",
      en:"Do rich people deserve their wealth?",
      es:"¿Los ricos merecen su riqueza?",
      nl:"Verdienen rijke mensen hun rijkdom?",
    },
  },
];

// Helper: get question text in current language (fallback to FR)
function qText(q, lang){ return q.text[lang] || q.text.fr; }

// Rich mock voices with more diversity
const MOCK_VOICES=[
  {id:"v1",name:"Maria L.",    city:"Madrid",   flag:"🇪🇸",anon:false,dur:8, likes:203,answer:"OUI"},
  {id:"v2",name:null,          city:"Paris",    flag:"🇫🇷",anon:true, dur:6, likes:147,answer:"NON"},
  {id:"v3",name:"Daniel O.",   city:"Abidjan",  flag:"🇨🇮",anon:false,dur:9, likes:118,answer:"ÇA DÉPEND"},
  {id:"v4",name:"Lucas M.",    city:"Paris",    flag:"🇫🇷",anon:false,dur:5, likes:89, answer:"OUI"},
  {id:"v5",name:"Aïssatou D.", city:"Dakar",    flag:"🇸🇳",anon:false,dur:10,likes:76, answer:"NON"},
  {id:"v6",name:null,          city:"Amsterdam",flag:"🇳🇱",anon:true, dur:7, likes:54, answer:"OUI"},
];

function getMockResults(qId){
  const s=qId.charCodeAt(qId.length-1);
  const a=30+(s*7)%40, b=20+(s*3)%35, c=100-a-b;
  return{
    global:[a,b,c], city:[a+8,b-4,c-4], country:[a-5,b+8,c-3],
    total:4200+s*1337, voices:120+s*43, cityName:"Abidjan", countryCode:"CI",
  };
}

const POINTS={vote:10,voice:20,share:15,invite:50,streak5:25,streak10:50,streak30:100};
const today=()=>new Date().toISOString().split("T")[0];

// ─────────────────────────────────────────────────────────────
// CSS — all keyframes + utilities
// ─────────────────────────────────────────────────────────────
const CSS=`
  @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700;800;900&family=DM+Sans:wght@400;500;600;700&display=swap');
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;-webkit-tap-highlight-color:transparent;-webkit-font-smoothing:antialiased}
  html,body{background:${C.bg};color:${C.text};font-family:'DM Sans',system-ui,sans-serif;overscroll-behavior:none}
  button{cursor:pointer;font-family:'DM Sans',system-ui,sans-serif}
  input,select,textarea{color-scheme:dark;font-family:'DM Sans',system-ui,sans-serif}
  ::-webkit-scrollbar{width:3px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:${C.border};border-radius:4px}

  @keyframes up{from{opacity:0;transform:translateY(22px)}to{opacity:1;transform:translateY(0)}}
  @keyframes pop{0%{transform:scale(0.84);opacity:0}60%{transform:scale(1.06)}100%{transform:scale(1);opacity:1}}
  @keyframes slideDown{from{opacity:0;transform:translateY(-24px)}to{opacity:1;transform:translateY(0)}}
  @keyframes fadeOut{0%,70%{opacity:1}100%{opacity:0;transform:translateY(-14px)}}
  @keyframes spin{to{transform:rotate(360deg)}}
  @keyframes blink{0%,100%{opacity:1}50%{opacity:0.25}}
  @keyframes ring{to{transform:scale(2.4);opacity:0}}
  @keyframes wave{0%,100%{transform:scaleY(0.18)}50%{transform:scaleY(1)}}
  @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-9px)}}
  @keyframes fireShake{0%,100%{transform:rotate(-7deg) scale(1.1)}50%{transform:rotate(7deg) scale(1.15)}}
  @keyframes badgePop{0%{transform:scale(0) rotate(-20deg);opacity:0}70%{transform:scale(1.18) rotate(5deg)}100%{transform:scale(1) rotate(0);opacity:1}}
  @keyframes countUp{from{opacity:0;transform:scale(0.8)}to{opacity:1;transform:scale(1)}}
  @keyframes pulseGlow{0%,100%{box-shadow:0 0 12px var(--gc,${C.red})}50%{box-shadow:0 0 28px var(--gc,${C.red})}}
  @keyframes streakBurst{0%{transform:scale(1)}25%{transform:scale(1.35)}50%{transform:scale(0.9)}75%{transform:scale(1.15)}100%{transform:scale(1)}}
  @keyframes ticker{from{transform:translateX(0)}to{transform:translateX(-50%)}}

  .u0{animation:up 0.36s ease both}
  .u1{animation:up 0.36s 0.07s ease both}
  .u2{animation:up 0.36s 0.14s ease both}
  .u3{animation:up 0.36s 0.21s ease both}
  .u4{animation:up 0.36s 0.28s ease both}
  .u5{animation:up 0.36s 0.35s ease both}
  .pop{animation:pop 0.44s ease both}
  .badge-pop{animation:badgePop 0.6s cubic-bezier(.34,1.56,.64,1) both}
  .streak-burst{animation:streakBurst 0.7s ease both}
  .float{animation:float 3.6s ease-in-out infinite}
  .blink{animation:blink 2s ease-in-out infinite}
  .fire{animation:fireShake 0.45s ease-in-out infinite}
  .lift{transition:transform 0.13s ease,box-shadow 0.13s ease}
  .lift:hover{transform:translateY(-2px)}
  .lift:active{transform:scale(0.97)!important}
`;

// ─────────────────────────────────────────────────────────────
// UTILS
// ─────────────────────────────────────────────────────────────
const fmt=n=>n>=1e6?`${(n/1e6).toFixed(1)}M`:n>=1e3?`${(n/1e3).toFixed(1)}k`:String(n);
const pcts=arr=>{const s=arr.reduce((a,b)=>a+b,0);return s?arr.map(v=>Math.round(v/s*100)):arr.map(()=>0);};

// ─────────────────────────────────────────────────────────────
// MICRO COMPONENTS
// ─────────────────────────────────────────────────────────────

function CatBadge({cat}){
  const color=CAT[cat]||C.red;
  return<span style={{display:"inline-flex",alignItems:"center",gap:5,background:`${color}18`,border:`1px solid ${color}40`,color,borderRadius:20,padding:"3px 10px",fontSize:10,fontWeight:800,letterSpacing:1.5,textTransform:"uppercase"}}><span style={{width:5,height:5,borderRadius:"50%",background:color,display:"inline-block"}}/>{cat}</span>;
}

function Waveform({active,color="#fff"}){
  return<div style={{display:"flex",gap:2.5,height:24,alignItems:"center"}}>{Array.from({length:16}).map((_,i)=><div key={i} style={{width:3,height:"100%",borderRadius:2,background:color,transformOrigin:"center",animation:active?`wave ${0.4+(i%4)*0.1}s ${i*0.05}s ease-in-out infinite`:"none",transform:active?undefined:"scaleY(0.18)",opacity:active?0.85:0.22,transition:"opacity 0.3s"}}/> )}</div>;
}

// Animated result bar
function ResultBar({label,p,isUser,color,delay=0}){
  const[w,setW]=useState(0);
  useEffect(()=>{const t=setTimeout(()=>setW(p),80+delay);return()=>clearTimeout(t);},[p]);
  return(
    <div style={{marginBottom:11}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:5}}>
        <div style={{display:"flex",alignItems:"center",gap:7}}>
          {isUser&&<span style={{fontSize:8,background:color,color:"#000",padding:"2px 6px",borderRadius:5,fontWeight:900,letterSpacing:0.5}}>TOI</span>}
          <span style={{fontSize:14,fontWeight:isUser?800:500,color:isUser?C.text:C.dim}}>{label}</span>
        </div>
        <span style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:22,fontWeight:900,letterSpacing:1,color:isUser?color:C.dim}}>{p}%</span>
      </div>
      <div style={{height:8,background:C.ghost,borderRadius:4,overflow:"hidden",position:"relative"}}>
        <div style={{height:"100%",width:`${w}%`,background:isUser?color:`${color}44`,borderRadius:4,transition:"width 1.1s cubic-bezier(.22,1,.36,1)",boxShadow:isUser?`0 0 12px ${color}66`:"none"}}/>
      </div>
    </div>
  );
}

// Social proof counter with live animation
function SocialProof({total,t,catColor}){
  const[displayed,setDisplayed]=useState(total);
  useEffect(()=>{
    // Safe to use Math.random() only on client side, after hydration
    setDisplayed(total-Math.floor(Math.random()*40+5));
    const interval=setInterval(()=>{
      setDisplayed(d=>{if(d>=total)return d;return d+Math.floor(Math.random()*3+1);});
    },2200);
    return()=>clearInterval(interval);
  },[total]);
  return(
    <div style={{display:"flex",alignItems:"center",gap:10,background:C.card,border:`1px solid ${C.border}`,borderRadius:12,padding:"10px 14px",marginBottom:20}}>
      <div style={{display:"flex",alignItems:"center",gap:5}}>
        <span className="blink" style={{width:7,height:7,borderRadius:"50%",background:C.green,display:"inline-block",boxShadow:`0 0 6px ${C.green}`}}/>
        <span style={{fontSize:11,color:C.green,fontWeight:800,letterSpacing:0.5}}>{t.live}</span>
      </div>
      <div style={{width:1,background:C.border,alignSelf:"stretch"}}/>
      <div style={{flex:1}}>
        <span style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:26,color:C.text,letterSpacing:1,fontWeight:900}}>{fmt(displayed)} </span>
        <span style={{fontSize:12,color:C.dim}}>{t.answered}</span>
      </div>
    </div>
  );
}

// Geo tabs for results
function GeoTabs({res,userIdx,catColor,t,opts}){
  const[tab,setTab]=useState("world");
  const data=pcts(tab==="world"?res.global:tab==="city"?res.city:res.country);
  const tabs=[{id:"world",l:`🌍 ${t.world}`},{id:"city",l:`🏙️ ${res.cityName}`},{id:"country",l:`🏳️ ${res.countryCode}`}];
  return(
    <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:18,padding:"16px",marginBottom:14}}>
      <div style={{display:"flex",gap:4,marginBottom:14}}>
        {tabs.map(tb=><button key={tb.id} onClick={()=>setTab(tb.id)} style={{flex:1,background:tab===tb.id?catColor:C.ghost,border:"none",color:tab===tb.id?(catColor===C.gold?"#000":"#fff"):C.dim,padding:"8px 4px",borderRadius:8,cursor:"pointer",fontSize:10,fontWeight:800,letterSpacing:0.3,transition:"all 0.18s"}}>{tb.l}</button>)}
      </div>
      {opts.map((opt,i)=><ResultBar key={i} label={opt} p={data[i]||0} isUser={userIdx===i} color={catColor} delay={i*60}/>)}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// STREAK RING (SVG circular progress)
// ─────────────────────────────────────────────────────────────
function StreakRing({streak,size=42}){
  const r=15, circ=2*Math.PI*r;
  const milestones=[7,30,100];
  const next=milestones.find(m=>m>streak)||100;
  const prog=Math.min(streak/next,1);
  const color=streak>=30?C.gold:streak>=7?C.orange:C.red;
  return(
    <div style={{display:"flex",alignItems:"center",gap:9,background:C.card,border:`1px solid ${streak>=7?color+"44":C.border}`,borderRadius:12,padding:"6px 12px 6px 8px",boxShadow:streak>=7?`0 0 12px ${color}22`:"none"}}>
      <svg width={size} height={size} style={{transform:"rotate(-90deg)",flexShrink:0}}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={C.border} strokeWidth={3}/>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={3}
          strokeDasharray={circ} strokeDashoffset={circ*(1-prog)} strokeLinecap="round"
          style={{transition:"stroke-dashoffset 0.9s cubic-bezier(.22,1,.36,1)"}}/>
        <text x={size/2} y={size/2} textAnchor="middle" dominantBaseline="central"
          fill={color} fontSize={10} fontWeight={900} fontFamily="Barlow Condensed,sans-serif"
          style={{transform:`rotate(90deg)`,transformOrigin:`${size/2}px ${size/2}px`}}>{streak}</text>
      </svg>
      <div>
        <div style={{fontSize:13,fontWeight:800,color,fontFamily:"'Barlow Condensed',sans-serif",letterSpacing:0.5,display:"flex",alignItems:"center",gap:4}}>
          <span className={streak>=3?"fire":""}>🔥</span> {streak} {streak===1?"jour":"jours"}
        </div>
        <div style={{fontSize:9,color:C.dim,marginTop:1,letterSpacing:0.3}}>→ {next} pour {streak>=30?streak>=100?"max":"Or":"Bronze"}</div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// STREAK TOAST — animated burst overlay on results screen
// ─────────────────────────────────────────────────────────────
function StreakToast({streak,prevStreak,t,newBadge}){
  const[vis,setVis]=useState(true);
  useEffect(()=>{const tm=setTimeout(()=>setVis(false),5000);return()=>clearTimeout(tm);},[]);
  if(!vis)return null;
  const isNew=prevStreak===0&&streak===1;
  const msg=isNew?t.streakStart:t.streakNew(streak);
  const isMilestone=[3,5,7,10,15,20,30,50,100].includes(streak);
  const color=streak>=30?C.gold:streak>=7?C.orange:C.red;
  return(
    <div style={{position:"fixed",top:0,left:0,right:0,zIndex:9999,display:"flex",flexDirection:"column",alignItems:"center",gap:8,padding:"12px 16px",pointerEvents:"none"}}>
      <div className="slideDown" style={{background:`linear-gradient(135deg,${color},${color==="red"?C.orange:C.red})`,borderRadius:18,padding:"14px 20px",display:"flex",alignItems:"center",gap:12,boxShadow:`0 8px 36px ${color}66`,maxWidth:360,width:"100%"}}>
        <span className="streak-burst" style={{fontSize:32,display:"inline-block"}}>{streak>=30?"⭐":streak>=7?"💥":"🔥"}</span>
        <div style={{flex:1}}>
          <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:19,letterSpacing:0.5,color:"#fff",fontWeight:900,lineHeight:1.2}}>{msg}</div>
          {isMilestone&&<div style={{fontSize:11,color:"rgba(255,255,255,0.8)",marginTop:3}}>Milestone ! 🎉</div>}
        </div>
        <div style={{textAlign:"center",background:"rgba(0,0,0,0.2)",borderRadius:10,padding:"6px 12px"}}>
          <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:38,color:"#fff",fontWeight:900,lineHeight:1}}>{streak}</div>
          <div style={{fontSize:8,color:"rgba(255,255,255,0.7)",letterSpacing:1,textTransform:"uppercase"}}>{t.streakLabel}</div>
        </div>
      </div>
      {newBadge&&(
        <div className="badge-pop" style={{background:C.card,border:`2px solid ${newBadge.color}70`,borderRadius:14,padding:"10px 18px",display:"flex",alignItems:"center",gap:12,boxShadow:`0 4px 24px ${newBadge.color}55`,maxWidth:360,width:"100%"}}>
          <span style={{fontSize:26}}>{newBadge.icon}</span>
          <div>
            <div style={{fontSize:10,color:C.dim,fontWeight:800,letterSpacing:1.5,textTransform:"uppercase"}}>BADGE DÉBLOQUÉ</div>
            <div style={{fontSize:16,fontWeight:800,color:newBadge.color,fontFamily:"'Barlow Condensed',sans-serif",letterSpacing:0.5}}>{newBadge.label}</div>
            <div style={{fontSize:11,color:C.dim,marginTop:2}}>{newBadge.desc}</div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// PSYCHO BANNER — key viral element
// ─────────────────────────────────────────────────────────────
function PsychoBanner({userPct,t,catColor,userAnswer}){
  const isMajority=userPct>=65;
  const isSplit=userPct>=40&&userPct<65;
  const color=isMajority?C.green:isSplit?C.gold:C.red;
  const icon=isMajority?"🔥":isSplit?"⚖️":"💎";
  const msg=isMajority?t.majority(userPct):isSplit?t.split(userPct):t.minority(userPct);
  return(
    <div className="pop" style={{background:`${color}12`,border:`1.5px solid ${color}44`,borderRadius:22,padding:"22px 20px",textAlign:"center",marginBottom:16,position:"relative",overflow:"hidden"}}>
      <div style={{position:"absolute",inset:0,background:`radial-gradient(ellipse at 50% -10%,${color}14,transparent 65%)`,pointerEvents:"none"}}/>
      <div style={{fontSize:46,marginBottom:8,display:"inline-block"}}>{icon}</div>
      <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:26,letterSpacing:0.5,color,lineHeight:1.25,marginBottom:8}}>{msg}</div>
      {userAnswer&&(
        <div style={{display:"inline-flex",alignItems:"center",gap:7,background:`${catColor}12`,border:`1px solid ${catColor}30`,borderRadius:9,padding:"5px 14px",marginBottom:12}}>
          <span style={{fontSize:11,color:C.dim}}>Ta réponse :</span>
          <span style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:14,fontWeight:900,color:catColor,letterSpacing:1}}>{userAnswer}</span>
        </div>
      )}
      {/* Share nudge */}
      <div style={{fontSize:12,color:C.dim,marginTop:4}}>👇 Partage pour voir ce que pensent tes amis</div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// VOICE CARD
// ─────────────────────────────────────────────────────────────
function VoiceCard({v,catColor,t,onLike}){
  const[playing,setPlaying]=useState(false);
  const[liked,setLiked]=useState(false);
  const[flagged,setFlagged]=useState(false);
  if(flagged)return null;
  const name=v.anon?t.anon:(v.name||t.anon);
  const answerColor=CAT[v.answer]||catColor;
  return(
    <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:12,padding:"11px 13px",marginBottom:7,display:"flex",alignItems:"center",gap:10}}>
      <div style={{width:38,height:38,borderRadius:"50%",background:`${catColor}18`,border:`1.5px solid ${catColor}44`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:15,fontWeight:800,color:catColor,flexShrink:0}}>{v.anon?"👤":name[0]}</div>
      <div style={{flex:1,minWidth:0}}>
        <div style={{fontSize:13,fontWeight:700,color:C.text,display:"flex",alignItems:"center",gap:6}}>
          <span>{v.flag} {name}</span>
          <span style={{fontSize:10,color:C.dim,fontWeight:400}}>· {v.city}</span>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:7,marginTop:3}}>
          <span style={{fontSize:10,color:C.dim}}>{v.dur}s</span>
          <span style={{fontSize:9,background:`${catColor}18`,color:catColor,borderRadius:5,padding:"1px 6px",fontWeight:700,letterSpacing:0.5}}>{v.answer}</span>
        </div>
      </div>
      {playing&&<Waveform active color={catColor}/>}
      <button onClick={()=>setPlaying(!playing)} style={{background:`${catColor}18`,border:`1px solid ${catColor}40`,borderRadius:999,padding:"5px 12px",color:catColor,fontSize:11,fontWeight:700,cursor:"pointer",flexShrink:0,display:"flex",alignItems:"center",gap:4}}>
        {playing?`■ ${t.stop}`:`▶ ${t.listen}`}
      </button>
      <button onClick={()=>{if(!liked){setLiked(true);onLike?.(v.id);}}} style={{background:"none",border:"none",fontSize:16,cursor:"pointer",color:liked?C.red:C.dim,flexShrink:0,lineHeight:1}}>{liked?"♥":"♡"}</button>
      <button onClick={()=>setFlagged(true)} style={{background:"none",border:"none",fontSize:12,cursor:"pointer",color:C.dim,flexShrink:0,lineHeight:1}}>🚩</button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// POINTS TOAST
// ─────────────────────────────────────────────────────────────
function PointsToast({pts}){
  if(!pts)return null;
  return<div className="pop" style={{position:"fixed",top:76,left:"50%",transform:"translateX(-50%)",background:C.gold,color:"#000",borderRadius:999,padding:"8px 22px",fontSize:13,fontWeight:900,zIndex:9998,letterSpacing:0.5,boxShadow:`0 6px 24px ${C.gold}55`,pointerEvents:"none"}}>+{pts} pts 🔥</div>;
}

// ─────────────────────────────────────────────────────────────
// NOTIFICATION BANNER
// ─────────────────────────────────────────────────────────────
function NotifBanner({t,onEnable,enabled}){
  const[dismissed,setDismissed]=useState(false);
  if(dismissed||enabled)return null;
  return(
    <div className="u0" style={{background:`${C.cyan}10`,border:`1px solid ${C.cyan}28`,borderRadius:12,padding:"11px 13px",marginBottom:14,display:"flex",alignItems:"center",gap:10}}>
      <span style={{fontSize:18,flexShrink:0}}>🔔</span>
      <div style={{flex:1,minWidth:0}}>
        <div style={{fontSize:12,fontWeight:700,color:C.text}}>Ne rate aucune question du jour</div>
      </div>
      <button onClick={onEnable} style={{background:C.cyan,border:"none",color:"#000",borderRadius:8,padding:"5px 12px",fontSize:11,fontWeight:800,cursor:"pointer",flexShrink:0,whiteSpace:"nowrap"}}>{t.notifEnable}</button>
      <button onClick={()=>setDismissed(true)} style={{background:"none",border:"none",color:C.dim,fontSize:18,cursor:"pointer",padding:"0 2px",lineHeight:1}}>×</button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// SCREEN 1 — LANDING
// ─────────────────────────────────────────────────────────────
function Landing({onStart,t,lang,setLang,profile}){
  const langList=["fr","en","es","nl"];
  const sc=profile.streak>=30?C.gold:profile.streak>=7?C.orange:C.red;
  return(
    <div style={{minHeight:"100vh",background:C.bg,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"32px 22px",position:"relative",overflow:"hidden"}}>
      <div style={{position:"fixed",top:-130,left:"50%",transform:"translateX(-50%)",width:560,height:560,background:`radial-gradient(circle,${C.red}14 0%,transparent 60%)`,pointerEvents:"none"}}/>
      {/* Lang selector */}
      <div style={{position:"absolute",top:18,right:18,display:"flex",gap:4}}>
        {langList.map(l=><button key={l} onClick={()=>setLang(l)} style={{background:l===lang?C.red:C.card,border:`1px solid ${l===lang?C.red:C.border}`,color:l===lang?"#fff":C.dim,borderRadius:6,padding:"3px 7px",fontSize:10,fontWeight:700,cursor:"pointer"}}>{l.toUpperCase()}</button>)}
      </div>
      <div className="float" style={{marginBottom:22}}>
        <div style={{width:90,height:90,borderRadius:26,background:C.red,display:"flex",alignItems:"center",justifyContent:"center",fontSize:38,boxShadow:`0 20px 64px ${C.red}60`}}>🎤</div>
      </div>
      <h1 className="u0" style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:88,letterSpacing:4,color:C.text,lineHeight:1,marginBottom:6}}>EENVOZ</h1>
      <p className="u1" style={{fontSize:15,color:C.dim,marginBottom:36,textAlign:"center",maxWidth:280,lineHeight:1.65}}>{t.tagline}</p>

      {/* Streak card on landing */}
      {profile.streak>0&&(
        <div className="u2 pop" style={{background:`linear-gradient(135deg,${sc}20,${sc}08)`,border:`1.5px solid ${sc}44`,borderRadius:18,padding:"14px 22px",marginBottom:28,textAlign:"center",width:"100%",maxWidth:340,boxShadow:`0 4px 24px ${sc}22`}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:14}}>
            <span className={profile.streak>=7?"fire":""} style={{fontSize:34}}>🔥</span>
            <div>
              <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:44,color:sc,letterSpacing:1,lineHeight:1}}>{profile.streak}</div>
              <div style={{fontSize:10,color:C.dim,letterSpacing:1.5,textTransform:"uppercase"}}>{t.streakLabel}</div>
            </div>
          </div>
          <div style={{fontSize:12,color:sc,marginTop:7,fontWeight:600}}>{t.todayDone}</div>
        </div>
      )}

      <button className="u3 lift" onClick={onStart} style={{background:C.red,border:"none",color:"#fff",padding:"22px 44px",borderRadius:14,fontSize:17,fontWeight:700,cursor:"pointer",fontFamily:"'Barlow Condensed',sans-serif",letterSpacing:2,maxWidth:340,width:"100%",boxShadow:`0 12px 44px ${C.red}55`}}>
        {t.start} →
      </button>
      <p className="u4 blink" style={{marginTop:16,fontSize:12,color:C.dim,display:"flex",alignItems:"center",gap:6}}>
        <span style={{width:7,height:7,borderRadius:"50%",background:C.green,display:"inline-block",boxShadow:`0 0 6px ${C.green}`}}/>
        12 458 {t.answered}
      </p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// SCREEN 2 — QUESTION
// ─────────────────────────────────────────────────────────────
function QuestionScreen({q,t,lang,onVote,recorder,userVote,profile}){
  const catColor=CAT[q.cat]||C.red;
  const[sel,setSel]=useState(userVote?.idx??null);
  const opts=t.opts||["OUI","NON","ÇA DÉPEND"];
  const res=getMockResults(q.id);
  const questionText=qText(q,lang);

  const handleVote=i=>{
    if(sel!==null||recorder.active)return;
    setSel(i);
    setTimeout(()=>onVote(opts[i],i),310);
  };

  return(
    <div style={{minHeight:"100vh",background:C.bg,maxWidth:480,margin:"0 auto",padding:"0 20px 120px",position:"relative"}}>
      {/* BG glow */}
      <div style={{position:"fixed",top:0,right:-60,width:280,height:280,background:`radial-gradient(circle,${catColor}10,transparent 70%)`,pointerEvents:"none",zIndex:0}}/>

      {/* Header */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"18px 0 12px",position:"relative",zIndex:1}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <div style={{width:26,height:26,background:C.red,borderRadius:7,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12}}>🎤</div>
          <span style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:22,letterSpacing:3,color:C.red}}>EENVOZ</span>
        </div>
        <CatBadge cat={q.cat}/>
      </div>

      {/* Streak ring */}
      <div className="u0" style={{marginBottom:14}}>
        <StreakRing streak={profile.streak}/>
      </div>

      {/* Sponsor */}
      {q.sponsor&&(
        <div className="u0" style={{display:"flex",alignItems:"center",gap:7,background:`${C.gold}10`,border:`1px solid ${C.gold}28`,borderRadius:8,padding:"6px 12px",marginBottom:12}}>
          <span style={{fontSize:10,color:C.gold,fontWeight:700,letterSpacing:0.5}}>{t.sponsoredBy} <strong>{q.sponsor.name}</strong></span>
        </div>
      )}

      {/* ★ Social proof counter (point 1) */}
      <SocialProof total={res.total} t={t} catColor={catColor}/>

      {/* Question */}
      <div className="u1" style={{marginBottom:28}}>
        <p style={{fontSize:10,color:C.dim,fontWeight:700,letterSpacing:2,textTransform:"uppercase",marginBottom:10}}>{t.qod}</p>
        <h2 style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:questionText.length>50?30:38,lineHeight:1.1,letterSpacing:0.3,color:C.text}}>{questionText}</h2>
      </div>

      {/* Vote buttons */}
      <div className="u2" style={{display:"flex",flexDirection:"column",gap:11,marginBottom:22}}>
        {opts.map((opt,i)=>{
          const on=sel===i;
          return<button key={i} className="lift" onClick={()=>handleVote(i)}
            style={{background:on?catColor:C.card,border:`2px solid ${on?catColor:C.brigh}`,color:on?(catColor===C.gold?"#000":"#fff"):C.text,
              padding:"19px 22px",borderRadius:14,fontSize:17,fontWeight:800,cursor:sel!==null?"default":"pointer",
              textAlign:"left",display:"flex",alignItems:"center",justifyContent:"space-between",
              fontFamily:"'Barlow Condensed',sans-serif",letterSpacing:1.5,
              boxShadow:on?`0 8px 30px ${catColor}44`:"none",transition:"all 0.14s ease",
              opacity:sel!==null&&!on?0.38:1}}>
            {opt}
            <span style={{fontSize:22,opacity:0.75}}>{["👍","👎","🤔"][i]}</span>
          </button>;
        })}
      </div>

      {/* OR divider */}
      <div className="u3" style={{display:"flex",alignItems:"center",gap:12,marginBottom:18}}>
        <div style={{flex:1,height:1,background:C.border}}/>
        <span style={{fontSize:11,color:C.dim,fontWeight:700,letterSpacing:2}}>{t.orVoice}</span>
        <div style={{flex:1,height:1,background:C.border}}/>
      </div>

      {/* Voice button */}
      <div className="u4">
        <button
          onPointerDown={recorder.active?undefined:recorder.start}
          onPointerUp={recorder.active?()=>{recorder.stop();setTimeout(()=>onVote(opts[0],0),700);}:undefined}
          onPointerLeave={recorder.active?()=>{recorder.stop();setTimeout(()=>onVote(opts[0],0),700);}:undefined}
          style={{position:"relative",background:recorder.active?C.red:C.card,border:`2px solid ${recorder.active?C.red:C.brigh}`,color:recorder.active?"#fff":C.text,padding:"19px 22px",borderRadius:14,fontSize:14,fontWeight:700,cursor:"pointer",width:"100%",display:"flex",flexDirection:"column",alignItems:"center",gap:10,boxShadow:recorder.active?`0 8px 32px ${C.red}44`:"none",transition:"all 0.2s"}}>
          {recorder.active&&<div style={{position:"absolute",inset:-2,borderRadius:14,border:`2px solid ${C.red}`,animation:"ring 1.2s ease-out infinite",pointerEvents:"none"}}/>}
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <span style={{fontSize:22}}>🎤</span>
            <span style={{fontFamily:"'Barlow Condensed',sans-serif",letterSpacing:1.5,fontSize:15}}>
              {recorder.active?`${t.recording}… ${recorder.MAX-recorder.t}s`:t.voiceBtn}
            </span>
          </div>
          {recorder.active&&<Waveform active color="#fff"/>}
        </button>
        {recorder.active&&(
          <div style={{height:4,background:C.border,borderRadius:4,overflow:"hidden",marginTop:8}}>
            <div style={{height:"100%",width:`${(recorder.t/recorder.MAX)*100}%`,background:C.red,borderRadius:4,transition:"width 1s linear",boxShadow:`0 0 10px ${C.red}88`}}/>
          </div>
        )}
        <p style={{fontSize:11,color:C.dim,textAlign:"center",marginTop:8}}>{t.holdRecord} · {t.maxVoice}</p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// SCREEN 3 — RESULTS (enriched: instant results + voices)
// ─────────────────────────────────────────────────────────────
function ResultsScreen({q,userVote,t,lang,onShare,onNext,pts,streakData,onLike}){
  const catColor=CAT[q.cat]||C.red;
  const res=getMockResults(q.id);
  const gp=pcts(res.global);
  const opts=t.opts||["OUI","NON","ÇA DÉPEND"];
  const userPct=userVote!==null?gp[userVote.idx]:null;
  const questionText=qText(q,lang);

  return(
    <div style={{minHeight:"100vh",background:C.bg,maxWidth:480,margin:"0 auto",padding:"18px 20px 120px"}}>
      {/* Streak + badge toast */}
      {streakData&&<StreakToast streak={streakData.streak} prevStreak={streakData.prev} t={t} newBadge={streakData.newBadge}/>}
      <PointsToast pts={pts}/>

      {/* Question reminder */}
      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:14}}>
        <CatBadge cat={q.cat}/>
        <span style={{fontSize:12,color:C.dim,flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{questionText}</span>
      </div>

      {/* ★ Psycho banner (point 4) */}
      {userPct!==null&&(
        <PsychoBanner userPct={userPct} t={t} catColor={catColor} userAnswer={userVote?.answer}/>
      )}

      {/* ★ Share CTA — right here, prime position (point 5) */}
      <button className="lift pop" onClick={onShare} style={{background:catColor,border:"none",color:catColor===C.gold?"#000":"#fff",padding:"20px",borderRadius:14,fontSize:16,fontWeight:700,fontFamily:"'Barlow Condensed',sans-serif",letterSpacing:2,width:"100%",boxShadow:`0 10px 36px ${catColor}44`,marginBottom:14,display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
        📤 {t.shareBtn}
      </button>

      {/* ★ Instant geo results (point 2) */}
      <div className="u0">
        <p style={{fontSize:10,color:C.dim,fontWeight:700,letterSpacing:2,textTransform:"uppercase",marginBottom:10}}>🌍 {t.resultsTitle}</p>
        <GeoTabs res={res} userIdx={userVote?.idx} catColor={catColor} t={t} opts={opts}/>
      </div>

      {/* Stats row */}
      <div style={{display:"flex",gap:10,marginBottom:18}}>
        {[
          {icon:"🗳️",val:fmt(res.total),label:"votes"},
          {icon:"🎤",val:fmt(res.voices),label:"vocaux"},
          {icon:"🌍",val:"48",label:"pays"},
        ].map((s,i)=>(
          <div key={i} style={{flex:1,background:C.card,border:`1px solid ${C.border}`,borderRadius:11,padding:"10px 8px",textAlign:"center"}}>
            <div style={{fontSize:16,marginBottom:3}}>{s.icon}</div>
            <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:20,color:C.text,letterSpacing:1}}>{s.val}</div>
            <div style={{fontSize:9,color:C.dim,textTransform:"uppercase",letterSpacing:0.5}}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* ★ Voices section (point 3) */}
      <div className="u1" style={{marginBottom:18}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
          <p style={{fontSize:10,color:C.dim,fontWeight:700,letterSpacing:2,textTransform:"uppercase"}}>🎤 {t.voicesTitle}</p>
          <span style={{fontSize:10,color:catColor,fontWeight:700}}>{t.voiceCount(res.voices)}</span>
        </div>
        {MOCK_VOICES.slice(0,4).map(v=><VoiceCard key={v.id} v={v} catColor={catColor} t={t} onLike={onLike}/>)}
      </div>

      <button onClick={onNext} style={{background:"transparent",border:`2px solid ${C.brigh}`,color:C.dim,padding:"14px",borderRadius:14,fontSize:14,fontWeight:600,width:"100%"}}>{t.next}</button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// SCREEN 4 — SHARE (viral card, platforms)
// ─────────────────────────────────────────────────────────────
function ShareScreen({q,userVote,t,lang,onBack,onNext,onShareDone}){
  const catColor=CAT[q.cat]||C.red;
  const res=getMockResults(q.id);
  const gp=pcts(res.global);
  const opts=t.opts||["OUI","NON","ÇA DÉPEND"];
  const[copied,setCopied]=useState(false);
  const userPct=userVote?gp[userVote.idx]:null;
  const isMaj=userPct>=65, isMin=userPct<40;
  const questionText=qText(q,lang);

  // Hook adapté à la langue
  const hook=lang==="nl"
    ? (isMaj?`Ik zit bij de meerderheid (${userPct}%) 🔥`:isMin?`Slechts ${userPct}% denkt zoals ik 💎`:`Meningen zijn verdeeld`)
    : lang==="es"
    ? (isMaj?`Estoy en la mayoría (${userPct}%) 🔥`:isMin?`Solo ${userPct}% piensa como yo 💎`:`Las opiniones están divididas`)
    : lang==="en"
    ? (isMaj?`I'm in the majority (${userPct}%) 🔥`:isMin?`Only ${userPct}% think like me 💎`:`Opinions are split on this`)
    : (isMaj?`Je suis dans la majorité (${userPct}%) 🔥`:isMin?`Je suis rare — seulement ${userPct}% pense comme moi 💎`:`Les avis sont partagés sur cette question`);

  const shareText=[
    `🎤 EENVOZ`,``,
    `"${questionText}"`,``,
    `${t.myAnswer} : ${userVote?.answer||"—"}`,
    hook,``,
    opts.map((o,i)=>`${o} ${gp[i]}%`).join(" · "),``,
    `👉 eenvoz.app`,
  ].join("\n");

  const copy=()=>navigator.clipboard.writeText(shareText).then(()=>{setCopied(true);onShareDone?.();setTimeout(()=>setCopied(false),2500);});

  const platforms=[
    {name:"WhatsApp",  icon:"💬",color:"#25D366",action:()=>{window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`,"_blank");onShareDone?.();}},
    {name:"Twitter/X", icon:"𝕏", color:"#fff",   action:()=>{window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`,"_blank");onShareDone?.();}},
    {name:"Instagram / TikTok",icon:"📱",color:"#E1306C",action:copy},
    {name:"Facebook",  icon:"📘",color:"#1877F2",action:()=>{window.open(`https://www.facebook.com/sharer.php?quote=${encodeURIComponent(shareText)}&u=https://eenvoz.app`,"_blank");onShareDone?.();}},
  ];

  return(
    <div style={{minHeight:"100vh",background:C.bg,maxWidth:480,margin:"0 auto",padding:"20px 20px 120px"}}>
      <button onClick={onBack} style={{background:"none",border:"none",color:C.dim,fontSize:13,fontWeight:700,cursor:"pointer",marginBottom:16,display:"flex",alignItems:"center",gap:4}}>← Retour</button>

      <h2 className="u0" style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:42,letterSpacing:2,color:C.text,marginBottom:4}}>{t.shareTitle.toUpperCase()}</h2>
      <p className="u1" style={{fontSize:14,color:C.dim,marginBottom:20}}>{t.shareHint}</p>

      {/* ★ Share card preview */}
      <div className="pop" style={{background:C.card,border:`2px solid ${catColor}44`,borderRadius:22,padding:"22px",marginBottom:20,position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",top:0,right:0,width:180,height:180,background:`radial-gradient(circle,${catColor}15,transparent 60%)`,pointerEvents:"none"}}/>
        {/* Header */}
        <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:14}}>
          <div style={{width:22,height:22,background:C.red,borderRadius:6,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11}}>🎤</div>
          <span style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:13,letterSpacing:2.5,color:C.red,fontWeight:900}}>EENVOZ</span>
          <CatBadge cat={q.cat}/>
        </div>
        {/* Question */}
        <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:questionText.length>60?19:24,letterSpacing:0.3,color:C.text,marginBottom:14,lineHeight:1.25}}>"{questionText}"</div>
        {/* User answer pill */}
        {userVote&&(
          <div style={{display:"inline-flex",alignItems:"center",gap:8,background:`${catColor}18`,border:`1.5px solid ${catColor}50`,borderRadius:10,padding:"7px 14px",marginBottom:14}}>
            <span style={{fontSize:11,color:C.dim}}>{t.myAnswer} :</span>
            <span style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:16,fontWeight:900,color:catColor,letterSpacing:1}}>{userVote.answer}</span>
            {userPct&&<span style={{fontSize:12,color:catColor,fontWeight:700}}>· {userPct}%</span>}
          </div>
        )}
        {/* Result bars (compact) */}
        <div style={{display:"flex",gap:4,marginBottom:10}}>
          {opts.map((o,i)=>(
            <div key={i} style={{flex:1}}>
              <div style={{height:5,background:C.ghost,borderRadius:3,overflow:"hidden",marginBottom:4}}>
                <div style={{height:"100%",width:`${gp[i]||0}%`,background:userVote?.idx===i?catColor:`${catColor}40`,borderRadius:3}}/>
              </div>
              <div style={{fontSize:9,color:userVote?.idx===i?catColor:C.dim,fontWeight:userVote?.idx===i?800:500,textAlign:"center",letterSpacing:0.3}}>{o} {gp[i]}%</div>
            </div>
          ))}
        </div>
        {/* Hook text */}
        <div style={{fontSize:11,color:catColor,fontWeight:700,marginBottom:10}}>{hook}</div>
        <div style={{fontSize:10,color:C.dim,letterSpacing:1}}>eenvoz.app</div>
      </div>

      {/* Platform buttons */}
      <div style={{display:"flex",flexDirection:"column",gap:9,marginBottom:12}}>
        {platforms.map(p=>(
          <button key={p.name} className="lift" onClick={p.action}
            style={{background:`${p.color}12`,border:`1px solid ${p.color}30`,color:p.color,borderRadius:12,padding:"14px 18px",fontSize:14,fontWeight:700,display:"flex",alignItems:"center",gap:12,cursor:"pointer",transition:"all 0.14s",textAlign:"left"}}>
            <span style={{fontSize:20}}>{p.icon}</span>{t.shareOn} {p.name}
          </button>
        ))}
        <button className="lift" onClick={copy}
          style={{background:copied?`${C.green}15`:C.card,border:`2px solid ${copied?C.green:C.brigh}`,color:copied?C.green:C.dim,borderRadius:12,padding:"14px 18px",fontSize:14,fontWeight:700,display:"flex",alignItems:"center",gap:12,cursor:"pointer",transition:"all 0.2s"}}>
          <span style={{fontSize:20}}>{copied?"✅":"🔗"}</span>{copied?t.copied:t.copyLink}
        </button>
      </div>
      <button onClick={onNext} style={{background:"transparent",border:`2px solid ${C.brigh}`,color:C.dim,padding:"14px",borderRadius:12,fontSize:14,fontWeight:600,width:"100%"}}>{t.next}</button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// SCREEN 5 — PROFILE (stats + badges + leaderboard + invite)
// ─────────────────────────────────────────────────────────────
function ProfileScreen({state,t,onBack,onNotif,notifEnabled}){
  const{votes,voicesSent,shares,points,streak,bestStreak,inviteCode,history,invited=1}=state;
  const[tab,setTab]=useState("stats");
  const[invCopied,setInvCopied]=useState(false);
  const earned=earnedBadges(state);
  const locked=BADGES.filter(b=>!earned.find(e=>e.id===b.id));
  const sc=streak>=30?C.gold:streak>=7?C.orange:C.red;

  // Dynamic leaderboard: insert user
  const lbWithMe=[
    ...LEADERBOARD_BASE,
    {name:"TOI",city:"...",flag:"🎤",pts:points,streak,votes,shares,isMe:true},
  ].sort((a,b)=>b.pts-a.pts).map((r,i)=>({...r,rank:i+1}));

  const inviteLink=`eenvoz.app/invite/${inviteCode}`;
  const copyInvite=()=>navigator.clipboard.writeText(inviteLink).then(()=>{setInvCopied(true);setTimeout(()=>setInvCopied(false),2500);});

  const tabList=[
    {id:"stats",l:"📊 Stats"},
    {id:"badges",l:`🏅 Badges ${earned.length>0?`(${earned.length})`:""}` },
    {id:"ranking",l:"🏆 Classement"},
    {id:"invite",l:"🔗 Inviter"},
  ];

  return(
    <div style={{minHeight:"100vh",background:C.bg,maxWidth:480,margin:"0 auto",padding:"20px 20px 120px"}}>
      <button onClick={onBack} style={{background:"none",border:"none",color:C.dim,fontSize:13,fontWeight:700,cursor:"pointer",marginBottom:14,display:"flex",alignItems:"center",gap:4}}>← Retour</button>

      {/* Avatar */}
      <div style={{textAlign:"center",marginBottom:18}}>
        <div style={{width:76,height:76,borderRadius:"50%",background:`linear-gradient(135deg,${C.red},${C.orange})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:30,margin:"0 auto 10px",boxShadow:`0 12px 36px ${C.red}44`,position:"relative"}}>
          👤
          {earned.length>0&&<div style={{position:"absolute",bottom:-3,right:-3,width:24,height:24,background:earned[earned.length-1].color,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,border:`2px solid ${C.bg}`}}>{earned[earned.length-1].icon}</div>}
        </div>
        <h3 style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:26,letterSpacing:2,color:C.text}}>UTILISATEUR</h3>
        <div style={{display:"inline-flex",alignItems:"center",gap:8,marginTop:8}}>
          <span style={{background:`${C.gold}15`,border:`1px solid ${C.gold}35`,borderRadius:999,padding:"4px 14px",fontFamily:"'Barlow Condensed',sans-serif",fontSize:18,color:C.gold}}>{points} pts</span>
          <span style={{background:`${sc}15`,border:`1px solid ${sc}35`,borderRadius:999,padding:"4px 14px",display:"flex",alignItems:"center",gap:5,fontSize:14,color:sc,fontWeight:800}}>🔥 {streak}</span>
        </div>
      </div>

      <NotifBanner t={t} onEnable={onNotif} enabled={notifEnabled}/>

      {/* Tabs */}
      <div style={{display:"flex",gap:3,background:C.card,borderRadius:12,padding:4,marginBottom:18,overflowX:"auto"}}>
        {tabList.map(tb=>(
          <button key={tb.id} onClick={()=>setTab(tb.id)} style={{flex:1,background:tab===tb.id?C.red:"transparent",border:"none",color:tab===tb.id?"#fff":C.dim,padding:"8px 4px",borderRadius:9,cursor:"pointer",fontSize:10,fontWeight:800,letterSpacing:0.2,transition:"all 0.18s",whiteSpace:"nowrap",minWidth:60}}>{tb.l}</button>
        ))}
      </div>

      {/* ── STATS ── */}
      {tab==="stats"&&(
        <div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:9,marginBottom:16}}>
            {[
              {label:t.currentStreak,value:streak,icon:"🔥",color:sc},
              {label:t.longestStreak,value:bestStreak,icon:"⭐",color:C.gold},
              {label:t.totalAnswers,value:votes,icon:"📊",color:C.red},
              {label:t.totalVoices,value:voicesSent,icon:"🎤",color:C.purple},
              {label:t.totalShares,value:shares,icon:"🔗",color:C.cyan},
              {label:t.totalPoints,value:points,icon:"💎",color:C.gold},
            ].map((s,i)=>(
              <div key={i} style={{background:C.card,border:`1px solid ${i<2?s.color+"44":C.border}`,borderRadius:14,padding:"15px 10px",textAlign:"center"}}>
                <div style={{fontSize:i<2?26:20,marginBottom:4}}>{s.icon}</div>
                <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:i<2?40:28,color:s.color,letterSpacing:1,lineHeight:1}}>{s.value}</div>
                <div style={{fontSize:9,color:C.dim,marginTop:3,fontWeight:700,letterSpacing:0.5,textTransform:"uppercase"}}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Streak progress bar */}
          {(()=>{
            const ms=[{n:7,l:"Bronze",c:C.bronze,i:"🥉"},{n:30,l:"Argent",c:C.silver,i:"🥈"},{n:100,l:"Or",c:C.gold,i:"🥇"}];
            const nx=ms.find(m=>m.n>streak);
            if(!nx)return null;
            return(
              <div style={{background:C.card,border:`1px solid ${nx.c}28`,borderRadius:14,padding:"13px",marginBottom:16}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:9}}>
                  <div style={{fontSize:12,fontWeight:700,color:C.text}}>Vers le badge {nx.l}</div>
                  <span style={{fontSize:18}}>{nx.i}</span>
                </div>
                <div style={{height:8,background:C.ghost,borderRadius:4,overflow:"hidden",marginBottom:6}}>
                  <div style={{height:"100%",width:`${(streak/nx.n)*100}%`,background:nx.c,borderRadius:4,transition:"width 1s ease",boxShadow:`0 0 8px ${nx.c}66`}}/>
                </div>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:10,color:C.dim}}>
                  <span>🔥 {streak} jours</span><span>Objectif : {nx.n}</span>
                </div>
              </div>
            );
          })()}

          {/* History */}
          <p style={{fontSize:10,color:C.dim,fontWeight:700,letterSpacing:2,textTransform:"uppercase",marginBottom:10}}>{t.history}</p>
          {history.length===0
            ?<p style={{fontSize:14,color:C.dim,textAlign:"center",padding:"28px"}}>Aucune réponse encore.</p>
            :history.map((h,i)=>{
              const cc=CAT[h.cat]||C.red;
              return<div key={i} style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:11,padding:"10px 13px",marginBottom:7,display:"flex",alignItems:"center",gap:10}}>
                <div style={{width:7,height:7,borderRadius:"50%",background:cc,flexShrink:0}}/>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:12,color:C.text,fontWeight:600,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{h.text}</div>
                  <div style={{fontSize:10,color:C.dim,marginTop:1}}>{h.date}</div>
                </div>
                <div style={{fontSize:10,fontWeight:800,color:cc,background:`${cc}18`,border:`1px solid ${cc}28`,borderRadius:7,padding:"2px 9px",flexShrink:0,fontFamily:"'Barlow Condensed',sans-serif",letterSpacing:0.5}}>{h.answer}</div>
              </div>;
            })
          }
        </div>
      )}

      {/* ── BADGES ── */}
      {tab==="badges"&&(
        <div>
          {earned.length>0&&<>
            <p style={{fontSize:10,color:C.green,fontWeight:800,letterSpacing:2,textTransform:"uppercase",marginBottom:10}}>✅ DÉBLOQUÉS ({earned.length})</p>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:9,marginBottom:20}}>
              {earned.map(b=>(
                <div key={b.id} className="pop" style={{background:`${b.color}12`,border:`1.5px solid ${b.color}44`,borderRadius:14,padding:"16px 12px",textAlign:"center",position:"relative"}}>
                  <div style={{fontSize:32,marginBottom:7}}>{b.icon}</div>
                  <div style={{fontSize:14,fontWeight:800,color:b.color,fontFamily:"'Barlow Condensed',sans-serif",letterSpacing:0.5}}>{b.label}</div>
                  <div style={{fontSize:10,color:C.dim,marginTop:4}}>{b.desc}</div>
                  <div style={{position:"absolute",top:8,right:8,width:8,height:8,borderRadius:"50%",background:C.green}}/>
                </div>
              ))}
            </div>
          </>}
          {locked.length>0&&<>
            <p style={{fontSize:10,color:C.dim,fontWeight:800,letterSpacing:2,textTransform:"uppercase",marginBottom:10}}>🔒 À DÉBLOQUER ({locked.length})</p>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:9}}>
              {locked.map(b=>(
                <div key={b.id} style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:14,padding:"16px 12px",textAlign:"center",opacity:0.55}}>
                  <div style={{fontSize:32,marginBottom:7,filter:"grayscale(1)"}}>{b.icon}</div>
                  <div style={{fontSize:13,fontWeight:800,color:C.dim,fontFamily:"'Barlow Condensed',sans-serif"}}>{b.label}</div>
                  <div style={{fontSize:10,color:C.dim,marginTop:4}}>{b.desc}</div>
                </div>
              ))}
            </div>
          </>}
        </div>
      )}

      {/* ── LEADERBOARD ── */}
      {tab==="ranking"&&(
        <div>
          <p style={{fontSize:10,color:C.gold,fontWeight:800,letterSpacing:2,textTransform:"uppercase",marginBottom:14}}>🏆 {t.weeklyTop}</p>
          {/* Sort options */}
          <div style={{display:"flex",gap:6,marginBottom:14}}>
            {["pts","streak","votes"].map(k=>(
              <div key={k} style={{background:k==="pts"?`${C.gold}15`:C.ghost,border:`1px solid ${k==="pts"?C.gold:C.border}`,borderRadius:8,padding:"4px 10px",fontSize:10,color:k==="pts"?C.gold:C.dim,fontWeight:700,letterSpacing:0.5}}>{k==="pts"?"💎 Points":k==="streak"?"🔥 Streak":"📊 Votes"}</div>
            ))}
          </div>
          {lbWithMe.map(r=>{
            const isMe=r.isMe;
            const rc=r.rank===1?C.gold:r.rank===2?C.silver:r.rank===3?C.bronze:C.dim;
            return(
              <div key={r.rank} style={{background:isMe?`${C.red}10`:C.card,border:`1px solid ${isMe?C.red+"44":C.border}`,borderRadius:12,padding:"12px 13px",marginBottom:7,display:"flex",alignItems:"center",gap:10}}>
                <div style={{width:28,height:28,borderRadius:"50%",background:r.rank<=3?`${rc}20`:"transparent",border:`1.5px solid ${rc}`,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Barlow Condensed',sans-serif",fontSize:r.rank<=3?16:13,fontWeight:900,color:rc,flexShrink:0}}>
                  {r.rank<=3?["🥇","🥈","🥉"][r.rank-1]:r.rank}
                </div>
                <span style={{fontSize:18,flexShrink:0}}>{r.flag}</span>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:13,fontWeight:isMe?800:600,color:C.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                    {r.name}{isMe&&<span style={{fontSize:10,color:C.red,fontWeight:900,marginLeft:6,background:`${C.red}15`,borderRadius:4,padding:"1px 5px"}}>TU</span>}
                  </div>
                  <div style={{fontSize:10,color:C.dim,marginTop:1}}>
                    {r.city} · 🔥{r.streak} · {r.votes} votes
                  </div>
                </div>
                <div style={{textAlign:"right",flexShrink:0}}>
                  <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:18,color:isMe?C.red:C.gold,fontWeight:900,letterSpacing:1}}>{fmt(r.pts)}</div>
                  <div style={{fontSize:9,color:C.dim}}>pts</div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── INVITE ── */}
      {tab==="invite"&&(
        <div>
          <div style={{textAlign:"center",marginBottom:24,padding:"0 10px"}}>
            <div style={{fontSize:48,marginBottom:10}}>🌍</div>
            <h3 style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:30,letterSpacing:1,color:C.text,marginBottom:8}}>{t.inviteTitle}</h3>
            <p style={{fontSize:14,color:C.dim,lineHeight:1.65}}>{t.inviteDesc(POINTS.invite)}</p>
          </div>

          {/* Invite link box */}
          <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:14,padding:"16px",marginBottom:16}}>
            <p style={{fontSize:10,color:C.dim,fontWeight:700,letterSpacing:2,textTransform:"uppercase",marginBottom:10}}>{t.inviteCode}</p>
            <div style={{background:C.ghost,borderRadius:10,padding:"13px 14px",fontFamily:"'Barlow Condensed',sans-serif",fontSize:16,letterSpacing:2,color:C.text,wordBreak:"break-all",marginBottom:10}}>{inviteLink}</div>
            <button onClick={copyInvite} style={{background:invCopied?`${C.green}20`:C.red,border:"none",color:invCopied?C.green:"#fff",borderRadius:10,padding:"13px",fontSize:14,fontWeight:700,cursor:"pointer",width:"100%",transition:"all 0.2s",fontFamily:"'Barlow Condensed',sans-serif",letterSpacing:1}}>
              {invCopied?`✓ ${t.inviteCopied}`:"📋 Copier le lien"}
            </button>
          </div>

          {/* Share invite on platforms */}
          <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:20}}>
            {[
              {name:"WhatsApp",icon:"💬",color:"#25D366",url:`https://wa.me/?text=${encodeURIComponent(`🎤 Rejoins-moi sur EENVOZ — l'app où tout le monde donne son vrai avis chaque jour !\n${inviteLink}`)}`},
              {name:"Twitter/X",icon:"𝕏",color:"#fff",url:`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Je réponds à la question du jour sur EENVOZ 🎤\n${inviteLink}`)}`},
            ].map(p=>(
              <button key={p.name} className="lift" onClick={()=>window.open(p.url,"_blank")}
                style={{background:`${p.color}12`,border:`1px solid ${p.color}28`,color:p.color,borderRadius:12,padding:"13px 16px",fontSize:13,fontWeight:700,display:"flex",alignItems:"center",gap:10,cursor:"pointer",textAlign:"left"}}>
                <span style={{fontSize:18}}>{p.icon}</span>Inviter via {p.name}
              </button>
            ))}
          </div>

          {/* Stats */}
          <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:14,padding:"14px"}}>
            <div style={{display:"flex",justifyContent:"space-around"}}>
              {[{l:"Amis invités",v:invited,c:C.green},{l:"Points gagnés",v:invited*POINTS.invite,c:C.gold}].map((s,i)=>(
                <div key={i} style={{textAlign:"center"}}>
                  <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:36,color:s.c,letterSpacing:1}}>{s.v}</div>
                  <div style={{fontSize:10,color:C.dim,fontWeight:700,letterSpacing:0.5,textTransform:"uppercase",marginTop:3}}>{s.l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// SCREEN 6 — ADMIN
// ─────────────────────────────────────────────────────────────
function AdminScreen({t,lang,adminData,onBack}){
  const[tab,setTab]=useState("stats");
  const[form,setForm]=useState({text:"",cat:"amour",o0:"OUI",o1:"NON",o2:"ÇA DÉPEND",date:""});
  const[saved,setSaved]=useState(false);
  const CATS=["amour","argent","amitié","famille","société","vérité","relations"];
  const inp={width:"100%",background:C.card,border:`1px solid ${C.brigh}`,borderRadius:10,padding:"10px 13px",color:C.text,fontSize:13,outline:"none",boxSizing:"border-box"};
  const save=()=>{if(!form.text||!form.date)return;setSaved(true);setTimeout(()=>setSaved(false),3000);};
  return(
    <div style={{minHeight:"100vh",background:C.bg,maxWidth:480,margin:"0 auto",padding:"20px 20px 120px"}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16}}>
        <button onClick={onBack} style={{background:"none",border:"none",color:C.dim,fontSize:13,fontWeight:700,cursor:"pointer"}}>← Retour</button>
        <span style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:11,letterSpacing:2,color:C.red}}>ADMIN PANEL</span>
      </div>
      <div style={{display:"flex",gap:4,background:C.card,borderRadius:12,padding:4,marginBottom:18}}>
        {[{id:"stats",l:"Stats"},{id:"questions",l:"Questions"},{id:"create",l:"+ Créer"}].map(tb=>(
          <button key={tb.id} onClick={()=>setTab(tb.id)} style={{flex:1,background:tab===tb.id?C.red:"transparent",border:"none",color:tab===tb.id?"#fff":C.dim,padding:"8px 0",borderRadius:9,cursor:"pointer",fontSize:12,fontWeight:800,letterSpacing:0.5,transition:"all 0.18s"}}>{tb.l}</button>
        ))}
      </div>
      {tab==="stats"&&(
        <div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:9,marginBottom:20}}>
            {[{l:"Utilisateurs",v:fmt(adminData.users),icon:"👥",c:C.cyan},{l:"Votes/jour",v:fmt(adminData.todayV),icon:"📊",c:C.red},{l:"Votes total",v:fmt(adminData.totalV),icon:"🗳️",c:C.gold},{l:"Vocaux",v:fmt(adminData.voices),icon:"🎤",c:C.green}].map((s,i)=>(
              <div key={i} style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:14,padding:"14px 10px",textAlign:"center"}}>
                <div style={{fontSize:20,marginBottom:4}}>{s.icon}</div>
                <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:30,color:s.c,letterSpacing:1}}>{s.v}</div>
                <div style={{fontSize:9,color:C.dim,marginTop:2,fontWeight:700,letterSpacing:0.5,textTransform:"uppercase"}}>{s.l}</div>
              </div>
            ))}
          </div>
          <p style={{fontSize:10,color:C.dim,fontWeight:700,letterSpacing:2,textTransform:"uppercase",marginBottom:10}}>Par catégorie</p>
          {Object.entries(adminData.byCat).sort((a,b)=>b[1]-a[1]).map(([cat,n])=>{
            const cc=CAT[cat]||C.red, max=Math.max(...Object.values(adminData.byCat));
            return<div key={cat} style={{marginBottom:10}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}><CatBadge cat={cat}/><span style={{fontSize:13,color:C.text,fontWeight:700}}>{fmt(n)}</span></div>
              <div style={{height:5,background:C.border,borderRadius:3,overflow:"hidden"}}><div style={{height:"100%",width:`${(n/max)*100}%`,background:cc,borderRadius:3}}/></div>
            </div>;
          })}
        </div>
      )}
      {tab==="questions"&&(
        <div>
          {QUESTIONS.map(q=>(
            <div key={q.id} style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:11,padding:"10px 13px",marginBottom:7,display:"flex",alignItems:"center",gap:9}}>
              <div style={{width:7,height:7,borderRadius:"50%",background:q.id==="q1"?C.green:C.dim,flexShrink:0}}/>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:12,color:C.text,fontWeight:600,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{qText(q,lang)}</div>
                <div style={{fontSize:10,color:C.dim,marginTop:1}}>{q.cat}</div>
              </div>
              <button style={{fontSize:9,fontWeight:800,background:q.id==="q1"?`${C.green}20`:C.ghost,color:q.id==="q1"?C.green:C.dim,border:`1px solid ${q.id==="q1"?C.green:C.brigh}`,borderRadius:6,padding:"3px 9px",cursor:"pointer"}}>{q.id==="q1"?"ACTIVE":"Activer"}</button>
            </div>
          ))}
        </div>
      )}
      {tab==="create"&&(
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          <div><p style={{fontSize:10,color:C.dim,fontWeight:700,letterSpacing:1.5,textTransform:"uppercase",marginBottom:7}}>Question</p><textarea value={form.text} onChange={e=>setForm({...form,text:e.target.value})} placeholder="Écris la question…" rows={3} style={{...inp,resize:"vertical"}}/></div>
          <div><p style={{fontSize:10,color:C.dim,fontWeight:700,letterSpacing:1.5,textTransform:"uppercase",marginBottom:7}}>Catégorie</p><select value={form.cat} onChange={e=>setForm({...form,cat:e.target.value})} style={inp}>{CATS.map(c=><option key={c} value={c}>{c}</option>)}</select></div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>{["o0","o1","o2"].map((k,i)=><div key={k}><p style={{fontSize:9,color:C.dim,fontWeight:700,letterSpacing:1,textTransform:"uppercase",marginBottom:5}}>Option {i+1}</p><input value={form[k]} onChange={e=>setForm({...form,[k]:e.target.value})} style={inp}/></div>)}</div>
          <div><p style={{fontSize:10,color:C.dim,fontWeight:700,letterSpacing:1.5,textTransform:"uppercase",marginBottom:7}}>Date</p><input type="date" value={form.date} onChange={e=>setForm({...form,date:e.target.value})} style={inp}/></div>
          <button onClick={save} disabled={!form.text||!form.date} style={{background:saved?C.green:C.red,border:"none",color:saved?"#000":"#fff",padding:"18px",borderRadius:12,fontSize:15,fontWeight:700,fontFamily:"'Barlow Condensed',sans-serif",letterSpacing:2,cursor:!form.text||!form.date?"not-allowed":"pointer",opacity:!form.text||!form.date?0.5:1,transition:"all 0.2s"}}>{saved?"✓ QUESTION CRÉÉE !":"CRÉER LA QUESTION"}</button>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// VOICE RECORDER HOOK
// ─────────────────────────────────────────────────────────────
function useRecorder(){
  const[active,setActive]=useState(false);
  const[t,setT]=useState(0);
  const MAX=10, ref=useRef(null);
  const stop=useCallback(()=>{clearInterval(ref.current);setActive(false);},[]);
  const start=useCallback(()=>{setActive(true);setT(0);ref.current=setInterval(()=>setT(p=>{if(p>=MAX-1){stop();return MAX;}return p+1;}),1000);},[stop]);
  useEffect(()=>()=>clearInterval(ref.current),[]);
  return{active,t,MAX,start,stop};
}

// ─────────────────────────────────────────────────────────────
// ROOT APP
// ─────────────────────────────────────────────────────────────
export default function EenVozApp(){
  const[screen,setScreen]=useState("landing");
  const[lang,setLang]=useState(detectLang);
  const t=I18N[lang]||I18N.fr;
  const[qIdx,setQIdx]=useState(0);
  const q=QUESTIONS[qIdx];
  const[userVote,setUserVote]=useState(null);
  const[pts,setPts]=useState(null);
  const[streakData,setStreakData]=useState(null);
  const[notifEnabled,setNotifEnabled]=useState(false);
  const recorder=useRecorder();

  useEffect(()=>{setLang(detectLang());},[]);

  // Profile state — inviteCode uses stable placeholder, replaced client-side
  const[profile,setProfile]=useState(()=>({
    votes:4, voicesSent:1, shares:2, points:75,
    streak:4, bestStreak:12,
    lastAnswerDate:"2025-01-12",
    invited:1,
    inviteCode:"EV-XXXX",           // replaced on client after hydration
    history:[
      {text:"L'argent rend-il vraiment heureux ?",cat:"argent",answer:"OUI",date:"Hier"},
      {text:"Tu pardonnerais une trahison ?",cat:"vérité",answer:"JAMAIS",date:"Il y a 2j"},
      {text:"La famille avant les amis ?",cat:"famille",answer:"OUI",date:"Il y a 3j"},
      {text:"Les réseaux sociaux...",cat:"société",answer:"OUI",date:"Il y a 4j"},
    ],
  }));

  // Generate random invite code client-side only (avoids SSR/hydration mismatch)
  useEffect(()=>{
    setProfile(p=>({...p,inviteCode:"EV-"+Math.random().toString(36).slice(2,6).toUpperCase()}));
  },[]);

  const adminData={users:8241,todayV:1203,totalV:94700,voices:3820,byCat:{amour:28000,argent:21000,société:18000,famille:12000,vérité:9000,amitié:4700,relations:2000}};

  // ── Streak logic ─────────────────────────────────────────
  const computeStreak=prev=>{
    const yStr=new Date(Date.now()-864e5).toISOString().split("T")[0];
    const cont=prev.lastAnswerDate===yStr||prev.lastAnswerDate===today();
    const ns=cont?prev.streak+1:1;
    return{newStreak:ns,newBest:Math.max(ns,prev.bestStreak)};
  };
  const checkNewBadge=(old,nw)=>{
    const oi=earnedBadges(old).map(b=>b.id);
    return earnedBadges(nw).find(b=>!oi.includes(b.id))||null;
  };

  // ── Handlers ─────────────────────────────────────────────
  const handleVote=(answer,idx)=>{
    const{newStreak,newBest}=computeStreak(profile);
    const prev=profile.streak;
    const bonusPts=newStreak===5?POINTS.streak5:newStreak===10?POINTS.streak10:newStreak===30?POINTS.streak30:0;
    const updated={
      ...profile,
      votes:profile.votes+1,
      points:profile.points+POINTS.vote+bonusPts,
      streak:newStreak, bestStreak:newBest,
      lastAnswerDate:today(),
      history:[{text:qText(q,lang),cat:q.cat,answer,date:"Aujourd'hui"},...profile.history].slice(0,20),
    };
    const newBadge=checkNewBadge(profile,updated);
    setProfile(updated);
    setUserVote({answer,idx});
    setPts(POINTS.vote+bonusPts);
    setTimeout(()=>setPts(null),3000);
    setStreakData({streak:newStreak,prev,newBadge});
    setScreen("results");
  };

  const handleShare=()=>{
    setProfile(p=>({...p,shares:p.shares+1,points:p.points+POINTS.share}));
    setScreen("share");
  };

  const handleShareDone=()=>{
    setProfile(p=>({...p,shares:p.shares+1,points:p.points+POINTS.share}));
  };

  const handleNext=()=>{
    setUserVote(null);setStreakData(null);
    setQIdx(i=>(i+1)%QUESTIONS.length);
    recorder.active&&recorder.stop();
    setScreen("question");
  };

  const handleNotif=()=>{
    if("Notification" in window){
      Notification.requestPermission().then(p=>{if(p==="granted"){setNotifEnabled(true);new Notification(t.notifTitle,{body:t.notifBody});}});
    }else setNotifEnabled(true);
  };

  const navItems=[
    {id:"question",icon:"🏠",label:t.home},
    {id:"profile", icon:"👤",label:t.profile},
    {id:"admin",   icon:"⚙️",label:t.admin},
  ];
  const activeNav=["question","results","share"].includes(screen)?"question":screen;

  return(
    <div style={{background:C.bg,minHeight:"100vh"}}>
      <style dangerouslySetInnerHTML={{__html:CSS}}/>

      {screen==="landing" &&<Landing onStart={()=>setScreen("question")} t={t} lang={lang} setLang={setLang} profile={profile}/>}
      {screen==="question"&&<QuestionScreen q={q} t={t} lang={lang} onVote={handleVote} recorder={recorder} userVote={userVote} profile={profile}/>}
      {screen==="results" &&<ResultsScreen q={q} userVote={userVote} t={t} lang={lang} onShare={handleShare} onNext={handleNext} pts={pts} streakData={streakData} onLike={()=>{}}/>}
      {screen==="share"   &&<ShareScreen q={q} userVote={userVote} t={t} lang={lang} onBack={()=>setScreen("results")} onNext={handleNext} onShareDone={handleShareDone}/>}
      {screen==="profile" &&<ProfileScreen state={profile} t={t} onBack={()=>setScreen("question")} onNotif={handleNotif} notifEnabled={notifEnabled}/>}
      {screen==="admin"   &&<AdminScreen t={t} lang={lang} adminData={adminData} onBack={()=>setScreen("question")}/>}

      {/* Bottom nav */}
      {screen!=="landing"&&(
        <nav style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:480,background:`${C.card}F4`,backdropFilter:"blur(22px)",borderTop:`1px solid ${C.border}`,padding:"10px 20px 24px",display:"flex",justifyContent:"space-around",zIndex:100}}>
          {navItems.map(item=>{
            const on=activeNav===item.id;
            return<button key={item.id} onClick={()=>setScreen(item.id)} style={{background:"none",border:"none",display:"flex",flexDirection:"column",alignItems:"center",gap:3,padding:"4px 16px",cursor:"pointer",position:"relative"}}>
              <span style={{fontSize:22,opacity:on?1:0.38,transition:"opacity 0.2s"}}>{item.icon}</span>
              <span style={{fontSize:9,fontWeight:on?800:500,color:on?C.red:C.dim,letterSpacing:0.5,textTransform:"uppercase"}}>{item.label}</span>
              {/* Streak pill */}
              {item.id==="question"&&profile.streak>0&&(
                <div style={{position:"absolute",top:-3,right:-2,background:C.red,borderRadius:999,padding:"1px 5px",fontSize:8,fontWeight:900,color:"#fff",lineHeight:1.5}}>🔥{profile.streak}</div>
              )}
              {on&&<div style={{position:"absolute",bottom:-10,width:18,height:2.5,background:C.red,borderRadius:2}}/>}
            </button>;
          })}
        </nav>
      )}
    </div>
  );
}
