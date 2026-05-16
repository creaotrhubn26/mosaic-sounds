export type AppLang = "en" | "nb" | "hi" | "pa" | "ur" | "ta";

type EventTranslation = { label: string; desc: string };

export type Translations = {
  onboarding: {
    step0Title: string;
    step0Sub: string;
    step1Title: string;
    step1Sub: string;
    step2Title: string;
    step2Sub: string;
    step3Title: string;
    step3Sub: string;
    musicStyle: string;
    energyLevel: string;
    familyFriendly: string;
    cleanLyricsHint: string;
    traditional: string;
    modern: string;
    chill: string;
    highEnergy: string;
    step4TitleWedding: string;
    step4TitleOther: string;
    step4SubWedding: (count: number) => string;
    step4SubOther: string;
    statMoments: string;
    statSongs: string;
    statCultures: string;
    btnStart: string;
    btnContinue: string;
    btnSkip: string;
  };
  events: Record<string, EventTranslation>;
  settings: {
    yourEvent: string;
    namesLabel: (eventType: string) => string;
    namesPlaceholder: (eventType: string) => string;
    eventDate: string;
    totalRuntime: string;
    eventTypeLabel: string;
    cultures: string;
    appLanguage: string;
    eventAndStyle: string;
  };
  common: {
    any: string;
  };
};

const en: Translations = {
  onboarding: {
    step0Title: "What are you\nplanning?",
    step0Sub: "Choose your event type",
    step1Title: "Your culture",
    step1Sub: "Select all that apply to your wedding",
    step2Title: "Music languages",
    step2Sub: "What languages should the songs be in?",
    step3Title: "Your style",
    step3Sub: "Set your music preferences",
    musicStyle: "Music style",
    energyLevel: "Energy level",
    familyFriendly: "Family friendly",
    cleanLyricsHint: "Clean lyrics only",
    traditional: "Traditional",
    modern: "Modern",
    chill: "Chill",
    highEnergy: "High energy",
    step4TitleWedding: "Your moments\nawait",
    step4TitleOther: "All set!",
    step4SubWedding: (n) => `We've set up ${n} moments throughout your entire wedding day`,
    step4SubOther: "Start planning music for your event",
    statMoments: "Moments",
    statSongs: "Songs",
    statCultures: "Cultures",
    btnStart: "Start planning",
    btnContinue: "Continue",
    btnSkip: "Skip",
  },
  events: {
    wedding:    { label: "Wedding",     desc: "Ceremonies, dancing & celebration" },
    birthday:   { label: "Birthday",   desc: "Celebration with friends & family" },
    corporate:  { label: "Corporate",  desc: "Professional gathering" },
    party:      { label: "Party",      desc: "Free celebration for all" },
    mehendi:    { label: "Mehndi",     desc: "Henna ceremony & ladies' celebration" },
    sangeet:    { label: "Sangeet",    desc: "Music, dance & family performances" },
    nikkah:     { label: "Nikkah",     desc: "Islamic wedding ceremony & Walima" },
    sweet16:    { label: "Sweet 16",   desc: "Coming-of-age birthday celebration" },
    graduation: { label: "Graduation", desc: "Academic milestone celebration" },
  },
  settings: {
    yourEvent: "Your Event",
    namesLabel: (et) =>
      et === "wedding" || et === "nikkah" ? "Couple Names" :
      et === "corporate" ? "Organiser Name" :
      et === "graduation" ? "Graduate Name" : "Host Name",
    namesPlaceholder: (et) =>
      et === "wedding" || et === "nikkah" ? "e.g. Priya & Lars" :
      et === "corporate" ? "e.g. Acme Corp" :
      et === "graduation" ? "e.g. Aisha Khan" : "e.g. Alex",
    eventDate: "Event Date",
    totalRuntime: "Total Event Runtime",
    eventTypeLabel: "Event Type",
    cultures: "Cultures",
    appLanguage: "App Language",
    eventAndStyle: "Event & Style",
  },
  common: {
    any: "Any",
  },
};

