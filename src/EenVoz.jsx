import { useState, useEffect, useRef, useCallback, useMemo } from "react";

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
  { id:"connector",icon:"👥", label:"Connecteur",    desc:"10 amis ajoutés",       color:C.cyan,   req:p=>(p.friends||[]).length>=10 },
  { id:"ambassador",icon:"🚀",label:"Top Ambassad.", desc:"20 amis invités",       color:C.purple, req:p=>p.invited>=20 },
];
const earnedBadges = p => BADGES.filter(b=>b.req(p));

// ─────────────────────────────────────────────────────────────
// LEADERBOARD
// ─────────────────────────────────────────────────────────────
const LEADERBOARD_BASE = [
  { name:"Aminata K.", city:"Abidjan",    flag:"🇨🇮", pts:2840, streak:34, votes:182, shares:47, invited:12 },
  { name:"Djibril M.", city:"Dakar",      flag:"🇸🇳", pts:2105, streak:21, votes:143, shares:31, invited:8  },
  { name:"Fatou S.",   city:"Paris",      flag:"🇫🇷", pts:1980, streak:18, votes:128, shares:28, invited:6  },
  { name:"Marco R.",   city:"Amsterdam",  flag:"🇳🇱", pts:1760, streak:15, votes:112, shares:19, invited:4  },
  { name:"Yann D.",    city:"Lyon",       flag:"🇫🇷", pts:1540, streak:12, votes:99,  shares:15, invited:3  },
  { name:"Aïcha B.",   city:"Casablanca", flag:"🇲🇦", pts:1320, streak:9,  votes:87,  shares:12, invited:2  },
  { name:"Carlos M.",  city:"Madrid",     flag:"🇪🇸", pts:1180, streak:8,  votes:78,  shares:9,  invited:1  },
];

// ─────────────────────────────────────────────────────────────
// MOCK FRIENDS
// ─────────────────────────────────────────────────────────────
const MOCK_FRIENDS = [
  { id:"f1", name:"Maria L.",    flag:"🇪🇸", city:"Madrid",   streak:12, votes:45 },
  { id:"f2", name:"Daniel O.",   flag:"🇨🇮", city:"Abidjan",  streak:7,  votes:32 },
  { id:"f3", name:"Lucas M.",    flag:"🇫🇷", city:"Paris",    streak:3,  votes:21 },
  { id:"f4", name:"Aïssatou D.", flag:"🇸🇳", city:"Dakar",    streak:18, votes:67 },
  { id:"f5", name:"Emma K.",     flag:"🇳🇱", city:"Amsterdam",streak:5,  votes:28 },
  { id:"f6", name:"Kevin A.",    flag:"🇧🇪", city:"Bruxelles",streak:9,  votes:41 },
];

// ─────────────────────────────────────────────────────────────
// I18N (fr + en + es + pt + nl)
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
    split:p=>`Les avis sont partagés — ${p}% dans ton camp`,
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
    friendsTitle:"Ce que pensent tes amis",
    friendsTab:"Amis",
    addFriend:"Ajouter un ami",
    noFriends:"Ajoute des amis pour voir leurs réponses !",
    friendAnswered:"a répondu",
    friendNotAnswered:"n'a pas encore répondu",
    ambassadorTitle:"Ambassadeurs",
    ambassadorDesc:"Invite des amis, grimpe au classement",
    totalInvited:"Amis invités",
    activeInvited:"Actifs",
    premiumInvited:"Premium",
    pointsEarned:"Points gagnés",
    inviteRank:"Rang ambassadeur",
    shareCardTitle:"RÉSULTAT MONDIAL",
    generateCard:"Générer ma carte",
    answeringNow:"personnes répondent en ce moment",
    regionalReplies:"réponses dans ta région",
    sharedToday:"partages aujourd'hui",
    quickShareTitle:"Partage ton opinion avec tes amis",
    trendingTitle:"Tendances", trendingTab:"🔥 Trends",
    trendingToday:"Aujourd'hui", trendingWeek:"Semaine", trendingMonth:"Mois",
    trendingReplies:"réponses", trendingShares:"partages", trendingVoices:"vocaux",
    trendingDebate:"💬 Débat", trendingViral:"📤 Viral", trendingPopular:"🔥 Top",
    challengeBtn:"⚡ DÉFIER UN AMI",
    challengeTitle:"Lance un défi !",
    challengeMsg:q=>`Je viens de répondre sur EENVOZ :\n\n"${q}"\n\nEt toi ? 🔥\n👉 eenvoz.app`,
    challengesSent:"Défis envoyés", challengesAccepted:"Défis acceptés",
    publicProfileTitle:"Profil Public",
    shareProfile:"Partager mon profil",
    opinionStats:"Mes opinions",
    home:"Accueil", profile:"Profil", trending:"Trends", admin:"Admin",
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
    friendsTitle:"What your friends think",
    friendsTab:"Friends",
    addFriend:"Add a friend",
    noFriends:"Add friends to see their answers!",
    friendAnswered:"answered",
    friendNotAnswered:"hasn't answered yet",
    ambassadorTitle:"Ambassadors",
    ambassadorDesc:"Invite friends, climb the ranking",
    totalInvited:"Friends invited",
    activeInvited:"Active",
    premiumInvited:"Premium",
    pointsEarned:"Points earned",
    inviteRank:"Ambassador rank",
    shareCardTitle:"GLOBAL RESULT",
    generateCard:"Generate my card",
    answeringNow:"people answering right now",
    regionalReplies:"replies in your region",
    sharedToday:"shares today",
    quickShareTitle:"Share your opinion with friends",
    trendingTitle:"Trending", trendingTab:"🔥 Trends",
    trendingToday:"Today", trendingWeek:"Week", trendingMonth:"Month",
    trendingReplies:"replies", trendingShares:"shares", trendingVoices:"voices",
    trendingDebate:"💬 Debate", trendingViral:"📤 Viral", trendingPopular:"🔥 Top",
    challengeBtn:"⚡ CHALLENGE A FRIEND",
    challengeTitle:"Send a challenge!",
    challengeMsg:q=>`I just answered this on EENVOZ:\n\n"${q}"\n\nWhat would you say? 🔥\n👉 eenvoz.app`,
    challengesSent:"Challenges sent", challengesAccepted:"Challenges accepted",
    publicProfileTitle:"Public Profile",
    shareProfile:"Share my profile",
    opinionStats:"My opinions",
    home:"Home", profile:"Profile", trending:"Trends", admin:"Admin",
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
    notifTitle:"EenVoz", notifBody:"Nueva pregunta del día 🎤",
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
    friendsTitle:"Lo que piensan tus amigos",
    friendsTab:"Amigos", addFriend:"Añadir amigo",
    noFriends:"¡Añade amigos para ver sus respuestas!",
    friendAnswered:"respondió", friendNotAnswered:"aún no respondió",
    ambassadorTitle:"Embajadores", ambassadorDesc:"Invita amigos, sube el ranking",
    totalInvited:"Amigos invitados", activeInvited:"Activos", premiumInvited:"Premium",
    pointsEarned:"Puntos ganados", inviteRank:"Rango embajador",
    shareCardTitle:"RESULTADO MUNDIAL", generateCard:"Generar mi tarjeta",
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
    friendsTitle:"O que seus amigos pensam",
    friendsTab:"Amigos", addFriend:"Adicionar amigo",
    noFriends:"Adicione amigos para ver as respostas deles!",
    friendAnswered:"respondeu", friendNotAnswered:"ainda não respondeu",
    ambassadorTitle:"Embaixadores", ambassadorDesc:"Convide amigos, suba no ranking",
    totalInvited:"Amigos convidados", activeInvited:"Ativos", premiumInvited:"Premium",
    pointsEarned:"Pontos ganhos", inviteRank:"Rank embaixador",
    shareCardTitle:"RESULTADO MUNDIAL", generateCard:"Gerar meu cartão",
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
    friendsTitle:"Wat jouw vrienden denken",
    friendsTab:"Vrienden", addFriend:"Vriend toevoegen",
    noFriends:"Voeg vrienden toe om hun antwoorden te zien!",
    friendAnswered:"heeft geantwoord", friendNotAnswered:"heeft nog niet geantwoord",
    ambassadorTitle:"Ambassadeurs", ambassadorDesc:"Nodig vrienden uit, klim in de rang",
    totalInvited:"Vrienden uitgenodigd", activeInvited:"Actief", premiumInvited:"Premium",
    pointsEarned:"Punten verdiend", inviteRank:"Ambassadeursrang",
    shareCardTitle:"WERELDRESULTAAT", generateCard:"Genereer mijn kaart",
  },
};
function detectLang(){if(typeof navigator==="undefined")return"fr";const l=navigator.language?.split("-")[0]?.toLowerCase();return I18N[l]?l:"fr";}

// ─────────────────────────────────────────────────────────────
// 200 VIRAL QUESTIONS DATABASE
// ─────────────────────────────────────────────────────────────
const ALL_QUESTIONS = [
  // AMOUR (40)
  {id:"q001",text:"Peut-on aimer deux personnes en même temps ?",cat:"amour"},
  {id:"q002",text:"L'amour à distance peut vraiment fonctionner ?",cat:"amour"},
  {id:"q003",text:"Tu pardonnerais une infidélité une seule fois ?",cat:"amour"},
  {id:"q004",text:"On peut tomber amoureux en une semaine ?",cat:"amour"},
  {id:"q005",text:"Tu préfères l'amour ou la liberté ?",cat:"amour"},
  {id:"q006",text:"Tu quitterais quelqu'un si tu n'étais plus amoureux ?",cat:"amour"},
  {id:"q007",text:"L'amour vrai existe-t-il vraiment ?",cat:"amour"},
  {id:"q008",text:"Tu peux être jaloux et amoureux en même temps ?",cat:"amour"},
  {id:"q009",text:"L'amour peut naître d'une amitié ?",cat:"amour"},
  {id:"q010",text:"Tu resterais avec quelqu'un que tu n'aimes plus pour tes enfants ?",cat:"amour"},
  {id:"q011",text:"Peut-on oublier un premier amour ?",cat:"amour"},
  {id:"q012",text:"L'amour passion dure combien de temps maximum ?",cat:"amour"},
  {id:"q013",text:"Tu crois au coup de foudre ?",cat:"amour"},
  {id:"q014",text:"Une relation sans confiance peut-elle durer ?",cat:"amour"},
  {id:"q015",text:"Tu pourrais aimer quelqu'un que ta famille n'approuve pas ?",cat:"amour"},
  {id:"q016",text:"L'amour se choisit ou s'impose ?",cat:"amour"},
  {id:"q017",text:"Tu pourrais être heureux seul toute ta vie ?",cat:"amour"},
  {id:"q018",text:"L'amour suffit pour construire une vie ensemble ?",cat:"amour"},
  {id:"q019",text:"Tu préfères aimer ou être aimé ?",cat:"amour"},
  {id:"q020",text:"Une relation fusionnelle est-elle saine ?",cat:"amour"},
  {id:"q021",text:"Peut-on vraiment rester amis avec un ex ?",cat:"amour"},
  {id:"q022",text:"Tu pourrais sortir avec quelqu'un de 10 ans plus âgé ?",cat:"amour"},
  {id:"q023",text:"La jalousie est-elle une preuve d'amour ?",cat:"amour"},
  {id:"q024",text:"Tu pourrais pardonner une tromperie émotionnelle ?",cat:"amour"},
  {id:"q025",text:"L'amour peut-il survivre à une longue séparation ?",cat:"amour"},
  {id:"q026",text:"Tu préfères un amour stable ou passionné ?",cat:"amour"},
  {id:"q027",text:"La romance en ligne peut mener à l'amour vrai ?",cat:"amour"},
  {id:"q028",text:"Tu retournerais avec un ex si tu pouvais ?",cat:"amour"},
  {id:"q029",text:"On peut tomber amoureux d'un inconnu sur Internet ?",cat:"amour"},
  {id:"q030",text:"L'amour change-t-il avec l'âge ?",cat:"amour"},
  {id:"q031",text:"Tu sortirais avec quelqu'un qui a des enfants d'une autre relation ?",cat:"amour"},
  {id:"q032",text:"Le mariage est-il encore nécessaire aujourd'hui ?",cat:"amour"},
  {id:"q033",text:"Tu pourrais être en couple ouvert ?",cat:"amour"},
  {id:"q034",text:"L'amour vrai peut-il être unilatéral ?",cat:"amour"},
  {id:"q035",text:"Tu pourrais quitter quelqu'un uniquement pour les apparences ?",cat:"amour"},
  {id:"q036",text:"Peut-on aimer quelqu'un et le tromper quand même ?",cat:"amour"},
  {id:"q037",text:"L'attirance physique est-elle indispensable à l'amour ?",cat:"amour"},
  {id:"q038",text:"Tu pourrais aimer quelqu'un d'une autre religion ?",cat:"amour"},
  {id:"q039",text:"Un amour non partagé peut-il être beau ?",cat:"amour"},
  {id:"q040",text:"Tu préfères une déclaration d'amour en public ou en privé ?",cat:"amour"},
  // ARGENT (30)
  {id:"q041",text:"L'argent rend-il vraiment heureux ?",cat:"argent"},
  {id:"q042",text:"Tu préfères l'amour ou l'argent ?",cat:"argent"},
  {id:"q043",text:"Tu quitterais un job que tu adores pour tripler ton salaire ?",cat:"argent"},
  {id:"q044",text:"Tu pourrais sortir avec quelqu'un plus pauvre que toi ?",cat:"argent"},
  {id:"q045",text:"Tu prêterais de l'argent à un ami ?",cat:"argent"},
  {id:"q046",text:"Les riches méritent-ils leur richesse ?",cat:"argent"},
  {id:"q047",text:"Tu parlerais de ton salaire à tes collègues ?",cat:"argent"},
  {id:"q048",text:"L'argent est la source principale des conflits en couple ?",cat:"argent"},
  {id:"q049",text:"Tu accepterais un travail illégal bien payé si tu ne te faisais pas attraper ?",cat:"argent"},
  {id:"q050",text:"L'argent change les gens ?",cat:"argent"},
  {id:"q051",text:"Tu achètes des choses inutiles pour impressionner les autres ?",cat:"argent"},
  {id:"q052",text:"Tout le monde peut devenir riche s'il travaille assez ?",cat:"argent"},
  {id:"q053",text:"Tu te sentirais à l'aise de gagner moins que ton partenaire ?",cat:"argent"},
  {id:"q054",text:"Il vaut mieux être riche et malheureux ou pauvre et heureux ?",cat:"argent"},
  {id:"q055",text:"Tu donnerais 10% de ton revenu à une cause ?",cat:"argent"},
  {id:"q056",text:"L'argent achète-t-il la paix ?",cat:"argent"},
  {id:"q057",text:"Tu serais à l'aise avec un écart de richesse énorme dans ton couple ?",cat:"argent"},
  {id:"q058",text:"Tu penses que tu mérites d'être riche ?",cat:"argent"},
  {id:"q059",text:"Tu parlerais d'argent au premier rendez-vous ?",cat:"argent"},
  {id:"q060",text:"La réussite financière définit-elle le succès ?",cat:"argent"},
  {id:"q061",text:"Tu refuserais un héritage mal acquis ?",cat:"argent"},
  {id:"q062",text:"Les pauvres sont-ils responsables de leur pauvreté ?",cat:"argent"},
  {id:"q063",text:"Tu investirais tes économies en crypto ?",cat:"argent"},
  {id:"q064",text:"L'argent est-il tabou dans ta culture ?",cat:"argent"},
  {id:"q065",text:"Tu accepterais de l'argent sans travailler si tu pouvais ?",cat:"argent"},
  {id:"q066",text:"Un homme doit payer au premier rendez-vous ?",cat:"argent"},
  {id:"q067",text:"Tu pourrais vivre sans carte de crédit ?",cat:"argent"},
  {id:"q068",text:"Les millionnaires sont-ils plus heureux que la moyenne ?",cat:"argent"},
  {id:"q069",text:"Tu comparerais ton salaire à celui de tes amis ?",cat:"argent"},
  {id:"q070",text:"L'argent est-il la mesure du respect dans la société ?",cat:"argent"},
  // RELATIONS (25)
  {id:"q071",text:"Peut-on être fidèle toute sa vie ?",cat:"relations"},
  {id:"q072",text:"Tu quitterais quelqu'un pour une meilleure vie ?",cat:"relations"},
  {id:"q073",text:"Un homme doit être le protecteur dans le couple ?",cat:"relations"},
  {id:"q074",text:"Tu peux vivre avec quelqu'un sans l'aimer vraiment ?",cat:"relations"},
  {id:"q075",text:"La tromperie est-elle toujours un deal-breaker ?",cat:"relations"},
  {id:"q076",text:"Les réseaux sociaux nuisent-ils aux relations amoureuses ?",cat:"relations"},
  {id:"q077",text:"Tu peux être heureux dans un mariage arrangé ?",cat:"relations"},
  {id:"q078",text:"Les couples qui se disputent s'aiment-ils plus ?",cat:"relations"},
  {id:"q079",text:"Tu cacherais des secrets à ton partenaire ?",cat:"relations"},
  {id:"q080",text:"La confiance se regagne-t-elle après une trahison ?",cat:"relations"},
  {id:"q081",text:"Tu pourrais partager les tâches ménagères à 50/50 ?",cat:"relations"},
  {id:"q082",text:"Les relations longues finissent-elles toujours par s'éteindre ?",cat:"relations"},
  {id:"q083",text:"Tu mettrais des règles dans ton couple ?",cat:"relations"},
  {id:"q084",text:"L'intimité diminue-t-elle avec le temps ?",cat:"relations"},
  {id:"q085",text:"Tu pourrais accepter que ton partenaire ait un ami proche du sexe opposé ?",cat:"relations"},
  {id:"q086",text:"La communication suffit-elle à résoudre tous les conflits ?",cat:"relations"},
  {id:"q087",text:"Tu lirais le téléphone de ton partenaire par curiosité ?",cat:"relations"},
  {id:"q088",text:"Un couple sans enfants est-il un couple complet ?",cat:"relations"},
  {id:"q089",text:"Tu quitterais quelqu'un qui ne veut pas d'enfants si toi tu veux ?",cat:"relations"},
  {id:"q090",text:"Le sexe est-il indispensable dans un couple ?",cat:"relations"},
  {id:"q091",text:"Tu mettrais un terme à une relation toxique même si tu aimes encore ?",cat:"relations"},
  {id:"q092",text:"Une relation saine est-elle possible sans espace personnel ?",cat:"relations"},
  {id:"q093",text:"Tu garderais tes mots de passe secrets dans ton couple ?",cat:"relations"},
  {id:"q094",text:"Les problèmes d'argent détruisent-ils plus de couples que la tromperie ?",cat:"relations"},
  {id:"q095",text:"Tu pourrais rester dans un couple sans amour pour les enfants ?",cat:"relations"},
  // AMITIÉ (20)
  {id:"q096",text:"Les amis sont plus importants que la famille ?",cat:"amitié"},
  {id:"q097",text:"Tu couperais les ponts après une seule trahison d'un ami ?",cat:"amitié"},
  {id:"q098",text:"Un ami peut devenir un ennemi du jour au lendemain ?",cat:"amitié"},
  {id:"q099",text:"Tu peux avoir de vrais amis en ligne ?",cat:"amitié"},
  {id:"q100",text:"Tu dirais la vérité à un ami même si ça fait mal ?",cat:"amitié"},
  {id:"q101",text:"L'amitié homme-femme sans sentiments est-elle possible ?",cat:"amitié"},
  {id:"q102",text:"Tu prêterais de l'argent à un ami proche ?",cat:"amitié"},
  {id:"q103",text:"Un ami qui dit toujours oui est-il vraiment un ami ?",cat:"amitié"},
  {id:"q104",text:"Les meilleurs amis viennent-ils de l'école ou du travail ?",cat:"amitié"},
  {id:"q105",text:"Tu pardonnerais à un ami qui a couché avec ton ex ?",cat:"amitié"},
  {id:"q106",text:"Il est normal de perdre des amis en grandissant ?",cat:"amitié"},
  {id:"q107",text:"La qualité des amis vaut-elle mieux que la quantité ?",cat:"amitié"},
  {id:"q108",text:"Tu aiderais un ami en fuite avec la loi ?",cat:"amitié"},
  {id:"q109",text:"Une amitié peut-elle survivre à une trahison grave ?",cat:"amitié"},
  {id:"q110",text:"Tu dis ce que tu penses vraiment à tes amis ?",cat:"amitié"},
  {id:"q111",text:"Les gens populaires ont-ils de vraies amitiés ?",cat:"amitié"},
  {id:"q112",text:"Un ami doit-il être disponible 24h/24 ?",cat:"amitié"},
  {id:"q113",text:"Tu gardes des amis d'enfance qui ne te correspondent plus ?",cat:"amitié"},
  {id:"q114",text:"Les amitiés d'école sont-elles plus solides ?",cat:"amitié"},
  {id:"q115",text:"Tu te bats pour un ami même si tu sais qu'il a tort ?",cat:"amitié"},
  // FAMILLE (20)
  {id:"q116",text:"La famille passe toujours avant les amis ?",cat:"famille"},
  {id:"q117",text:"Tu pourrais couper tout contact avec un membre de ta famille ?",cat:"famille"},
  {id:"q118",text:"Tes parents ont-ils raison sur la plupart des choses ?",cat:"famille"},
  {id:"q119",text:"Tu aiderais un frère ou sœur financièrement même si tu es serré ?",cat:"famille"},
  {id:"q120",text:"La famille choisie est-elle aussi légitime que la famille de sang ?",cat:"famille"},
  {id:"q121",text:"Tu pourrais épouser quelqu'un que ta famille n'aime pas ?",cat:"famille"},
  {id:"q122",text:"Un enfant doit-il obéir à ses parents toujours ?",cat:"famille"},
  {id:"q123",text:"Tu garderais un secret honteux pour protéger ta famille ?",cat:"famille"},
  {id:"q124",text:"Tu sacrifierais ta carrière pour être proche de ta famille ?",cat:"famille"},
  {id:"q125",text:"Les parents ont-ils le droit d'influencer le choix de vie de leurs enfants adultes ?",cat:"famille"},
  {id:"q126",text:"Il est normal de préférer un de ses enfants à un autre ?",cat:"famille"},
  {id:"q127",text:"Tu mettrais tes parents en maison de retraite ?",cat:"famille"},
  {id:"q128",text:"La famille est la source de la majorité de nos traumatismes ?",cat:"famille"},
  {id:"q129",text:"Tu prêterais de l'argent à un membre de ta famille ?",cat:"famille"},
  {id:"q130",text:"Les disputes familiales guérissent-elles toujours ?",cat:"famille"},
  {id:"q131",text:"Tu pourrais élever un enfant seul si nécessaire ?",cat:"famille"},
  {id:"q132",text:"L'éducation parentale est-elle la clé du succès ?",cat:"famille"},
  {id:"q133",text:"Tu parles des problèmes familiaux à tes amis ?",cat:"famille"},
  {id:"q134",text:"Il faut avoir des enfants pour être épanoui ?",cat:"famille"},
  {id:"q135",text:"La relation avec tes parents change-t-elle en vieillissant ?",cat:"famille"},
  // SOCIÉTÉ (30)
  {id:"q136",text:"Les réseaux sociaux font plus de mal que de bien ?",cat:"société"},
  {id:"q137",text:"La démocratie est-elle le meilleur système politique ?",cat:"société"},
  {id:"q138",text:"Le racisme est-il encore un problème majeur aujourd'hui ?",cat:"société"},
  {id:"q139",text:"Les hommes et les femmes sont-ils vraiment égaux ?",cat:"société"},
  {id:"q140",text:"La cancel culture va trop loin ?",cat:"société"},
  {id:"q141",text:"Le changement climatique est-il la plus grande menace de notre époque ?",cat:"société"},
  {id:"q142",text:"L'intelligence artificielle va-t-elle remplacer les humains ?",cat:"société"},
  {id:"q143",text:"Les médias mentent-ils plus qu'ils ne disent la vérité ?",cat:"société"},
  {id:"q144",text:"Il est possible de réussir sans études supérieures ?",cat:"société"},
  {id:"q145",text:"La mondialisation profite-t-elle à tout le monde ?",cat:"société"},
  {id:"q146",text:"Les jeunes d'aujourd'hui sont-ils plus ou moins courageux que leurs parents ?",cat:"société"},
  {id:"q147",text:"Tu ferais confiance à un inconnu ?",cat:"société"},
  {id:"q148",text:"Internet a-t-il rendu les gens plus solitaires ?",cat:"société"},
  {id:"q149",text:"La polygamie devrait-elle être légale ?",cat:"société"},
  {id:"q150",text:"Il faut souffrir pour réussir ?",cat:"société"},
  {id:"q151",text:"L'école prépare-t-elle vraiment à la vie ?",cat:"société"},
  {id:"q152",text:"Le travail à distance est meilleur que le bureau ?",cat:"société"},
  {id:"q153",text:"La société favorise-t-elle les personnes belles ?",cat:"société"},
  {id:"q154",text:"Tu sacrifierais ton bonheur pour le bonheur collectif ?",cat:"société"},
  {id:"q155",text:"Les réseaux sociaux ont-ils créé plus de dépression chez les jeunes ?",cat:"société"},
  {id:"q156",text:"Tu porterais une arme si c'était légal dans ton pays ?",cat:"société"},
  {id:"q157",text:"La peine de mort est-elle justifiée dans certains cas ?",cat:"société"},
  {id:"q158",text:"L'immigration est-elle bénéfique pour les pays d'accueil ?",cat:"société"},
  {id:"q159",text:"Les technologies vont-elles améliorer nos vies ?",cat:"société"},
  {id:"q160",text:"On peut changer le système de l'intérieur ?",cat:"société"},
  {id:"q161",text:"Les hommes ont-ils peur des femmes fortes ?",cat:"société"},
  {id:"q162",text:"La liberté absolue est-elle possible en société ?",cat:"société"},
  {id:"q163",text:"La religion divise-t-elle plus qu'elle ne rassemble ?",cat:"société"},
  {id:"q164",text:"Les enfants d'aujourd'hui ont-ils une vie plus difficile ?",cat:"société"},
  {id:"q165",text:"Tu paierais plus d'impôts pour de meilleurs services publics ?",cat:"société"},
  // VÉRITÉ (35)
  {id:"q166",text:"Tu mens parfois pour ne pas blesser ?",cat:"vérité"},
  {id:"q167",text:"On peut changer vraiment sa personnalité ?",cat:"vérité"},
  {id:"q168",text:"Tu as déjà regretté quelque chose de grave ?",cat:"vérité"},
  {id:"q169",text:"Tu as peur de la mort ?",cat:"vérité"},
  {id:"q170",text:"Tu ferais quelque chose d'immoral si personne ne le savait ?",cat:"vérité"},
  {id:"q171",text:"Les gens sont fondamentalement bons ou mauvais ?",cat:"vérité"},
  {id:"q172",text:"Tu as déjà jalousé quelqu'un secrètement ?",cat:"vérité"},
  {id:"q173",text:"Tu serais honnête même si ça te coûte quelque chose ?",cat:"vérité"},
  {id:"q174",text:"La vérité fait-elle toujours du bien ?",cat:"vérité"},
  {id:"q175",text:"Tu peux regarder quelqu'un dans les yeux en mentant ?",cat:"vérité"},
  {id:"q176",text:"Tu t'es déjà senti seul entouré de monde ?",cat:"vérité"},
  {id:"q177",text:"Tu te juges trop sévèrement ?",cat:"vérité"},
  {id:"q178",text:"Le succès des autres te rend parfois jaloux ?",cat:"vérité"},
  {id:"q179",text:"Tu parles de toi-même en bien aux autres ?",cat:"vérité"},
  {id:"q180",text:"Tu as déjà trompé quelqu'un de confiance ?",cat:"vérité"},
  {id:"q181",text:"Tu penses sincèrement que tu es une bonne personne ?",cat:"vérité"},
  {id:"q182",text:"La peur te limite-t-elle dans tes choix ?",cat:"vérité"},
  {id:"q183",text:"Tu fais semblant d'être heureux parfois ?",cat:"vérité"},
  {id:"q184",text:"Tu as des regrets sur des choix de vie importants ?",cat:"vérité"},
  {id:"q185",text:"L'honnêteté totale est-elle possible dans une relation ?",cat:"vérité"},
  {id:"q186",text:"Tu trahirais un secret si ça pouvait aider quelqu'un ?",cat:"vérité"},
  {id:"q187",text:"Tu mens sur les réseaux sociaux sur ta vraie vie ?",cat:"vérité"},
  {id:"q188",text:"Tu te bats contre tes mauvaises habitudes ?",cat:"vérité"},
  {id:"q189",text:"Tu as peur du jugement des autres ?",cat:"vérité"},
  {id:"q190",text:"Tu penses que tu mérites plus que ce que tu as ?",cat:"vérité"},
  {id:"q191",text:"Tu as déjà abandonné un rêve par peur ?",cat:"vérité"},
  {id:"q192",text:"Tu te reconnais dans les critiques qu'on te fait ?",cat:"vérité"},
  {id:"q193",text:"La vérité peut-elle être relative ?",cat:"vérité"},
  {id:"q194",text:"Tu t'es déjà senti trahi par toi-même ?",cat:"vérité"},
  {id:"q195",text:"Tu es vraiment satisfait de ta vie actuelle ?",cat:"vérité"},
  {id:"q196",text:"Tu pourrais vivre sans approbation des autres ?",cat:"vérité"},
  {id:"q197",text:"Tu regrettes des paroles dites sous le coup de la colère ?",cat:"vérité"},
  {id:"q198",text:"Le bonheur est-il un choix ou une chance ?",cat:"vérité"},
  {id:"q199",text:"Tu as toujours su qui tu es vraiment ?",cat:"vérité"},
  {id:"q200",text:"Si tu pouvais tout recommencer, tu ferais différemment ?",cat:"vérité"},
];

// Question du jour automatique (basée sur la date)
function getQuestionOfTheDay() {
  const start = new Date("2024-01-01");
  const today = new Date();
  const diff = Math.floor((today - start) / (1000 * 60 * 60 * 24));
  return ALL_QUESTIONS[diff % ALL_QUESTIONS.length];
}

// 10 questions pour navigation
const QUESTIONS = ALL_QUESTIONS.slice(0, 10).map(q => ({...q, sponsor: q.id==="q041"?{name:"MoneyApp"}:null}));

// ─────────────────────────────────────────────────────────────
// MOCK VOICES
// ─────────────────────────────────────────────────────────────
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