const nb: Translations = {
  onboarding: {
    step0Title: "Hva planlegger\ndu?",
    step0Sub: "Velg type arrangement",
    step1Title: "Din kultur",
    step1Sub: "Velg alle som gjelder for ditt bryllup",
    step2Title: "Musikk-språk",
    step2Sub: "Hvilke språk skal sangene være på?",
    step3Title: "Din stil",
    step3Sub: "Sett dine musikk-preferanser",
    musicStyle: "Musikk-stil",
    energyLevel: "Energinivå",
    familyFriendly: "Familie-vennlig",
    cleanLyricsHint: "Kun rene tekster",
    traditional: "Tradisjonell",
    modern: "Moderne",
    chill: "Rolig",
    highEnergy: "Høy energi",
    step4TitleWedding: "Øyeblikkene\nventer",
    step4TitleOther: "Alt klart!",
    step4SubWedding: (n) => `Vi har satt opp ${n} øyeblikk gjennom hele bryllupsdagen`,
    step4SubOther: "Begynn å planlegge musikken til arrangementet ditt",
    statMoments: "Øyeblikk",
    statSongs: "Sanger",
    statCultures: "Kulturer",
    btnStart: "Start planlegging",
    btnContinue: "Fortsett",
    btnSkip: "Hopp over",
  },
  events: {
    wedding:    { label: "Bryllup",     desc: "Seremonier, dans og fest" },
    birthday:   { label: "Bursdag",     desc: "Feiring med venner og familie" },
    corporate:  { label: "Bedrift",     desc: "Profesjonell tilstelning" },
    party:      { label: "Fest",        desc: "Fri feiring for alle" },
    mehendi:    { label: "Mehndi",      desc: "Henna-seremoni og damefeiring" },
    sangeet:    { label: "Sangeet",     desc: "Musikk, dans og familieopptreden" },
    nikkah:     { label: "Nikkah",      desc: "Islamsk bryllupsseremoni og Walima" },
    sweet16:    { label: "Sweet 16",    desc: "Markering av 16-årsdag" },
    graduation: { label: "Diplom",      desc: "Feiring av akademisk milepæl" },
  },
  settings: {
    yourEvent: "Ditt arrangement",
    namesLabel: (et) =>
      et === "wedding" || et === "nikkah" ? "Brudepars navn" :
      et === "corporate" ? "Organisatornavn" :
      et === "graduation" ? "Kandidatnavn" : "Vertnavn",
    namesPlaceholder: (et) =>
      et === "wedding" || et === "nikkah" ? "f.eks. Priya & Lars" :
      et === "corporate" ? "f.eks. Acme AS" :
      et === "graduation" ? "f.eks. Aisha Khan" : "f.eks. Alex",
    eventDate: "Arrangementsdato",
    totalRuntime: "Total spilletid",
    eventTypeLabel: "Arrangementtype",
    cultures: "Kulturer",
    appLanguage: "App-språk",
    eventAndStyle: "Arrangement & stil",
  },
  common: {
    any: "Alle",
  },
};

const hi: Translations = {
  onboarding: {
    step0Title: "आप क्या\nप्लान कर रहे हैं?",
    step0Sub: "अपना इवेंट टाइप चुनें",
    step1Title: "आपकी संस्कृति",
    step1Sub: "अपने विवाह के लिए सभी लागू विकल्प चुनें",
    step2Title: "संगीत की भाषाएँ",
    step2Sub: "गाने किन भाषाओं में होने चाहिए?",
    step3Title: "आपकी शैली",
    step3Sub: "अपनी संगीत प्राथमिकताएँ सेट करें",
    musicStyle: "संगीत शैली",
    energyLevel: "ऊर्जा स्तर",
    familyFriendly: "परिवार के अनुकूल",
    cleanLyricsHint: "केवल साफ़ बोल",
    traditional: "पारंपरिक",
    modern: "आधुनिक",
    chill: "शांत",
    highEnergy: "उच्च ऊर्जा",
    step4TitleWedding: "आपके पल\nइंतज़ार कर रहे हैं",
    step4TitleOther: "सब तैयार!",
    step4SubWedding: (n) => `हमने आपके पूरे विवाह दिवस में ${n} पलों की व्यवस्था की है`,
    step4SubOther: "अपने इवेंट के लिए संगीत की योजना शुरू करें",
    statMoments: "पल",
    statSongs: "गाने",
    statCultures: "संस्कृतियाँ",
    btnStart: "योजना शुरू करें",
    btnContinue: "जारी रखें",
    btnSkip: "छोड़ें",
  },
  events: {
    wedding:    { label: "विवाह",       desc: "समारोह, नृत्य और उत्सव" },
    birthday:   { label: "जन्मदिन",     desc: "मित्रों और परिवार के साथ उत्सव" },
    corporate:  { label: "कॉर्पोरेट",   desc: "पेशेवर सभा" },
    party:      { label: "पार्टी",      desc: "सभी के लिए स्वतंत्र उत्सव" },
    mehendi:    { label: "मेहंदी",      desc: "मेहंदी समारोह और महिला उत्सव" },
    sangeet:    { label: "संगीत",       desc: "संगीत, नृत्य और पारिवारिक प्रस्तुतियाँ" },
    nikkah:     { label: "निकाह",       desc: "इस्लामिक विवाह समारोह और वलीमा" },
    sweet16:    { label: "स्वीट 16",    desc: "16वीं जन्मदिन का भव्य उत्सव" },
    graduation: { label: "दीक्षांत",    desc: "शैक्षणिक उपलब्धि का उत्सव" },
  },
  settings: {
    yourEvent: "आपका इवेंट",
    namesLabel: (et) =>
      et === "wedding" || et === "nikkah" ? "जोड़े का नाम" :
      et === "corporate" ? "आयोजक का नाम" :
      et === "graduation" ? "स्नातक का नाम" : "मेज़बान का नाम",
    namesPlaceholder: (et) =>
      et === "wedding" || et === "nikkah" ? "जैसे: प्रिया & लार्स" :
      et === "corporate" ? "जैसे: Acme Corp" :
      et === "graduation" ? "जैसे: आयशा खान" : "जैसे: Alex",
    eventDate: "इवेंट की तारीख",
    totalRuntime: "कुल कार्यक्रम समय",
    eventTypeLabel: "इवेंट प्रकार",
    cultures: "संस्कृतियाँ",
    appLanguage: "ऐप भाषा",
    eventAndStyle: "इवेंट & शैली",
  },
  common: {
    any: "सभी",
  },
};