// Friends answers mock (simulé)
function getFriendsAnswers(qId, friends, opts) {
  return friends.map((f, i) => {
    const answered = (f.id.charCodeAt(1) + qId.charCodeAt(qId.length-1)) % 3 !== 0;
    const answerIdx = (f.id.charCodeAt(1) + qId.charCodeAt(qId.length-1)) % opts.length;
    return { ...f, answered, answer: answered ? opts[answerIdx] : null };
  });
}

const POINTS={vote:10,voice:20,share:15,invite:50,inviteActive:100,invitePremium:200,streak5:25,streak10:50,streak30:100,challenge:5};
const today=()=>new Date().toISOString().split("T")[0];

// ─────────────────────────────────────────────────────────────
// TRENDING DATA (mock)
// ─────────────────────────────────────────────────────────────
function getTrendingQuestions(period, region) {
  // Deterministic seeded shuffle based on period+region
  const seed = period.charCodeAt(0) + region.charCodeAt(0);
  return ALL_QUESTIONS.map((q, i) => {
    const s = q.id.charCodeAt(q.id.length-1) + seed;
    const votes = 1200 + (s * 3711) % 28000;
    const shares = Math.floor(votes * (0.05 + (s % 20) * 0.02));
    const voices = Math.floor(votes * (0.03 + (s % 15) * 0.01));
    const debateScore = Math.abs(50 - ((s * 7) % 100)); // closer to 0 = more debate (50/50 split)
    const type = debateScore < 15 ? "debate" : shares > 3000 ? "viral" : "popular";
    return { ...q, votes, shares, voices, type, debateScore };
  }).sort((a, b) => {
    if (period === "today") return b.voices - a.voices;
    if (period === "week") return b.shares - a.shares;
    return b.votes - a.votes;
  }).slice(0, 20);
}

const REGIONS = [
  { id:"world", label:"🌍 Monde", flag:"🌍" },
  { id:"ci",    label:"🇨🇮 Côte d'Ivoire", flag:"🇨🇮" },
  { id:"sn",    label:"🇸🇳 Sénégal", flag:"🇸🇳" },
  { id:"fr",    label:"🇫🇷 France", flag:"🇫🇷" },
  { id:"nl",    label:"🇳🇱 Pays-Bas", flag:"🇳🇱" },
  { id:"ma",    label:"🇲🇦 Maroc", flag:"🇲🇦" },
  { id:"es",    label:"🇪🇸 Espagne", flag:"🇪🇸" },
];

// ─────────────────────────────────────────────────────────────
// CSS
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
  @keyframes cardReveal{0%{opacity:0;transform:scale(0.9) translateY(20px)}100%{opacity:1;transform:scale(1) translateY(0)}}
  @keyframes ctaPulse{0%,100%{box-shadow:0 12px 44px ${C.red}55,0 0 0 0 ${C.red}44}60%{box-shadow:0 12px 60px ${C.red}80,0 0 0 14px ${C.red}00}}
  @keyframes ctaGlow{0%,100%{filter:brightness(1)}50%{filter:brightness(1.18)}}
  @keyframes socialProofSlide{0%{opacity:0;transform:translateY(8px)}12%{opacity:1;transform:translateY(0)}88%{opacity:1;transform:translateY(0)}100%{opacity:0;transform:translateY(-8px)}}
  @keyframes streakFlame{0%{transform:scale(1) rotate(-4deg)}25%{transform:scale(1.4) rotate(6deg)}50%{transform:scale(1.2) rotate(-6deg)}75%{transform:scale(1.35) rotate(4deg)}100%{transform:scale(1) rotate(-4deg)}}
  @keyframes streakNumberPop{0%{transform:scale(0.4);opacity:0}60%{transform:scale(1.3);opacity:1}100%{transform:scale(1);opacity:1}}
  @keyframes quickShareSlide{0%{opacity:0;transform:translateY(16px)}100%{opacity:1;transform:translateY(0)}}
  @keyframes barFill{from{width:0%}to{width:var(--bar-w)}}

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
  .card-reveal{animation:cardReveal 0.5s cubic-bezier(.22,1,.36,1) both}
  .cta-pulse{animation:ctaPulse 2.2s ease-in-out infinite,ctaGlow 2.2s ease-in-out infinite}
  .streak-flame{animation:streakFlame 0.55s ease-in-out both}
  .streak-num{animation:streakNumberPop 0.5s cubic-bezier(.34,1.56,.64,1) both}
  .quick-share{animation:quickShareSlide 0.38s cubic-bezier(.22,1,.36,1) both}
  .bar-fill{animation:barFill 0.9s cubic-bezier(.22,1,.36,1) forwards}