const pa: Translations = {
  onboarding: {
    step0Title: "ਤੁਸੀਂ ਕੀ\nਪਲਾਨ ਕਰ ਰਹੇ ਹੋ?",
    step0Sub: "ਆਪਣਾ ਇਵੈਂਟ ਟਾਈਪ ਚੁਣੋ",
    step1Title: "ਤੁਹਾਡੀ ਸੰਸਕ੍ਰਿਤੀ",
    step1Sub: "ਆਪਣੇ ਵਿਆਹ ਲਈ ਸਭ ਲਾਗੂ ਵਿਕਲਪ ਚੁਣੋ",
    step2Title: "ਸੰਗੀਤ ਦੀਆਂ ਭਾਸ਼ਾਵਾਂ",
    step2Sub: "ਗੀਤ ਕਿਹੜੀਆਂ ਭਾਸ਼ਾਵਾਂ ਵਿੱਚ ਹੋਣੇ ਚਾਹੀਦੇ ਹਨ?",
    step3Title: "ਤੁਹਾਡਾ ਸਟਾਈਲ",
    step3Sub: "ਆਪਣੀ ਸੰਗੀਤ ਤਰਜੀਹਾਂ ਸੈੱਟ ਕਰੋ",
    musicStyle: "ਸੰਗੀਤ ਸ਼ੈਲੀ",
    energyLevel: "ਊਰਜਾ ਪੱਧਰ",
    familyFriendly: "ਪਰਿਵਾਰ ਲਈ ਅਨੁਕੂਲ",
    cleanLyricsHint: "ਸਿਰਫ਼ ਸਾਫ਼ ਬੋਲ",
    traditional: "ਪਰੰਪਰਾਗਤ",
    modern: "ਆਧੁਨਿਕ",
    chill: "ਸ਼ਾਂਤ",
    highEnergy: "ਉੱਚ ਊਰਜਾ",
    step4TitleWedding: "ਤੁਹਾਡੇ ਪਲ\nਉਡੀਕ ਕਰ ਰਹੇ ਹਨ",
    step4TitleOther: "ਸਭ ਤਿਆਰ!",
    step4SubWedding: (n) => `ਅਸੀਂ ਤੁਹਾਡੇ ਪੂਰੇ ਵਿਆਹ ਦੇ ਦਿਨ ਵਿੱਚ ${n} ਪਲ ਸੈੱਟ ਕੀਤੇ ਹਨ`,
    step4SubOther: "ਆਪਣੇ ਇਵੈਂਟ ਲਈ ਸੰਗੀਤ ਪਲਾਨ ਕਰਨਾ ਸ਼ੁਰੂ ਕਰੋ",
    statMoments: "ਪਲ",
    statSongs: "ਗੀਤ",
    statCultures: "ਸੱਭਿਆਚਾਰ",
    btnStart: "ਪਲਾਨਿੰਗ ਸ਼ੁਰੂ ਕਰੋ",
    btnContinue: "ਜਾਰੀ ਰੱਖੋ",
    btnSkip: "ਛੱਡੋ",
  },
  events: {
    wedding:    { label: "ਵਿਆਹ",        desc: "ਰਸਮਾਂ, ਨਾਚ ਅਤੇ ਜਸ਼ਨ" },
    birthday:   { label: "ਜਨਮਦਿਨ",     desc: "ਦੋਸਤਾਂ ਅਤੇ ਪਰਿਵਾਰ ਨਾਲ ਜਸ਼ਨ" },
    corporate:  { label: "ਕਾਰਪੋਰੇਟ",   desc: "ਪੇਸ਼ੇਵਰ ਇਕੱਠ" },
    party:      { label: "ਪਾਰਟੀ",      desc: "ਸਭ ਲਈ ਖੁੱਲ੍ਹਾ ਜਸ਼ਨ" },
    mehendi:    { label: "ਮਹਿੰਦੀ",     desc: "ਮਹਿੰਦੀ ਰਸਮ ਅਤੇ ਔਰਤਾਂ ਦਾ ਜਸ਼ਨ" },
    sangeet:    { label: "ਸੰਗੀਤ",      desc: "ਸੰਗੀਤ, ਨਾਚ ਅਤੇ ਪਰਿਵਾਰਕ ਪ੍ਰਦਰਸ਼ਨੀਆਂ" },
    nikkah:     { label: "ਨਿਕਾਹ",      desc: "ਇਸਲਾਮਿਕ ਵਿਆਹ ਰਸਮ ਅਤੇ ਵਲੀਮਾ" },
    sweet16:    { label: "ਸਵੀਟ 16",    desc: "16ਵੇਂ ਜਨਮਦਿਨ ਦਾ ਭਵਯ ਜਸ਼ਨ" },
    graduation: { label: "ਗ੍ਰੈਜੂਏਸ਼ਨ", desc: "ਵਿੱਦਿਅਕ ਪ੍ਰਾਪਤੀ ਦਾ ਜਸ਼ਨ" },
  },
  settings: {
    yourEvent: "ਤੁਹਾਡਾ ਇਵੈਂਟ",
    namesLabel: (et) =>
      et === "wedding" || et === "nikkah" ? "ਜੋੜੇ ਦਾ ਨਾਮ" :
      et === "corporate" ? "ਆਯੋਜਕ ਦਾ ਨਾਮ" :
      et === "graduation" ? "ਗ੍ਰੈਜੂਏਟ ਦਾ ਨਾਮ" : "ਮੇਜ਼ਬਾਨ ਦਾ ਨਾਮ",
    namesPlaceholder: (et) =>
      et === "wedding" || et === "nikkah" ? "ਜਿਵੇਂ: ਪ੍ਰਿਆ & ਲਾਰਸ" :
      et === "corporate" ? "ਜਿਵੇਂ: Acme Corp" :
      et === "graduation" ? "ਜਿਵੇਂ: ਆਇਸ਼ਾ ਖਾਨ" : "ਜਿਵੇਂ: Alex",
    eventDate: "ਇਵੈਂਟ ਦੀ ਤਾਰੀਖ਼",
    totalRuntime: "ਕੁੱਲ ਸਮਾਂ",
    eventTypeLabel: "ਇਵੈਂਟ ਕਿਸਮ",
    cultures: "ਸੱਭਿਆਚਾਰ",
    appLanguage: "ਐਪ ਭਾਸ਼ਾ",
    eventAndStyle: "ਇਵੈਂਟ & ਸਟਾਈਲ",
  },
  common: {
    any: "ਸਭ",
  },
};

const ur: Translations = {
  onboarding: {
    step0Title: "آپ کیا\nپلان کر رہے ہیں؟",
    step0Sub: "اپنا ایونٹ ٹائپ چنیں",
    step1Title: "آپ کی ثقافت",
    step1Sub: "اپنی شادی کے لیے تمام موزوں اختیارات چنیں",
    step2Title: "موسیقی کی زبانیں",
    step2Sub: "گانے کن زبانوں میں ہونے چاہئیں؟",
    step3Title: "آپ کا انداز",
    step3Sub: "اپنی موسیقی کی ترجیحات سیٹ کریں",
    musicStyle: "موسیقی کا انداز",
    energyLevel: "توانائی کی سطح",
    familyFriendly: "خاندان کے لیے موزوں",
    cleanLyricsHint: "صرف صاف بول",
    traditional: "روایتی",
    modern: "جدید",
    chill: "سکون بخش",
    highEnergy: "اعلی توانائی",
    step4TitleWedding: "آپ کے لمحات\nانتظار میں ہیں",
    step4TitleOther: "سب تیار!",
    step4SubWedding: (n) => `ہم نے آپ کے پورے شادی کے دن میں ${n} لمحات ترتیب دیے ہیں`,
    step4SubOther: "اپنے ایونٹ کے لیے موسیقی کی منصوبہ بندی شروع کریں",
    statMoments: "لمحات",
    statSongs: "گانے",
    statCultures: "ثقافتیں",
    btnStart: "منصوبہ بندی شروع کریں",
    btnContinue: "جاری رکھیں",
    btnSkip: "چھوڑیں",
  },
  events: {
    wedding:    { label: "شادی",         desc: "تقاریب، رقص اور جشن" },
    birthday:   { label: "سالگرہ",       desc: "دوستوں اور خاندان کے ساتھ جشن" },
    corporate:  { label: "کارپوریٹ",     desc: "پیشہ ورانہ تقریب" },
    party:      { label: "پارٹی",        desc: "سب کے لیے آزاد جشن" },
    mehendi:    { label: "مہندی",        desc: "مہندی کی رسم اور خواتین کا جشن" },
    sangeet:    { label: "سنگیت",        desc: "موسیقی، رقص اور خاندانی پرفارمنس" },
    nikkah:     { label: "نکاح",         desc: "اسلامی شادی کی تقریب اور ولیمہ" },
    sweet16:    { label: "سویٹ 16",      desc: "16ویں سالگرہ کا شاندار جشن" },
    graduation: { label: "گریجویشن",     desc: "تعلیمی کامیابی کا جشن" },
  },
  settings: {
    yourEvent: "آپ کا ایونٹ",
    namesLabel: (et) =>
      et === "wedding" || et === "nikkah" ? "جوڑے کا نام" :
      et === "corporate" ? "منتظم کا نام" :
      et === "graduation" ? "گریجویٹ کا نام" : "میزبان کا نام",
    namesPlaceholder: (et) =>
      et === "wedding" || et === "nikkah" ? "مثلاً: پریا & لارس" :
      et === "corporate" ? "مثلاً: Acme Corp" :
      et === "graduation" ? "مثلاً: عائشہ خان" : "مثلاً: Alex",
    eventDate: "ایونٹ کی تاریخ",
    totalRuntime: "کل پروگرام وقت",
    eventTypeLabel: "ایونٹ کی قسم",
    cultures: "ثقافتیں",
    appLanguage: "ایپ زبان",
    eventAndStyle: "ایونٹ & انداز",
  },
  common: {
    any: "تمام",
  },
};