`;

// ─────────────────────────────────────────────────────────────
// UTILS
// ─────────────────────────────────────────────────────────────
const fmt=n=>n>=1e6?`${(n/1e6).toFixed(1)}M`:n>=1e3?`${(n/1e3).toFixed(1)}k`:String(n);
const pcts=arr=>{const s=arr.reduce((a,b)=>a+b,0);return s?arr.map(v=>Math.round(v/s*100)):arr.map(()=>0);};

// ─────────────────────────────────────────────────────────────
// DYNAMIC SOCIAL PROOF — riche, multi-stats, live
// ─────────────────────────────────────────────────────────────
function useLiveStats() {
  const BASE = 12458;
  const [stats, setStats] = useState({
    today:    BASE,
    live:     14 + Math.floor(Math.random()*22),
    regional: 347 + Math.floor(Math.random()*80),
    shared:   Math.floor(BASE * 0.31),
    countries: 48,
  });
  useEffect(()=>{
    const id = setInterval(()=>{
      setStats(s=>({
        ...s,
        today:    s.today    + Math.floor(Math.random()*4),
        live:     Math.max(5, s.live + Math.floor(Math.random()*7) - 3),
        regional: s.regional + (Math.random()>0.7?1:0),
        shared:   s.shared   + Math.floor(Math.random()*2),
      }));
    }, 2800);
    return ()=>clearInterval(id);
  },[]);
  return stats;
}

function DynamicSocialProof({t, color=C.green}) {
  const stats = useLiveStats();
  const [idx, setIdx] = useState(0);
  const [fade, setFade] = useState(true);

  const messages = [
    { icon:"🟢", dot:C.green,  text:`${stats.live} ${t.answeringNow||"personnes répondent maintenant"}` },
    { icon:"📊", dot:C.cyan,   text:`${fmt(stats.today)} ${t.answered||"réponses aujourd'hui"}` },
    { icon:"📍", dot:C.purple, text:`${stats.regional} ${t.regionalReplies||"réponses dans ta région"}` },
    { icon:"📤", dot:C.orange, text:`${fmt(stats.shared)} ${t.sharedToday||"partages aujourd'hui"}` },
    { icon:"🌍", dot:C.gold,   text:`${stats.countries} pays représentés` },
  ];

  useEffect(()=>{
    const id = setInterval(()=>{
      setFade(false);
      setTimeout(()=>{ setIdx(i=>(i+1)%messages.length); setFade(true); }, 380);
    }, 3600);
    return ()=>clearInterval(id);
  },[messages.length]);

  const msg = messages[idx];
  return (
    <div style={{display:"flex",alignItems:"center",gap:8,justifyContent:"center",minHeight:24}}>
      <span style={{width:7,height:7,borderRadius:"50%",background:msg.dot,flexShrink:0,
        boxShadow:`0 0 8px ${msg.dot}`,animation:"blink 2s ease-in-out infinite"}}/>
      <span key={idx} style={{fontSize:12,color:C.dim,fontWeight:600,
        opacity:fade?1:0,transition:"opacity 0.34s ease",userSelect:"none"}}>
        {msg.icon} {msg.text}
      </span>
    </div>
  );
}

// Compact live ticker for question screen header
function LiveActivityTicker({stats, catColor}) {
  if(!stats) return null;
  return(
    <div style={{display:"flex",gap:14,justifyContent:"center",flexWrap:"wrap"}}>
      {[
        {icon:"🟢", val:stats.live,             label:"live",    color:C.green},
        {icon:"📊", val:fmt(stats.today),        label:"today",   color:C.cyan},
        {icon:"🌍", val:stats.countries+" pays", label:"",        color:C.gold},
      ].map((s,i)=>(
        <div key={i} style={{display:"flex",alignItems:"center",gap:4}}>
          <span style={{width:5,height:5,borderRadius:"50%",background:s.color,
            boxShadow:`0 0 5px ${s.color}`,animation:"blink 2s ease-in-out infinite",flexShrink:0}}/>
          <span style={{fontSize:11,color:C.dim,fontWeight:600}}>
            {s.icon} <span style={{color:s.color,fontWeight:800}}>{s.val}</span>
            {s.label&&<span> {s.label}</span>}
          </span>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// ANIMATED RESULT BARS (post-vote)
// ─────────────────────────────────────────────────────────────
function AnimatedResultBars({pcts, opts, userIdx, catColor}) {
  const [mounted, setMounted] = useState(false);
  useEffect(()=>{ const id=setTimeout(()=>setMounted(true),120); return()=>clearTimeout(id); },[]);

  const colors = [catColor, C.dim, `${catColor}88`];
  return(
    <div style={{display:"flex",flexDirection:"column",gap:9,marginBottom:4}}>
      {opts.map((opt,i)=>{
        const pct = pcts[i]??0;
        const isUser = i===userIdx;
        const col = isUser ? catColor : `${catColor}66`;
        return(
          <div key={i}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
              <span style={{fontSize:13,fontWeight:isUser?800:600,color:isUser?catColor:C.dim,display:"flex",alignItems:"center",gap:5}}>
                {isUser && <span style={{fontSize:10}}>◀</span>} {opt}
              </span>
              <span style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:22,fontWeight:900,color:isUser?catColor:C.dim,lineHeight:1,letterSpacing:0.5}}>
                {pct}%
              </span>
            </div>
            <div style={{height:9,background:C.ghost,borderRadius:5,overflow:"hidden"}}>
              <div className="bar-fill" style={{
                '--bar-w':`${mounted?pct:0}%`,
                height:"100%",
                width:`${mounted?pct:0}%`,
                background:isUser?`linear-gradient(90deg,${catColor},${catColor}bb)`:C.brigh,
                borderRadius:5,
                boxShadow:isUser?`0 0 10px ${catColor}55`:"none",
                transition:"width 0.9s cubic-bezier(.22,1,.36,1)",
              }}/>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// QUICK SHARE STRIP (inline after vote)
// ─────────────────────────────────────────────────────────────
function QuickShareStrip({q, userVote, t, catColor, onShareDone}) {
  const [copied, setCopied] = useState(false);
  const opts = t.opts||["OUI","NON","ÇA DÉPEND"];
  const answer = userVote ? opts[userVote.idx] : "";
  const msg = `🎤 EENVOZ\n\n"${q.text}"\n\nMa réponse : ${answer}\n\nEt toi ? 👉 eenvoz.app`;

  const share = (platform) => {
    if(platform==="whatsapp") window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`,"_blank");
    if(platform==="copy") { navigator.clipboard.writeText(msg).then(()=>{setCopied(true);setTimeout(()=>setCopied(false),2000);}); }
    if(platform==="instagram") { navigator.clipboard.writeText(msg).then(()=>{setCopied(true);setTimeout(()=>setCopied(false),2000);}); }
    onShareDone?.();
  };

  return(
    <div className="quick-share" style={{background:C.card,border:`1px solid ${catColor}30`,borderRadius:16,padding:"14px 16px",marginBottom:14}}>
      <div style={{fontSize:11,color:catColor,fontWeight:800,letterSpacing:1.5,textTransform:"uppercase",marginBottom:10}}>
        💬 {t.quickShareTitle||"Partage ton opinion"}
      </div>
      <div style={{display:"flex",gap:8}}>
        {[
          {id:"whatsapp", icon:"💬", label:"WhatsApp", color:"#25D366"},
          {id:"instagram",icon:"📸", label:"Instagram", color:"#E1306C"},
          {id:"copy",     icon:copied?"✅":"🔗", label:copied?(t.copied||"Copié!"):(t.copyLink||"Copier"), color:C.cyan},
        ].map(p=>(
          <button key={p.id} onClick={()=>share(p.id)} className="lift"
            style={{flex:1,background:`${p.color}12`,border:`1px solid ${p.color}30`,color:p.color,borderRadius:10,padding:"9px 4px",fontSize:10,fontWeight:700,cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:4,transition:"all 0.15s"}}>
            <span style={{fontSize:18}}>{p.icon}</span>
            <span style={{fontSize:9,letterSpacing:0.3}}>{p.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// STREAK CELEBRATION OVERLAY
// ─────────────────────────────────────────────────────────────
function StreakCelebration({streak, color, onDone}) {
  const [phase, setPhase] = useState("in"); // in → hold → out
  useEffect(()=>{
    const t1 = setTimeout(()=>setPhase("hold"),600);
    const t2 = setTimeout(()=>setPhase("out"),2600);
    const t3 = setTimeout(()=>onDone?.(),3100);
    return()=>{clearTimeout(t1);clearTimeout(t2);clearTimeout(t3);};
  },[]);

  const opacity = phase==="out"?0:1;
  const scale = phase==="in"?0.6:phase==="hold"?1:1.08;

  return(
    <div style={{position:"fixed",inset:0,zIndex:9999,display:"flex",alignItems:"center",justifyContent:"center",pointerEvents:"none",background:phase==="hold"?"rgba(0,0,0,0.55)":"rgba(0,0,0,0)",transition:"background 0.4s ease"}}>
      <div style={{textAlign:"center",opacity,transform:`scale(${scale})`,transition:"all 0.45s cubic-bezier(.34,1.56,.64,1)"}}>
        {/* Flame burst */}
        <div style={{position:"relative",display:"inline-block",marginBottom:12}}>
          {[...Array(6)].map((_,i)=>(
            <div key={i} style={{position:"absolute",fontSize:28,top:"50%",left:"50%",transform:`rotate(${i*60}deg) translateY(-52px) translateX(-50%)`,animation:`streakFlame 0.6s ${i*0.08}s ease-in-out both`,opacity:0.7}}>🔥</div>
          ))}
          <div className="streak-flame" style={{fontSize:72,display:"block",filter:`drop-shadow(0 0 24px ${color})`}}>🔥</div>
        </div>
        <div className="streak-num" style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:88,lineHeight:1,color,letterSpacing:2,textShadow:`0 0 32px ${color}88`}}>{streak}</div>
        <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:22,letterSpacing:3,color,opacity:0.85,marginTop:2}}>JOURS DE STREAK</div>
        <div style={{fontSize:14,color:"rgba(255,255,255,0.6)",marginTop:8,fontWeight:600}}>
          {streak>=30?"🏆 LÉGENDAIRE !":streak>=10?"⚡ EN FEU !":streak>=5?"🔥 CHAUD !":"💪 Continue !"}
        </div>
      </div>
    </div>
  );
}


function CatBadge({cat}){
  const color=CAT[cat]||C.red;
  return<span style={{display:"inline-flex",alignItems:"center",gap:5,background:`${color}18`,border:`1px solid ${color}40`,color,borderRadius:20,padding:"3px 10px",fontSize:10,fontWeight:800,letterSpacing:1.5,textTransform:"uppercase"}}><span style={{width:5,height:5,borderRadius:"50%",background:color,display:"inline-block"}}/>{cat}</span>;
}

function Waveform({active,color="#fff"}){
  return<div style={{display:"flex",gap:2.5,height:24,alignItems:"center"}}>{Array.from({length:16}).map((_,i)=><div key={i} style={{width:3,height:"100%",borderRadius:2,background:color,transformOrigin:"center",animation:active?`wave ${0.4+(i%4)*0.1}s ${i*0.05}s ease-in-out infinite`:"none",transform:active?undefined:"scaleY(0.18)",opacity:active?0.85:0.22,transition:"opacity 0.3s"}}/> )}</div>;
}

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

function SocialProof({total,t,catColor}){
  const[displayed,setDisplayed]=useState(total-Math.floor(Math.random()*40+5));
  useEffect(()=>{
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

function StreakRing({streak,size=42}){
  const r=15,circ=2*Math.PI*r;
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
      <div className="slideDown" style={{background:`linear-gradient(135deg,${color},${color===C.red?C.orange:C.red})`,borderRadius:18,padding:"14px 20px",display:"flex",alignItems:"center",gap:12,boxShadow:`0 8px 36px ${color}66`,maxWidth:360,width:"100%"}}>
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
      <div style={{fontSize:12,color:C.dim,marginTop:4}}>👇 Partage pour voir ce que pensent tes amis</div>
    </div>
  );
}

function VoiceCard({v,catColor,t,onLike,blockedUsers=[],onBlock}){
  const[playing,setPlaying]=useState(false);
  const[liked,setLiked]=useState(false);
  const[showMod,setShowMod]=useState(false);
  const[reported,setReported]=useState(false);

  if(blockedUsers.includes(v.id)) return null;
  if(reported) return(
    <div style={{background:C.ghost,border:`1px solid ${C.border}`,borderRadius:12,padding:"10px 13px",marginBottom:7,fontSize:12,color:C.dim,textAlign:"center"}}>
      ✓ Contenu signalé — merci pour ta contribution.
    </div>
  );

  const name=v.anon?t.anon:(v.name||t.anon);
  return(
    <>
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
      <button onClick={()=>setShowMod(true)} style={{background:"none",border:"none",fontSize:12,cursor:"pointer",color:C.dim,flexShrink:0,lineHeight:1,padding:"2px 4px"}}>⋯</button>
    </div>
    {showMod&&<ModerationModal
      voiceId={v.id} voiceName={name}
      onClose={()=>setShowMod(false)}
      onReport={()=>{setReported(true);setShowMod(false);}}
      onBlock={()=>{onBlock?.(v.id);setShowMod(false);}}
    />}
    </>
  );
}

function PointsToast({pts}){
  if(!pts)return null;
  return<div className="pop" style={{position:"fixed",top:76,left:"50%",transform:"translateX(-50%)",background:C.gold,color:"#000",borderRadius:999,padding:"8px 22px",fontSize:13,fontWeight:900,zIndex:9998,letterSpacing:0.5,boxShadow:`0 6px 24px ${C.gold}55`,pointerEvents:"none"}}>+{pts} pts 🔥</div>;
}

function NotifBanner({t,onEnable,enabled}){
  const[dismissed,setDismissed]=useState(false);
  const[scheduled,setScheduled]=useState(false);
  const[hour,setHour]=useState("09:00");
  const[showSchedule,setShowSchedule]=useState(false);

  if(dismissed||enabled)return null;

  const handleEnable=()=>{
    if("Notification" in window){
      Notification.requestPermission().then(p=>{
        if(p==="granted"){
          onEnable?.();
          setScheduled(true);
          // Schedule immediate confirmation notification
          new Notification("🔔 EENVOZ activé !", {
            body:`Rappel quotidien à ${hour} ✅`,
            icon:"/favicon.ico"
          });
        }
      });
    } else { onEnable?.(); setScheduled(true); }
  };

  return(
    <div className="u0" style={{background:`${C.cyan}10`,border:`1px solid ${C.cyan}28`,borderRadius:14,padding:"13px",marginBottom:14}}>
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:showSchedule?10:0}}>
        <span style={{fontSize:20,flexShrink:0}}>🔔</span>
        <div style={{flex:1,minWidth:0}}>
          <div style={{fontSize:12,fontWeight:700,color:C.text}}>Ne rate aucune question du jour</div>
          <div style={{fontSize:10,color:C.dim,marginTop:1}}>Rappel quotidien · gratuit</div>
        </div>
        <div style={{display:"flex",gap:5,flexShrink:0}}>
          <button onClick={()=>setShowSchedule(!showSchedule)} style={{background:`${C.cyan}18`,border:`1px solid ${C.cyan}30`,color:C.cyan,borderRadius:8,padding:"5px 9px",fontSize:10,fontWeight:700,cursor:"pointer"}}>
            {hour}
          </button>
          <button onClick={handleEnable} style={{background:C.cyan,border:"none",color:"#000",borderRadius:8,padding:"5px 12px",fontSize:11,fontWeight:800,cursor:"pointer",whiteSpace:"nowrap"}}>{t.notifEnable||"Activer 🔔"}</button>
          <button onClick={()=>setDismissed(true)} style={{background:"none",border:"none",color:C.dim,fontSize:18,cursor:"pointer",padding:"0 2px",lineHeight:1}}>×</button>
        </div>
      </div>
      {showSchedule&&(
        <div style={{display:"flex",gap:6,flexWrap:"wrap",paddingTop:6,borderTop:`1px solid ${C.border}`}}>
          {["07:00","08:00","09:00","12:00","18:00","20:00"].map(h=>(
            <button key={h} onClick={()=>{setHour(h);setShowSchedule(false);}} style={{background:h===hour?`${C.cyan}20`:C.ghost,border:`1px solid ${h===hour?C.cyan:C.border}`,color:h===hour?C.cyan:C.dim,borderRadius:20,padding:"4px 10px",fontSize:11,fontWeight:700,cursor:"pointer"}}>
              {h}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// MODERATION SYSTEM
// ─────────────────────────────────────────────────────────────
const PROFANITY_LIST = ["insulte","spam","fake","harcèlement","violence"];

function filterText(text) {
  let out = text;
  PROFANITY_LIST.forEach(w => { out = out.replace(new RegExp(w,"gi"), "***"); });
  return out;
}

function ModerationModal({voiceId, voiceName, onClose, onReport, onBlock}) {
  const [step, setStep] = useState("menu"); // menu | reason | done
  const [reason, setReason] = useState("");
  const reasons = [
    "Contenu offensant / insultes",
    "Spam ou publicité",
    "Discours de haine",
    "Contenu inapproprié",
    "Fausse identité",
    "Autre",
  ];

  const submit = () => {
    onReport?.({ voiceId, reason });
    setStep("done");
  };

  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.78)",zIndex:9100,display:"flex",alignItems:"flex-end",backdropFilter:"blur(4px)"}} onClick={onClose}>
      <div onClick={e=>e.stopPropagation()} style={{background:C.card,borderRadius:"22px 22px 0 0",width:"100%",maxWidth:480,margin:"0 auto",padding:"20px 20px 36px",border:`1px solid ${C.border}`}}>
        <div style={{width:32,height:4,background:C.brigh,borderRadius:2,margin:"0 auto 18px"}}/>

        {step==="menu"&&(
          <>
            <div style={{fontSize:11,color:C.dim,fontWeight:800,letterSpacing:2,textTransform:"uppercase",marginBottom:14}}>⚠️ Signaler : {voiceName}</div>
            <button onClick={()=>setStep("reason")} className="lift" style={{width:"100%",background:`${C.orange}12`,border:`1px solid ${C.orange}30`,color:C.orange,borderRadius:12,padding:"13px",fontSize:14,fontWeight:700,cursor:"pointer",marginBottom:8,display:"flex",alignItems:"center",gap:10}}>
              🚩 Signaler ce vocal
            </button>
            <button onClick={()=>{onBlock?.({id:voiceId,name:voiceName});setStep("done");}} className="lift" style={{width:"100%",background:`${C.red}10`,border:`1px solid ${C.red}30`,color:C.red,borderRadius:12,padding:"13px",fontSize:14,fontWeight:700,cursor:"pointer",marginBottom:8,display:"flex",alignItems:"center",gap:10}}>
              🚫 Bloquer cet utilisateur
            </button>
            <button onClick={onClose} style={{width:"100%",background:"none",border:"none",color:C.dim,fontSize:13,fontWeight:700,cursor:"pointer",marginTop:4}}>Annuler</button>
          </>
        )}

        {step==="reason"&&(
          <>
            <div style={{fontSize:11,color:C.dim,fontWeight:800,letterSpacing:2,textTransform:"uppercase",marginBottom:14}}>📋 Raison du signalement</div>
            <div style={{display:"flex",flexDirection:"column",gap:7,marginBottom:14}}>
              {reasons.map(r=>(
                <button key={r} onClick={()=>setReason(r)} style={{background:reason===r?`${C.red}15`:C.ghost,border:`1.5px solid ${reason===r?C.red:C.border}`,color:reason===r?C.text:C.dim,borderRadius:10,padding:"11px 14px",fontSize:13,fontWeight:reason===r?700:500,cursor:"pointer",textAlign:"left",transition:"all 0.14s"}}>
                  {reason===r?"✓ ":""}{r}
                </button>
              ))}
            </div>
            <button onClick={submit} disabled={!reason} style={{width:"100%",background:reason?C.red:"transparent",border:`2px solid ${reason?C.red:C.brigh}`,color:reason?"#fff":C.dim,borderRadius:12,padding:"14px",fontSize:14,fontWeight:700,cursor:reason?"pointer":"not-allowed",transition:"all 0.2s"}}>
              Envoyer le signalement
            </button>
          </>
        )}

        {step==="done"&&(
          <div style={{textAlign:"center",padding:"20px 0"}}>
            <div style={{fontSize:48,marginBottom:12}}>✅</div>
            <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:24,color:C.text,letterSpacing:1,marginBottom:8}}>Signalement envoyé</div>
            <div style={{fontSize:13,color:C.dim,lineHeight:1.6,marginBottom:20}}>Notre équipe va examiner ce contenu. Merci de contribuer à la sécurité d'EENVOZ.</div>
            <button onClick={onClose} style={{background:C.green,border:"none",color:"#000",borderRadius:12,padding:"12px 32px",fontSize:14,fontWeight:700,cursor:"pointer"}}>Fermer</button>
          </div>
        )}
      </div>
    </div>
  );
}

// VoiceCard with moderation support

function FriendsPanel({friends, qId, opts, catColor, t}) {
  const[showAdd,setShowAdd]=useState(false);
  const[search,setSearch]=useState("");
  const friendsWithAnswers = getFriendsAnswers(qId, friends, opts);
  const answered = friendsWithAnswers.filter(f=>f.answered);
  const notAnswered = friendsWithAnswers.filter(f=>!f.answered);

  // Group by answer
  const byAnswer = opts.reduce((acc,opt)=>{
    acc[opt]=answered.filter(f=>f.answer===opt);
    return acc;
  },{});

  return(
    <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:18,padding:"16px",marginBottom:14}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
        <div style={{fontSize:10,color:catColor,fontWeight:800,letterSpacing:2,textTransform:"uppercase"}}>
          👥 {t.friendsTitle}
        </div>
        <button onClick={()=>setShowAdd(!showAdd)} style={{background:`${catColor}15`,border:`1px solid ${catColor}30`,color:catColor,borderRadius:8,padding:"4px 10px",fontSize:10,fontWeight:800,cursor:"pointer"}}>
          + {t.addFriend}
        </button>
      </div>

      {showAdd&&(
        <div style={{marginBottom:12}}>
          <input
            value={search} onChange={e=>setSearch(e.target.value)}
            placeholder="Chercher un ami par pseudo..."
            style={{width:"100%",background:C.ghost,border:`1px solid ${C.brigh}`,borderRadius:10,padding:"10px 13px",color:C.text,fontSize:13,outline:"none"}}
          />
        </div>
      )}

      {friends.length===0?(
        <div style={{textAlign:"center",padding:"20px 0"}}>
          <div style={{fontSize:32,marginBottom:8}}>👥</div>
          <p style={{fontSize:13,color:C.dim}}>{t.noFriends}</p>
        </div>
      ):(
        <>
          {/* Résumé visuel des réponses amis */}
          {answered.length>0&&(
            <div style={{display:"flex",gap:8,marginBottom:12,flexWrap:"wrap"}}>
              {opts.map((opt,i)=>{
                const count=byAnswer[opt]?.length||0;
                if(count===0)return null;
                return(
                  <div key={i} style={{background:`${catColor}12`,border:`1px solid ${catColor}28`,borderRadius:10,padding:"6px 10px",display:"flex",alignItems:"center",gap:6}}>
                    <span style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:13,color:catColor,fontWeight:900}}>{opt}</span>
                    <div style={{display:"flex"}}>
                      {byAnswer[opt].slice(0,3).map((f,j)=>(
                        <div key={j} style={{width:20,height:20,borderRadius:"50%",background:`${catColor}30`,border:`1.5px solid ${catColor}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:800,color:catColor,marginLeft:j>0?-5:0}}>
                          {f.flag}
                        </div>
                      ))}
                      {byAnswer[opt].length>3&&<div style={{width:20,height:20,borderRadius:"50%",background:C.ghost,border:`1.5px solid ${C.brigh}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:8,color:C.dim,fontWeight:700,marginLeft:-5}}>+{byAnswer[opt].length-3}</div>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Liste amis */}
          {friendsWithAnswers.slice(0,4).map(f=>(
            <div key={f.id} style={{display:"flex",alignItems:"center",gap:10,padding:"7px 0",borderBottom:`1px solid ${C.border}`}}>
              <div style={{width:32,height:32,borderRadius:"50%",background:`${catColor}18`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,flexShrink:0}}>
                {f.flag}
              </div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:12,fontWeight:700,color:C.text}}>{f.name}</div>
                <div style={{fontSize:10,color:C.dim}}>{f.city} · 🔥{f.streak}</div>
              </div>
              {f.answered?(
                <div style={{background:`${catColor}15`,border:`1px solid ${catColor}30`,borderRadius:7,padding:"3px 10px",fontSize:11,fontWeight:800,color:catColor,flexShrink:0,fontFamily:"'Barlow Condensed',sans-serif",letterSpacing:0.5}}>
                  {f.answer}
                </div>
              ):(
                <div style={{fontSize:10,color:C.dim,fontStyle:"italic",flexShrink:0}}>
                  ⏳ attente
                </div>
              )}
            </div>
          ))}

          {friendsWithAnswers.length>4&&(
            <div style={{textAlign:"center",marginTop:8}}>
              <span style={{fontSize:11,color:C.dim}}>{friendsWithAnswers.length-4} autres amis...</span>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// SHARE CARD — Carte partageable visuelle premium
// ─────────────────────────────────────────────────────────────
function ShareCard({q, userVote, gp, opts, catColor, t, onShare}) {
  const[revealed,setRevealed]=useState(false);
  const userPct=userVote?gp[userVote.idx]:null;
  const isMaj=userPct>=65, isMin=userPct<40;
  const hook=isMaj?`Je suis dans la majorité (${userPct}%) 🔥`:isMin?`Rare — seulement ${userPct}% pense comme moi 💎`:`Les avis sont partagés !`;
  const emoji=isMaj?"🔥":isMin?"💎":"⚖️";

  useEffect(()=>{setTimeout(()=>setRevealed(true),100);},[]);

  return(
    <div className={revealed?"card-reveal":""} style={{
      background:`linear-gradient(145deg, ${C.card2} 0%, ${C.bg} 100%)`,
      border:`2px solid ${catColor}55`,
      borderRadius:24,
      padding:"24px 22px",
      marginBottom:20,
      position:"relative",
      overflow:"hidden",
      boxShadow:`0 20px 60px ${catColor}25, 0 4px 20px rgba(0,0,0,0.6)`,
    }}>
      {/* Glow effects */}
      <div style={{position:"absolute",top:-60,right:-60,width:200,height:200,background:`radial-gradient(circle,${catColor}22,transparent 65%)`,pointerEvents:"none"}}/>
      <div style={{position:"absolute",bottom:-40,left:-40,width:150,height:150,background:`radial-gradient(circle,${C.red}15,transparent 65%)`,pointerEvents:"none"}}/>

      {/* Header : logo + catégorie */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <div style={{width:28,height:28,background:C.red,borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,boxShadow:`0 4px 12px ${C.red}55`}}>🎤</div>
          <span style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:16,letterSpacing:3,color:C.red,fontWeight:900}}>EENVOZ</span>
        </div>
        <CatBadge cat={q.cat}/>
      </div>

      {/* Question */}
      <div style={{background:`${catColor}08`,border:`1px solid ${catColor}22`,borderRadius:14,padding:"14px 16px",marginBottom:16}}>
        <div style={{fontSize:10,color:C.dim,fontWeight:700,letterSpacing:2,textTransform:"uppercase",marginBottom:6}}>QUESTION DU JOUR</div>
        <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:q.text.length>60?18:22,letterSpacing:0.3,color:C.text,lineHeight:1.25}}>
          "{q.text}"
        </div>
      </div>

      {/* Ma réponse + psycho */}
      {userVote&&(
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:16}}>
          <div style={{background:`${catColor}20`,border:`2px solid ${catColor}60`,borderRadius:12,padding:"10px 16px",flex:1}}>
            <div style={{fontSize:9,color:C.dim,fontWeight:700,letterSpacing:1.5,textTransform:"uppercase",marginBottom:4}}>MA RÉPONSE</div>
            <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:26,color:catColor,fontWeight:900,letterSpacing:1,lineHeight:1}}>{userVote.answer}</div>
          </div>
          <div style={{textAlign:"center",padding:"10px"}}>
            <div style={{fontSize:36}}>{emoji}</div>
            <div style={{fontSize:10,color:C.dim,fontWeight:600,maxWidth:80,lineHeight:1.3}}>{hook}</div>
          </div>
        </div>
      )}

      {/* Résultat mondial — barres visuelles */}
      <div style={{marginBottom:14}}>
        <div style={{fontSize:9,color:C.dim,fontWeight:700,letterSpacing:2,textTransform:"uppercase",marginBottom:8}}>🌍 {t.shareCardTitle}</div>
        {opts.map((opt,i)=>{
          const isUser=userVote?.idx===i;
          return(
            <div key={i} style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
              <div style={{width:60,fontSize:10,fontWeight:isUser?800:500,color:isUser?catColor:C.dim,textAlign:"right",flexShrink:0,fontFamily:"'Barlow Condensed',sans-serif",letterSpacing:0.5}}>{opt}</div>
              <div style={{flex:1,height:20,background:C.ghost,borderRadius:6,overflow:"hidden",position:"relative"}}>
                <div style={{
                  height:"100%",
                  width:`${gp[i]||0}%`,
                  background:isUser?catColor:`${catColor}35`,
                  borderRadius:6,
                  position:"relative",
                  display:"flex",
                  alignItems:"center",
                  justifyContent:"flex-end",
                  paddingRight:6,
                }}>
                  {isUser&&<div style={{position:"absolute",inset:0,background:"linear-gradient(90deg,transparent,rgba(255,255,255,0.15))",borderRadius:6}}/>}
                </div>
              </div>
              <div style={{width:36,fontSize:13,fontWeight:isUser?900:600,color:isUser?catColor:C.dim,fontFamily:"'Barlow Condensed',sans-serif",letterSpacing:1,flexShrink:0}}>
                {gp[i]||0}%
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",paddingTop:12,borderTop:`1px solid ${C.border}`}}>
        <div style={{fontSize:10,color:C.dim,letterSpacing:0.5}}>eenvoz.app</div>
        <div style={{fontSize:10,color:C.dim}}>Rejoins le débat →</div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// AMBASSADOR PANEL — Nouveau composant
// ─────────────────────────────────────────────────────────────
function AmbassadorPanel({profile, t}) {
  const invited = profile.invited || 0;
  const activeInvited = Math.floor(invited * 0.7);
  const premiumInvited = Math.floor(invited * 0.1);
  const pointsFromInvites = invited*POINTS.invite + activeInvited*POINTS.inviteActive + premiumInvited*POINTS.invitePremium;

  // Classement ambassadeurs mock
  const ambassadors = [
    {name:"Aminata K.",flag:"🇨🇮",invited:12,pts:2400},
    {name:"Djibril M.",flag:"🇸🇳",invited:8, pts:1600},
    {name:"Fatou S.",  flag:"🇫🇷",invited:6, pts:1200},
    {name:"TOI",       flag:"🎤", invited,    pts:pointsFromInvites,isMe:true},
  ].sort((a,b)=>b.invited-a.invited).map((a,i)=>({...a,rank:i+1}));

  return(
    <div>
      {/* Stats ambassador */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:9,marginBottom:18}}>
        {[
          {l:t.totalInvited,v:invited,   icon:"👥",c:C.green},
          {l:t.activeInvited,v:activeInvited,icon:"✅",c:C.cyan},
          {l:t.premiumInvited,v:premiumInvited,icon:"💎",c:C.gold},
          {l:t.pointsEarned, v:pointsFromInvites,icon:"🏆",c:C.orange},
        ].map((s,i)=>(
          <div key={i} style={{background:C.card,border:`1px solid ${s.c}28`,borderRadius:14,padding:"14px 10px",textAlign:"center"}}>
            <div style={{fontSize:22,marginBottom:4}}>{s.icon}</div>
            <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:30,color:s.c,letterSpacing:1,lineHeight:1}}>{s.v}</div>
            <div style={{fontSize:9,color:C.dim,marginTop:3,fontWeight:700,letterSpacing:0.5,textTransform:"uppercase"}}>{s.l}</div>
          </div>
        ))}
      </div>

      {/* Barème de points */}
      <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:14,padding:"14px",marginBottom:18}}>
        <div style={{fontSize:10,color:C.gold,fontWeight:800,letterSpacing:2,textTransform:"uppercase",marginBottom:12}}>💰 BARÈME POINTS</div>
        {[
          {label:"Ami invité",pts:POINTS.invite,color:C.green,icon:"👤"},
          {label:"Ami actif (répond chaque jour)",pts:POINTS.inviteActive,color:C.cyan,icon:"🔥"},
          {label:"Ami premium",pts:POINTS.invitePremium,color:C.gold,icon:"💎"},
        ].map((r,i)=>(
          <div key={i} style={{display:"flex",alignItems:"center",gap:10,marginBottom:i<2?10:0}}>
            <span style={{fontSize:16}}>{r.icon}</span>
            <div style={{flex:1,fontSize:12,color:C.text}}>{r.label}</div>
            <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:18,color:r.color,fontWeight:900}}>+{r.pts} pts</div>
          </div>
        ))}
      </div>

      {/* Classement ambassadeurs */}
      <div style={{fontSize:10,color:C.gold,fontWeight:800,letterSpacing:2,textTransform:"uppercase",marginBottom:12}}>🚀 TOP AMBASSADEURS</div>
      {ambassadors.map(a=>{
        const rc=a.rank===1?C.gold:a.rank===2?C.silver:a.rank===3?C.bronze:C.dim;
        return(
          <div key={a.name} style={{background:a.isMe?`${C.red}10`:C.card,border:`1px solid ${a.isMe?C.red+"44":C.border}`,borderRadius:12,padding:"11px 13px",marginBottom:7,display:"flex",alignItems:"center",gap:10}}>
            <div style={{width:26,height:26,borderRadius:"50%",background:a.rank<=3?`${rc}20`:C.ghost,border:`1.5px solid ${rc}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:a.rank<=3?14:11,fontWeight:900,color:rc,flexShrink:0}}>
              {a.rank<=3?["🥇","🥈","🥉"][a.rank-1]:a.rank}
            </div>
            <span style={{fontSize:18,flexShrink:0}}>{a.flag}</span>
            <div style={{flex:1}}>
              <div style={{fontSize:13,fontWeight:a.isMe?800:600,color:C.text}}>
                {a.name}{a.isMe&&<span style={{fontSize:9,color:C.red,fontWeight:900,marginLeft:6,background:`${C.red}15`,borderRadius:4,padding:"1px 5px"}}>TU</span>}
              </div>
              <div style={{fontSize:10,color:C.dim}}>{a.invited} amis invités</div>
            </div>
            <div style={{textAlign:"right",flexShrink:0}}>
              <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:16,color:a.isMe?C.red:C.gold,fontWeight:900}}>{fmt(a.pts)}</div>
              <div style={{fontSize:9,color:C.dim}}>pts</div>
            </div>
          </div>
        );
      })}

      {/* Commission future */}
      <div style={{background:`${C.gold}08`,border:`1px solid ${C.gold}28`,borderRadius:14,padding:"14px",marginTop:16}}>
        <div style={{fontSize:11,color:C.gold,fontWeight:800,marginBottom:6}}>💰 Bientôt : Commission Premium</div>
        <div style={{fontSize:12,color:C.dim,lineHeight:1.6}}>
          Quand un ami invité souscrit à Premium (5€/mois), tu reçois <strong style={{color:C.gold}}>20% de commission</strong> = 1€/mois par ami premium actif.
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// SCREEN 1 — LANDING
// ─────────────────────────────────────────────────────────────
function Landing({onStart,t,lang,setLang,profile,liveStats}){
  const langList=["fr","en","es","pt","nl"];
  const sc=profile.streak>=30?C.gold:profile.streak>=7?C.orange:C.red;
  const qod = getQuestionOfTheDay();
  return(
    <div style={{minHeight:"100vh",background:C.bg,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"32px 22px",position:"relative",overflow:"hidden"}}>
      <div style={{position:"fixed",top:-130,left:"50%",transform:"translateX(-50%)",width:560,height:560,background:`radial-gradient(circle,${C.red}14 0%,transparent 60%)`,pointerEvents:"none"}}/>
      <div style={{position:"absolute",top:18,right:18,display:"flex",gap:4}}>
        {langList.map(l=><button key={l} onClick={()=>setLang(l)} style={{background:l===lang?C.red:C.card,border:`1px solid ${l===lang?C.red:C.border}`,color:l===lang?"#fff":C.dim,borderRadius:6,padding:"3px 7px",fontSize:10,fontWeight:700,cursor:"pointer"}}>{l.toUpperCase()}</button>)}
      </div>
      <div className="float" style={{marginBottom:22}}>
        <div style={{width:90,height:90,borderRadius:26,background:C.red,display:"flex",alignItems:"center",justifyContent:"center",fontSize:38,boxShadow:`0 20px 64px ${C.red}60`}}>🎤</div>
      </div>
      <h1 className="u0" style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:88,letterSpacing:4,color:C.text,lineHeight:1,marginBottom:6}}>EENVOZ</h1>
      <p className="u1" style={{fontSize:15,color:C.dim,marginBottom:24,textAlign:"center",maxWidth:280,lineHeight:1.65}}>{t.tagline}</p>

      {/* Question du jour preview */}
      <div className="u2" style={{background:C.card,border:`1px solid ${CAT[qod.cat]||C.red}33`,borderRadius:16,padding:"14px 18px",marginBottom:20,width:"100%",maxWidth:340}}>
        <div style={{fontSize:9,color:CAT[qod.cat]||C.red,fontWeight:800,letterSpacing:2,textTransform:"uppercase",marginBottom:6}}>❓ {t.qod}</div>
        <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:16,color:C.text,lineHeight:1.3}}>"{qod.text}"</div>
      </div>

      {profile.streak>0&&(
        <div className="u3 pop" style={{background:`linear-gradient(135deg,${sc}20,${sc}08)`,border:`1.5px solid ${sc}44`,borderRadius:18,padding:"14px 22px",marginBottom:24,textAlign:"center",width:"100%",maxWidth:340,boxShadow:`0 4px 24px ${sc}22`}}>
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

      <button className="u4 lift cta-pulse" onClick={onStart} style={{background:C.red,border:"none",color:"#fff",padding:"22px 44px",borderRadius:14,fontSize:17,fontWeight:700,cursor:"pointer",fontFamily:"'Barlow Condensed',sans-serif",letterSpacing:2,maxWidth:340,width:"100%",boxShadow:`0 12px 44px ${C.red}55`}}>
        {t.start} →
      </button>

      {/* Live activity ticker */}
      {liveStats&&(
        <div className="u5" style={{marginTop:14,padding:"10px 16px",background:C.card,border:`1px solid ${C.border}`,borderRadius:12,maxWidth:340,width:"100%"}}>
          <LiveActivityTicker stats={liveStats} catColor={C.red}/>
        </div>
      )}

      <div style={{marginTop:10}}>
        <DynamicSocialProof t={t}/>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// SCREEN 2 — QUESTION
// ─────────────────────────────────────────────────────────────
function QuestionScreen({q,t,onVote,recorder,userVote,profile,liveStats}){
  const catColor=CAT[q.cat]||C.red;
  const[sel,setSel]=useState(userVote?.idx??null);
  const opts=t.opts||["OUI","NON","ÇA DÉPEND"];

  const handleVote=i=>{
    if(sel!==null||recorder.active)return;
    setSel(i);
    setTimeout(()=>onVote(opts[i],i),310);
  };

  return(
    <div style={{minHeight:"100vh",background:C.bg,maxWidth:480,margin:"0 auto",padding:"0 20px 120px",position:"relative"}}>
      <div style={{position:"fixed",top:0,right:-60,width:280,height:280,background:`radial-gradient(circle,${catColor}10,transparent 70%)`,pointerEvents:"none",zIndex:0}}/>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"18px 0 12px",position:"relative",zIndex:1}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <div style={{width:26,height:26,background:C.red,borderRadius:7,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12}}>🎤</div>
          <span style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:22,letterSpacing:3,color:C.red}}>EENVOZ</span>
        </div>
        <CatBadge cat={q.cat}/>
      </div>
      <div className="u0" style={{marginBottom:14}}><StreakRing streak={profile.streak}/></div>
      {liveStats&&(
        <div className="u0" style={{background:C.ghost,border:`1px solid ${C.border}`,borderRadius:10,padding:"7px 12px",marginBottom:10}}>
          <LiveActivityTicker stats={liveStats} catColor={catColor}/>
        </div>
      )}
      {q.sponsor&&(
        <div className="u0" style={{display:"flex",alignItems:"center",gap:7,background:`${C.gold}10`,border:`1px solid ${C.gold}28`,borderRadius:8,padding:"6px 12px",marginBottom:12}}>
          <span style={{fontSize:10,color:C.gold,fontWeight:700,letterSpacing:0.5}}>Sponsorisé par <strong>{q.sponsor.name}</strong></span>
        </div>
      )}
      <SocialProof total={getMockResults(q.id).total} t={t} catColor={catColor}/>
      <div className="u1" style={{marginBottom:28}}>
        <p style={{fontSize:10,color:C.dim,fontWeight:700,letterSpacing:2,textTransform:"uppercase",marginBottom:10}}>{t.qod}</p>
        <h2 style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:q.text.length>50?30:38,lineHeight:1.1,letterSpacing:0.3,color:C.text}}>{q.text}</h2>
      </div>
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
      <div className="u3" style={{display:"flex",alignItems:"center",gap:12,marginBottom:18}}>
        <div style={{flex:1,height:1,background:C.border}}/>
        <span style={{fontSize:11,color:C.dim,fontWeight:700,letterSpacing:2}}>{t.orVoice}</span>
        <div style={{flex:1,height:1,background:C.border}}/>
      </div>
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
// SCREEN 3 — RESULTS
// ─────────────────────────────────────────────────────────────
function ResultsScreen({q,userVote,t,onShare,onNext,pts,streakData,onLike,friends,onChallenge,blockedUsers=[],onBlockUser}){
  const catColor=CAT[q.cat]||C.red;
  const res=getMockResults(q.id);
  const gp=pcts(res.global);
  const opts=t.opts||["OUI","NON","ÇA DÉPEND"];
  const userPct=userVote!==null?gp[userVote.idx]:null;

  return(
    <div style={{minHeight:"100vh",background:C.bg,maxWidth:480,margin:"0 auto",padding:"18px 20px 120px"}}>
      {streakData&&<StreakToast streak={streakData.streak} prevStreak={streakData.prev} t={t} newBadge={streakData.newBadge}/>}
      <PointsToast pts={pts}/>

      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:14}}>
        <CatBadge cat={q.cat}/>
        <span style={{fontSize:12,color:C.dim,flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{q.text}</span>
      </div>

      {userPct!==null&&<PsychoBanner userPct={userPct} t={t} catColor={catColor} userAnswer={userVote?.answer}/>}

      {/* ── Animated result bars ── */}
      {userVote!==null&&(
        <div className="u1" style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:16,padding:"16px 16px 12px",marginBottom:14}}>
          <div style={{fontSize:10,color:C.dim,fontWeight:800,letterSpacing:2,textTransform:"uppercase",marginBottom:12}}>🌍 {t.resultsTitle||"Résultat mondial"}</div>
          <AnimatedResultBars pcts={gp} opts={opts} userIdx={userVote.idx} catColor={catColor}/>
          <div style={{marginTop:10,display:"flex",gap:14}}>
            <span style={{fontSize:10,color:C.dim}}>🗳️ {fmt(res.total)} votes</span>
            <span style={{fontSize:10,color:C.dim}}>🎤 {fmt(res.voices)} vocaux</span>
            <span style={{fontSize:10,color:C.dim}}>🌍 48 pays</span>
          </div>
        </div>
      )}

      {/* ── Quick share strip ── */}
      {userVote!==null&&<QuickShareStrip q={q} userVote={userVote} t={t} catColor={catColor}/>}

      <button className="lift pop" onClick={onShare} style={{background:catColor,border:"none",color:catColor===C.gold?"#000":"#fff",padding:"20px",borderRadius:14,fontSize:16,fontWeight:700,fontFamily:"'Barlow Condensed',sans-serif",letterSpacing:2,width:"100%",boxShadow:`0 10px 36px ${catColor}44`,marginBottom:10,display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
        📤 {t.shareBtn}
      </button>

      {/* Challenge button */}
      <button className="lift" onClick={onChallenge} style={{background:`${C.orange}15`,border:`2px solid ${C.orange}44`,color:C.orange,padding:"14px",borderRadius:14,fontSize:14,fontWeight:700,fontFamily:"'Barlow Condensed',sans-serif",letterSpacing:1,width:"100%",marginBottom:14,display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
        {t.challengeBtn||"⚡ DÉFIER UN AMI"}
      </button>

      <div className="u0">
        <p style={{fontSize:10,color:C.dim,fontWeight:700,letterSpacing:2,textTransform:"uppercase",marginBottom:10}}>🌍 {t.resultsTitle}</p>
        <GeoTabs res={res} userIdx={userVote?.idx} catColor={catColor} t={t} opts={opts}/>
      </div>

      {/* Friends Panel — NOUVEAU */}
      <FriendsPanel friends={friends} qId={q.id} opts={opts} catColor={catColor} t={t}/>

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

      <div className="u1" style={{marginBottom:18}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
          <p style={{fontSize:10,color:C.dim,fontWeight:700,letterSpacing:2,textTransform:"uppercase"}}>🎤 {t.voicesTitle}</p>
          <span style={{fontSize:10,color:catColor,fontWeight:700}}>{t.voiceCount(res.voices)}</span>
        </div>
        {MOCK_VOICES.slice(0,4).map(v=><VoiceCard key={v.id} v={v} catColor={catColor} t={t} onLike={onLike} blockedUsers={blockedUsers} onBlock={onBlockUser}/>)}
      </div>

      <button onClick={onNext} style={{background:"transparent",border:`2px solid ${C.brigh}`,color:C.dim,padding:"14px",borderRadius:14,fontSize:14,fontWeight:600,width:"100%"}}>{t.next}</button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// SCREEN 4 — SHARE (carte premium + plateformes)
// ─────────────────────────────────────────────────────────────
function ShareScreen({q,userVote,t,onBack,onNext,onShareDone}){
  const catColor=CAT[q.cat]||C.red;
  const res=getMockResults(q.id);
  const gp=pcts(res.global);
  const opts=t.opts||["OUI","NON","ÇA DÉPEND"];
  const[copied,setCopied]=useState(false);
  const userPct=userVote?gp[userVote.idx]:null;
  const isMaj=userPct>=65, isMin=userPct<40;
  const hook=isMaj?`Je suis dans la majorité (${userPct}%) 🔥`:isMin?`Je suis rare — seulement ${userPct}% pense comme moi 💎`:`Les avis sont partagés sur cette question`;

  const shareText=[
    `🎤 EENVOZ`,``,
    `"${q.text}"`,``,
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

      {/* ★ Carte premium générée */}
      <ShareCard q={q} userVote={userVote} gp={gp} opts={opts} catColor={catColor} t={t}/>

      {/* Plateformes */}
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
// SCREEN 5 — PROFILE
// ─────────────────────────────────────────────────────────────
function ProfileScreen({state,t,onBack,onNotif,notifEnabled,onViewPublic}){
  const{votes,voicesSent,shares,points,streak,bestStreak,inviteCode,history,invited=1,friends=[],challengesSent=0,challengesAccepted=0}=state;
  const[tab,setTab]=useState("stats");
  const[invCopied,setInvCopied]=useState(false);
  const earned=earnedBadges(state);
  const locked=BADGES.filter(b=>!earned.find(e=>e.id===b.id));
  const sc=streak>=30?C.gold:streak>=7?C.orange:C.red;

  const lbWithMe=[
    ...LEADERBOARD_BASE,
    {name:"TOI",city:"...",flag:"🎤",pts:points,streak,votes,shares,invited,isMe:true},
  ].sort((a,b)=>b.pts-a.pts).map((r,i)=>({...r,rank:i+1}));

  const inviteLink=`eenvoz.app/invite/${inviteCode}`;
  const copyInvite=()=>navigator.clipboard.writeText(inviteLink).then(()=>{setInvCopied(true);setTimeout(()=>setInvCopied(false),2500);});

  const tabList=[
    {id:"stats",  l:"📊 Stats"},
    {id:"badges", l:`🏅 ${earned.length>0?`(${earned.length})`:""}` },
    {id:"friends",l:`👥 Amis (${friends.length})`},
    {id:"ranking",l:"🏆 Top"},
    {id:"invite", l:"🚀 Ambass."},
  ];

  return(
    <div style={{minHeight:"100vh",background:C.bg,maxWidth:480,margin:"0 auto",padding:"20px 20px 120px"}}>
      <button onClick={onBack} style={{background:"none",border:"none",color:C.dim,fontSize:13,fontWeight:700,cursor:"pointer",marginBottom:14,display:"flex",alignItems:"center",gap:4}}>← Retour</button>

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
        {/* Public profile button */}
        <div style={{marginTop:12}}>
          <button onClick={onViewPublic} className="lift" style={{background:`${C.purple}15`,border:`1px solid ${C.purple}40`,color:C.purple,borderRadius:20,padding:"7px 18px",fontSize:12,fontWeight:700,cursor:"pointer",display:"inline-flex",alignItems:"center",gap:6}}>
            🌐 {t.publicProfileTitle||"Voir mon profil public"}
          </button>
        </div>
      </div>

      <NotifBanner t={t} onEnable={onNotif} enabled={notifEnabled}/>

      {/* Tabs scrollable */}
      <div style={{display:"flex",gap:3,background:C.card,borderRadius:12,padding:4,marginBottom:18,overflowX:"auto"}}>
        {tabList.map(tb=>(
          <button key={tb.id} onClick={()=>setTab(tb.id)} style={{flex:"0 0 auto",background:tab===tb.id?C.red:"transparent",border:"none",color:tab===tb.id?"#fff":C.dim,padding:"8px 10px",borderRadius:9,cursor:"pointer",fontSize:10,fontWeight:800,letterSpacing:0.2,transition:"all 0.18s",whiteSpace:"nowrap"}}>{tb.l}</button>
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
              {label:t.challengesSent||"Défis envoyés",value:challengesSent,icon:"⚡",color:C.orange},
              {label:t.challengesAccepted||"Défis acceptés",value:challengesAccepted,icon:"✅",color:C.green},
            ].map((s,i)=>(
              <div key={i} style={{background:C.card,border:`1px solid ${i<2?s.color+"44":C.border}`,borderRadius:14,padding:"15px 10px",textAlign:"center"}}>
                <div style={{fontSize:i<2?26:20,marginBottom:4}}>{s.icon}</div>
                <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:i<2?40:28,color:s.color,letterSpacing:1,lineHeight:1}}>{s.value}</div>
                <div style={{fontSize:9,color:C.dim,marginTop:3,fontWeight:700,letterSpacing:0.5,textTransform:"uppercase"}}>{s.label}</div>
              </div>
            ))}
          </div>
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

      {/* ── FRIENDS ── */}
      {tab==="friends"&&(
        <div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
            <div style={{fontSize:10,color:C.cyan,fontWeight:800,letterSpacing:2,textTransform:"uppercase"}}>👥 MES AMIS ({friends.length})</div>
            <button style={{background:`${C.cyan}15`,border:`1px solid ${C.cyan}30`,color:C.cyan,borderRadius:8,padding:"5px 12px",fontSize:11,fontWeight:800,cursor:"pointer"}}>
              + {t.addFriend}
            </button>
          </div>
          {friends.length===0?(
            <div style={{textAlign:"center",padding:"40px 20px"}}>
              <div style={{fontSize:48,marginBottom:12}}>👥</div>
              <p style={{fontSize:14,color:C.dim,lineHeight:1.7}}>{t.noFriends}</p>
            </div>
          ):(
            friends.map(f=>(
              <div key={f.id} style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:12,padding:"12px 14px",marginBottom:8,display:"flex",alignItems:"center",gap:12}}>
                <div style={{width:42,height:42,borderRadius:"50%",background:`${C.cyan}18`,border:`1.5px solid ${C.cyan}44`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>
                  {f.flag}
                </div>
                <div style={{flex:1}}>
                  <div style={{fontSize:14,fontWeight:700,color:C.text}}>{f.name}</div>
                  <div style={{fontSize:11,color:C.dim,marginTop:2}}>{f.city} · 🔥{f.streak} streak · {f.votes} réponses</div>
                </div>
                <div style={{display:"flex",gap:6}}>
                  <button style={{background:"none",border:`1px solid ${C.border}`,color:C.dim,borderRadius:7,padding:"4px 8px",fontSize:10,cursor:"pointer"}}>Message</button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ── LEADERBOARD ── */}
      {tab==="ranking"&&(
        <div>
          <p style={{fontSize:10,color:C.gold,fontWeight:800,letterSpacing:2,textTransform:"uppercase",marginBottom:14}}>🏆 {t.weeklyTop}</p>
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
                  <div style={{fontSize:10,color:C.dim,marginTop:1}}>{r.city} · 🔥{r.streak} · {r.votes} votes</div>
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

      {/* ── AMBASSADOR (INVITE) ── */}
      {tab==="invite"&&(
        <div>
          <div style={{textAlign:"center",marginBottom:20}}>
            <div style={{fontSize:44,marginBottom:8}}>🚀</div>
            <h3 style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:28,letterSpacing:1,color:C.text,marginBottom:6}}>{t.ambassadorTitle}</h3>
            <p style={{fontSize:13,color:C.dim,lineHeight:1.65}}>{t.ambassadorDesc}</p>
          </div>

          {/* Lien invitation */}
          <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:14,padding:"16px",marginBottom:16}}>
            <p style={{fontSize:10,color:C.dim,fontWeight:700,letterSpacing:2,textTransform:"uppercase",marginBottom:10}}>{t.inviteCode}</p>
            <div style={{background:C.ghost,borderRadius:10,padding:"13px 14px",fontFamily:"'Barlow Condensed',sans-serif",fontSize:14,letterSpacing:2,color:C.text,wordBreak:"break-all",marginBottom:10}}>{inviteLink}</div>
            <button onClick={copyInvite} style={{background:invCopied?`${C.green}20`:C.red,border:"none",color:invCopied?C.green:"#fff",borderRadius:10,padding:"13px",fontSize:14,fontWeight:700,cursor:"pointer",width:"100%",transition:"all 0.2s",fontFamily:"'Barlow Condensed',sans-serif",letterSpacing:1}}>
              {invCopied?`✓ ${t.inviteCopied}`:"📋 Copier le lien"}
            </button>
          </div>

          {/* Share invite */}
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

          {/* Ambassador stats + leaderboard */}
          <AmbassadorPanel profile={state} t={t}/>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// SCREEN 6 — ADMIN
// ─────────────────────────────────────────────────────────────
function AdminScreen({t,adminData,onBack}){
  const[tab,setTab]=useState("stats");
  const[form,setForm]=useState({text:"",cat:"amour",o0:"OUI",o1:"NON",o2:"ÇA DÉPEND",date:""});
  const[saved,setSaved]=useState(false);
  const[searchQ,setSearchQ]=useState("");
  const[filterCat,setFilterCat]=useState("all");
  const CATS=["amour","argent","amitié","famille","société","vérité","relations"];
  const inp={width:"100%",background:C.card,border:`1px solid ${C.brigh}`,borderRadius:10,padding:"10px 13px",color:C.text,fontSize:13,outline:"none",boxSizing:"border-box"};
  const save=()=>{if(!form.text||!form.date)return;setSaved(true);setTimeout(()=>setSaved(false),3000);};

  const filteredQ = ALL_QUESTIONS.filter(q=>{
    const matchCat = filterCat==="all" || q.cat===filterCat;
    const matchSearch = !searchQ || q.text.toLowerCase().includes(searchQ.toLowerCase());
    return matchCat && matchSearch;
  });

  const catCounts = CATS.reduce((acc,c)=>({...acc,[c]:ALL_QUESTIONS.filter(q=>q.cat===c).length}),{});

  return(
    <div style={{minHeight:"100vh",background:C.bg,maxWidth:480,margin:"0 auto",padding:"20px 20px 120px"}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16}}>
        <button onClick={onBack} style={{background:"none",border:"none",color:C.dim,fontSize:13,fontWeight:700,cursor:"pointer"}}>← Retour</button>
        <span style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:11,letterSpacing:2,color:C.red}}>ADMIN PANEL</span>
      </div>
      <div style={{display:"flex",gap:4,background:C.card,borderRadius:12,padding:4,marginBottom:18}}>
        {[{id:"stats",l:"Stats"},{id:"questions",l:`Questions (${ALL_QUESTIONS.length})`},{id:"create",l:"+ Créer"}].map(tb=>(
          <button key={tb.id} onClick={()=>setTab(tb.id)} style={{flex:1,background:tab===tb.id?C.red:"transparent",border:"none",color:tab===tb.id?"#fff":C.dim,padding:"8px 0",borderRadius:9,cursor:"pointer",fontSize:11,fontWeight:800,letterSpacing:0.3,transition:"all 0.18s"}}>{tb.l}</button>
        ))}
      </div>

      {tab==="stats"&&(
        <div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:9,marginBottom:20}}>
            {[
              {l:"Utilisateurs",v:fmt(adminData.users),icon:"👥",c:C.cyan},
              {l:"Votes/jour",v:fmt(adminData.todayV),icon:"📊",c:C.red},
              {l:"Votes total",v:fmt(adminData.totalV),icon:"🗳️",c:C.gold},
              {l:"Vocaux",v:fmt(adminData.voices),icon:"🎤",c:C.green},
              {l:"Questions DB",v:ALL_QUESTIONS.length,icon:"❓",c:C.purple},
              {l:"Catégories",v:CATS.length,icon:"🏷️",c:C.orange},
            ].map((s,i)=>(
              <div key={i} style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:14,padding:"14px 10px",textAlign:"center"}}>
                <div style={{fontSize:20,marginBottom:4}}>{s.icon}</div>
                <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:30,color:s.c,letterSpacing:1}}>{s.v}</div>
                <div style={{fontSize:9,color:C.dim,marginTop:2,fontWeight:700,letterSpacing:0.5,textTransform:"uppercase"}}>{s.l}</div>
              </div>
            ))}
          </div>
          <p style={{fontSize:10,color:C.dim,fontWeight:700,letterSpacing:2,textTransform:"uppercase",marginBottom:10}}>Répartition par catégorie</p>
          {Object.entries(catCounts).sort((a,b)=>b[1]-a[1]).map(([cat,n])=>{
            const cc=CAT[cat]||C.red, max=Math.max(...Object.values(catCounts));
            return<div key={cat} style={{marginBottom:10}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                <CatBadge cat={cat}/>
                <span style={{fontSize:13,color:C.text,fontWeight:700}}>{n} questions</span>
              </div>
              <div style={{height:5,background:C.border,borderRadius:3,overflow:"hidden"}}>
                <div style={{height:"100%",width:`${(n/max)*100}%`,background:cc,borderRadius:3}}/>
              </div>
            </div>;
          })}
        </div>
      )}

      {tab==="questions"&&(
        <div>
          {/* Filtres */}
          <div style={{marginBottom:12}}>
            <input value={searchQ} onChange={e=>setSearchQ(e.target.value)} placeholder="🔍 Chercher une question..." style={{...inp,marginBottom:8}}/>
            <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
              <button onClick={()=>setFilterCat("all")} style={{background:filterCat==="all"?C.red:C.ghost,border:"none",color:filterCat==="all"?"#fff":C.dim,borderRadius:6,padding:"4px 9px",fontSize:9,fontWeight:700,cursor:"pointer"}}>Toutes ({ALL_QUESTIONS.length})</button>
              {CATS.map(c=>(
                <button key={c} onClick={()=>setFilterCat(c)} style={{background:filterCat===c?CAT[c]:C.ghost,border:"none",color:filterCat===c?"#fff":C.dim,borderRadius:6,padding:"4px 9px",fontSize:9,fontWeight:700,cursor:"pointer"}}>{c} ({catCounts[c]})</button>
              ))}
            </div>
          </div>
          <p style={{fontSize:10,color:C.dim,marginBottom:10}}>{filteredQ.length} question{filteredQ.length>1?"s":""} affichée{filteredQ.length>1?"s":""}</p>
          {filteredQ.map((q,i)=>(
            <div key={q.id} style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:11,padding:"10px 13px",marginBottom:7,display:"flex",alignItems:"center",gap:9}}>
              <div style={{width:7,height:7,borderRadius:"50%",background:CAT[q.cat]||C.red,flexShrink:0}}/>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:12,color:C.text,fontWeight:600,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{q.text}</div>
                <div style={{fontSize:10,color:C.dim,marginTop:1}}>{q.cat} · #{q.id}</div>
              </div>
              <button style={{fontSize:9,fontWeight:800,background:C.ghost,color:C.dim,border:`1px solid ${C.brigh}`,borderRadius:6,padding:"3px 9px",cursor:"pointer"}}>Activer</button>
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
          <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:12,padding:"12px",fontSize:12,color:C.dim,lineHeight:1.7}}>
            💡 La <strong style={{color:C.text}}>question du jour</strong> est sélectionnée automatiquement selon la date. Base actuelle : <strong style={{color:C.gold}}>{ALL_QUESTIONS.length} questions</strong>.
          </div>
          <button onClick={save} disabled={!form.text||!form.date} style={{background:saved?C.green:C.red,border:"none",color:saved?"#000":"#fff",padding:"18px",borderRadius:12,fontSize:15,fontWeight:700,fontFamily:"'Barlow Condensed',sans-serif",letterSpacing:2,cursor:!form.text||!form.date?"not-allowed":"pointer",opacity:!form.text||!form.date?0.5:1,transition:"all 0.2s"}}>{saved?"✓ QUESTION CRÉÉE !":"CRÉER LA QUESTION"}</button>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// SCREEN 7 — TRENDING
// ─────────────────────────────────────────────────────────────
function TrendingScreen({t, onQuestionSelect, onBack}) {
  const [period, setPeriod] = useState("today");
  const [region, setRegion] = useState("world");
  const trending = getTrendingQuestions(period, region);

  const typeConfig = {
    debate: { color: C.orange, label: t.trendingDebate || "💬 Débat" },
    viral:  { color: C.red,    label: t.trendingViral  || "📤 Viral" },
    popular:{ color: C.cyan,   label: t.trendingPopular|| "🔥 Top"   },
  };

  return (
    <div style={{minHeight:"100vh", background:C.bg, maxWidth:480, margin:"0 auto", padding:"18px 20px 120px"}}>
      {/* Header */}
      <div style={{display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20}}>
        <button onClick={onBack} style={{background:"none",border:"none",color:C.dim,fontSize:13,fontWeight:700,cursor:"pointer"}}>← Retour</button>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <span style={{fontSize:22}}>🔥</span>
          <span style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:26,letterSpacing:2,color:C.text,fontWeight:900}}>{t.trendingTitle||"TRENDING"}</span>
        </div>
        <div style={{width:60}}/>
      </div>

      {/* Period tabs */}
      <div style={{display:"flex",gap:4,background:C.card,borderRadius:12,padding:4,marginBottom:14}}>
        {[
          {id:"today",  l:t.trendingToday||"Aujourd'hui"},
          {id:"week",   l:t.trendingWeek ||"Semaine"},
          {id:"month",  l:t.trendingMonth||"Mois"},
        ].map(p=>(
          <button key={p.id} onClick={()=>setPeriod(p.id)}
            style={{flex:1,background:period===p.id?C.red:"transparent",border:"none",color:period===p.id?"#fff":C.dim,padding:"9px 4px",borderRadius:9,cursor:"pointer",fontSize:12,fontWeight:800,letterSpacing:0.3,transition:"all 0.18s"}}>
            {p.l}
          </button>
        ))}
      </div>

      {/* Region selector */}
      <div style={{display:"flex",gap:6,marginBottom:18,overflowX:"auto",paddingBottom:4}}>
        {REGIONS.map(r=>(
          <button key={r.id} onClick={()=>setRegion(r.id)}
            style={{flexShrink:0,background:region===r.id?`${C.cyan}20`:C.ghost,border:`1px solid ${region===r.id?C.cyan:C.border}`,color:region===r.id?C.cyan:C.dim,borderRadius:20,padding:"5px 11px",fontSize:11,fontWeight:700,cursor:"pointer",whiteSpace:"nowrap",transition:"all 0.15s"}}>
            {r.label}
          </button>
        ))}
      </div>

      {/* Top 3 podium */}
      <div style={{marginBottom:22}}>
        <div style={{fontSize:10,color:C.gold,fontWeight:800,letterSpacing:2,textTransform:"uppercase",marginBottom:12}}>🏆 TOP 3</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1.2fr 1fr",gap:8,alignItems:"flex-end"}}>
          {[trending[1], trending[0], trending[2]].map((q,i)=>{
            const rank=[2,1,3][i];
            const height=[120,148,110][i];
            const color=[C.silver,C.gold,C.bronze][i];
            const catColor=CAT[q.cat]||C.red;
            return(
              <div key={q.id} className="pop" onClick={()=>onQuestionSelect&&onQuestionSelect(q)}
                style={{background:`${color}10`,border:`2px solid ${color}44`,borderRadius:14,padding:"12px 8px",textAlign:"center",cursor:"pointer",height,display:"flex",flexDirection:"column",justifyContent:"space-between",transition:"all 0.15s"}}>
                <div style={{fontSize:rank===1?24:18}}>{rank===1?"🥇":rank===2?"🥈":"🥉"}</div>
                <div style={{fontSize:10,fontWeight:700,color:C.text,lineHeight:1.3,overflow:"hidden",display:"-webkit-box",WebkitLineClamp:3,WebkitBoxOrient:"vertical"}}>{q.text}</div>
                <div style={{fontSize:11,color:color,fontWeight:900,fontFamily:"'Barlow Condensed',sans-serif"}}>{fmt(q.votes)}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Full ranking */}
      <div style={{fontSize:10,color:C.dim,fontWeight:800,letterSpacing:2,textTransform:"uppercase",marginBottom:12}}>📊 CLASSEMENT COMPLET</div>
      {trending.map((q, i)=>{
        const catColor = CAT[q.cat]||C.red;
        const tc = typeConfig[q.type];
        const maxVotes = trending[0].votes;
        return(
          <div key={q.id} className="lift" onClick={()=>onQuestionSelect&&onQuestionSelect(q)}
            style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:14,padding:"12px 14px",marginBottom:8,cursor:"pointer",transition:"all 0.15s",position:"relative",overflow:"hidden"}}>
            {/* Progress bar bg */}
            <div style={{position:"absolute",left:0,top:0,bottom:0,width:`${(q.votes/maxVotes)*100}%`,background:`${catColor}07`,borderRadius:14,pointerEvents:"none"}}/>
            <div style={{position:"relative",display:"flex",alignItems:"center",gap:10}}>
              {/* Rank */}
              <div style={{width:28,height:28,borderRadius:"50%",background:i<3?`${[C.gold,C.silver,C.bronze][i]}20`:C.ghost,border:`1.5px solid ${i<3?[C.gold,C.silver,C.bronze][i]:C.brigh}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:i<3?14:11,fontWeight:900,color:i<3?[C.gold,C.silver,C.bronze][i]:C.dim,flexShrink:0}}>
                {i<3?["🥇","🥈","🥉"][i]:i+1}
              </div>
              {/* Content */}
              <div style={{flex:1,minWidth:0}}>
                <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:4}}>
                  <CatBadge cat={q.cat}/>
                  <span style={{fontSize:9,background:`${tc.color}15`,color:tc.color,borderRadius:5,padding:"1px 6px",fontWeight:800,letterSpacing:0.5,flexShrink:0}}>{tc.label}</span>
                </div>
                <div style={{fontSize:13,fontWeight:700,color:C.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{q.text}</div>
                <div style={{display:"flex",gap:12,marginTop:4}}>
                  <span style={{fontSize:10,color:C.dim}}>🗳️ {fmt(q.votes)}</span>
                  <span style={{fontSize:10,color:C.dim}}>📤 {fmt(q.shares)}</span>
                  <span style={{fontSize:10,color:C.dim}}>🎤 {fmt(q.voices)}</span>
                </div>
              </div>
              {/* Trend arrow */}
              <div style={{flexShrink:0,fontSize:16}}>{i<5?"📈":"➡️"}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// CHALLENGE MODAL
// ─────────────────────────────────────────────────────────────
function ChallengeModal({q, userVote, t, onClose, onChallengeSent}) {
  const [copied, setCopied] = useState(false);
  const [sent, setSent] = useState(false);
  const catColor = CAT[q.cat]||C.red;
  const msg = t.challengeMsg ? t.challengeMsg(q.text) : `Je viens de répondre sur EENVOZ :\n\n"${q.text}"\n\nEt toi ? 🔥\n👉 eenvoz.app`;

  const platforms = [
    {name:"WhatsApp", icon:"💬", color:"#25D366", action:()=>{window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`,"_blank");doSend();}},
    {name:"Instagram / TikTok",icon:"📱",color:"#E1306C",action:()=>{navigator.clipboard.writeText(msg).then(()=>{setCopied(true);doSend();setTimeout(()=>setCopied(false),2000);})}},
    {name:"Facebook",  icon:"📘",color:"#1877F2",action:()=>{window.open(`https://www.facebook.com/sharer.php?quote=${encodeURIComponent(msg)}&u=https://eenvoz.app`,"_blank");doSend();}},
  ];

  const doSend = ()=>{setSent(true);onChallengeSent?.();};
  const copy = ()=>navigator.clipboard.writeText(msg).then(()=>{setCopied(true);doSend();setTimeout(()=>setCopied(false),2000);});

  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.75)",zIndex:9000,display:"flex",alignItems:"flex-end",backdropFilter:"blur(4px)"}} onClick={onClose}>
      <div onClick={e=>e.stopPropagation()} style={{background:C.card,borderRadius:"24px 24px 0 0",width:"100%",maxWidth:480,margin:"0 auto",padding:"24px 20px 40px",border:`1px solid ${C.border}`}}>
        {/* Handle */}
        <div style={{width:36,height:4,background:C.brigh,borderRadius:2,margin:"0 auto 20px"}}/>

        <h3 style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:30,letterSpacing:1,color:C.text,marginBottom:6,textAlign:"center"}}>
          ⚡ {t.challengeTitle||"Lance un défi !"}
        </h3>

        {/* Preview carte défi */}
        <div style={{background:C.card2,border:`1.5px solid ${catColor}44`,borderRadius:16,padding:"16px",marginBottom:20}}>
          <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:10}}>
            <div style={{width:20,height:20,background:C.red,borderRadius:5,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10}}>🎤</div>
            <span style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:12,letterSpacing:2.5,color:C.red,fontWeight:900}}>EENVOZ</span>
            <CatBadge cat={q.cat}/>
          </div>
          <div style={{fontSize:13,fontWeight:700,color:C.text,marginBottom:10,fontStyle:"italic"}}>"{q.text}"</div>
          {userVote&&(
            <div style={{display:"inline-flex",alignItems:"center",gap:6,background:`${catColor}15`,border:`1px solid ${catColor}30`,borderRadius:8,padding:"5px 12px",marginBottom:8}}>
              <span style={{fontSize:10,color:C.dim}}>J'ai répondu :</span>
              <span style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:14,color:catColor,fontWeight:900}}>{userVote.answer}</span>
            </div>
          )}
          <div style={{fontSize:12,color:C.dim,fontWeight:600}}>Et toi, tu répondrais quoi ? 🔥</div>
        </div>

        {/* Platforms */}
        <div style={{display:"flex",flexDirection:"column",gap:9,marginBottom:12}}>
          {platforms.map(p=>(
            <button key={p.name} className="lift" onClick={p.action}
              style={{background:`${p.color}12`,border:`1px solid ${p.color}30`,color:p.color,borderRadius:12,padding:"14px 18px",fontSize:14,fontWeight:700,display:"flex",alignItems:"center",gap:12,cursor:"pointer",transition:"all 0.14s"}}>
              <span style={{fontSize:20}}>{p.icon}</span>Défier via {p.name}
            </button>
          ))}
          <button className="lift" onClick={copy}
            style={{background:copied?`${C.green}15`:C.ghost,border:`2px solid ${copied?C.green:C.brigh}`,color:copied?C.green:C.dim,borderRadius:12,padding:"14px 18px",fontSize:14,fontWeight:700,display:"flex",alignItems:"center",gap:12,cursor:"pointer",transition:"all 0.2s"}}>
            <span style={{fontSize:20}}>{copied?"✅":"🔗"}</span>{copied?"Copié !":"Copier le message"}
          </button>
        </div>

        {sent&&<div className="pop" style={{textAlign:"center",fontSize:13,color:C.green,fontWeight:700,padding:"8px"}}>⚡ Défi envoyé ! +{POINTS.challenge} pts</div>}

        <button onClick={onClose} style={{background:"none",border:"none",color:C.dim,fontSize:13,fontWeight:700,cursor:"pointer",width:"100%",marginTop:8}}>Fermer</button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// PUBLIC PROFILE SCREEN
// ─────────────────────────────────────────────────────────────
function PublicProfileScreen({profile, t, onBack}) {
  const [copied, setCopied] = useState(false);
  const earned = earnedBadges(profile);
  const sc = profile.streak>=30?C.gold:profile.streak>=7?C.orange:C.red;

  // Opinion distribution (mock based on history)
  const hist = profile.history||[];
  const yes = hist.filter(h=>["OUI","YES","SÍ","SIM","JA"].includes(h.answer)).length;
  const no  = hist.filter(h=>["NON","NO","NEE"].includes(h.answer)).length;
  const dep = hist.length - yes - no;
  const total = hist.length || 1;

  const profileLink = `eenvoz.app/user/${profile.inviteCode}`;
  const profileCard = `🎤 EENVOZ – Mon Profil Opinion\n\n🔥 ${profile.streak} jours de streak\n📊 ${profile.votes} réponses données\n🏆 ${earned.length} badges débloqués\n\n👉 ${profileLink}`;

  const copy = ()=>navigator.clipboard.writeText(profileCard).then(()=>{setCopied(true);setTimeout(()=>setCopied(false),2000);});

  return(
    <div style={{minHeight:"100vh",background:C.bg,maxWidth:480,margin:"0 auto",padding:"20px 20px 120px"}}>
      <button onClick={onBack} style={{background:"none",border:"none",color:C.dim,fontSize:13,fontWeight:700,cursor:"pointer",marginBottom:18,display:"flex",alignItems:"center",gap:4}}>← Retour</button>

      {/* Profile Hero Card */}
      <div className="pop" style={{background:`linear-gradient(145deg,${C.card2},${C.bg})`,border:`2px solid ${sc}44`,borderRadius:24,padding:"24px 20px",marginBottom:20,position:"relative",overflow:"hidden",boxShadow:`0 20px 50px ${sc}15`}}>
        <div style={{position:"absolute",top:-50,right:-50,width:180,height:180,background:`radial-gradient(circle,${sc}18,transparent 65%)`,pointerEvents:"none"}}/>

        {/* Avatar + name */}
        <div style={{textAlign:"center",marginBottom:18}}>
          <div style={{width:80,height:80,borderRadius:"50%",background:`linear-gradient(135deg,${C.red},${C.orange})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:32,margin:"0 auto 12px",boxShadow:`0 12px 36px ${C.red}44`,border:`3px solid ${sc}66`}}>
            👤
          </div>
          <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:28,letterSpacing:2,color:C.text,fontWeight:900}}>UTILISATEUR</div>
          <div style={{fontSize:13,color:C.dim,marginTop:2}}>🌍 Amsterdam, Pays-Bas</div>
          {/* Profile link */}
          <div style={{fontSize:11,color:C.dim,marginTop:4,fontFamily:"monospace"}}>{profileLink}</div>
        </div>

        {/* Key stats row */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:16}}>
          {[
            {val:profile.streak,    label:"Streak",    color:sc,    icon:"🔥"},
            {val:profile.votes,     label:"Réponses",  color:C.cyan, icon:"📊"},
            {val:earned.length,     label:"Badges",    color:C.gold, icon:"🏅"},
          ].map((s,i)=>(
            <div key={i} style={{textAlign:"center",background:`${s.color}10`,border:`1px solid ${s.color}28`,borderRadius:12,padding:"10px 6px"}}>
              <div style={{fontSize:16,marginBottom:2}}>{s.icon}</div>
              <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:28,color:s.color,fontWeight:900,lineHeight:1}}>{s.val}</div>
              <div style={{fontSize:9,color:C.dim,fontWeight:700,textTransform:"uppercase",letterSpacing:0.5,marginTop:2}}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Badges earned */}
        {earned.length>0&&(
          <div style={{display:"flex",flexWrap:"wrap",gap:8,justifyContent:"center",marginBottom:16}}>
            {earned.map(b=>(
              <div key={b.id} style={{background:`${b.color}15`,border:`1px solid ${b.color}40`,borderRadius:20,padding:"4px 10px",display:"flex",alignItems:"center",gap:5}}>
                <span style={{fontSize:12}}>{b.icon}</span>
                <span style={{fontSize:10,fontWeight:800,color:b.color,letterSpacing:0.5}}>{b.label}</span>
              </div>
            ))}
          </div>
        )}

        {/* Share profile button */}
        <div style={{display:"flex",gap:9}}>
          <button className="lift" onClick={()=>window.open(`https://wa.me/?text=${encodeURIComponent(profileCard)}`,"_blank")}
            style={{flex:1,background:`#25D36618`,border:`1px solid #25D36630`,color:"#25D366",borderRadius:12,padding:"12px",fontSize:13,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
            💬 WhatsApp
          </button>
          <button className="lift" onClick={copy}
            style={{flex:1,background:copied?`${C.green}15`:C.ghost,border:`2px solid ${copied?C.green:C.brigh}`,color:copied?C.green:C.dim,borderRadius:12,padding:"12px",fontSize:13,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
            {copied?"✅ Copié !":"🔗 Copier"}
          </button>
        </div>
      </div>

      {/* Opinion stats */}
      <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:18,padding:"18px",marginBottom:16}}>
        <div style={{fontSize:10,color:C.dim,fontWeight:800,letterSpacing:2,textTransform:"uppercase",marginBottom:14}}>{t.opinionStats||"MES OPINIONS"}</div>
        {[
          {label:"OUI",   val:yes,  pct:Math.round(yes/total*100),  color:C.green},
          {label:"NON",   val:no,   pct:Math.round(no/total*100),   color:C.red},
          {label:"DÉPEND",val:dep,  pct:Math.round(dep/total*100),  color:C.gold},
        ].map((s,i)=>(
          <div key={i} style={{marginBottom:10}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
              <span style={{fontSize:13,fontWeight:700,color:C.text}}>{s.label}</span>
              <span style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:20,color:s.color,fontWeight:900}}>{s.pct}%</span>
            </div>
            <div style={{height:7,background:C.ghost,borderRadius:4,overflow:"hidden"}}>
              <div style={{height:"100%",width:`${s.pct}%`,background:s.color,borderRadius:4,transition:"width 1s ease",boxShadow:`0 0 8px ${s.color}55`}}/>
            </div>
          </div>
        ))}
        <div style={{marginTop:12,fontSize:11,color:C.dim,textAlign:"center"}}>Basé sur {hist.length} réponse{hist.length>1?"s":""}</div>
      </div>

      {/* Activité récente */}
      <div style={{fontSize:10,color:C.dim,fontWeight:800,letterSpacing:2,textTransform:"uppercase",marginBottom:12}}>📅 ACTIVITÉ RÉCENTE</div>
      {profile.history&&profile.history.slice(0,6).map((h,i)=>{
        const cc=CAT[h.cat]||C.red;
        return(
          <div key={i} style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:12,padding:"11px 14px",marginBottom:8,display:"flex",alignItems:"center",gap:10}}>
            <div style={{width:8,height:8,borderRadius:"50%",background:cc,flexShrink:0}}/>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontSize:12,color:C.text,fontWeight:600,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{h.text}</div>
              <div style={{fontSize:10,color:C.dim,marginTop:1}}>{h.date}</div>
            </div>
            <div style={{fontSize:10,fontWeight:900,color:cc,background:`${cc}18`,border:`1px solid ${cc}28`,borderRadius:7,padding:"2px 10px",flexShrink:0,fontFamily:"'Barlow Condensed',sans-serif",letterSpacing:0.5}}>{h.answer}</div>
          </div>
        );
      })}
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
  const[showChallenge,setShowChallenge]=useState(false);
  const[streakCelebration,setStreakCelebration]=useState(null);
  const[blockedUsers,setBlockedUsers]=useState([]);
  const liveStats=useLiveStats();
  const recorder=useRecorder();

  useEffect(()=>{setLang(detectLang());},[]);

  const[profile,setProfile]=useState(()=>({
    votes:4, voicesSent:1, shares:2, points:75,
    streak:4, bestStreak:12,
    lastAnswerDate:"2025-01-12",
    invited:1,
    challengesSent:3, challengesAccepted:2,
    inviteCode:"EV-"+Math.random().toString(36).slice(2,6).toUpperCase(),
    friends: MOCK_FRIENDS.slice(0,3),
    history:[
      {text:"L'argent rend-il vraiment heureux ?",cat:"argent",answer:"OUI",date:"Hier"},
      {text:"Tu pardonnerais une trahison ?",cat:"vérité",answer:"JAMAIS",date:"Il y a 2j"},
      {text:"La famille avant les amis ?",cat:"famille",answer:"OUI",date:"Il y a 3j"},
      {text:"Les réseaux sociaux...",cat:"société",answer:"OUI",date:"Il y a 4j"},
    ],
  }));

  const adminData={users:8241,todayV:1203,totalV:94700,voices:3820,byCat:{amour:28000,argent:21000,société:18000,famille:12000,vérité:9000,amitié:4700,relations:2000}};

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
      history:[{text:q.text,cat:q.cat,answer,date:"Aujourd'hui"},...profile.history].slice(0,20),
    };
    const newBadge=checkNewBadge(profile,updated);
    setProfile(updated);
    setUserVote({answer,idx});
    setPts(POINTS.vote+bonusPts);
    setTimeout(()=>setPts(null),3000);
    setStreakData({streak:newStreak,prev,newBadge});
    // Streak celebration on milestones or first streak
    if(newStreak>=3 && newStreak!==prev) {
      const milestones=[3,5,7,10,15,20,30,50,100];
      const isMilestone = milestones.includes(newStreak) || newStreak%10===0;
      if(isMilestone || newStreak<=3) {
        const sc=newStreak>=30?C.gold:newStreak>=10?C.orange:C.red;
        setTimeout(()=>setStreakCelebration({streak:newStreak,color:sc}),700);
      }
    }
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

  const handleChallengeSent=()=>{
    setProfile(p=>({...p,challengesSent:(p.challengesSent||0)+1,points:p.points+POINTS.challenge}));
  };

  const navItems=[
    {id:"question", icon:"🏠", label:t.home||"Accueil"},
    {id:"trending",  icon:"🔥", label:t.trendingTab||"Trends"},
    {id:"profile",  icon:"👤", label:t.profile||"Profil"},
    {id:"admin",    icon:"⚙️", label:t.admin||"Admin"},
  ];
  const activeNav=["question","results","share"].includes(screen)?"question":screen;

  return(
    <div style={{background:C.bg,minHeight:"100vh"}}>
      <style dangerouslySetInnerHTML={{__html:CSS}}/>

      {screen==="landing"      &&<Landing onStart={()=>setScreen("question")} t={t} lang={lang} setLang={setLang} profile={profile} liveStats={liveStats}/>}
      {screen==="question"     &&<QuestionScreen q={q} t={t} onVote={handleVote} recorder={recorder} userVote={userVote} profile={profile} liveStats={liveStats}/>}
      {screen==="results"      &&<ResultsScreen q={q} userVote={userVote} t={t} onShare={handleShare} onNext={handleNext} pts={pts} streakData={streakData} onLike={()=>{}} friends={profile.friends} onChallenge={()=>setShowChallenge(true)} blockedUsers={blockedUsers} onBlockUser={id=>setBlockedUsers(b=>[...b,id])}/>}
      {screen==="share"        &&<ShareScreen q={q} userVote={userVote} t={t} onBack={()=>setScreen("results")} onNext={handleNext} onShareDone={handleShareDone}/>}
      {screen==="profile"      &&<ProfileScreen state={profile} t={t} onBack={()=>setScreen("question")} onNotif={handleNotif} notifEnabled={notifEnabled} onViewPublic={()=>setScreen("publicprofile")}/>}
      {screen==="trending"     &&<TrendingScreen t={t} onBack={()=>setScreen("question")} onQuestionSelect={()=>setScreen("question")}/>}
      {screen==="publicprofile"&&<PublicProfileScreen profile={profile} t={t} onBack={()=>setScreen("profile")}/>}
      {screen==="admin"        &&<AdminScreen t={t} adminData={adminData} onBack={()=>setScreen("question")}/>}

      {/* Streak Celebration Overlay */}
      {streakCelebration&&<StreakCelebration streak={streakCelebration.streak} color={streakCelebration.color} onDone={()=>setStreakCelebration(null)}/>}

      {/* Challenge Modal */}
      {showChallenge&&<ChallengeModal q={q} userVote={userVote} t={t} onClose={()=>setShowChallenge(false)} onChallengeSent={handleChallengeSent}/>}

      {screen!=="landing"&&(
        <nav style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:480,background:`${C.card}F4`,backdropFilter:"blur(22px)",borderTop:`1px solid ${C.border}`,padding:"10px 20px 24px",display:"flex",justifyContent:"space-around",zIndex:100}}>
          {navItems.map(item=>{
            const on=activeNav===item.id;
            return<button key={item.id} onClick={()=>setScreen(item.id)} style={{background:"none",border:"none",display:"flex",flexDirection:"column",alignItems:"center",gap:3,padding:"4px 12px",cursor:"pointer",position:"relative"}}>
              <span style={{fontSize:22,opacity:on?1:0.38,transition:"opacity 0.2s"}}>{item.icon}</span>
              <span style={{fontSize:9,fontWeight:on?800:500,color:on?C.red:C.dim,letterSpacing:0.5,textTransform:"uppercase"}}>{item.label}</span>
              {item.id==="question"&&profile.streak>0&&(
                <div style={{position:"absolute",top:-3,right:-2,background:C.red,borderRadius:999,padding:"1px 5px",fontSize:8,fontWeight:900,color:"#fff",lineHeight:1.5}}>🔥{profile.streak}</div>
              )}
              {item.id==="trending"&&(
                <div style={{position:"absolute",top:-3,right:-2,background:C.orange,borderRadius:999,padding:"1px 5px",fontSize:8,fontWeight:900,color:"#fff",lineHeight:1.5}}>NEW</div>
              )}
              {on&&<div style={{position:"absolute",bottom:-10,width:18,height:2.5,background:C.red,borderRadius:2}}/>}
            </button>;
          })}
        </nav>
      )}
    </div>
  );
}