const ta: Translations = {
  onboarding: {
    step0Title: "நீங்கள் என்ன\nதிட்டமிடுகிறீர்கள்?",
    step0Sub: "உங்கள் நிகழ்வு வகையைத் தேர்ந்தெடுங்கள்",
    step1Title: "உங்கள் கலாசாரம்",
    step1Sub: "உங்கள் திருமணத்திற்கு பொருந்தும் அனைத்தையும் தேர்ந்தெடுங்கள்",
    step2Title: "இசை மொழிகள்",
    step2Sub: "பாடல்கள் எந்த மொழிகளில் இருக்க வேண்டும்?",
    step3Title: "உங்கள் பாணி",
    step3Sub: "உங்கள் இசை விருப்பங்களை அமைக்கவும்",
    musicStyle: "இசை பாணி",
    energyLevel: "ஆற்றல் நிலை",
    familyFriendly: "குடும்பத்தினருக்கு ஏற்றது",
    cleanLyricsHint: "தூய வரிகள் மட்டும்",
    traditional: "பாரம்பரியம்",
    modern: "நவீனம்",
    chill: "அமைதியான",
    highEnergy: "அதிக ஆற்றல்",
    step4TitleWedding: "உங்கள் தருணங்கள்\nகாத்திருக்கின்றன",
    step4TitleOther: "அனைத்தும் தயார்!",
    step4SubWedding: (n) => `உங்கள் முழு திருமண நாளில் ${n} தருணங்களை அமைத்துள்ளோம்`,
    step4SubOther: "உங்கள் நிகழ்வுக்கான இசையைத் திட்டமிடத் தொடங்குங்கள்",
    statMoments: "தருணங்கள்",
    statSongs: "பாடல்கள்",
    statCultures: "கலாசாரங்கள்",
    btnStart: "திட்டமிடல் தொடங்கு",
    btnContinue: "தொடர்க",
    btnSkip: "தவிர்",
  },
  events: {
    wedding:    { label: "திருமணம்",     desc: "சடங்குகள், நடனம் & கொண்டாட்டம்" },
    birthday:   { label: "பிறந்தநாள்",  desc: "நண்பர்கள் & குடும்பத்தினருடன் கொண்டாட்டம்" },
    corporate:  { label: "கார்ப்பரேட்",  desc: "தொழில்முறை கூட்டம்" },
    party:      { label: "பார்ட்டி",     desc: "அனைவருக்கும் திறந்த கொண்டாட்டம்" },
    mehendi:    { label: "மேஹந்தி",     desc: "மேஹந்தி சடங்கு & பெண்களின் கொண்டாட்டம்" },
    sangeet:    { label: "சங்கீத்",     desc: "இசை, நடனம் & குடும்ப நிகழ்ச்சிகள்" },
    nikkah:     { label: "நிக்காஹ்",    desc: "இஸ்லாமிய திருமண சடங்கு & வலீமா" },
    sweet16:    { label: "ஸ்வீட் 16",   desc: "16வது பிறந்தநாள் கொண்டாட்டம்" },
    graduation: { label: "பட்டமளிப்பு", desc: "கல்வி சாதனை கொண்டாட்டம்" },
  },
  settings: {
    yourEvent: "உங்கள் நிகழ்வு",
    namesLabel: (et) =>
      et === "wedding" || et === "nikkah" ? "தம்பதி பெயர்" :
      et === "corporate" ? "ஏற்பாட்டாளர் பெயர்" :
      et === "graduation" ? "பட்டதாரி பெயர்" : "தலைவர் பெயர்",
    namesPlaceholder: (et) =>
      et === "wedding" || et === "nikkah" ? "எ.கா: பிரியா & லார்ஸ்" :
      et === "corporate" ? "எ.கா: Acme Corp" :
      et === "graduation" ? "எ.கா: ஆயிஷா கான்" : "எ.கா: Alex",
    eventDate: "நிகழ்வு தேதி",
    totalRuntime: "மொத்த நேரம்",
    eventTypeLabel: "நிகழ்வு வகை",
    cultures: "கலாசாரங்கள்",
    appLanguage: "செயலி மொழி",
    eventAndStyle: "நிகழ்வு & பாணி",
  },
  common: {
    any: "அனைத்தும்",
  },
};

const TRANSLATIONS: Record<AppLang, Translations> = { en, nb, hi, pa, ur, ta };

export function getT(lang?: string): Translations {
  return TRANSLATIONS[(lang as AppLang) ?? "en"] ?? TRANSLATIONS.en;
}
