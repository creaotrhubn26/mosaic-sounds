import { EXTENDED_SONGS, EXTENDED_META } from './data-extended';

export type Song = {
  id: string;
  title: string;
  artist: string;
  youtubeVideoId: string;
  audioUrl?: string;
  previewUrl?: string;
  artworkUrl?: string;
  energyScore: number;
  dholScore: number;
  danceability: number;
  moments: string[];
  cultureTags: string[];
  languageTags: string[];
  tags: string[];
  familyFriendly: boolean;
  bpmRange?: string;
};

export type EventType = "wedding" | "birthday" | "corporate" | "party" | "mehendi" | "sangeet" | "nikkah" | "sweet16" | "graduation";

// restrictedTo: if set, only shown to weddings with at least one matching culture.
// Empty / undefined = universal (shown to all).
export type WeddingMoment = {
  id: string;
  label: string;
  subtitle: string;
  sfIcon: string;
  featherIcon: string;
  energyProfile: string;
  description: string;
  restrictedTo?: string[];
};

export type Culture = {
  id: string;
  label: string;
  flag?: string;
};

export type Language = {
  id: string;
  label: string;
};

// ─── Culture group shorthands for restrictedTo ───────────────────────────────
const SOUTH_ASIAN = ["punjabi","north_indian","south_indian","sikh","hindu","bengali","gujarati","marathi","tamil","telugu","malayali"];
const MUSLIM_CULTURES = ["pakistani","muslim","arabic","moroccan","turkish","persian","bengali"];
const HENNA_CULTURES = [...SOUTH_ASIAN, "pakistani","muslim","arabic","moroccan","turkish","persian"];

export const WEDDING_MOMENTS: WeddingMoment[] = [
  // ── Universal / Western ──────────────────────────────────────────────────
  {
    id: "guest_arrival",
    label: "Guest Arrival",
    subtitle: "Prelude",
    sfIcon: "person.wave.2.fill",
    featherIcon: "users",
    energyProfile: "Soft, Welcoming",
    description: "Ambient music as guests arrive and take their seats",
  },
  {
    id: "ceremony",
    label: "Ceremony",
    subtitle: "Wedding Ceremony",
    sfIcon: "sparkles",
    featherIcon: "sun",
    energyProfile: "Classical, Romantic",
    description: "Music for the wedding ceremony",
  },
  {
    id: "wedding_march",
    label: "Wedding March",
    subtitle: "Processional",
    sfIcon: "music.note.list",
    featherIcon: "music",
    energyProfile: "Grand, Emotional",
    description: "The processional walk down the aisle",
  },
  {
    id: "signing",
    label: "Signing",
    subtitle: "Register Signing",
    sfIcon: "pencil.line",
    featherIcon: "edit-2",
    energyProfile: "Soft, Intimate",
    description: "Music during the signing of the register",
  },
  {
    id: "cocktail_hour",
    label: "Cocktail Hour",
    subtitle: "Welcome Drinks",
    sfIcon: "wineglass.fill",
    featherIcon: "coffee",
    energyProfile: "Jazz, Lounge, Upbeat",
    description: "Background music for welcome drinks and mingling",
  },
  {
    id: "first_dance",
    label: "First Dance",
    subtitle: "Romantic Moment",
    sfIcon: "heart.circle.fill",
    featherIcon: "heart",
    energyProfile: "Romantic Slow",
    description: "The couple's first dance as married",
  },
  {
    id: "toast_speeches",
    label: "Toast & Speeches",
    subtitle: "Toasts",
    sfIcon: "mic.fill",
    featherIcon: "mic",
    energyProfile: "Soft, Background",
    description: "Light background music during speeches and toasts",
  },
  {
    id: "dinner",
    label: "Dinner",
    subtitle: "Background Music",
    sfIcon: "fork.knife",
    featherIcon: "coffee",
    energyProfile: "Classy Lounge",
    description: "Ambient music for the wedding dinner",
  },
  {
    id: "cake_cutting",
    label: "Cake Cutting",
    subtitle: "Sweet Moment",
    sfIcon: "birthday.cake.fill",
    featherIcon: "star",
    energyProfile: "Playful, Fun",
    description: "Fun music for the cake cutting moment",
  },
  {
    id: "family_dance",
    label: "Family Dance",
    subtitle: "Dance Floor",
    sfIcon: "person.3.fill",
    featherIcon: "users",
    energyProfile: "Fun, Crowd Pleaser",
    description: "Everyone on the dance floor together",
  },
  {
    id: "afterparty",
    label: "Afterparty",
    subtitle: "Club Vibes",
    sfIcon: "bolt.fill",
    featherIcon: "zap",
    energyProfile: "DJ, Electronic, Hype",
    description: "Peak energy afterparty bangers",
  },
  // ── South Asian ──────────────────────────────────────────────────────────
  {
    id: "baraat",
    label: "Baraat",
    subtitle: "Dhol & Procession",
    sfIcon: "music.note",
    featherIcon: "music",
    energyProfile: "Dhol-heavy, Bhangra",
    description: "The groom's grand procession with dhol beats",
    restrictedTo: SOUTH_ASIAN,
  },
  {
    id: "bride_entry",
    label: "Bride Entry",
    subtitle: "Grand Entrance",
    sfIcon: "heart.fill",
    featherIcon: "heart",
    energyProfile: "Romantic, Emotional",
    description: "The bride's beautiful walk to the mandap",
    restrictedTo: SOUTH_ASIAN,
  },
  {
    id: "couple_entry",
    label: "Couple Entry",
    subtitle: "Reception",
    sfIcon: "person.2.fill",
    featherIcon: "users",
    energyProfile: "Celebratory, Hype",
    description: "Couple's grand entrance at reception",
    restrictedTo: SOUTH_ASIAN,
  },
  {
    id: "pheras",
    label: "Pheras",
    subtitle: "Hindu Wedding",
    sfIcon: "flame.fill",
    featherIcon: "sun",
    energyProfile: "Devotional, Classical",
    description: "Sacred pheras around the holy fire",
    restrictedTo: SOUTH_ASIAN,
  },
  {
    id: "sangeet",
    label: "Sangeet",
    subtitle: "Family Dance",
    sfIcon: "figure.dance",
    featherIcon: "activity",
    energyProfile: "Bollywood, Dance",
    description: "Family dance performances and fun",
    restrictedTo: SOUTH_ASIAN,
  },
  {
    id: "mehndi",
    label: "Mehndi Night",
    subtitle: "Henna & Celebration",
    sfIcon: "paintbrush.fill",
    featherIcon: "edit-3",
    energyProfile: "Joyful, Folk, Festive",
    description: "Vibrant henna night with music and dance",
    restrictedTo: HENNA_CULTURES,
  },
  {
    id: "haldi",
    label: "Haldi Ceremony",
    subtitle: "Turmeric Ritual",
    sfIcon: "sun.max.fill",
    featherIcon: "sun",
    energyProfile: "Folk, Playful, Upbeat",
    description: "Joyful turmeric ceremony with family",
    restrictedTo: SOUTH_ASIAN,
  },
  {
    id: "vidaai",
    label: "Vidaai",
    subtitle: "Farewell",
    sfIcon: "car.fill",
    featherIcon: "log-out",
    energyProfile: "Emotional, Sentimental",
    description: "Emotional farewell of the bride",
    restrictedTo: SOUTH_ASIAN,
  },
  // ── Muslim / Middle Eastern ──────────────────────────────────────────────
  {
    id: "mehndi_groom",
    label: "Groom Entry",
    subtitle: "Mehndi Night",
    sfIcon: "star.fill",
    featherIcon: "star",
    energyProfile: "Dhol-heavy, Hype",
    description: "High-energy entry for the groom at Mehndi",
    restrictedTo: HENNA_CULTURES,
  },
  {
    id: "nikah",
    label: "Nikah",
    subtitle: "Ceremony",
    sfIcon: "moon.stars.fill",
    featherIcon: "moon",
    energyProfile: "Sufi, Devotional",
    description: "Sacred Nikah ceremony music",
    restrictedTo: MUSLIM_CULTURES,
  },
  {
    id: "walima",
    label: "Walima",
    subtitle: "Post-Wedding Feast",
    sfIcon: "fork.knife.circle.fill",
    featherIcon: "coffee",
    energyProfile: "Sufi, Refined, Celebratory",
    description: "Elegant post-wedding reception feast",
    restrictedTo: MUSLIM_CULTURES,
  },
];

// ─── Event-type moment lists ─────────────────────────────────────────────────

export const BIRTHDAY_MOMENTS: WeddingMoment[] = [
  { id: "guest_arrival",  label: "Arrivals",         subtitle: "Welcome",      sfIcon: "person.wave.2.fill",   featherIcon: "users",    energyProfile: "Soft, Welcoming",       description: "Ambient music as guests arrive" },
  { id: "cocktail_hour",  label: "Welcome Drinks",   subtitle: "Mingling",     sfIcon: "wineglass.fill",       featherIcon: "coffee",   energyProfile: "Jazz, Lounge",           description: "Background music for drinks and mingling" },
  { id: "toast_speeches", label: "Birthday Toasts",  subtitle: "Toasts",       sfIcon: "mic.fill",             featherIcon: "mic",      energyProfile: "Soft, Fun",              description: "Speeches and happy birthday toasts" },
  { id: "cake_cutting",   label: "Birthday Cake",    subtitle: "Cake Time!",   sfIcon: "birthday.cake.fill",   featherIcon: "star",     energyProfile: "Playful, Fun",           description: "The big birthday cake moment" },
  { id: "dinner",         label: "Dinner",           subtitle: "Background",   sfIcon: "fork.knife",           featherIcon: "coffee",   energyProfile: "Classy Lounge",          description: "Ambient music during the meal" },
  { id: "family_dance",   label: "Dance Floor",      subtitle: "Party Time",   sfIcon: "person.3.fill",        featherIcon: "users",    energyProfile: "Fun, Crowd Pleaser",     description: "Everyone on the dance floor" },
  { id: "afterparty",     label: "Afterparty",       subtitle: "Club Vibes",   sfIcon: "bolt.fill",            featherIcon: "zap",      energyProfile: "DJ, Electronic, Hype",   description: "Peak energy afterparty bangers" },
];

export const CORPORATE_MOMENTS: WeddingMoment[] = [
  { id: "guest_arrival",  label: "Registration",     subtitle: "Arrival",      sfIcon: "person.wave.2.fill",   featherIcon: "users",    energyProfile: "Professional, Ambient",  description: "Background music as guests register and arrive" },
  { id: "cocktail_hour",  label: "Networking",       subtitle: "Cocktails",    sfIcon: "wineglass.fill",       featherIcon: "coffee",   energyProfile: "Jazz, Upbeat",           description: "Music for networking and welcome drinks" },
  { id: "dinner",         label: "Gala Dinner",      subtitle: "Dinner",       sfIcon: "fork.knife",           featherIcon: "coffee",   energyProfile: "Sophisticated, Lounge",  description: "Elegant background music for the dinner" },
  { id: "toast_speeches", label: "Awards & Speeches",subtitle: "Recognition",  sfIcon: "mic.fill",             featherIcon: "mic",      energyProfile: "Professional, Ambient",  description: "Background music during presentations and awards" },
  { id: "family_dance",   label: "Entertainment",    subtitle: "Live Act",     sfIcon: "figure.dance",         featherIcon: "activity", energyProfile: "Corporate Entertainment",description: "Live or DJ entertainment set" },
  { id: "afterparty",     label: "After Party",      subtitle: "Wind Down",    sfIcon: "bolt.fill",            featherIcon: "zap",      energyProfile: "Upbeat, Fun",            description: "Post-event party and celebrations" },
];

export const PARTY_MOMENTS: WeddingMoment[] = [
  { id: "guest_arrival",  label: "Arrivals",         subtitle: "Pre-Drinks",   sfIcon: "person.wave.2.fill",   featherIcon: "users",    energyProfile: "Upbeat, Welcoming",     description: "Music to get the party started" },
  { id: "cocktail_hour",  label: "Pre-Drinks",       subtitle: "Warm-up",      sfIcon: "wineglass.fill",       featherIcon: "coffee",   energyProfile: "Chill, Build-up",        description: "Pre-party warm-up vibes" },
  { id: "first_dance",    label: "Main Set",         subtitle: "Peak Hours",   sfIcon: "heart.circle.fill",    featherIcon: "heart",    energyProfile: "High Energy, Peak",      description: "Peak party hours, main dance floor" },
  { id: "family_dance",   label: "Dance Floor",      subtitle: "All Night",    sfIcon: "person.3.fill",        featherIcon: "users",    energyProfile: "Crowd Pleaser",          description: "Floor fillers for everyone" },
  { id: "dinner",         label: "Food Break",       subtitle: "Chill Out",    sfIcon: "fork.knife",           featherIcon: "coffee",   energyProfile: "Chill, Background",      description: "Music during the food break" },
  { id: "afterparty",     label: "Afterparty",       subtitle: "Late Night",   sfIcon: "bolt.fill",            featherIcon: "zap",      energyProfile: "DJ, Electronic, Hype",   description: "The late-night afterparty" },
];

export const MEHENDI_MOMENTS: WeddingMoment[] = [
  { id: "guest_arrival",        label: "Guest Arrival",         subtitle: "Welcome",        sfIcon: "person.wave.2.fill",    featherIcon: "users",     energyProfile: "Soft, Festive",          description: "Guests arrive for the Mehndi celebration" },
  { id: "mehndi_application",   label: "Mehndi Application",    subtitle: "Henna Time",     sfIcon: "hand.point.up.fill",    featherIcon: "feather",   energyProfile: "Calm, Traditional",      description: "Mehndi artist applies henna to the bride and guests" },
  { id: "ladies_function",      label: "Ladies' Function",      subtitle: "Girls' Circle",  sfIcon: "person.3.fill",         featherIcon: "users",     energyProfile: "Fun, Upbeat",            description: "Ladies-only dancing and singing" },
  { id: "music_celebrations",   label: "Music & Dance",         subtitle: "Celebration",    sfIcon: "music.note.list",       featherIcon: "music",     energyProfile: "Bhangra, Fun",           description: "Dancing, singing, and lively music" },
  { id: "group_dance",          label: "Group Performance",     subtitle: "Choreography",   sfIcon: "figure.dance",          featherIcon: "activity",  energyProfile: "High Energy",            description: "Choreographed group dances and performances" },
  { id: "dinner",               label: "Mehndi Dinner",         subtitle: "Feast",          sfIcon: "fork.knife",            featherIcon: "coffee",    energyProfile: "Relaxed, Warm",          description: "Dinner and refreshments for guests" },
  { id: "finale",               label: "Grand Finale",          subtitle: "Send-Off",       sfIcon: "sparkles",              featherIcon: "star",      energyProfile: "Joyful, Festive",        description: "Closing celebrations and farewells" },
];

export const SANGEET_MOMENTS: WeddingMoment[] = [
  { id: "guest_arrival",        label: "Guest Arrival",         subtitle: "Welcome",        sfIcon: "person.wave.2.fill",    featherIcon: "users",     energyProfile: "Upbeat, Warm",           description: "Guests arrive for the Sangeet night" },
  { id: "opening_performance",  label: "Opening Act",           subtitle: "Kick-off",       sfIcon: "theatermasks.fill",     featherIcon: "tv",        energyProfile: "High Energy, Hype",      description: "Opening performances to kick off the Sangeet" },
  { id: "ladies_sangeet",       label: "Ladies' Sangeet",       subtitle: "Bride's Side",   sfIcon: "person.3.fill",         featherIcon: "users",     energyProfile: "Fun, Playful",           description: "Ladies perform for the bride and groom" },
  { id: "family_performances",  label: "Family Performances",   subtitle: "Family Time",    sfIcon: "figure.2.and.child.holdinghands", featherIcon: "home", energyProfile: "Sentimental, Fun",  description: "Family members perform songs and dances" },
  { id: "garba_dandiya",        label: "Garba / Dandiya",       subtitle: "Folk Dance",     sfIcon: "figure.dance",          featherIcon: "activity",  energyProfile: "Folk, Traditional",      description: "Traditional Garba or Dandiya Raas dance" },
  { id: "first_dance",          label: "Couple's Dance",        subtitle: "Spotlight",      sfIcon: "heart.circle.fill",     featherIcon: "heart",     energyProfile: "Romantic, Emotional",    description: "The couple's spotlight performance" },
  { id: "family_dance",         label: "Open Dance Floor",      subtitle: "All Night",      sfIcon: "sparkles",              featherIcon: "zap",       energyProfile: "Peak Energy, Party",     description: "Full open dance floor for all guests" },
  { id: "afterparty",           label: "After-party",           subtitle: "Late Night",     sfIcon: "bolt.fill",             featherIcon: "zap",       energyProfile: "DJ, Electronic, Hype",   description: "Late-night afterparty bangers" },
];

export const NIKKAH_MOMENTS: WeddingMoment[] = [
  { id: "guest_arrival",        label: "Guest Arrival",         subtitle: "Welcome",        sfIcon: "person.wave.2.fill",    featherIcon: "users",     energyProfile: "Soft, Welcoming",        description: "Guests arrive and are seated" },
  { id: "quran_recitation",     label: "Quranic Recitation",    subtitle: "Opening",        sfIcon: "book.fill",             featherIcon: "book-open", energyProfile: "Spiritual, Calm",        description: "Opening recitation and nasheeds" },
  { id: "nikkah_ceremony",      label: "Nikkah Ceremony",       subtitle: "Sacred Union",   sfIcon: "heart.fill",            featherIcon: "heart",     energyProfile: "Solemn, Spiritual",      description: "The Nikkah contract and ceremony" },
  { id: "rukhsati",             label: "Rukhsati",              subtitle: "Departure",      sfIcon: "figure.walk.departure", featherIcon: "navigation", energyProfile: "Emotional, Tender",     description: "The bride's emotional departure from her family" },
  { id: "dinner",               label: "Walima Dinner",         subtitle: "Reception",      sfIcon: "fork.knife",            featherIcon: "coffee",    energyProfile: "Festive, Warm",          description: "Celebratory Walima dinner for guests" },
  { id: "family_dance",         label: "Celebration",           subtitle: "Joy & Music",    sfIcon: "music.note.list",       featherIcon: "music",     energyProfile: "Moderate, Joyful",       description: "Moderate music and celebration after the ceremony" },
  { id: "afterparty",           label: "After-party",           subtitle: "Festivities",    sfIcon: "bolt.fill",             featherIcon: "zap",       energyProfile: "Upbeat, Fun",            description: "Post-ceremony celebrations and dancing" },
];

export const SWEET16_MOMENTS: WeddingMoment[] = [
  { id: "guest_arrival",        label: "Guest Arrival",         subtitle: "Welcome",        sfIcon: "person.wave.2.fill",    featherIcon: "users",     energyProfile: "Upbeat, Welcoming",      description: "Guests arrive and mingle" },
  { id: "cocktail_hour",        label: "Welcome Drinks",        subtitle: "Mocktails",      sfIcon: "wineglass.fill",        featherIcon: "coffee",    energyProfile: "Chill, Fun",             description: "Welcome drinks and socialising" },
  { id: "crown_ceremony",       label: "Crown Ceremony",        subtitle: "Sweet 16 Crown", sfIcon: "crown.fill",            featherIcon: "star",      energyProfile: "Dramatic, Grand",        description: "The iconic Sweet 16 crown presentation moment" },
  { id: "toast_speeches",       label: "Birthday Toasts",       subtitle: "Speeches",       sfIcon: "mic.fill",              featherIcon: "mic",       energyProfile: "Heartfelt, Fun",         description: "Speeches and toasts to the birthday girl/boy" },
  { id: "first_dance",          label: "Spotlight Dance",       subtitle: "First Dance",    sfIcon: "heart.circle.fill",     featherIcon: "heart",     energyProfile: "Emotional, Pop",         description: "The special spotlight dance moment" },
  { id: "family_dance",         label: "Dance Floor",           subtitle: "Party Time",     sfIcon: "person.3.fill",         featherIcon: "users",     energyProfile: "High Energy, Pop",       description: "Full dance floor for all guests" },
  { id: "cake_cutting",         label: "Birthday Cake",         subtitle: "Cake Time",      sfIcon: "birthday.cake.fill",    featherIcon: "star",      energyProfile: "Playful, Sweet",         description: "The big cake cutting moment" },
  { id: "afterparty",           label: "Afterparty",            subtitle: "Club Vibes",     sfIcon: "bolt.fill",             featherIcon: "zap",       energyProfile: "High Energy, DJ",        description: "Peak energy afterparty for the night" },
];

export const GRADUATION_MOMENTS: WeddingMoment[] = [
  { id: "guest_arrival",        label: "Guest Arrival",         subtitle: "Welcome",        sfIcon: "person.wave.2.fill",    featherIcon: "users",     energyProfile: "Warm, Ambient",          description: "Guests and family arrive" },
  { id: "processional",         label: "Graduate Procession",   subtitle: "The Walk",       sfIcon: "graduationcap.fill",    featherIcon: "award",     energyProfile: "Grand, Triumphant",      description: "Graduates process in to the ceremony" },
  { id: "ceremony",             label: "Graduation Ceremony",   subtitle: "The Moment",     sfIcon: "scroll.fill",           featherIcon: "file-text", energyProfile: "Solemn, Proud",          description: "Diploma presentations and speeches" },
  { id: "photo_session",        label: "Photo Reception",       subtitle: "Memories",       sfIcon: "camera.fill",           featherIcon: "camera",    energyProfile: "Light, Celebratory",     description: "Photos and post-ceremony reception mingling" },
  { id: "dinner",               label: "Celebration Dinner",    subtitle: "Feast",          sfIcon: "fork.knife",            featherIcon: "coffee",    energyProfile: "Classy, Warm",           description: "Celebratory dinner with family and friends" },
  { id: "family_dance",         label: "Graduation Party",      subtitle: "Let's Go!",      sfIcon: "figure.dance",          featherIcon: "activity",  energyProfile: "High Energy, Fun",       description: "The graduation celebration party" },
  { id: "afterparty",           label: "Afterparty",            subtitle: "Late Night",     sfIcon: "bolt.fill",             featherIcon: "zap",       energyProfile: "DJ, Electronic, Hype",   description: "Late-night grad party" },
];

export function getMomentsForEventType(eventType?: EventType): WeddingMoment[] {
  switch (eventType) {
    case "birthday":    return BIRTHDAY_MOMENTS;
    case "corporate":   return CORPORATE_MOMENTS;
    case "party":       return PARTY_MOMENTS;
    case "mehendi":     return MEHENDI_MOMENTS;
    case "sangeet":     return SANGEET_MOMENTS;
    case "nikkah":      return NIKKAH_MOMENTS;
    case "sweet16":     return SWEET16_MOMENTS;
    case "graduation":  return GRADUATION_MOMENTS;
    default:            return WEDDING_MOMENTS;
  }
}

export const CULTURES: Culture[] = [
  { id: "punjabi",        label: "Punjabi",             flag: "🇮🇳" },
  { id: "pakistani",      label: "Pakistani",           flag: "🇵🇰" },
  { id: "north_indian",   label: "North Indian",        flag: "🇮🇳" },
  { id: "south_indian",   label: "South Indian",        flag: "🇮🇳" },
  { id: "sikh",           label: "Sikh",                flag: "🟡" },
  { id: "hindu",          label: "Hindu",               flag: "🕉️" },
  { id: "muslim",         label: "Muslim",              flag: "☪️" },
  { id: "bengali",        label: "Bengali",             flag: "🇧🇩" },
  { id: "gujarati",       label: "Gujarati",            flag: "🇮🇳" },
  { id: "marathi",        label: "Marathi",             flag: "🇮🇳" },
  { id: "tamil",          label: "Tamil",               flag: "🇮🇳" },
  { id: "telugu",         label: "Telugu",              flag: "🇮🇳" },
  { id: "malayali",       label: "Malayali",            flag: "🇮🇳" },
  { id: "arabic",         label: "Arabic / Arab",       flag: "🇸🇦" },
  { id: "moroccan",       label: "Moroccan",            flag: "🇲🇦" },
  { id: "turkish",        label: "Turkish",             flag: "🇹🇷" },
  { id: "persian",        label: "Persian / Iranian",   flag: "🇮🇷" },
  { id: "nigerian",       label: "Nigerian",            flag: "🇳🇬" },
  { id: "ghanaian",       label: "Ghanaian",            flag: "🇬🇭" },
  { id: "afro_caribbean", label: "Afro-Caribbean",      flag: "🌴" },
  { id: "chinese",        label: "Chinese",             flag: "🇨🇳" },
  { id: "korean",         label: "Korean",              flag: "🇰🇷" },
  { id: "jewish",         label: "Jewish / Israeli",    flag: "🇮🇱" },
  { id: "greek",          label: "Greek",               flag: "🇬🇷" },
  { id: "italian",        label: "Italian",             flag: "🇮🇹" },
  { id: "irish",          label: "Irish",               flag: "🇮🇪" },
  { id: "british",        label: "British",             flag: "🇬🇧" },
  { id: "american",       label: "American",            flag: "🇺🇸" },
  { id: "australian",     label: "Australian",          flag: "🇦🇺" },
  { id: "norwegian",      label: "Norwegian",           flag: "🇳🇴" },
  { id: "caribbean",      label: "Caribbean",           flag: "🌊" },
  { id: "latin",          label: "Latin / Hispanic",    flag: "🌎" },
  { id: "brazilian",      label: "Brazilian",           flag: "🇧🇷" },
  { id: "west_african",   label: "West African",        flag: "🌍" },
  { id: "mixed",          label: "Mixed / Fusion",      flag: "🌍" },
];

export const LANGUAGES: Language[] = [
  { id: "hindi",      label: "Hindi" },
  { id: "punjabi",    label: "Punjabi" },
  { id: "urdu",       label: "Urdu" },
  { id: "english",    label: "English" },
  { id: "norwegian",  label: "Norwegian" },
  { id: "tamil",      label: "Tamil" },
  { id: "telugu",     label: "Telugu" },
  { id: "bengali",    label: "Bengali" },
  { id: "gujarati",   label: "Gujarati" },
  { id: "marathi",    label: "Marathi" },
  { id: "arabic",     label: "Arabic" },
  { id: "turkish",    label: "Turkish" },
  { id: "spanish",    label: "Spanish" },
  { id: "french",     label: "French" },
  { id: "swahili",    label: "Swahili" },
  { id: "korean",     label: "Korean" },
  { id: "mandarin",   label: "Mandarin" },
];

export const SONG_DATABASE: Song[] = [
  // ─── BARAAT ────────────────────────────────────────────────────────────────
  {
    id: "s1",
    title: "Sauda Khara Khara",
    artist: "Diljit Dosanjh",
    youtubeVideoId: "9WFD2aQ9Bg8",
    energyScore: 95,
    dholScore: 90,
    danceability: 92,
    moments: ["baraat", "mehndi_groom", "sangeet"],
    cultureTags: ["punjabi", "sikh"],
    languageTags: ["punjabi"],
    tags: ["dhol-drop", "entry-hit", "singalong"],
    familyFriendly: true,
    bpmRange: "120-130",
  },
  {
    id: "s2",
    title: "Morni Banke",
    artist: "Guru Randhawa",
    youtubeVideoId: "yVfb3kP2oYo",
    energyScore: 88,
    dholScore: 80,
    danceability: 90,
    moments: ["baraat", "mehndi_groom", "sangeet"],
    cultureTags: ["punjabi", "north_indian"],
    languageTags: ["punjabi", "hindi"],
    tags: ["bhangra-beat", "hype", "singalong"],
    familyFriendly: true,
    bpmRange: "115-125",
  },
  {
    id: "s3",
    title: "3 Peg",
    artist: "Sharry Mann",
    youtubeVideoId: "CuKFDvH-L8U",
    energyScore: 92,
    dholScore: 85,
    danceability: 94,
    moments: ["baraat", "sangeet", "afterparty"],
    cultureTags: ["punjabi"],
    languageTags: ["punjabi"],
    tags: ["pure-bhangra", "hype", "dance-floor"],
    familyFriendly: false,
    bpmRange: "120-135",
  },
  {
    id: "s4",
    title: "Mundian To Bach Ke",
    artist: "Panjabi MC",
    youtubeVideoId: "djV11Xbc914",
    energyScore: 96,
    dholScore: 98,
    danceability: 97,
    moments: ["baraat", "mehndi_groom", "afterparty"],
    cultureTags: ["punjabi", "sikh"],
    languageTags: ["punjabi", "english"],
    tags: ["dhol-drop", "classic", "dance-floor"],
    familyFriendly: true,
    bpmRange: "128-138",
  },
  {
    id: "s5",
    title: "Sher Aaya Sher",
    artist: "Various",
    youtubeVideoId: "bSdBBEmxKo4",
    energyScore: 97,
    dholScore: 95,
    danceability: 95,
    moments: ["baraat", "mehndi_groom"],
    cultureTags: ["punjabi", "north_indian"],
    languageTags: ["punjabi"],
    tags: ["swag-entry", "power", "dhol-drop"],
    familyFriendly: true,
    bpmRange: "125-140",
  },
  {
    id: "s28",
    title: "Laung Laachi",
    artist: "Mannat Noor",
    youtubeVideoId: "_wB5ZFPQ0is",
    energyScore: 82,
    dholScore: 78,
    danceability: 84,
    moments: ["baraat", "sangeet", "family_dance"],
    cultureTags: ["punjabi"],
    languageTags: ["punjabi"],
    tags: ["bhangra", "folk", "singalong"],
    familyFriendly: true,
    bpmRange: "110-120",
  },
  {
    id: "s29",
    title: "Nikle Currant",
    artist: "Neha Kakkar & Yaseer Desai",
    youtubeVideoId: "gkjlKFQ-XkI",
    energyScore: 87,
    dholScore: 72,
    danceability: 88,
    moments: ["baraat", "sangeet", "couple_entry"],
    cultureTags: ["punjabi", "north_indian"],
    languageTags: ["punjabi", "hindi"],
    tags: ["bhangra", "hype", "singalong"],
    familyFriendly: true,
    bpmRange: "115-125",
  },
  {
    id: "s30",
    title: "Proper Patola",
    artist: "Diljit Dosanjh",
    youtubeVideoId: "vINJzxC8q_c",
    energyScore: 89,
    dholScore: 76,
    danceability: 91,
    moments: ["baraat", "sangeet", "afterparty"],
    cultureTags: ["punjabi"],
    languageTags: ["punjabi", "english"],
    tags: ["bhangra", "hype", "dance-floor"],
    familyFriendly: false,
    bpmRange: "118-128",
  },

  // ─── BRIDE ENTRY ───────────────────────────────────────────────────────────
  {
    id: "s6",
    title: "Tum Jo Aaye",
    artist: "Rahat Fateh Ali Khan",
    youtubeVideoId: "CuKFDvH-L8U",
    energyScore: 55,
    dholScore: 20,
    danceability: 40,
    moments: ["bride_entry", "first_dance", "dinner"],
    cultureTags: ["pakistani", "muslim", "north_indian"],
    languageTags: ["urdu", "hindi"],
    tags: ["romantic", "slow", "couple-friendly", "sufi"],
    familyFriendly: true,
    bpmRange: "70-80",
  },
  {
    id: "s7",
    title: "Tere Liye",
    artist: "Atif Aslam",
    youtubeVideoId: "lVnLNmsFGlA",
    energyScore: 50,
    dholScore: 15,
    danceability: 38,
    moments: ["bride_entry", "first_dance"],
    cultureTags: ["pakistani", "north_indian"],
    languageTags: ["urdu", "hindi"],
    tags: ["romantic", "slow", "emotional"],
    familyFriendly: true,
    bpmRange: "65-75",
  },
  {
    id: "s8",
    title: "Jeena Jeena",
    artist: "Atif Aslam",
    youtubeVideoId: "yVfb3kP2oYo",
    energyScore: 62,
    dholScore: 25,
    danceability: 55,
    moments: ["bride_entry", "couple_entry", "first_dance"],
    cultureTags: ["pakistani", "north_indian"],
    languageTags: ["hindi"],
    tags: ["romantic", "couple-friendly", "sweet"],
    familyFriendly: true,
    bpmRange: "80-90",
  },
  {
    id: "s31",
    title: "Pehli Dafa",
    artist: "Atif Aslam",
    youtubeVideoId: "Rz8hO9oGzS4",
    energyScore: 48,
    dholScore: 10,
    danceability: 40,
    moments: ["bride_entry", "first_dance"],
    cultureTags: ["pakistani", "north_indian"],
    languageTags: ["hindi"],
    tags: ["romantic", "emotional", "slow"],
    familyFriendly: true,
    bpmRange: "68-78",
  },
  {
    id: "s32",
    title: "Hawayein",
    artist: "Arijit Singh",
    youtubeVideoId: "cMnDMQVBkYA",
    energyScore: 52,
    dholScore: 8,
    danceability: 45,
    moments: ["bride_entry", "first_dance"],
    cultureTags: ["north_indian"],
    languageTags: ["hindi"],
    tags: ["romantic", "emotional", "soulful"],
    familyFriendly: true,
    bpmRange: "70-80",
  },
  {
    id: "s33",
    title: "Kannaana Kanney",
    artist: "D. Imman",
    youtubeVideoId: "yVfb3kP2oYo",
    energyScore: 35,
    dholScore: 10,
    danceability: 28,
    moments: ["bride_entry", "dinner", "vidaai"],
    cultureTags: ["south_indian"],
    languageTags: ["tamil"],
    tags: ["emotional", "slow", "sentimental"],
    familyFriendly: true,
    bpmRange: "58-68",
  },

  // ─── COUPLE ENTRY / RECEPTION ──────────────────────────────────────────────
  {
    id: "s9",
    title: "Gallan Goodiyan",
    artist: "Various",
    youtubeVideoId: "CuKFDvH-L8U",
    energyScore: 88,
    dholScore: 75,
    danceability: 90,
    moments: ["couple_entry", "sangeet", "family_dance"],
    cultureTags: ["north_indian", "punjabi"],
    languageTags: ["hindi"],
    tags: ["bhangra", "singalong", "dance-floor"],
    familyFriendly: true,
    bpmRange: "110-120",
  },
  {
    id: "s10",
    title: "London Thumakda",
    artist: "Labh Janjua, Sonu Kakkar",
    youtubeVideoId: "9WFD2aQ9Bg8",
    energyScore: 90,
    dholScore: 70,
    danceability: 92,
    moments: ["couple_entry", "sangeet", "family_dance"],
    cultureTags: ["punjabi", "north_indian"],
    languageTags: ["punjabi", "hindi"],
    tags: ["bhangra", "hype", "singalong"],
    familyFriendly: true,
    bpmRange: "115-125",
  },
  {
    id: "s34",
    title: "Kesariya",
    artist: "Arijit Singh",
    youtubeVideoId: "BddP6PYo2gs",
    energyScore: 72,
    dholScore: 30,
    danceability: 70,
    moments: ["couple_entry", "first_dance", "dinner"],
    cultureTags: ["north_indian"],
    languageTags: ["hindi"],
    tags: ["romantic", "couple-friendly", "singalong"],
    familyFriendly: true,
    bpmRange: "95-105",
  },
  {
    id: "s35",
    title: "Ranjha",
    artist: "B Praak & Jasleen Royal",
    youtubeVideoId: "kpKBzXenknI",
    energyScore: 65,
    dholScore: 20,
    danceability: 60,
    moments: ["couple_entry", "first_dance", "bride_entry"],
    cultureTags: ["north_indian", "punjabi"],
    languageTags: ["hindi"],
    tags: ["romantic", "emotional", "couple-friendly"],
    familyFriendly: true,
    bpmRange: "88-98",
  },
  {
    id: "s36",
    title: "Bole Chudiyan",
    artist: "Udit Narayan & Alka Yagnik",
    youtubeVideoId: "tsCKOBvRCKI",
    energyScore: 82,
    dholScore: 65,
    danceability: 85,
    moments: ["couple_entry", "sangeet", "family_dance"],
    cultureTags: ["north_indian"],
    languageTags: ["hindi"],
    tags: ["classic", "bhangra", "singalong"],
    familyFriendly: true,
    bpmRange: "108-118",
  },

  // ─── NIKAH ─────────────────────────────────────────────────────────────────
  {
    id: "s11",
    title: "Afreen Afreen",
    artist: "Rahat Fateh Ali Khan & Momina Mustehsan",
    youtubeVideoId: "yVfb3kP2oYo",
    energyScore: 45,
    dholScore: 10,
    danceability: 30,
    moments: ["nikah", "dinner", "bride_entry"],
    cultureTags: ["pakistani", "muslim"],
    languageTags: ["urdu"],
    tags: ["sufi", "devotional", "couple-friendly"],
    familyFriendly: true,
    bpmRange: "60-70",
  },
  {
    id: "s12",
    title: "Dama Dam Mast Qalandar",
    artist: "Various",
    youtubeVideoId: "CuKFDvH-L8U",
    energyScore: 65,
    dholScore: 60,
    danceability: 65,
    moments: ["nikah", "sangeet", "dinner"],
    cultureTags: ["pakistani", "muslim"],
    languageTags: ["urdu", "punjabi"],
    tags: ["sufi-groove", "spiritual", "classic"],
    familyFriendly: true,
    bpmRange: "90-100",
  },
  {
    id: "s37",
    title: "Woh Humsafar Tha",
    artist: "Qurat ul Ain Balouch",
    youtubeVideoId: "1M55mX9q7t4",
    energyScore: 42,
    dholScore: 5,
    danceability: 32,
    moments: ["nikah", "bride_entry", "dinner"],
    cultureTags: ["pakistani", "muslim"],
    languageTags: ["urdu"],
    tags: ["sufi", "romantic", "emotional"],
    familyFriendly: true,
    bpmRange: "62-72",
  },
  {
    id: "s38",
    title: "Chaap Tilak",
    artist: "Abida Parveen",
    youtubeVideoId: "kRsXF2w3s6k",
    energyScore: 55,
    dholScore: 30,
    danceability: 40,
    moments: ["nikah", "pheras", "dinner"],
    cultureTags: ["pakistani", "muslim"],
    languageTags: ["urdu"],
    tags: ["sufi", "devotional", "spiritual"],
    familyFriendly: true,
    bpmRange: "72-82",
  },

  // ─── PHERAS ────────────────────────────────────────────────────────────────
  {
    id: "s17",
    title: "Kun Faya Kun",
    artist: "A.R. Rahman",
    youtubeVideoId: "T94PHkuydcw",
    energyScore: 38,
    dholScore: 15,
    danceability: 25,
    moments: ["dinner", "pheras", "nikah"],
    cultureTags: ["north_indian", "muslim"],
    languageTags: ["urdu", "hindi"],
    tags: ["sufi", "spiritual", "ambient"],
    familyFriendly: true,
    bpmRange: "55-65",
  },
  {
    id: "s18",
    title: "Ik Onkar",
    artist: "A.R. Rahman",
    youtubeVideoId: "CuKFDvH-L8U",
    energyScore: 40,
    dholScore: 20,
    danceability: 30,
    moments: ["pheras", "nikah", "dinner"],
    cultureTags: ["sikh", "north_indian"],
    languageTags: ["punjabi"],
    tags: ["devotional", "spiritual", "gurbani"],
    familyFriendly: true,
    bpmRange: "60-70",
  },

  // ─── FIRST DANCE ───────────────────────────────────────────────────────────
  {
    id: "s13",
    title: "Tera Ban Jaunga",
    artist: "Akhil Sachdeva & Tulsi Kumar",
    youtubeVideoId: "9WFD2aQ9Bg8",
    energyScore: 48,
    dholScore: 10,
    danceability: 42,
    moments: ["first_dance"],
    cultureTags: ["north_indian"],
    languageTags: ["hindi"],
    tags: ["romantic", "couple-friendly", "emotional"],
    familyFriendly: true,
    bpmRange: "68-78",
  },
  {
    id: "s14",
    title: "Tujh Mein Rab Dikhta Hai",
    artist: "Roop Kumar Rathod",
    youtubeVideoId: "yVfb3kP2oYo",
    energyScore: 44,
    dholScore: 8,
    danceability: 38,
    moments: ["first_dance", "bride_entry"],
    cultureTags: ["north_indian"],
    languageTags: ["hindi"],
    tags: ["romantic", "emotional", "classic"],
    familyFriendly: true,
    bpmRange: "65-75",
  },
  {
    id: "s39",
    title: "Ik Vaari Aa",
    artist: "Arijit Singh",
    youtubeVideoId: "_9YxBGCOFQc",
    energyScore: 50,
    dholScore: 8,
    danceability: 44,
    moments: ["first_dance", "bride_entry", "dinner"],
    cultureTags: ["north_indian"],
    languageTags: ["hindi"],
    tags: ["romantic", "emotional", "couple-friendly"],
    familyFriendly: true,
    bpmRange: "70-80",
  },
  {
    id: "s40",
    title: "Thinking Out Loud",
    artist: "Ed Sheeran",
    youtubeVideoId: "lp-EBT1meGU",
    energyScore: 60,
    dholScore: 0,
    danceability: 62,
    moments: ["first_dance", "dinner", "couple_entry", "ceremony", "signing"],
    cultureTags: ["mixed", "norwegian"],
    languageTags: ["english"],
    tags: ["romantic", "classic", "couple-friendly"],
    familyFriendly: true,
    bpmRange: "80-90",
  },
  {
    id: "s41",
    title: "Perfect",
    artist: "Ed Sheeran",
    youtubeVideoId: "2Vv-BfVoq4g",
    energyScore: 58,
    dholScore: 0,
    danceability: 58,
    moments: ["first_dance", "dinner", "guest_arrival", "signing"],
    cultureTags: ["mixed", "norwegian"],
    languageTags: ["english"],
    tags: ["romantic", "slow", "couple-friendly"],
    familyFriendly: true,
    bpmRange: "76-86",
  },

  // ─── SANGEET / FAMILY DANCE ────────────────────────────────────────────────
  {
    id: "s15",
    title: "Nagada Sang Dhol",
    artist: "Shreya Ghoshal",
    youtubeVideoId: "CuKFDvH-L8U",
    energyScore: 86,
    dholScore: 88,
    danceability: 88,
    moments: ["sangeet", "family_dance", "baraat"],
    cultureTags: ["north_indian", "punjabi"],
    languageTags: ["hindi"],
    tags: ["dhol", "bhangra", "singalong", "classic"],
    familyFriendly: true,
    bpmRange: "118-128",
  },
  {
    id: "s16",
    title: "Chogada",
    artist: "Darshan Raval",
    youtubeVideoId: "9WFD2aQ9Bg8",
    energyScore: 84,
    dholScore: 80,
    danceability: 86,
    moments: ["sangeet", "family_dance"],
    cultureTags: ["north_indian"],
    languageTags: ["hindi"],
    tags: ["bhangra", "dance", "folk-fusion"],
    familyFriendly: true,
    bpmRange: "112-122",
  },
  {
    id: "s42",
    title: "Desi Girl",
    artist: "Shankar-Ehsaan-Loy",
    youtubeVideoId: "E6_oaO-zTLE",
    energyScore: 88,
    dholScore: 65,
    danceability: 90,
    moments: ["sangeet", "family_dance", "couple_entry"],
    cultureTags: ["north_indian"],
    languageTags: ["hindi", "english"],
    tags: ["dance-floor", "hype", "singalong"],
    familyFriendly: true,
    bpmRange: "114-124",
  },
  {
    id: "s43",
    title: "Ainvayi Ainvayi",
    artist: "Salim Merchant & Sunidhi Chauhan",
    youtubeVideoId: "Z4NjVlqaqIc",
    energyScore: 80,
    dholScore: 60,
    danceability: 82,
    moments: ["sangeet", "couple_entry", "family_dance"],
    cultureTags: ["north_indian", "punjabi"],
    languageTags: ["hindi"],
    tags: ["romantic", "dance", "fun"],
    familyFriendly: true,
    bpmRange: "108-118",
  },
  {
    id: "s44",
    title: "Prem Ratan Dhan Payo",
    artist: "Palak Muchhal",
    youtubeVideoId: "1C0nMjVrn3M",
    energyScore: 78,
    dholScore: 55,
    danceability: 80,
    moments: ["sangeet", "couple_entry", "family_dance"],
    cultureTags: ["north_indian"],
    languageTags: ["hindi"],
    tags: ["classic", "singalong", "dance"],
    familyFriendly: true,
    bpmRange: "105-115",
  },

  // ─── DINNER ────────────────────────────────────────────────────────────────
  {
    id: "s45",
    title: "Tum Hi Ho",
    artist: "Arijit Singh",
    youtubeVideoId: "Umqb9KENgmk",
    energyScore: 40,
    dholScore: 5,
    danceability: 32,
    moments: ["dinner", "first_dance", "bride_entry"],
    cultureTags: ["north_indian", "pakistani"],
    languageTags: ["hindi"],
    tags: ["romantic", "ambient", "emotional"],
    familyFriendly: true,
    bpmRange: "62-72",
  },
  {
    id: "s46",
    title: "Channa Mereya",
    artist: "Arijit Singh",
    youtubeVideoId: "zaRsRdP7J_8",
    energyScore: 42,
    dholScore: 8,
    danceability: 35,
    moments: ["dinner", "vidaai"],
    cultureTags: ["north_indian"],
    languageTags: ["hindi"],
    tags: ["emotional", "ambient", "romantic"],
    familyFriendly: true,
    bpmRange: "65-75",
  },
  {
    id: "s47",
    title: "Samajavaragamana",
    artist: "Sid Sriram",
    youtubeVideoId: "OsJBFHHScAA",
    energyScore: 45,
    dholScore: 12,
    danceability: 40,
    moments: ["dinner", "bride_entry", "first_dance"],
    cultureTags: ["south_indian"],
    languageTags: ["telugu"],
    tags: ["romantic", "ambient", "classical"],
    familyFriendly: true,
    bpmRange: "68-78",
  },

  // ─── VIDAAI ────────────────────────────────────────────────────────────────
  {
    id: "s19",
    title: "Babul Ki Duayen",
    artist: "Lata Mangeshkar",
    youtubeVideoId: "9WFD2aQ9Bg8",
    energyScore: 25,
    dholScore: 5,
    danceability: 15,
    moments: ["vidaai"],
    cultureTags: ["north_indian", "punjabi"],
    languageTags: ["hindi"],
    tags: ["emotional", "farewell", "sentimental"],
    familyFriendly: true,
    bpmRange: "50-60",
  },
  {
    id: "s20",
    title: "Alvida",
    artist: "Rahat Fateh Ali Khan",
    youtubeVideoId: "yVfb3kP2oYo",
    energyScore: 28,
    dholScore: 8,
    danceability: 18,
    moments: ["vidaai"],
    cultureTags: ["pakistani", "north_indian"],
    languageTags: ["urdu"],
    tags: ["emotional", "farewell", "sufi"],
    familyFriendly: true,
    bpmRange: "52-62",
  },
  {
    id: "s48",
    title: "Tujhse Naraaz Nahin",
    artist: "Pandit Jasraj",
    youtubeVideoId: "CuKFDvH-L8U",
    energyScore: 22,
    dholScore: 3,
    danceability: 12,
    moments: ["vidaai", "dinner"],
    cultureTags: ["north_indian"],
    languageTags: ["hindi"],
    tags: ["emotional", "farewell", "sentimental"],
    familyFriendly: true,
    bpmRange: "48-58",
  },

  // ─── AFTERPARTY ────────────────────────────────────────────────────────────
  {
    id: "s21",
    title: "Amplifier",
    artist: "Imran Khan",
    youtubeVideoId: "CuKFDvH-L8U",
    energyScore: 94,
    dholScore: 60,
    danceability: 96,
    moments: ["afterparty", "sangeet"],
    cultureTags: ["punjabi", "pakistani"],
    languageTags: ["punjabi", "english"],
    tags: ["dj", "hype", "dance-floor", "drop"],
    familyFriendly: false,
    bpmRange: "128-140",
  },
  {
    id: "s22",
    title: "Lovely",
    artist: "Bilal Saeed & Bohemia",
    youtubeVideoId: "9WFD2aQ9Bg8",
    energyScore: 88,
    dholScore: 55,
    danceability: 90,
    moments: ["afterparty", "couple_entry"],
    cultureTags: ["punjabi", "pakistani"],
    languageTags: ["punjabi", "english"],
    tags: ["hype", "dj", "singalong"],
    familyFriendly: true,
    bpmRange: "120-132",
  },
  {
    id: "s49",
    title: "Vaathi Coming",
    artist: "Anirudh Ravichander",
    youtubeVideoId: "3qF0bfNDRxk",
    energyScore: 92,
    dholScore: 70,
    danceability: 93,
    moments: ["afterparty", "baraat", "sangeet"],
    cultureTags: ["south_indian"],
    languageTags: ["tamil"],
    tags: ["dance", "hype", "folk-beat", "drop"],
    familyFriendly: true,
    bpmRange: "122-132",
  },
  {
    id: "s50",
    title: "Arabic Kuthu",
    artist: "Anirudh Ravichander",
    youtubeVideoId: "r7dG1OFzJnU",
    energyScore: 96,
    dholScore: 80,
    danceability: 97,
    moments: ["afterparty", "baraat", "sangeet"],
    cultureTags: ["south_indian"],
    languageTags: ["tamil"],
    tags: ["dance", "hype", "dance-floor", "drop"],
    familyFriendly: true,
    bpmRange: "126-136",
  },
  {
    id: "s51",
    title: "Chaiyya Chaiyya",
    artist: "A.R. Rahman & Sukhwinder Singh",
    youtubeVideoId: "hK_BEHtBsOU",
    energyScore: 90,
    dholScore: 75,
    danceability: 91,
    moments: ["afterparty", "baraat", "sangeet"],
    cultureTags: ["north_indian"],
    languageTags: ["hindi"],
    tags: ["classic", "dance", "singalong"],
    familyFriendly: true,
    bpmRange: "120-130",
  },

  // ─── SOUTH INDIAN ──────────────────────────────────────────────────────────
  {
    id: "s26",
    title: "Rowdy Baby",
    artist: "Yuvan Shankar Raja",
    youtubeVideoId: "74j1N8FZu5Y",
    energyScore: 90,
    dholScore: 70,
    danceability: 92,
    moments: ["baraat", "sangeet", "afterparty"],
    cultureTags: ["south_indian"],
    languageTags: ["tamil"],
    tags: ["dance", "hype", "folk-beat"],
    familyFriendly: true,
    bpmRange: "120-130",
  },
  {
    id: "s52",
    title: "Butta Bomma",
    artist: "Armaan Malik",
    youtubeVideoId: "QFItjrxbz00",
    energyScore: 68,
    dholScore: 40,
    danceability: 70,
    moments: ["sangeet", "couple_entry", "family_dance"],
    cultureTags: ["south_indian"],
    languageTags: ["telugu"],
    tags: ["romantic", "dance", "fun"],
    familyFriendly: true,
    bpmRange: "94-104",
  },
  {
    id: "s53",
    title: "Kutti Story",
    artist: "Anirudh Ravichander",
    youtubeVideoId: "nkLqoNjdp_k",
    energyScore: 88,
    dholScore: 65,
    danceability: 90,
    moments: ["sangeet", "afterparty", "baraat"],
    cultureTags: ["south_indian"],
    languageTags: ["tamil"],
    tags: ["hype", "dance", "folk-beat"],
    familyFriendly: true,
    bpmRange: "116-126",
  },

  // ─── NORWEGIAN / MIXED / WESTERN ──────────────────────────────────────────
  {
    id: "s23",
    title: "Take On Me",
    artist: "A-ha",
    youtubeVideoId: "djV11Xbc914",
    energyScore: 80,
    dholScore: 0,
    danceability: 82,
    moments: ["afterparty", "couple_entry", "cocktail_hour", "toast_speeches", "family_dance"],
    cultureTags: ["norwegian", "mixed"],
    languageTags: ["english"],
    tags: ["classic", "singalong", "dance-floor"],
    familyFriendly: true,
    bpmRange: "118-125",
  },
  {
    id: "s24",
    title: "Lovefool",
    artist: "The Cardigans",
    youtubeVideoId: "CuKFDvH-L8U",
    energyScore: 72,
    dholScore: 0,
    danceability: 78,
    moments: ["first_dance", "dinner", "couple_entry"],
    cultureTags: ["norwegian", "mixed"],
    languageTags: ["english"],
    tags: ["romantic", "classic", "singalong"],
    familyFriendly: true,
    bpmRange: "108-118",
  },
  {
    id: "s25",
    title: "Strangers",
    artist: "Sigrid",
    youtubeVideoId: "cV4Kqkl1LBJ",
    energyScore: 82,
    dholScore: 0,
    danceability: 83,
    moments: ["afterparty", "sangeet"],
    cultureTags: ["norwegian"],
    languageTags: ["english"],
    tags: ["dance-pop", "uplifting", "singalong"],
    familyFriendly: true,
    bpmRange: "118-128",
  },
  {
    id: "s54",
    title: "Runaway",
    artist: "Aurora",
    youtubeVideoId: "QBATAzpyOJk",
    energyScore: 74,
    dholScore: 0,
    danceability: 72,
    moments: ["first_dance", "dinner", "bride_entry", "ceremony", "guest_arrival"],
    cultureTags: ["norwegian"],
    languageTags: ["english"],
    tags: ["romantic", "ambient", "ethereal"],
    familyFriendly: true,
    bpmRange: "100-110",
  },
  {
    id: "s55",
    title: "Don't Kill My Vibe",
    artist: "Sigrid",
    youtubeVideoId: "wBT5_Oy9Vhg",
    energyScore: 76,
    dholScore: 0,
    danceability: 75,
    moments: ["afterparty", "couple_entry"],
    cultureTags: ["norwegian"],
    languageTags: ["english"],
    tags: ["uplifting", "dance-pop", "fun"],
    familyFriendly: true,
    bpmRange: "108-118",
  },
  {
    id: "s56",
    title: "A Sky Full of Stars",
    artist: "Coldplay",
    youtubeVideoId: "VPRjCeoBqrI",
    energyScore: 85,
    dholScore: 0,
    danceability: 83,
    moments: ["couple_entry", "afterparty", "cake_cutting", "family_dance"],
    cultureTags: ["mixed", "norwegian"],
    languageTags: ["english"],
    tags: ["singalong", "dance-floor", "uplifting"],
    familyFriendly: true,
    bpmRange: "125-132",
  },

  // ─── MEHNDI NIGHT ───────────────────────────────────────────────────────────
  {
    id: "s57",
    title: "Mehndi Laga Ke Rakhna",
    artist: "Lata Mangeshkar",
    youtubeVideoId: "gCsQBNP1F_k",
    energyScore: 75,
    dholScore: 55,
    danceability: 78,
    moments: ["mehndi", "sangeet"],
    cultureTags: ["north_indian", "punjabi"],
    languageTags: ["hindi"],
    tags: ["singalong", "classic", "couple-friendly"],
    familyFriendly: true,
    bpmRange: "96-104",
  },
  {
    id: "s58",
    title: "Chan Kitthan",
    artist: "Ayushmann Khurrana",
    youtubeVideoId: "Dwa3VGwdPbQ",
    energyScore: 72,
    dholScore: 45,
    danceability: 74,
    moments: ["mehndi", "sangeet"],
    cultureTags: ["punjabi", "north_indian"],
    languageTags: ["punjabi", "hindi"],
    tags: ["romantic", "folk", "singalong"],
    familyFriendly: true,
    bpmRange: "88-96",
  },
  {
    id: "s59",
    title: "Morni",
    artist: "Sunidhi Chauhan",
    youtubeVideoId: "j6Bqb4bLPJY",
    energyScore: 80,
    dholScore: 70,
    danceability: 82,
    moments: ["mehndi", "sangeet", "family_dance"],
    cultureTags: ["punjabi", "sikh"],
    languageTags: ["punjabi"],
    tags: ["bhangra-beat", "folk", "singalong"],
    familyFriendly: true,
    bpmRange: "108-116",
  },
  {
    id: "s60",
    title: "Mehendi Hai Rachne Wali",
    artist: "Anuradha Paudwal",
    youtubeVideoId: "n1dHgNELVRw",
    energyScore: 65,
    dholScore: 40,
    danceability: 68,
    moments: ["mehndi"],
    cultureTags: ["north_indian"],
    languageTags: ["hindi"],
    tags: ["classic", "folk", "singalong", "ambient"],
    familyFriendly: true,
    bpmRange: "84-92",
  },
  {
    id: "s61",
    title: "Aaj Ki Raat",
    artist: "Madhuri Dixit / Don 2",
    youtubeVideoId: "2bFPQqkVVyU",
    energyScore: 88,
    dholScore: 55,
    danceability: 90,
    moments: ["mehndi", "sangeet", "afterparty"],
    cultureTags: ["north_indian", "mixed"],
    languageTags: ["hindi"],
    tags: ["dance-floor", "hype", "singalong"],
    familyFriendly: true,
    bpmRange: "118-126",
  },

  // ─── HALDI CEREMONY ─────────────────────────────────────────────────────────
  {
    id: "s62",
    title: "Haldi (Jugaadi Thumka)",
    artist: "Sunidhi Chauhan",
    youtubeVideoId: "8pVRE0W7_d4",
    energyScore: 82,
    dholScore: 72,
    danceability: 85,
    moments: ["haldi", "sangeet"],
    cultureTags: ["north_indian", "punjabi"],
    languageTags: ["hindi"],
    tags: ["folk", "bhangra-beat", "singalong"],
    familyFriendly: true,
    bpmRange: "112-120",
  },
  {
    id: "s63",
    title: "Aaj Mere Yaar Ki Shaadi Hai",
    artist: "Asha Bhosle",
    youtubeVideoId: "UW0QaKbRfMk",
    energyScore: 78,
    dholScore: 60,
    danceability: 80,
    moments: ["haldi", "sangeet", "family_dance"],
    cultureTags: ["north_indian"],
    languageTags: ["hindi"],
    tags: ["classic", "singalong", "fun"],
    familyFriendly: true,
    bpmRange: "100-108",
  },
  {
    id: "s64",
    title: "Nach Punjaban",
    artist: "Tanishk Bagchi, Zahrah S Khan",
    youtubeVideoId: "UuBSFRxD6m0",
    energyScore: 90,
    dholScore: 78,
    danceability: 92,
    moments: ["haldi", "sangeet", "family_dance", "afterparty"],
    cultureTags: ["punjabi", "north_indian"],
    languageTags: ["punjabi", "hindi"],
    tags: ["bhangra-beat", "hype", "dance-floor"],
    familyFriendly: true,
    bpmRange: "120-128",
  },
  {
    id: "s65",
    title: "Ranjha",
    artist: "Jasleen Royal (Shershaah)",
    youtubeVideoId: "5MZ6q9T0W2s",
    energyScore: 68,
    dholScore: 35,
    danceability: 70,
    moments: ["haldi", "sangeet"],
    cultureTags: ["punjabi", "north_indian"],
    languageTags: ["punjabi", "hindi"],
    tags: ["romantic", "folk", "couple-friendly"],
    familyFriendly: true,
    bpmRange: "88-96",
  },
  {
    id: "s66",
    title: "Balle Balle",
    artist: "Daler Mehndi",
    youtubeVideoId: "Y7lSukP2Hxo",
    energyScore: 92,
    dholScore: 88,
    danceability: 90,
    moments: ["haldi", "baraat", "sangeet"],
    cultureTags: ["punjabi", "sikh"],
    languageTags: ["punjabi"],
    tags: ["bhangra-beat", "dhol-drop", "singalong", "classic"],
    familyFriendly: true,
    bpmRange: "128-136",
  },

  // ─── WALIMA ──────────────────────────────────────────────────────────────────
  {
    id: "s67",
    title: "Afreen Afreen",
    artist: "Rahat Fateh Ali Khan (Coke Studio)",
    youtubeVideoId: "wJ8RRF1YPGU",
    energyScore: 55,
    dholScore: 20,
    danceability: 52,
    moments: ["walima", "nikah", "dinner"],
    cultureTags: ["pakistani", "muslim"],
    languageTags: ["urdu"],
    tags: ["sufi", "romantic", "ambient"],
    familyFriendly: true,
    bpmRange: "72-80",
  },
  {
    id: "s68",
    title: "Tere Bin",
    artist: "Atif Aslam, Rohail Hayat",
    youtubeVideoId: "hvmtP9VUTJE",
    energyScore: 60,
    dholScore: 15,
    danceability: 55,
    moments: ["walima", "first_dance", "dinner"],
    cultureTags: ["pakistani", "muslim"],
    languageTags: ["urdu"],
    tags: ["romantic", "sufi", "couple-friendly"],
    familyFriendly: true,
    bpmRange: "76-84",
  },
  {
    id: "s69",
    title: "Mere Rashke Qamar",
    artist: "Nusrat Fateh Ali Khan",
    youtubeVideoId: "_lK0nMT-OmI",
    energyScore: 58,
    dholScore: 25,
    danceability: 56,
    moments: ["walima", "nikah", "dinner"],
    cultureTags: ["pakistani", "muslim"],
    languageTags: ["urdu"],
    tags: ["sufi", "classic", "romantic"],
    familyFriendly: true,
    bpmRange: "68-76",
  },
  {
    id: "s70",
    title: "Ve Maahi",
    artist: "Arijit Singh, Asees Kaur (Kesari)",
    youtubeVideoId: "PZT-eBUMOhY",
    energyScore: 64,
    dholScore: 28,
    danceability: 62,
    moments: ["walima", "couple_entry", "first_dance"],
    cultureTags: ["north_indian", "punjabi", "mixed"],
    languageTags: ["punjabi", "hindi"],
    tags: ["romantic", "emotional", "couple-friendly"],
    familyFriendly: true,
    bpmRange: "80-88",
  },
  {
    id: "s71",
    title: "Sooha Saaha",
    artist: "Ali Zafar",
    youtubeVideoId: "6jQD7RR5mIQ",
    energyScore: 70,
    dholScore: 30,
    danceability: 72,
    moments: ["walima", "dinner", "couple_entry"],
    cultureTags: ["pakistani", "north_indian"],
    languageTags: ["urdu", "hindi"],
    tags: ["romantic", "uplifting", "couple-friendly"],
    familyFriendly: true,
    bpmRange: "90-98",
  },

  // ─── HINDI BOLLYWOOD ────────────────────────────────────────────────────────
  {
    id: "s72",
    title: "Gallan Goodiyaan",
    artist: "Shankar-Ehsaan-Loy (Dil Dhadakne Do)",
    youtubeVideoId: "5gDoNLgMJ9k",
    energyScore: 88,
    dholScore: 50,
    danceability: 88,
    moments: ["sangeet", "family_dance", "couple_entry"],
    cultureTags: ["north_indian", "mixed"],
    languageTags: ["hindi", "punjabi"],
    tags: ["singalong", "dance-floor", "fun", "bhangra-beat"],
    familyFriendly: true,
    bpmRange: "118-126",
  },
  {
    id: "s73",
    title: "Chogada Tara",
    artist: "Darshan Raval, Asees Kaur",
    youtubeVideoId: "dJjXl9I6hN8",
    energyScore: 85,
    dholScore: 65,
    danceability: 87,
    moments: ["sangeet", "family_dance", "couple_entry"],
    cultureTags: ["north_indian", "south_indian"],
    languageTags: ["hindi"],
    tags: ["garba", "dance-floor", "singalong"],
    familyFriendly: true,
    bpmRange: "112-120",
  },
  {
    id: "s74",
    title: "Balam Pichkari",
    artist: "Shalmali Kholgade, Vishal Dadlani",
    youtubeVideoId: "lS3JKUV_1dA",
    energyScore: 90,
    dholScore: 58,
    danceability: 92,
    moments: ["sangeet", "afterparty", "family_dance"],
    cultureTags: ["north_indian", "mixed"],
    languageTags: ["hindi"],
    tags: ["hype", "dance-floor", "singalong", "fun"],
    familyFriendly: true,
    bpmRange: "124-132",
  },
  {
    id: "s75",
    title: "Nagada Sang Dhol",
    artist: "Shreya Ghoshal, Osman Mir (Ram-Leela)",
    youtubeVideoId: "QS9wLkAobKA",
    energyScore: 93,
    dholScore: 88,
    danceability: 90,
    moments: ["baraat", "sangeet", "family_dance", "haldi"],
    cultureTags: ["north_indian", "south_indian"],
    languageTags: ["hindi"],
    tags: ["dhol-drop", "bhangra-beat", "singalong", "garba"],
    familyFriendly: true,
    bpmRange: "132-140",
  },
  {
    id: "s76",
    title: "Badri Ki Dulhania",
    artist: "Dev Negi, Monali Thakur",
    youtubeVideoId: "viaHBWMp3zM",
    energyScore: 87,
    dholScore: 60,
    danceability: 88,
    moments: ["bride_entry", "sangeet", "family_dance"],
    cultureTags: ["north_indian"],
    languageTags: ["hindi"],
    tags: ["bride", "dance-floor", "singalong"],
    familyFriendly: true,
    bpmRange: "116-124",
  },
  {
    id: "s77",
    title: "Tattad Tattad",
    artist: "Aakanksha Sharma (Ram-Leela)",
    youtubeVideoId: "KU5h7pnT8Q4",
    energyScore: 91,
    dholScore: 72,
    danceability: 93,
    moments: ["sangeet", "afterparty", "family_dance"],
    cultureTags: ["north_indian"],
    languageTags: ["hindi"],
    tags: ["garba", "hype", "dance-floor"],
    familyFriendly: true,
    bpmRange: "128-136",
  },
  {
    id: "s78",
    title: "Khalibali",
    artist: "Shivam Pathak (Padmaavat)",
    youtubeVideoId: "rqkDMjbPiTk",
    energyScore: 92,
    dholScore: 75,
    danceability: 90,
    moments: ["sangeet", "afterparty", "baraat"],
    cultureTags: ["north_indian"],
    languageTags: ["hindi"],
    tags: ["dhol-drop", "hype", "dance-floor"],
    familyFriendly: true,
    bpmRange: "126-134",
  },
  {
    id: "s79",
    title: "London Thumakda",
    artist: "Labh Janjua, Sonu Kakkar (Queen)",
    youtubeVideoId: "uddJMEC_0dw",
    energyScore: 84,
    dholScore: 55,
    danceability: 86,
    moments: ["sangeet", "family_dance", "afterparty"],
    cultureTags: ["punjabi", "north_indian"],
    languageTags: ["hindi", "punjabi"],
    tags: ["fun", "singalong", "dance-floor"],
    familyFriendly: true,
    bpmRange: "108-116",
  },
  {
    id: "s80",
    title: "Zingaat",
    artist: "Ajay-Atul (Dhadak)",
    youtubeVideoId: "Tit4Cxlhqlg",
    energyScore: 95,
    dholScore: 68,
    danceability: 95,
    moments: ["sangeet", "afterparty", "family_dance"],
    cultureTags: ["north_indian"],
    languageTags: ["hindi"],
    tags: ["hype", "dance-floor", "singalong"],
    familyFriendly: true,
    bpmRange: "136-144",
  },
  {
    id: "s81",
    title: "Ghungroo",
    artist: "Arijit Singh, Shilpa Rao (War)",
    youtubeVideoId: "qFTFMwKJQYk",
    energyScore: 86,
    dholScore: 48,
    danceability: 88,
    moments: ["couple_entry", "sangeet"],
    cultureTags: ["north_indian", "mixed"],
    languageTags: ["hindi"],
    tags: ["dance-floor", "romantic", "couple-friendly"],
    familyFriendly: true,
    bpmRange: "114-122",
  },

  // ─── PUNJABI FOLK / POP ──────────────────────────────────────────────────────
  {
    id: "s82",
    title: "Pasoori",
    artist: "Ali Sethi, Shae Gill (Coke Studio)",
    youtubeVideoId: "YCWWdVtQ7gA",
    energyScore: 74,
    dholScore: 32,
    danceability: 72,
    moments: ["dinner", "nikah", "walima"],
    cultureTags: ["pakistani", "punjabi"],
    languageTags: ["punjabi", "urdu"],
    tags: ["sufi", "romantic", "singalong", "ambient"],
    familyFriendly: true,
    bpmRange: "90-98",
  },
  {
    id: "s83",
    title: "Lamberghini",
    artist: "The Doorbeen ft. Ragini",
    youtubeVideoId: "KYBF7dxFqN8",
    energyScore: 89,
    dholScore: 70,
    danceability: 90,
    moments: ["baraat", "mehndi_groom", "afterparty"],
    cultureTags: ["punjabi"],
    languageTags: ["punjabi"],
    tags: ["bhangra-beat", "hype", "entry-hit"],
    familyFriendly: true,
    bpmRange: "118-126",
  },
  {
    id: "s84",
    title: "Naach Meri Rani",
    artist: "Guru Randhawa ft. Nora Fatehi",
    youtubeVideoId: "x9pCGnRE5nM",
    energyScore: 86,
    dholScore: 52,
    danceability: 88,
    moments: ["sangeet", "family_dance", "afterparty"],
    cultureTags: ["punjabi", "mixed"],
    languageTags: ["hindi", "punjabi"],
    tags: ["dance-floor", "fun", "singalong"],
    familyFriendly: true,
    bpmRange: "112-120",
  },
  {
    id: "s85",
    title: "What Jhumka",
    artist: "Arijit Singh, Jonita Gandhi (Rocky Aur Rani)",
    youtubeVideoId: "2UPJkBBb8qI",
    energyScore: 82,
    dholScore: 58,
    danceability: 85,
    moments: ["sangeet", "family_dance", "mehndi"],
    cultureTags: ["north_indian", "punjabi"],
    languageTags: ["hindi"],
    tags: ["singalong", "fun", "bhangra-beat"],
    familyFriendly: true,
    bpmRange: "108-116",
  },
  {
    id: "s86",
    title: "Ik Vaari Aa",
    artist: "Arijit Singh (Raabta)",
    youtubeVideoId: "N9QSZMtX7WA",
    energyScore: 58,
    dholScore: 15,
    danceability: 55,
    moments: ["first_dance", "dinner", "vidaai"],
    cultureTags: ["north_indian", "punjabi"],
    languageTags: ["hindi", "punjabi"],
    tags: ["romantic", "emotional", "couple-friendly"],
    familyFriendly: true,
    bpmRange: "72-80",
  },

  // ─── PAKISTANI / URDU ────────────────────────────────────────────────────────
  {
    id: "s87",
    title: "Tu Jhoom",
    artist: "Abida Parveen, Naseebo Lal (Coke Studio)",
    youtubeVideoId: "3VBFBiGKoAw",
    energyScore: 68,
    dholScore: 38,
    danceability: 65,
    moments: ["nikah", "walima", "dinner"],
    cultureTags: ["pakistani", "muslim"],
    languageTags: ["urdu"],
    tags: ["sufi", "devotional", "ambient", "singalong"],
    familyFriendly: true,
    bpmRange: "84-92",
  },
  {
    id: "s88",
    title: "Bol Do Na Zara",
    artist: "Armaan Malik, Jonita Gandhi (Azhar)",
    youtubeVideoId: "QFuaJBnH5u8",
    energyScore: 64,
    dholScore: 18,
    danceability: 62,
    moments: ["first_dance", "nikah", "walima"],
    cultureTags: ["pakistani", "north_indian"],
    languageTags: ["urdu", "hindi"],
    tags: ["romantic", "sufi", "couple-friendly"],
    familyFriendly: true,
    bpmRange: "78-86",
  },
  {
    id: "s89",
    title: "Woh Lamhe",
    artist: "Atif Aslam",
    youtubeVideoId: "m69TA0yAoR8",
    energyScore: 62,
    dholScore: 12,
    danceability: 58,
    moments: ["first_dance", "vidaai", "dinner"],
    cultureTags: ["pakistani", "north_indian"],
    languageTags: ["urdu", "hindi"],
    tags: ["romantic", "emotional", "ambient"],
    familyFriendly: true,
    bpmRange: "74-82",
  },
  {
    id: "s90",
    title: "Tajdar-e-Haram",
    artist: "Atif Aslam (Coke Studio)",
    youtubeVideoId: "kqbyf8bbv2A",
    energyScore: 55,
    dholScore: 22,
    danceability: 48,
    moments: ["nikah", "walima", "dinner"],
    cultureTags: ["pakistani", "muslim"],
    languageTags: ["urdu"],
    tags: ["sufi", "devotional", "ambient"],
    familyFriendly: true,
    bpmRange: "65-73",
  },
  {
    id: "s91",
    title: "Dil Diyaan Gallaan",
    artist: "Atif Aslam (Tiger 3)",
    youtubeVideoId: "NP3C63oQBkg",
    energyScore: 66,
    dholScore: 28,
    danceability: 64,
    moments: ["dinner", "first_dance", "vidaai"],
    cultureTags: ["pakistani", "punjabi"],
    languageTags: ["punjabi", "urdu"],
    tags: ["romantic", "emotional", "couple-friendly"],
    familyFriendly: true,
    bpmRange: "82-90",
  },

  // ─── SOUTH INDIAN ───────────────────────────────────────────────────────────
  {
    id: "s92",
    title: "Arabic Kuthu",
    artist: "Anirudh Ravichander, Jonita Gandhi (Beast)",
    youtubeVideoId: "ZVFTy4URmKs",
    energyScore: 94,
    dholScore: 62,
    danceability: 95,
    moments: ["afterparty", "sangeet", "family_dance"],
    cultureTags: ["south_indian"],
    languageTags: ["tamil"],
    tags: ["hype", "dance-floor", "singalong"],
    familyFriendly: true,
    bpmRange: "130-138",
  },
  {
    id: "s93",
    title: "Rowdy Baby",
    artist: "Dhanush, Dhee (Maari 2)",
    youtubeVideoId: "o6MnCfBSGqQ",
    energyScore: 90,
    dholScore: 68,
    danceability: 92,
    moments: ["sangeet", "family_dance", "afterparty"],
    cultureTags: ["south_indian"],
    languageTags: ["tamil"],
    tags: ["bhangra-beat", "dance-floor", "singalong"],
    familyFriendly: true,
    bpmRange: "120-128",
  },
  {
    id: "s94",
    title: "Butta Bomma",
    artist: "Armaan Malik (Ala Vaikunthapurramuloo)",
    youtubeVideoId: "0G_6sNs2_c8",
    energyScore: 78,
    dholScore: 42,
    danceability: 80,
    moments: ["sangeet", "couple_entry", "family_dance"],
    cultureTags: ["south_indian"],
    languageTags: ["telugu"],
    tags: ["romantic", "fun", "singalong"],
    familyFriendly: true,
    bpmRange: "100-108",
  },
  {
    id: "s95",
    title: "Vaathi Coming",
    artist: "Anirudh Ravichander (Master)",
    youtubeVideoId: "b4JlpHm5jps",
    energyScore: 95,
    dholScore: 72,
    danceability: 94,
    moments: ["afterparty", "baraat", "mehndi_groom"],
    cultureTags: ["south_indian"],
    languageTags: ["tamil"],
    tags: ["hype", "entry-hit", "dance-floor"],
    familyFriendly: true,
    bpmRange: "132-140",
  },
  {
    id: "s96",
    title: "Srivalli",
    artist: "Sid Sriram (Pushpa)",
    youtubeVideoId: "OHlUEPuOJAI",
    energyScore: 72,
    dholScore: 35,
    danceability: 70,
    moments: ["sangeet", "dinner", "nikah"],
    cultureTags: ["south_indian"],
    languageTags: ["telugu"],
    tags: ["romantic", "sufi", "singalong"],
    familyFriendly: true,
    bpmRange: "88-96",
  },

  // ─── ENGLISH / WESTERN ──────────────────────────────────────────────────────
  {
    id: "s97",
    title: "Marry Me",
    artist: "Train",
    youtubeVideoId: "WoJdoEpIGuc",
    energyScore: 55,
    dholScore: 0,
    danceability: 50,
    moments: ["first_dance", "bride_entry", "nikah", "ceremony", "signing", "guest_arrival"],
    cultureTags: ["norwegian", "mixed"],
    languageTags: ["english"],
    tags: ["romantic", "classic", "couple-friendly"],
    familyFriendly: true,
    bpmRange: "80-88",
  },
  {
    id: "s98",
    title: "Can't Help Falling in Love",
    artist: "Elvis Presley",
    youtubeVideoId: "vGJTaP6anOU",
    energyScore: 48,
    dholScore: 0,
    danceability: 44,
    moments: ["first_dance", "dinner", "vidaai", "ceremony", "wedding_march", "signing"],
    cultureTags: ["norwegian", "mixed"],
    languageTags: ["english"],
    tags: ["classic", "romantic", "couple-friendly", "ambient"],
    familyFriendly: true,
    bpmRange: "65-72",
  },
  {
    id: "s99",
    title: "Better Together",
    artist: "Jack Johnson",
    youtubeVideoId: "u57d4_b_YgI",
    energyScore: 52,
    dholScore: 0,
    danceability: 50,
    moments: ["dinner", "first_dance", "cocktail_hour", "signing"],
    cultureTags: ["norwegian", "mixed"],
    languageTags: ["english"],
    tags: ["ambient", "romantic", "couple-friendly"],
    familyFriendly: true,
    bpmRange: "105-112",
  },
  {
    id: "s100",
    title: "Blinding Lights",
    artist: "The Weeknd",
    youtubeVideoId: "4NRXx6U8ABQ",
    energyScore: 88,
    dholScore: 0,
    danceability: 88,
    moments: ["afterparty", "couple_entry", "cake_cutting"],
    cultureTags: ["norwegian", "mixed"],
    languageTags: ["english"],
    tags: ["dance-floor", "hype", "singalong"],
    familyFriendly: true,
    bpmRange: "171-178",
  },
  {
    id: "s101",
    title: "Shape of You",
    artist: "Ed Sheeran",
    youtubeVideoId: "JGwWNGJdvx8",
    energyScore: 82,
    dholScore: 0,
    danceability: 83,
    moments: ["afterparty", "first_dance", "cake_cutting", "family_dance"],
    cultureTags: ["norwegian", "mixed"],
    languageTags: ["english"],
    tags: ["singalong", "dance-floor", "fun"],
    familyFriendly: true,
    bpmRange: "96-104",
  },

  // ─── WESTERN / CEREMONY ─────────────────────────────────────────────────────
  {
    id: "s102",
    title: "Canon in D",
    artist: "Pachelbel",
    youtubeVideoId: "Qv_sE4VJpnY",
    energyScore: 32,
    dholScore: 0,
    danceability: 28,
    moments: ["guest_arrival", "ceremony", "wedding_march", "signing"],
    cultureTags: ["mixed", "norwegian", "british", "american", "irish", "greek", "italian", "australian"],
    languageTags: [],
    tags: ["classical", "processional", "elegant", "instrumental"],
    familyFriendly: true,
    bpmRange: "68-72",
  },
  {
    id: "s103",
    title: "A Thousand Years",
    artist: "Christina Perri",
    youtubeVideoId: "rtOvBOTyX00",
    energyScore: 42,
    dholScore: 0,
    danceability: 36,
    moments: ["wedding_march", "ceremony", "signing", "first_dance", "bride_entry"],
    cultureTags: ["mixed", "norwegian", "british", "american", "australian", "irish"],
    languageTags: ["english"],
    tags: ["romantic", "emotional", "ballad", "processional"],
    familyFriendly: true,
    bpmRange: "68-76",
  },
  {
    id: "s104",
    title: "Ave Maria",
    artist: "Franz Schubert",
    youtubeVideoId: "lDhW_lhGNDM",
    energyScore: 28,
    dholScore: 0,
    danceability: 22,
    moments: ["ceremony", "signing", "guest_arrival"],
    cultureTags: ["mixed", "italian", "greek", "irish", "norwegian", "british", "american"],
    languageTags: ["latin"],
    tags: ["classical", "sacred", "elegant", "instrumental"],
    familyFriendly: true,
    bpmRange: "52-60",
  },
  {
    id: "s105",
    title: "All of Me",
    artist: "John Legend",
    youtubeVideoId: "450p7goxZqg",
    energyScore: 45,
    dholScore: 0,
    danceability: 42,
    moments: ["first_dance", "ceremony", "signing", "dinner"],
    cultureTags: ["mixed", "american", "british", "australian", "norwegian"],
    languageTags: ["english"],
    tags: ["romantic", "soul", "ballad", "modern"],
    familyFriendly: true,
    bpmRange: "60-68",
  },
  {
    id: "s106",
    title: "At Last",
    artist: "Etta James",
    youtubeVideoId: "LMlGNNe0Iy4",
    energyScore: 44,
    dholScore: 0,
    danceability: 42,
    moments: ["first_dance", "ceremony", "guest_arrival", "dinner"],
    cultureTags: ["mixed", "american", "british", "australian", "irish"],
    languageTags: ["english"],
    tags: ["classic", "soul", "jazz", "romantic"],
    familyFriendly: true,
    bpmRange: "60-68",
  },

  // ─── WESTERN / COCKTAIL + DINNER ────────────────────────────────────────────
  {
    id: "s107",
    title: "Fly Me to the Moon",
    artist: "Frank Sinatra",
    youtubeVideoId: "ZEcqHA7dbwM",
    energyScore: 48,
    dholScore: 0,
    danceability: 62,
    moments: ["cocktail_hour", "dinner", "guest_arrival"],
    cultureTags: ["mixed", "american", "british", "australian", "irish", "italian"],
    languageTags: ["english"],
    tags: ["jazz", "classic", "swing", "lounge"],
    familyFriendly: true,
    bpmRange: "124-132",
  },
  {
    id: "s108",
    title: "The Way You Look Tonight",
    artist: "Frank Sinatra",
    youtubeVideoId: "L-mR9lRtOns",
    energyScore: 45,
    dholScore: 0,
    danceability: 55,
    moments: ["cocktail_hour", "first_dance", "dinner", "signing"],
    cultureTags: ["mixed", "american", "british", "australian", "irish"],
    languageTags: ["english"],
    tags: ["jazz", "classic", "swing", "romantic", "lounge"],
    familyFriendly: true,
    bpmRange: "88-96",
  },
  {
    id: "s109",
    title: "Feeling Good",
    artist: "Nina Simone",
    youtubeVideoId: "Edwsf-8F3sI",
    energyScore: 55,
    dholScore: 0,
    danceability: 52,
    moments: ["cocktail_hour", "couple_entry", "ceremony"],
    cultureTags: ["mixed", "american", "british", "australian"],
    languageTags: ["english"],
    tags: ["jazz", "soul", "classic", "powerful"],
    familyFriendly: true,
    bpmRange: "68-76",
  },
  {
    id: "s110",
    title: "La Vie En Rose",
    artist: "Édith Piaf",
    youtubeVideoId: "U2BwKMBnTHI",
    energyScore: 35,
    dholScore: 0,
    danceability: 32,
    moments: ["dinner", "cocktail_hour", "ceremony", "signing"],
    cultureTags: ["mixed", "italian", "greek", "british", "american"],
    languageTags: ["french"],
    tags: ["french", "classic", "romantic", "chanson", "elegant"],
    familyFriendly: true,
    bpmRange: "60-68",
  },
  {
    id: "s111",
    title: "Moon River",
    artist: "Audrey Hepburn",
    youtubeVideoId: "Sk8QKBbAMBc",
    energyScore: 28,
    dholScore: 0,
    danceability: 25,
    moments: ["guest_arrival", "dinner", "signing", "ceremony"],
    cultureTags: ["mixed", "american", "british", "australian", "irish"],
    languageTags: ["english"],
    tags: ["classic", "romantic", "gentle", "elegant", "lounge"],
    familyFriendly: true,
    bpmRange: "62-70",
  },

  // ─── WESTERN / TOAST + SPEECHES ─────────────────────────────────────────────
  {
    id: "s112",
    title: "What a Wonderful World",
    artist: "Louis Armstrong",
    youtubeVideoId: "VqhCQZaH4Vs",
    energyScore: 30,
    dholScore: 0,
    danceability: 28,
    moments: ["toast_speeches", "dinner", "ceremony", "signing"],
    cultureTags: ["mixed", "american", "british", "australian", "norwegian", "irish"],
    languageTags: ["english"],
    tags: ["classic", "jazz", "heartfelt", "emotional"],
    familyFriendly: true,
    bpmRange: "65-72",
  },
  {
    id: "s113",
    title: "Stand By Me",
    artist: "Ben E. King",
    youtubeVideoId: "hwZNL32ni_A",
    energyScore: 45,
    dholScore: 0,
    danceability: 50,
    moments: ["toast_speeches", "dinner", "signing", "cocktail_hour"],
    cultureTags: ["mixed", "american", "british", "australian", "norwegian", "irish"],
    languageTags: ["english"],
    tags: ["classic", "soul", "romantic", "timeless"],
    familyFriendly: true,
    bpmRange: "118-126",
  },
  {
    id: "s114",
    title: "Isn't She Lovely",
    artist: "Stevie Wonder",
    youtubeVideoId: "lmjnVFxH6j8",
    energyScore: 68,
    dholScore: 0,
    danceability: 70,
    moments: ["guest_arrival", "cake_cutting", "toast_speeches"],
    cultureTags: ["mixed", "american", "british", "australian"],
    languageTags: ["english"],
    tags: ["classic", "soul", "fun", "romantic"],
    familyFriendly: true,
    bpmRange: "100-108",
  },

  // ─── WESTERN / CAKE + FAMILY DANCE + AFTERPARTY ─────────────────────────────
  {
    id: "s115",
    title: "Dancing Queen",
    artist: "ABBA",
    youtubeVideoId: "xFrGuyw1V8s",
    energyScore: 82,
    dholScore: 0,
    danceability: 88,
    moments: ["family_dance", "afterparty", "cake_cutting"],
    cultureTags: ["mixed", "norwegian", "british", "american", "australian", "irish"],
    languageTags: ["english"],
    tags: ["disco", "classic", "fun", "dance-floor", "pop"],
    familyFriendly: true,
    bpmRange: "98-106",
  },
  {
    id: "s116",
    title: "September",
    artist: "Earth, Wind & Fire",
    youtubeVideoId: "Gs069dndIYk",
    energyScore: 88,
    dholScore: 5,
    danceability: 90,
    moments: ["afterparty", "family_dance", "couple_entry", "cake_cutting"],
    cultureTags: ["mixed", "american", "british", "australian", "afro_caribbean", "nigerian", "ghanaian"],
    languageTags: ["english"],
    tags: ["disco", "funk", "classic", "dance-floor", "feel-good"],
    familyFriendly: true,
    bpmRange: "124-130",
  },
  {
    id: "s117",
    title: "Don't Stop Me Now",
    artist: "Queen",
    youtubeVideoId: "HgzGwKwLmgM",
    energyScore: 92,
    dholScore: 0,
    danceability: 88,
    moments: ["afterparty", "family_dance", "cake_cutting"],
    cultureTags: ["mixed", "british", "american", "australian", "norwegian", "irish"],
    languageTags: ["english"],
    tags: ["rock", "classic", "fun", "high-energy", "crowd-pleaser"],
    familyFriendly: true,
    bpmRange: "154-160",
  },
  {
    id: "s118",
    title: "Sweet Caroline",
    artist: "Neil Diamond",
    youtubeVideoId: "8jAl5GDuBHk",
    energyScore: 72,
    dholScore: 0,
    danceability: 72,
    moments: ["family_dance", "toast_speeches", "afterparty", "cocktail_hour"],
    cultureTags: ["mixed", "american", "british", "australian", "irish", "norwegian"],
    languageTags: ["english"],
    tags: ["classic", "singalong", "crowd-pleaser", "fun"],
    familyFriendly: true,
    bpmRange: "122-128",
  },
  {
    id: "s119",
    title: "Happy",
    artist: "Pharrell Williams",
    youtubeVideoId: "ZbZSe6N_BXs",
    energyScore: 80,
    dholScore: 0,
    danceability: 88,
    moments: ["afterparty", "cocktail_hour", "cake_cutting", "family_dance"],
    cultureTags: ["mixed", "american", "british", "australian", "norwegian"],
    languageTags: ["english"],
    tags: ["pop", "feel-good", "modern", "dance", "fun"],
    familyFriendly: true,
    bpmRange: "158-164",
  },
  {
    id: "s120",
    title: "Sugar",
    artist: "Maroon 5",
    youtubeVideoId: "09R8_2nJtjg",
    energyScore: 75,
    dholScore: 0,
    danceability: 80,
    moments: ["cake_cutting", "cocktail_hour", "afterparty"],
    cultureTags: ["mixed", "american", "british", "australian", "norwegian"],
    languageTags: ["english"],
    tags: ["pop", "modern", "fun", "dance"],
    familyFriendly: true,
    bpmRange: "118-126",
  },
  {
    id: "s121",
    title: "Marry You",
    artist: "Bruno Mars",
    youtubeVideoId: "_Er6lfY2dME",
    energyScore: 72,
    dholScore: 0,
    danceability: 80,
    moments: ["couple_entry", "cake_cutting", "family_dance", "cocktail_hour"],
    cultureTags: ["mixed", "american", "british", "australian", "norwegian"],
    languageTags: ["english"],
    tags: ["pop", "fun", "romantic", "modern", "upbeat"],
    familyFriendly: true,
    bpmRange: "142-150",
  },
  {
    id: "s122",
    title: "Uptown Funk",
    artist: "Mark Ronson ft. Bruno Mars",
    youtubeVideoId: "OPf0YbXqDm0",
    energyScore: 90,
    dholScore: 5,
    danceability: 90,
    moments: ["afterparty", "couple_entry", "family_dance"],
    cultureTags: ["mixed", "american", "british", "australian", "norwegian"],
    languageTags: ["english"],
    tags: ["funk", "modern", "dance-floor", "hype", "pop"],
    familyFriendly: true,
    bpmRange: "113-119",
  },

  // ─── NORWEGIAN / SCANDINAVIAN ────────────────────────────────────────────────
  {
    id: "s123",
    title: "Firestone",
    artist: "Kygo ft. Conrad Sewell",
    youtubeVideoId: "9WJ4L9QM538",
    energyScore: 62,
    dholScore: 0,
    danceability: 68,
    moments: ["first_dance", "cocktail_hour", "signing", "dinner"],
    cultureTags: ["norwegian", "mixed"],
    languageTags: ["english"],
    tags: ["EDM", "chill", "romantic", "Norwegian", "modern"],
    familyFriendly: true,
    bpmRange: "98-106",
  },
  {
    id: "s124",
    title: "Stole the Show",
    artist: "Kygo ft. Parson James",
    youtubeVideoId: "xoFQzfn1Oe4",
    energyScore: 55,
    dholScore: 0,
    danceability: 60,
    moments: ["first_dance", "signing", "dinner", "ceremony"],
    cultureTags: ["norwegian", "mixed"],
    languageTags: ["english"],
    tags: ["EDM", "romantic", "emotional", "Norwegian", "pop"],
    familyFriendly: true,
    bpmRange: "96-104",
  },
  {
    id: "s125",
    title: "Higher Love",
    artist: "Kygo ft. Whitney Houston",
    youtubeVideoId: "9X_ViIPA-Gc",
    energyScore: 82,
    dholScore: 0,
    danceability: 82,
    moments: ["couple_entry", "family_dance", "afterparty", "cake_cutting"],
    cultureTags: ["norwegian", "mixed"],
    languageTags: ["english"],
    tags: ["EDM", "dance", "Norwegian", "upbeat", "feel-good"],
    familyFriendly: true,
    bpmRange: "122-128",
  },

  // ─── IRISH / CELTIC ──────────────────────────────────────────────────────────
  {
    id: "s126",
    title: "Galway Girl",
    artist: "Ed Sheeran",
    youtubeVideoId: "p5hNtLRhRX4",
    energyScore: 82,
    dholScore: 0,
    danceability: 88,
    moments: ["family_dance", "afterparty", "cocktail_hour"],
    cultureTags: ["irish", "british", "mixed"],
    languageTags: ["english"],
    tags: ["folk", "irish", "fun", "modern", "upbeat"],
    familyFriendly: true,
    bpmRange: "122-130",
  },

  // ─── JEWISH ──────────────────────────────────────────────────────────────────
  {
    id: "s127",
    title: "Hava Nagila",
    artist: "Traditional",
    youtubeVideoId: "H6-IKjCHvrE",
    energyScore: 82,
    dholScore: 15,
    danceability: 90,
    moments: ["family_dance", "couple_entry", "afterparty"],
    cultureTags: ["jewish"],
    languageTags: ["hebrew"],
    tags: ["traditional", "jewish", "hora", "folk", "circle-dance"],
    familyFriendly: true,
    bpmRange: "120-145",
  },

  // ─── GREEK ───────────────────────────────────────────────────────────────────
  {
    id: "s128",
    title: "Zorba the Greek",
    artist: "Mikis Theodorakis",
    youtubeVideoId: "aeY_5hKWpwE",
    energyScore: 85,
    dholScore: 20,
    danceability: 88,
    moments: ["family_dance", "afterparty", "couple_entry"],
    cultureTags: ["greek"],
    languageTags: [],
    tags: ["greek", "traditional", "folk", "dance", "instrumental"],
    familyFriendly: true,
    bpmRange: "80-160",
  },

  // ─── ITALIAN ─────────────────────────────────────────────────────────────────
  {
    id: "s129",
    title: "Volare",
    artist: "Dean Martin",
    youtubeVideoId: "fy2dFM_vbME",
    energyScore: 70,
    dholScore: 0,
    danceability: 78,
    moments: ["dinner", "cocktail_hour", "family_dance"],
    cultureTags: ["italian", "mixed"],
    languageTags: ["italian", "english"],
    tags: ["italian", "classic", "fun", "swing", "lounge"],
    familyFriendly: true,
    bpmRange: "128-136",
  },

  // ─── CHINESE ─────────────────────────────────────────────────────────────────
  {
    id: "s130",
    title: "月亮代表我的心",
    artist: "Teresa Teng",
    youtubeVideoId: "R3WaO6UJL0I",
    energyScore: 32,
    dholScore: 0,
    danceability: 30,
    moments: ["first_dance", "dinner", "signing", "ceremony"],
    cultureTags: ["chinese", "korean"],
    languageTags: ["mandarin"],
    tags: ["chinese", "classic", "romantic", "ballad"],
    familyFriendly: true,
    bpmRange: "62-70",
  },

  // ─── AFRO-CARIBBEAN / NIGERIAN ───────────────────────────────────────────────
  {
    id: "s131",
    title: "One Love",
    artist: "Bob Marley",
    youtubeVideoId: "Yhj4fexk0VI",
    energyScore: 62,
    dholScore: 8,
    danceability: 68,
    moments: ["toast_speeches", "cocktail_hour", "afterparty", "dinner"],
    cultureTags: ["caribbean", "afro_caribbean", "nigerian", "ghanaian", "mixed"],
    languageTags: ["english"],
    tags: ["reggae", "caribbean", "feel-good", "classic"],
    familyFriendly: true,
    bpmRange: "76-84",
  },
  {
    id: "s132",
    title: "Ojuelegba",
    artist: "Wizkid",
    youtubeVideoId: "GCiZEdJYqrk",
    energyScore: 70,
    dholScore: 10,
    danceability: 78,
    moments: ["family_dance", "couple_entry", "afterparty"],
    cultureTags: ["nigerian", "ghanaian", "afro_caribbean"],
    languageTags: ["english", "yoruba"],
    tags: ["afrobeats", "Nigerian", "modern", "dance"],
    familyFriendly: true,
    bpmRange: "96-104",
  },

  // ─── ARABIC / MIDDLE EASTERN ────────────────────────────────────────────────
  {
    id: "s133",
    title: "Inta Omri",
    artist: "Umm Kulthum",
    youtubeVideoId: "vaBCKxSLKSs",
    energyScore: 40,
    dholScore: 12,
    danceability: 38,
    moments: ["dinner", "ceremony", "signing", "cocktail_hour"],
    cultureTags: ["arabic", "moroccan", "persian", "turkish"],
    languageTags: ["arabic"],
    tags: ["arabic", "classic", "elegant", "romantic", "Middle Eastern"],
    familyFriendly: true,
    bpmRange: "60-80",
  },

  // ─── ARABIC / MIDDLE EASTERN ──────────────────────────────────────────────
  { id:"s134", title:"Nour El Ein",           artist:"Amr Diab",                  youtubeVideoId:"qLkIz1tN5gM", energyScore:88, dholScore:20, danceability:90, moments:["family_dance","cocktail_hour","guest_arrival"], cultureTags:["arabic","moroccan"],         languageTags:["arabic"],          tags:["arabic-pop","wedding-classic","dance"],         familyFriendly:true,  bpmRange:"120-130" },
  { id:"s135", title:"Tamally Maak",          artist:"Amr Diab",                  youtubeVideoId:"BxbqKScFqxI", energyScore:70, dholScore:10, danceability:75, moments:["first_dance","dinner","guest_arrival"],          cultureTags:["arabic"],                    languageTags:["arabic"],          tags:["arabic-pop","romantic","wedding"],              familyFriendly:true,  bpmRange:"80-95"  },
  { id:"s136", title:"Awedoony",              artist:"Amr Diab",                  youtubeVideoId:"LLZ1RiSNt8s", energyScore:82, dholScore:15, danceability:84, moments:["family_dance","cocktail_hour"],                  cultureTags:["arabic"],                    languageTags:["arabic"],          tags:["arabic-pop","dance","festive"],                 familyFriendly:true,  bpmRange:"105-115"},
  { id:"s137", title:"Ah W Noss",             artist:"Nancy Ajram",               youtubeVideoId:"1dAkrAi1j-c", energyScore:85, dholScore:25, danceability:88, moments:["family_dance","cocktail_hour","afterparty"],      cultureTags:["arabic","moroccan"],         languageTags:["arabic"],          tags:["arabic-pop","dance","festive","crowd-pleaser"],  familyFriendly:true,  bpmRange:"110-125"},
  { id:"s138", title:"Shakhbat Shakhabit",    artist:"Nancy Ajram",               youtubeVideoId:"MoiTlqHNqaM", energyScore:90, dholScore:30, danceability:92, moments:["family_dance","afterparty"],                      cultureTags:["arabic"],                    languageTags:["arabic"],          tags:["arabic-pop","high-energy","dance"],             familyFriendly:true,  bpmRange:"115-130"},
  { id:"s139", title:"Lawn Einy",             artist:"Nancy Ajram",               youtubeVideoId:"5Hcnp3jsFzw", energyScore:68, dholScore:10, danceability:70, moments:["first_dance","dinner"],                           cultureTags:["arabic"],                    languageTags:["arabic"],          tags:["romantic","soft","arabic-pop"],                 familyFriendly:true,  bpmRange:"75-90"  },
  { id:"s140", title:"Nassam Alayna El Hawa", artist:"Fairuz",                    youtubeVideoId:"Pib62D-AobY", energyScore:55, dholScore:5,  danceability:50, moments:["guest_arrival","dinner","nikkah_ceremony"],       cultureTags:["arabic","moroccan","persian"],languageTags:["arabic"],          tags:["classic","traditional","ceremony","timeless"],  familyFriendly:true,  bpmRange:"65-80"  },
  { id:"s141", title:"Bhebbak",               artist:"Fairuz",                    youtubeVideoId:"9xPJ3BXVT5Y", energyScore:50, dholScore:5,  danceability:45, moments:["dinner","first_dance","nikkah_ceremony"],         cultureTags:["arabic"],                    languageTags:["arabic"],          tags:["classic","romantic","traditional"],             familyFriendly:true,  bpmRange:"60-75"  },
  { id:"s142", title:"LM3ALLEM",              artist:"Saad Lamjarred",            youtubeVideoId:"knBfmFB6JBo", energyScore:95, dholScore:30, danceability:97, moments:["family_dance","afterparty","cocktail_hour"],      cultureTags:["arabic","moroccan"],         languageTags:["arabic","french"], tags:["arabic-pop","banger","dance-floor","hype"],     familyFriendly:true,  bpmRange:"120-135"},
  { id:"s143", title:"Ghazali",               artist:"Saad Lamjarred",            youtubeVideoId:"SBiuTHe-6sc", energyScore:88, dholScore:20, danceability:90, moments:["family_dance","cocktail_hour"],                  cultureTags:["arabic","moroccan"],         languageTags:["arabic"],          tags:["arabic-pop","dance","festive"],                 familyFriendly:true,  bpmRange:"115-125"},
  { id:"s144", title:"Mal Hbibi Malou",       artist:"Saad Lamjarred",            youtubeVideoId:"rjXa3CXQX3g", energyScore:85, dholScore:20, danceability:87, moments:["family_dance","afterparty"],                      cultureTags:["arabic","moroccan"],         languageTags:["arabic"],          tags:["arabic-pop","dance","modern"],                  familyFriendly:true,  bpmRange:"110-122"},
  { id:"s145", title:"Didi",                  artist:"Cheb Khaled",               youtubeVideoId:"T9b4T5QIXRE", energyScore:92, dholScore:25, danceability:94, moments:["family_dance","afterparty","cocktail_hour"],      cultureTags:["arabic","moroccan"],         languageTags:["arabic","french"], tags:["rai","dance","classic","crowd-pleaser"],        familyFriendly:true,  bpmRange:"125-135"},
  { id:"s146", title:"Aicha",                 artist:"Cheb Khaled",               youtubeVideoId:"2mvl7vu0JI0", energyScore:72, dholScore:15, danceability:74, moments:["first_dance","dinner","guest_arrival"],           cultureTags:["arabic","moroccan"],         languageTags:["arabic","french"], tags:["rai","romantic","classic"],                    familyFriendly:true,  bpmRange:"90-105" },
  { id:"s147", title:"C'est La Vie",          artist:"Cheb Khaled",               youtubeVideoId:"BuQBuBqQKWE", energyScore:86, dholScore:20, danceability:88, moments:["family_dance","cocktail_hour"],                  cultureTags:["arabic","moroccan"],         languageTags:["arabic","french"], tags:["rai","festive","dance"],                        familyFriendly:true,  bpmRange:"110-120"},
  { id:"s148", title:"For the Rest of My Life",artist:"Maher Zain",               youtubeVideoId:"mz9yDRdMGhI", energyScore:65, dholScore:5,  danceability:60, moments:["first_dance","nikkah_ceremony","dinner"],         cultureTags:["arabic","muslim","turkish","persian"], languageTags:["english"], tags:["nasheed","wedding","romantic","spiritual"],   familyFriendly:true,  bpmRange:"75-85"  },
  { id:"s149", title:"Insha Allah",           artist:"Maher Zain",                youtubeVideoId:"pClhR2gHa0s", energyScore:60, dholScore:5,  danceability:55, moments:["quran_recitation","nikkah_ceremony","guest_arrival"], cultureTags:["arabic","muslim","turkish","persian","punjabi","pakistani"], languageTags:["english","arabic"], tags:["nasheed","spiritual","ceremony"],          familyFriendly:true,  bpmRange:"70-80"  },
  { id:"s150", title:"Ya Nabi Salam Alayka",  artist:"Maher Zain",                youtubeVideoId:"RBzFPhkIzNk", energyScore:58, dholScore:5,  danceability:50, moments:["quran_recitation","nikkah_ceremony"],              cultureTags:["arabic","muslim","persian","pakistani"], languageTags:["arabic"], tags:["nasheed","spiritual","nikkah","ceremony"],   familyFriendly:true,  bpmRange:"65-78"  },
  { id:"s151", title:"Al Mu'allim",           artist:"Sami Yusuf",                youtubeVideoId:"W_3aFHWnDKI", energyScore:70, dholScore:10, danceability:65, moments:["quran_recitation","nikkah_ceremony","guest_arrival"], cultureTags:["arabic","muslim","turkish","persian","punjabi"], languageTags:["arabic","english"], tags:["nasheed","spiritual","wedding"],           familyFriendly:true,  bpmRange:"75-90"  },
  { id:"s152", title:"Ya Lili",               artist:"Balti ft. Haifa Wehbe",     youtubeVideoId:"L3u_aM_AeHc", energyScore:90, dholScore:20, danceability:93, moments:["family_dance","afterparty","cocktail_hour"],      cultureTags:["arabic","moroccan"],         languageTags:["arabic"],          tags:["arabic-pop","dance","banger","hype"],           familyFriendly:true,  bpmRange:"118-128"},
  { id:"s153", title:"Habibi Ana",            artist:"Haifa Wehbe",               youtubeVideoId:"FbKbMiSqGAg", energyScore:80, dholScore:15, danceability:82, moments:["family_dance","cocktail_hour","first_dance"],     cultureTags:["arabic"],                    languageTags:["arabic"],          tags:["arabic-pop","dance","romantic"],                familyFriendly:true,  bpmRange:"100-112"},
  { id:"s154", title:"Mosh Adra Aboad",       artist:"Ramy Sabry",                youtubeVideoId:"Tb5eKzpfJnI", energyScore:68, dholScore:10, danceability:70, moments:["first_dance","dinner","rukhsati"],                 cultureTags:["arabic"],                    languageTags:["arabic"],          tags:["romantic","ballad","egyptian-pop"],             familyFriendly:true,  bpmRange:"80-95"  },
  { id:"s155", title:"Law Bayny W Baynak",    artist:"Ramy Sabry",                youtubeVideoId:"nL5Cxbcjj4w", energyScore:72, dholScore:12, danceability:74, moments:["cocktail_hour","dinner","first_dance"],            cultureTags:["arabic"],                    languageTags:["arabic"],          tags:["romantic","arabic-pop","wedding"],              familyFriendly:true,  bpmRange:"88-100" },
  { id:"s156", title:"Yelomo",                artist:"Mohamed Hamaki",             youtubeVideoId:"Ky-HfNxL6SI", energyScore:84, dholScore:18, danceability:86, moments:["family_dance","cocktail_hour"],                  cultureTags:["arabic"],                    languageTags:["arabic"],          tags:["arabic-pop","dance","festive"],                 familyFriendly:true,  bpmRange:"105-118"},
  { id:"s157", title:"Bahebak",               artist:"Tamer Hosny",               youtubeVideoId:"kKBmFQaHWes", energyScore:70, dholScore:12, danceability:72, moments:["first_dance","dinner","rukhsati"],                 cultureTags:["arabic"],                    languageTags:["arabic"],          tags:["romantic","arabic-pop","wedding"],              familyFriendly:true,  bpmRange:"85-98"  },
  { id:"s158", title:"Ana Masry",             artist:"Sherine",                   youtubeVideoId:"3bY3XANXI4w", energyScore:78, dholScore:15, danceability:80, moments:["family_dance","cocktail_hour","guest_arrival"],   cultureTags:["arabic"],                    languageTags:["arabic"],          tags:["arabic-pop","festive","patriotic"],             familyFriendly:true,  bpmRange:"100-112"},
  { id:"s159", title:"Ana Gheir",             artist:"Ragheb Alama",              youtubeVideoId:"e2AZMgI5PIg", energyScore:82, dholScore:18, danceability:84, moments:["family_dance","cocktail_hour"],                  cultureTags:["arabic"],                    languageTags:["arabic"],          tags:["arabic-pop","lebanese","dance"],                familyFriendly:true,  bpmRange:"105-118"},
  { id:"s160", title:"Nassini El Dounya",     artist:"Nassif Zeytoun",            youtubeVideoId:"7FQrmosG5Gw", energyScore:74, dholScore:12, danceability:76, moments:["first_dance","dinner","cocktail_hour"],            cultureTags:["arabic"],                    languageTags:["arabic"],          tags:["lebanese-pop","romantic","wedding"],            familyFriendly:true,  bpmRange:"92-105" },
  { id:"s161", title:"Matigi Hena",           artist:"Ragheb Alama",              youtubeVideoId:"jQ1qqBJSgRY", energyScore:86, dholScore:20, danceability:88, moments:["family_dance","afterparty"],                      cultureTags:["arabic"],                    languageTags:["arabic"],          tags:["arabic-pop","dance","lebanese"],                familyFriendly:true,  bpmRange:"110-122"},
  { id:"s162", title:"Ahla W Ahla",           artist:"Julia Boutros",             youtubeVideoId:"U7-Q_T9awTg", energyScore:80, dholScore:15, danceability:78, moments:["family_dance","cocktail_hour","guest_arrival"],   cultureTags:["arabic"],                    languageTags:["arabic"],          tags:["lebanese","festive","wedding","classic"],       familyFriendly:true,  bpmRange:"100-115"},
  { id:"s163", title:"Ya Habayeb",            artist:"Majid Al Muhandis",         youtubeVideoId:"x3C1r1HoW2A", energyScore:72, dholScore:10, danceability:70, moments:["dinner","first_dance","guest_arrival"],           cultureTags:["arabic"],                    languageTags:["arabic"],          tags:["gulf","romantic","classic"],                   familyFriendly:true,  bpmRange:"85-98"  },
  { id:"s164", title:"Galbak Tayeb",          artist:"Abdul Majeed Abdullah",     youtubeVideoId:"isTj3GaBiAU", energyScore:65, dholScore:8,  danceability:62, moments:["dinner","first_dance","rukhsati"],                 cultureTags:["arabic"],                    languageTags:["arabic"],          tags:["gulf","romantic","traditional"],                familyFriendly:true,  bpmRange:"75-88"  },
  { id:"s165", title:"Habibti",               artist:"Shatha Hassoun",            youtubeVideoId:"Qw3hk8rUHfg", energyScore:70, dholScore:12, danceability:72, moments:["first_dance","dinner","cocktail_hour"],            cultureTags:["arabic"],                    languageTags:["arabic"],          tags:["arabic-pop","romantic","iraqi"],                familyFriendly:true,  bpmRange:"88-100" },
  { id:"s166", title:"Rani Rani",             artist:"DYSTINCT",                  youtubeVideoId:"BNIqnLahJW0", energyScore:92, dholScore:25, danceability:94, moments:["family_dance","afterparty"],                      cultureTags:["arabic","moroccan"],         languageTags:["arabic","french"], tags:["moroccan-trap","hype","modern","dance"],        familyFriendly:true,  bpmRange:"120-132"},
  { id:"s167", title:"Sofia",                 artist:"Saad Lamjarred",            youtubeVideoId:"n6gFMoC3X-E", energyScore:88, dholScore:22, danceability:90, moments:["family_dance","afterparty","cocktail_hour"],      cultureTags:["arabic","moroccan"],         languageTags:["arabic"],          tags:["arabic-pop","dance","modern"],                  familyFriendly:true,  bpmRange:"114-124"},
  { id:"s168", title:"Meen Dah Elly Nasak",   artist:"Amr Diab",                  youtubeVideoId:"PXRuVNVxaHs", energyScore:78, dholScore:15, danceability:80, moments:["cocktail_hour","family_dance"],                   cultureTags:["arabic"],                    languageTags:["arabic"],          tags:["arabic-pop","dance","festive"],                 familyFriendly:true,  bpmRange:"102-115"},
  { id:"s169", title:"Kammalna",              artist:"Elyanna",                   youtubeVideoId:"J_wHnM3xYS4", energyScore:75, dholScore:10, danceability:77, moments:["first_dance","dinner","guest_arrival"],           cultureTags:["arabic"],                    languageTags:["arabic"],          tags:["modern-arabic","wedding","indie"],              familyFriendly:true,  bpmRange:"95-108" },
  { id:"s170", title:"Oliver Twist Arabic Mix",artist:"Various Artists",          youtubeVideoId:"Xw_W5rKJqpA", energyScore:88, dholScore:20, danceability:90, moments:["family_dance","afterparty"],                      cultureTags:["arabic","moroccan"],         languageTags:["arabic"],          tags:["arabic-pop","dance","party"],                   familyFriendly:true,  bpmRange:"112-122"},
  { id:"s171", title:"Wana Masha'a Allah",    artist:"Hamada Helal",              youtubeVideoId:"RjAUzSFPCNA", energyScore:75, dholScore:12, danceability:76, moments:["family_dance","cocktail_hour","guest_arrival"],   cultureTags:["arabic"],                    languageTags:["arabic"],          tags:["arabic-pop","festive","wedding"],               familyFriendly:true,  bpmRange:"98-110" },
  { id:"s172", title:"Habibi Sawah",          artist:"Amr Diab",                  youtubeVideoId:"MGRmd3P8wqA", energyScore:80, dholScore:15, danceability:82, moments:["family_dance","cocktail_hour"],                  cultureTags:["arabic"],                    languageTags:["arabic"],          tags:["arabic-pop","dance","classic"],                 familyFriendly:true,  bpmRange:"104-116"},
  { id:"s173", title:"Wala Ala Balo",         artist:"Wael Kfoury",               youtubeVideoId:"OTr-eFts5G8", energyScore:66, dholScore:8,  danceability:68, moments:["first_dance","dinner","rukhsati"],                 cultureTags:["arabic"],                    languageTags:["arabic"],          tags:["romantic","lebanese","wedding","emotional"],    familyFriendly:true,  bpmRange:"80-92"  },
  { id:"s174", title:"Leil El Eid",           artist:"Various",                   youtubeVideoId:"eEP2bXkDiAA", energyScore:82, dholScore:20, danceability:84, moments:["family_dance","guest_arrival","cocktail_hour"],   cultureTags:["arabic","moroccan","persian"], languageTags:["arabic"],        tags:["arabic","festive","eid","celebration"],         familyFriendly:true,  bpmRange:"106-118"},
  { id:"s175", title:"Zahrat El Mada'en",     artist:"Fairuz",                    youtubeVideoId:"8sBqy0eaBmA", energyScore:52, dholScore:5,  danceability:45, moments:["quran_recitation","nikkah_ceremony","dinner"],     cultureTags:["arabic"],                    languageTags:["arabic"],          tags:["classic","traditional","ceremony"],             familyFriendly:true,  bpmRange:"58-72"  },
  { id:"s176", title:"Toot Toot",             artist:"Nancy Ajram",               youtubeVideoId:"U4M5DdNwpgM", energyScore:88, dholScore:22, danceability:90, moments:["family_dance","afterparty"],                      cultureTags:["arabic"],                    languageTags:["arabic"],          tags:["arabic-pop","fun","dance","catchy"],            familyFriendly:true,  bpmRange:"112-124"},
  { id:"s177", title:"Ya Salam",              artist:"Samira Said",               youtubeVideoId:"sY5W3mJl3fI", energyScore:76, dholScore:15, danceability:78, moments:["family_dance","cocktail_hour","guest_arrival"],   cultureTags:["arabic","moroccan"],         languageTags:["arabic"],          tags:["moroccan","arabic-pop","dance"],                familyFriendly:true,  bpmRange:"98-110" },
  { id:"s178", title:"Bent El Sultan",        artist:"Saif Nabeel",               youtubeVideoId:"k2gQ8j4zVnI", energyScore:80, dholScore:18, danceability:82, moments:["family_dance","cocktail_hour"],                  cultureTags:["arabic"],                    languageTags:["arabic"],          tags:["gulf-pop","dance","festive"],                   familyFriendly:true,  bpmRange:"104-116"},
  { id:"s179", title:"Coucou",                artist:"Mohamed Ramadan",           youtubeVideoId:"kDsgBiJmFp8", energyScore:90, dholScore:25, danceability:92, moments:["family_dance","afterparty"],                      cultureTags:["arabic"],                    languageTags:["arabic"],          tags:["egyptian-trap","modern","hype","dance"],        familyFriendly:true,  bpmRange:"116-128"},
  { id:"s180", title:"Basha El Masry",        artist:"Ahmed Saad",                youtubeVideoId:"Vo6LTU5X3Wk", energyScore:86, dholScore:20, danceability:88, moments:["family_dance","cocktail_hour"],                  cultureTags:["arabic"],                    languageTags:["arabic"],          tags:["egyptian-pop","dance","festive"],               familyFriendly:true,  bpmRange:"108-120"},
  { id:"s181", title:"Hayat Alby",            artist:"Hamaki",                    youtubeVideoId:"KwRl0_lbSX4", energyScore:65, dholScore:8,  danceability:66, moments:["first_dance","dinner"],                           cultureTags:["arabic"],                    languageTags:["arabic"],          tags:["romantic","arabic-pop","wedding"],              familyFriendly:true,  bpmRange:"78-90"  },
  { id:"s182", title:"Albi",                  artist:"A-WA",                      youtubeVideoId:"tCkKIj7nTL0", energyScore:84, dholScore:20, danceability:86, moments:["family_dance","cocktail_hour"],                  cultureTags:["arabic"],                    languageTags:["arabic"],          tags:["yemeni-folk","modern","dance","fusion"],        familyFriendly:true,  bpmRange:"108-120"},
  { id:"s183", title:"El Oum",                artist:"Balti",                     youtubeVideoId:"9rBPb0eGLF0", energyScore:78, dholScore:15, danceability:80, moments:["dinner","rukhsati","guest_arrival"],               cultureTags:["arabic","moroccan"],         languageTags:["arabic"],          tags:["moroccan-pop","emotional","wedding"],           familyFriendly:true,  bpmRange:"98-110" },

  // ─── TURKISH ──────────────────────────────────────────────────────────────
  { id:"s184", title:"Şımarık (Kiss Kiss)",   artist:"Tarkan",                    youtubeVideoId:"HQ78lHcOIXc", energyScore:92, dholScore:20, danceability:94, moments:["family_dance","afterparty","cocktail_hour"],      cultureTags:["turkish"],                   languageTags:["turkish"],         tags:["turkish-pop","dance","iconic","party"],         familyFriendly:true,  bpmRange:"120-130"},
  { id:"s185", title:"Dudu",                  artist:"Tarkan",                    youtubeVideoId:"4kBZIiGSBiI", energyScore:86, dholScore:18, danceability:88, moments:["family_dance","cocktail_hour"],                  cultureTags:["turkish"],                   languageTags:["turkish"],         tags:["turkish-pop","dance","romantic"],               familyFriendly:true,  bpmRange:"112-122"},
  { id:"s186", title:"Adını Kalbime Yazdım",  artist:"Tarkan",                    youtubeVideoId:"LpO_JPBR9xQ", energyScore:70, dholScore:10, danceability:72, moments:["first_dance","dinner"],                           cultureTags:["turkish"],                   languageTags:["turkish"],         tags:["turkish-pop","romantic","wedding"],             familyFriendly:true,  bpmRange:"88-100" },
  { id:"s187", title:"Everyway That I Can",   artist:"Sertab Erener",             youtubeVideoId:"jxB4xWMM-pU", energyScore:90, dholScore:15, danceability:92, moments:["family_dance","afterparty","cocktail_hour"],      cultureTags:["turkish"],                   languageTags:["turkish"],         tags:["turkish-pop","euro-pop","dance","iconic"],      familyFriendly:true,  bpmRange:"122-132"},
  { id:"s188", title:"Aya Benzer",            artist:"Mustafa Sandal",            youtubeVideoId:"RYbJxJQhC2A", energyScore:84, dholScore:18, danceability:86, moments:["family_dance","cocktail_hour"],                  cultureTags:["turkish"],                   languageTags:["turkish"],         tags:["turkish-pop","dance","festive"],                familyFriendly:true,  bpmRange:"108-118"},
  { id:"s189", title:"Gülümse",               artist:"Sezen Aksu",                youtubeVideoId:"6_Pqw6e4a6Q", energyScore:68, dholScore:8,  danceability:65, moments:["guest_arrival","dinner","first_dance"],           cultureTags:["turkish"],                   languageTags:["turkish"],         tags:["turkish-classic","romantic","timeless"],        familyFriendly:true,  bpmRange:"82-95"  },
  { id:"s190", title:"Düm Tek Tek",           artist:"Hadise",                    youtubeVideoId:"F1yqoHMnEi8", energyScore:92, dholScore:22, danceability:94, moments:["family_dance","afterparty"],                      cultureTags:["turkish"],                   languageTags:["turkish"],         tags:["turkish-pop","dance","party","hype"],           familyFriendly:true,  bpmRange:"124-134"},
  { id:"s191", title:"Bu Gece",               artist:"Kenan Doğulu",              youtubeVideoId:"5z8VrjdPSXM", energyScore:82, dholScore:15, danceability:84, moments:["family_dance","cocktail_hour","afterparty"],      cultureTags:["turkish"],                   languageTags:["turkish"],         tags:["turkish-pop","dance","night"],                  familyFriendly:true,  bpmRange:"106-116"},
  { id:"s192", title:"Hayat Güzel",           artist:"Sinan Akçıl",               youtubeVideoId:"b60N9g79fyk", energyScore:80, dholScore:15, danceability:82, moments:["guest_arrival","cocktail_hour","family_dance"],   cultureTags:["turkish"],                   languageTags:["turkish"],         tags:["turkish-pop","upbeat","feel-good"],             familyFriendly:true,  bpmRange:"104-116"},
  { id:"s193", title:"Can Dosta",             artist:"Aleyna Tilki",              youtubeVideoId:"9p5nnY4s_MY", energyScore:84, dholScore:15, danceability:86, moments:["family_dance","cocktail_hour"],                  cultureTags:["turkish"],                   languageTags:["turkish"],         tags:["turkish-pop","modern","dance"],                 familyFriendly:true,  bpmRange:"106-118"},
  { id:"s194", title:"Muhtaç",                artist:"Semicenk",                  youtubeVideoId:"mBIhCQxp3XY", energyScore:62, dholScore:8,  danceability:60, moments:["first_dance","dinner","rukhsati"],                 cultureTags:["turkish"],                   languageTags:["turkish"],         tags:["turkish-ballad","emotional","romantic"],        familyFriendly:true,  bpmRange:"72-85"  },
  { id:"s195", title:"Yara Yara",             artist:"Canbay & Wolker",           youtubeVideoId:"kLq3kgwILt4", energyScore:86, dholScore:18, danceability:88, moments:["family_dance","cocktail_hour"],                  cultureTags:["turkish"],                   languageTags:["turkish"],         tags:["turkish-pop","trap-pop","modern"],              familyFriendly:true,  bpmRange:"108-120"},
  { id:"s196", title:"Tövbe",                 artist:"Güneş",                     youtubeVideoId:"SbJlq3MBFWQ", energyScore:78, dholScore:15, danceability:80, moments:["family_dance","cocktail_hour"],                  cultureTags:["turkish"],                   languageTags:["turkish"],         tags:["turkish-pop","dance","modern"],                 familyFriendly:true,  bpmRange:"100-112"},
  { id:"s197", title:"Paramparça",            artist:"Teoman",                    youtubeVideoId:"zNS4hy4shCA", energyScore:58, dholScore:5,  danceability:55, moments:["dinner","first_dance"],                           cultureTags:["turkish"],                   languageTags:["turkish"],         tags:["turkish-rock","romantic","classic"],            familyFriendly:true,  bpmRange:"75-88"  },
  { id:"s198", title:"Holocaust",             artist:"Ceza",                      youtubeVideoId:"1mBPKAVnIGQ", energyScore:95, dholScore:20, danceability:85, moments:["afterparty"],                                     cultureTags:["turkish"],                   languageTags:["turkish"],         tags:["turkish-rap","hype","energy","afterparty"],     familyFriendly:false, bpmRange:"128-140"},
  { id:"s199", title:"Senden Daha Güzel",     artist:"Duman",                     youtubeVideoId:"S3Nq-Qbj_Dg", energyScore:64, dholScore:8,  danceability:62, moments:["first_dance","dinner"],                           cultureTags:["turkish"],                   languageTags:["turkish"],         tags:["turkish-rock","romantic","wedding"],            familyFriendly:true,  bpmRange:"78-90"  },
  { id:"s200", title:"Araba",                 artist:"Mustafa Sandal",            youtubeVideoId:"e3_XqW5RFiY", energyScore:88, dholScore:20, danceability:90, moments:["family_dance","afterparty"],                      cultureTags:["turkish"],                   languageTags:["turkish"],         tags:["turkish-pop","dance","party","hype"],           familyFriendly:true,  bpmRange:"114-124"},
  { id:"s201", title:"Çıkmaz Sokak",          artist:"Gülşen",                    youtubeVideoId:"vZ7mq6p3YiE", energyScore:80, dholScore:15, danceability:82, moments:["family_dance","cocktail_hour"],                  cultureTags:["turkish"],                   languageTags:["turkish"],         tags:["turkish-pop","dance","modern"],                 familyFriendly:true,  bpmRange:"102-114"},
  { id:"s202", title:"Yüksek Sesle",          artist:"Mabel Matiz",               youtubeVideoId:"Z0xFvmN7cqM", energyScore:74, dholScore:10, danceability:75, moments:["cocktail_hour","dinner","guest_arrival"],         cultureTags:["turkish"],                   languageTags:["turkish"],         tags:["turkish-indie","alt-pop","feel-good"],          familyFriendly:true,  bpmRange:"95-108" },
  { id:"s203", title:"Müptezhel",             artist:"Ezhel",                     youtubeVideoId:"b6aPjNL5nJM", energyScore:85, dholScore:15, danceability:85, moments:["afterparty","family_dance"],                      cultureTags:["turkish"],                   languageTags:["turkish"],         tags:["turkish-hiphop","modern","street"],             familyFriendly:false, bpmRange:"95-105" },
  { id:"s204", title:"Aşkı Bulamam Ben",      artist:"Murat Boz",                 youtubeVideoId:"JGqDU4Ysm_g", energyScore:68, dholScore:10, danceability:70, moments:["first_dance","dinner","cocktail_hour"],            cultureTags:["turkish"],                   languageTags:["turkish"],         tags:["turkish-pop","romantic","wedding"],             familyFriendly:true,  bpmRange:"85-98"  },
  { id:"s205", title:"Doğru Bilirim",         artist:"Emre Aydın",                youtubeVideoId:"ZNiCCIWVGfw", energyScore:62, dholScore:8,  danceability:60, moments:["first_dance","dinner"],                           cultureTags:["turkish"],                   languageTags:["turkish"],         tags:["turkish-pop","romantic","sentimental"],         familyFriendly:true,  bpmRange:"75-88"  },
  { id:"s206", title:"Annen Güzel",           artist:"Kurtuluş Kuş",              youtubeVideoId:"Q_B5zs4UQEM", energyScore:70, dholScore:12, danceability:72, moments:["cocktail_hour","guest_arrival","family_dance"],   cultureTags:["turkish"],                   languageTags:["turkish"],         tags:["türkü-pop","fun","wedding"],                    familyFriendly:true,  bpmRange:"90-102" },
  { id:"s207", title:"Sonsuz",                artist:"EDIS",                      youtubeVideoId:"U9KjIl5Dze8", energyScore:66, dholScore:8,  danceability:68, moments:["first_dance","dinner"],                           cultureTags:["turkish"],                   languageTags:["turkish"],         tags:["turkish-pop","romantic","wedding"],             familyFriendly:true,  bpmRange:"82-95"  },
  { id:"s208", title:"İnsanlar",              artist:"Sertab Erener",             youtubeVideoId:"jbT2X-fO3mc", energyScore:74, dholScore:10, danceability:76, moments:["cocktail_hour","dinner","guest_arrival"],         cultureTags:["turkish"],                   languageTags:["turkish"],         tags:["turkish-pop","classic","feel-good"],            familyFriendly:true,  bpmRange:"94-106" },
  { id:"s209", title:"Aşk Kaç Beden Giyer",   artist:"Hadise",                    youtubeVideoId:"eYH_X8RCPLA", energyScore:78, dholScore:14, danceability:80, moments:["family_dance","cocktail_hour"],                  cultureTags:["turkish"],                   languageTags:["turkish"],         tags:["turkish-pop","dance","modern"],                 familyFriendly:true,  bpmRange:"102-114"},
  { id:"s210", title:"Deli",                  artist:"Mabel Matiz ft. Sertab Erener", youtubeVideoId:"aqr4N2m_PSY", energyScore:80, dholScore:15, danceability:82, moments:["family_dance","cocktail_hour"],            cultureTags:["turkish"],                   languageTags:["turkish"],         tags:["turkish-pop","collaboration","dance"],          familyFriendly:true,  bpmRange:"104-116"},
  { id:"s211", title:"Yandı Kalbim",          artist:"Yıldız Tilbe",              youtubeVideoId:"5JXD8M6gjvg", energyScore:64, dholScore:10, danceability:66, moments:["dinner","first_dance","guest_arrival"],           cultureTags:["turkish"],                   languageTags:["turkish"],         tags:["türkü","traditional","emotional"],              familyFriendly:true,  bpmRange:"80-94"  },
  { id:"s212", title:"Yalnızca Sen",          artist:"Sertab Erener",             youtubeVideoId:"Nv5BKR-kCNI", energyScore:62, dholScore:8,  danceability:62, moments:["first_dance","dinner","nikkah_ceremony"],         cultureTags:["turkish"],                   languageTags:["turkish"],         tags:["turkish-pop","romantic","wedding"],             familyFriendly:true,  bpmRange:"76-90"  },
  { id:"s213", title:"Beraber",               artist:"Semicenk ft. Reynmen",      youtubeVideoId:"XRRrxK1hJzg", energyScore:72, dholScore:12, danceability:74, moments:["first_dance","dinner","cocktail_hour"],            cultureTags:["turkish"],                   languageTags:["turkish"],         tags:["turkish-pop","romantic","duet"],                familyFriendly:true,  bpmRange:"90-102" },

  // ─── WEST AFRICAN / AFROBEATS ─────────────────────────────────────────────
  { id:"s214", title:"Essence",               artist:"Wizkid ft. Tems",           youtubeVideoId:"Hi_sVaS3GHg", energyScore:82, dholScore:10, danceability:90, moments:["first_dance","cocktail_hour","family_dance"],     cultureTags:["nigerian","ghanaian","afro_caribbean"], languageTags:["english","yoruba"], tags:["afrobeats","romantic","smooth","wedding"],  familyFriendly:true,  bpmRange:"95-108" },
  { id:"s215", title:"Come Closer",           artist:"Wizkid ft. Drake",          youtubeVideoId:"cUEeVOmTPIo", energyScore:80, dholScore:12, danceability:88, moments:["first_dance","cocktail_hour","family_dance"],     cultureTags:["nigerian","afro_caribbean"],  languageTags:["english"],         tags:["afrobeats","romantic","smooth"],                familyFriendly:true,  bpmRange:"98-110" },
  { id:"s216", title:"Soco",                  artist:"Wizkid",                    youtubeVideoId:"dLuMhgBuXjQ", energyScore:88, dholScore:15, danceability:92, moments:["family_dance","afterparty","cocktail_hour"],      cultureTags:["nigerian","ghanaian"],        languageTags:["english","yoruba"], tags:["afrobeats","dance","banger","hype"],           familyFriendly:true,  bpmRange:"108-120"},
  { id:"s217", title:"Ojuelegba",             artist:"Wizkid",                    youtubeVideoId:"VQqFkBG_vVE", energyScore:74, dholScore:10, danceability:80, moments:["cocktail_hour","dinner","guest_arrival"],         cultureTags:["nigerian"],                  languageTags:["english","yoruba"], tags:["afrobeats","chill","nostalgic"],               familyFriendly:true,  bpmRange:"92-104" },
  { id:"s218", title:"Ye",                    artist:"Burna Boy",                 youtubeVideoId:"F89Cejb4GFY", energyScore:85, dholScore:15, danceability:88, moments:["family_dance","afterparty","cocktail_hour"],      cultureTags:["nigerian","afro_caribbean"], languageTags:["english","pidgin"], tags:["afrobeats","afrofusion","dance","banger"],     familyFriendly:true,  bpmRange:"105-118"},
  { id:"s219", title:"On The Low",            artist:"Burna Boy",                 youtubeVideoId:"A0l_UD_sH3U", energyScore:78, dholScore:12, danceability:85, moments:["first_dance","cocktail_hour","family_dance"],     cultureTags:["nigerian","afro_caribbean"], languageTags:["english","pidgin"], tags:["afrofusion","smooth","romantic","afrobeats"],  familyFriendly:true,  bpmRange:"98-110" },
  { id:"s220", title:"Last Last",             artist:"Burna Boy",                 youtubeVideoId:"zRbCFz5-Ox0", energyScore:80, dholScore:12, danceability:85, moments:["cocktail_hour","family_dance","afterparty"],      cultureTags:["nigerian","afro_caribbean"], languageTags:["english","pidgin"], tags:["afrofusion","afrobeats","dance"],              familyFriendly:true,  bpmRange:"102-114"},
  { id:"s221", title:"Way Too Big",           artist:"Burna Boy",                 youtubeVideoId:"xKcIo-aBqas", energyScore:90, dholScore:18, danceability:90, moments:["family_dance","afterparty"],                      cultureTags:["nigerian","afro_caribbean"], languageTags:["english","pidgin"], tags:["afrofusion","hype","dance","banger"],          familyFriendly:true,  bpmRange:"112-124"},
  { id:"s222", title:"Fall",                  artist:"Davido",                    youtubeVideoId:"o_yp6T1PSOM", energyScore:85, dholScore:12, danceability:88, moments:["family_dance","first_dance","cocktail_hour"],     cultureTags:["nigerian","afro_caribbean"], languageTags:["english"],         tags:["afrobeats","romantic","wedding","dance"],       familyFriendly:true,  bpmRange:"108-118"},
  { id:"s223", title:"Assurance",             artist:"Davido",                    youtubeVideoId:"cHFKS9RNzV0", energyScore:78, dholScore:10, danceability:82, moments:["first_dance","dinner","cocktail_hour"],            cultureTags:["nigerian"],                  languageTags:["english"],         tags:["afrobeats","romantic","wedding","smooth"],      familyFriendly:true,  bpmRange:"96-108" },
  { id:"s224", title:"Jowo",                  artist:"Davido",                    youtubeVideoId:"jIc7yXqBi6A", energyScore:76, dholScore:10, danceability:80, moments:["first_dance","dinner"],                           cultureTags:["nigerian"],                  languageTags:["english","yoruba"], tags:["afrobeats","romantic","soulful"],              familyFriendly:true,  bpmRange:"94-106" },
  { id:"s225", title:"FIA",                   artist:"Davido",                    youtubeVideoId:"3IJoT9-tBXc", energyScore:82, dholScore:14, danceability:86, moments:["cocktail_hour","family_dance"],                   cultureTags:["nigerian"],                  languageTags:["english"],         tags:["afrobeats","dance","fun"],                      familyFriendly:true,  bpmRange:"104-116"},
  { id:"s226", title:"Free Mind",             artist:"Tems",                      youtubeVideoId:"kdXUPBiJqlc", energyScore:70, dholScore:8,  danceability:72, moments:["first_dance","dinner","cocktail_hour"],            cultureTags:["nigerian","afro_caribbean"], languageTags:["english"],         tags:["afrobeats","soulful","r&b","smooth"],           familyFriendly:true,  bpmRange:"88-100" },
  { id:"s227", title:"Higher",                artist:"Tems",                      youtubeVideoId:"JjHGQ5gQFEw", energyScore:75, dholScore:10, danceability:77, moments:["first_dance","dinner","guest_arrival"],           cultureTags:["nigerian","afro_caribbean"], languageTags:["english"],         tags:["afrobeats","r&b","soulful"],                    familyFriendly:true,  bpmRange:"92-104" },
  { id:"s228", title:"Love Nwantiti",         artist:"CKay",                      youtubeVideoId:"GCeTsFRFlC8", energyScore:88, dholScore:15, danceability:92, moments:["family_dance","afterparty","cocktail_hour"],      cultureTags:["nigerian","afro_caribbean"], languageTags:["english","igbo"],  tags:["afrobeats","viral","dance","banger","hype"],   familyFriendly:true,  bpmRange:"108-120"},
  { id:"s229", title:"Leg Over",              artist:"Mr Eazi",                   youtubeVideoId:"k_3LMaqIDeo", energyScore:80, dholScore:12, danceability:84, moments:["family_dance","cocktail_hour","afterparty"],      cultureTags:["ghanaian","nigerian"],       languageTags:["english","pidgin"], tags:["afrobeats","dance","fun","crowd-pleaser"],     familyFriendly:true,  bpmRange:"102-114"},
  { id:"s230", title:"Pour Me Water",         artist:"Mr Eazi",                   youtubeVideoId:"uxRbpMJC5o4", energyScore:76, dholScore:10, danceability:80, moments:["cocktail_hour","family_dance"],                   cultureTags:["ghanaian","nigerian"],       languageTags:["english","pidgin"], tags:["afrobeats","fun","dance"],                     familyFriendly:true,  bpmRange:"98-110" },
  { id:"s231", title:"Koroba",                artist:"Tiwa Savage",               youtubeVideoId:"LqhUxkMq4DE", energyScore:86, dholScore:18, danceability:88, moments:["family_dance","afterparty"],                      cultureTags:["nigerian","afro_caribbean"], languageTags:["english","yoruba"], tags:["afrobeats","dance","powerful","hype"],         familyFriendly:true,  bpmRange:"106-118"},
  { id:"s232", title:"Somebody's Son",        artist:"Tiwa Savage ft. Brandy",    youtubeVideoId:"oaJi97QrwdI", energyScore:72, dholScore:10, danceability:74, moments:["first_dance","dinner","cocktail_hour"],            cultureTags:["nigerian"],                  languageTags:["english"],         tags:["afrobeats","romantic","r&b","wedding"],         familyFriendly:true,  bpmRange:"90-102" },
  { id:"s233", title:"Wo!",                   artist:"Olamide",                   youtubeVideoId:"4kdDm1C7A1Y", energyScore:92, dholScore:20, danceability:92, moments:["family_dance","afterparty"],                      cultureTags:["nigerian"],                  languageTags:["english","yoruba"], tags:["afrobeats","banger","hype","dance"],           familyFriendly:true,  bpmRange:"112-124"},
  { id:"s234", title:"Science Student",       artist:"Olamide",                   youtubeVideoId:"bNKlSnQeJQM", energyScore:88, dholScore:18, danceability:90, moments:["family_dance","afterparty"],                      cultureTags:["nigerian"],                  languageTags:["english","yoruba"], tags:["afrobeats","dance","hype","party"],            familyFriendly:false, bpmRange:"108-120"},
  { id:"s235", title:"Peru",                  artist:"Fireboy DML",               youtubeVideoId:"BSoX-Ge3FuY", energyScore:85, dholScore:15, danceability:90, moments:["family_dance","cocktail_hour","afterparty"],      cultureTags:["nigerian","afro_caribbean"], languageTags:["english"],         tags:["afrobeats","dance","viral","banger"],           familyFriendly:true,  bpmRange:"104-116"},
  { id:"s236", title:"Jealous",               artist:"Fireboy DML",               youtubeVideoId:"N-YUJQiuHGM", energyScore:78, dholScore:12, danceability:82, moments:["cocktail_hour","family_dance","dinner"],          cultureTags:["nigerian"],                  languageTags:["english"],         tags:["afrobeats","smooth","romantic","dance"],        familyFriendly:true,  bpmRange:"98-110" },
  { id:"s237", title:"Calm Down",             artist:"Rema",                      youtubeVideoId:"k7mHBkJPHyM", energyScore:86, dholScore:15, danceability:90, moments:["family_dance","cocktail_hour","afterparty"],      cultureTags:["nigerian","afro_caribbean"], languageTags:["english"],         tags:["afrobeats","dance","smooth","viral"],           familyFriendly:true,  bpmRange:"105-118"},
  { id:"s238", title:"Bounce",                artist:"Rema",                      youtubeVideoId:"LlZ3A2yAqdk", energyScore:90, dholScore:18, danceability:92, moments:["family_dance","afterparty"],                      cultureTags:["nigerian"],                  languageTags:["english"],         tags:["afrobeats","hype","dance","banger"],            familyFriendly:true,  bpmRange:"110-122"},
  { id:"s239", title:"Attention",             artist:"Omah Lay",                  youtubeVideoId:"jByiHMDVb-4", energyScore:76, dholScore:10, danceability:80, moments:["cocktail_hour","family_dance","dinner"],          cultureTags:["nigerian"],                  languageTags:["english"],         tags:["afrobeats","smooth","romantic"],                familyFriendly:true,  bpmRange:"96-108" },
  { id:"s240", title:"Buga",                  artist:"Kizz Daniel ft. Tekno",     youtubeVideoId:"yKOVjx3u2oI", energyScore:90, dholScore:20, danceability:93, moments:["family_dance","afterparty","cocktail_hour"],      cultureTags:["nigerian","ghanaian","afro_caribbean"], languageTags:["english"], tags:["afrobeats","dance","banger","viral","hype"],  familyFriendly:true,  bpmRange:"112-124"},
  { id:"s241", title:"Baby",                  artist:"Joeboy",                    youtubeVideoId:"bJD_JBf7Xm8", energyScore:75, dholScore:10, danceability:78, moments:["first_dance","cocktail_hour","dinner"],            cultureTags:["nigerian"],                  languageTags:["english"],         tags:["afrobeats","romantic","smooth","wedding"],      familyFriendly:true,  bpmRange:"94-106" },
  { id:"s242", title:"Rush",                  artist:"Ayra Starr",                youtubeVideoId:"VlSBxfkuNao", energyScore:86, dholScore:15, danceability:89, moments:["family_dance","afterparty","cocktail_hour"],      cultureTags:["nigerian","afro_caribbean"], languageTags:["english"],         tags:["afrobeats","pop","dance","hype"],               familyFriendly:true,  bpmRange:"108-120"},
  { id:"s243", title:"Bloody Samaritan",      artist:"Ayra Starr",                youtubeVideoId:"rDRL7SJ23YY", energyScore:84, dholScore:14, danceability:88, moments:["family_dance","afterparty"],                      cultureTags:["nigerian"],                  languageTags:["english"],         tags:["afrobeats","baddie","hype","dance"],            familyFriendly:true,  bpmRange:"106-118"},
  { id:"s244", title:"Sungba",                artist:"Asake ft. Burna Boy",       youtubeVideoId:"RmRcJr4FKzI", energyScore:92, dholScore:22, danceability:92, moments:["family_dance","afterparty"],                      cultureTags:["nigerian"],                  languageTags:["english","yoruba"], tags:["afrobeats","amapiano","hype","banger"],        familyFriendly:true,  bpmRange:"114-126"},
  { id:"s245", title:"Palazzo",               artist:"Asake",                     youtubeVideoId:"m_K7YCIJ9Yw", energyScore:88, dholScore:18, danceability:90, moments:["family_dance","afterparty","cocktail_hour"],      cultureTags:["nigerian"],                  languageTags:["english","yoruba"], tags:["afrobeats","amapiano","dance","banger"],       familyFriendly:true,  bpmRange:"110-122"},
  { id:"s246", title:"Finesse",               artist:"Pheelz ft. BNXN",           youtubeVideoId:"HbHFbIiChfw", energyScore:85, dholScore:15, danceability:88, moments:["family_dance","cocktail_hour","afterparty"],      cultureTags:["nigerian"],                  languageTags:["english"],         tags:["afrobeats","dance","banger","viral"],           familyFriendly:true,  bpmRange:"106-118"},
  { id:"s247", title:"Johnny",                artist:"Yemi Alade",                youtubeVideoId:"zHFnPBRq5cU", energyScore:88, dholScore:18, danceability:90, moments:["family_dance","afterparty","cocktail_hour"],      cultureTags:["nigerian","ghanaian","afro_caribbean"], languageTags:["english"], tags:["afrobeats","dance","fun","crowd-pleaser"],    familyFriendly:true,  bpmRange:"110-122"},
  { id:"s248", title:"Oh My Gosh",            artist:"Yemi Alade",                youtubeVideoId:"OUQtGvNsLto", energyScore:84, dholScore:16, danceability:88, moments:["family_dance","cocktail_hour"],                  cultureTags:["nigerian"],                  languageTags:["english"],         tags:["afrobeats","dance","fun"],                      familyFriendly:true,  bpmRange:"108-120"},
  { id:"s249", title:"Personally",            artist:"P-Square",                  youtubeVideoId:"0E4lsCmwBX0", energyScore:86, dholScore:18, danceability:90, moments:["family_dance","afterparty","cocktail_hour"],      cultureTags:["nigerian","afro_caribbean"], languageTags:["english"],         tags:["afrobeats","rnb","dance","classic"],            familyFriendly:true,  bpmRange:"108-120"},
  { id:"s250", title:"Oliver Twist",          artist:"D'banj",                    youtubeVideoId:"pWji7NMb_Vc", energyScore:92, dholScore:20, danceability:93, moments:["family_dance","afterparty"],                      cultureTags:["nigerian","afro_caribbean"], languageTags:["english"],         tags:["afrobeats","dance","classic","hype"],           familyFriendly:true,  bpmRange:"116-128"},
  { id:"s251", title:"Sexy Dance",            artist:"Fally Ipupa",               youtubeVideoId:"nTqUy9Oky6Y", energyScore:86, dholScore:15, danceability:88, moments:["family_dance","cocktail_hour"],                  cultureTags:["afro_caribbean","nigerian"], languageTags:["french","lingala"], tags:["afrobeats","congolese","dance","festive"],     familyFriendly:true,  bpmRange:"106-118"},
  { id:"s252", title:"Deja Vu",               artist:"Davido ft. Summer Walker",  youtubeVideoId:"bx3B6fYNKWs", energyScore:74, dholScore:10, danceability:78, moments:["cocktail_hour","first_dance","dinner"],            cultureTags:["nigerian"],                  languageTags:["english"],         tags:["afrobeats","r&b","smooth","romantic"],          familyFriendly:true,  bpmRange:"92-104" },
  { id:"s253", title:"Super Powers",          artist:"Burna Boy ft. NSG",         youtubeVideoId:"fBdA_zS2W2o", energyScore:82, dholScore:14, danceability:86, moments:["family_dance","cocktail_hour"],                  cultureTags:["nigerian","afro_caribbean"], languageTags:["english"],         tags:["afrobeats","upbeat","dance","feel-good"],       familyFriendly:true,  bpmRange:"104-116"},
  { id:"s254", title:"Stand Strong",          artist:"Davido ft. The Samples",    youtubeVideoId:"Q_eMdPe7kW4", energyScore:76, dholScore:10, danceability:78, moments:["guest_arrival","dinner","cocktail_hour"],         cultureTags:["nigerian"],                  languageTags:["english"],         tags:["afrobeats","gospel","uplift","wedding"],        familyFriendly:true,  bpmRange:"94-106" },
  { id:"s255", title:"Midnight",              artist:"Wizkid ft. Damian Marley",  youtubeVideoId:"3MfuPdUAqoY", energyScore:72, dholScore:10, danceability:74, moments:["cocktail_hour","dinner","afterparty"],            cultureTags:["nigerian","afro_caribbean"], languageTags:["english"],         tags:["afrobeats","reggae","chill","vibes"],           familyFriendly:true,  bpmRange:"90-102" },
  { id:"s256", title:"Bolo Bolo",             artist:"King Promise",              youtubeVideoId:"RG4JoTiKEOM", energyScore:80, dholScore:12, danceability:84, moments:["family_dance","cocktail_hour"],                  cultureTags:["ghanaian","nigerian"],       languageTags:["english"],         tags:["afrobeats","highlife","ghana","dance"],         familyFriendly:true,  bpmRange:"100-114"},
  { id:"s257", title:"EMOTION",               artist:"Fireboy DML ft. Becky G",   youtubeVideoId:"5LKQSroJPkA", energyScore:84, dholScore:15, danceability:88, moments:["family_dance","cocktail_hour","afterparty"],      cultureTags:["nigerian","afro_caribbean"], languageTags:["english","spanish"], tags:["afrobeats","crossover","latin","dance"],       familyFriendly:true,  bpmRange:"106-118"},
  { id:"s258", title:"Mood",                  artist:"BNXN fka Benson Daniel",    youtubeVideoId:"eN0BCKcRl5A", energyScore:78, dholScore:12, danceability:82, moments:["cocktail_hour","family_dance","dinner"],          cultureTags:["nigerian"],                  languageTags:["english"],         tags:["afrobeats","smooth","modern","dance"],          familyFriendly:true,  bpmRange:"98-112" },

  // ─── LATIN ────────────────────────────────────────────────────────────────
  { id:"s259", title:"Dakiti",                artist:"Bad Bunny & Jhay Cortez",   youtubeVideoId:"G9VMec38EIM", energyScore:92, dholScore:15, danceability:95, moments:["family_dance","afterparty"],                      cultureTags:["afro_caribbean","mixed","american"], languageTags:["spanish"],  tags:["reggaeton","trap","banger","hype","latin"],    familyFriendly:true,  bpmRange:"110-122"},
  { id:"s260", title:"Tití Me Preguntó",      artist:"Bad Bunny",                 youtubeVideoId:"yFl8rZqgJtw", energyScore:88, dholScore:12, danceability:93, moments:["family_dance","afterparty","cocktail_hour"],      cultureTags:["afro_caribbean","mixed"],     languageTags:["spanish"],         tags:["reggaeton","dance","latin","fun"],              familyFriendly:false, bpmRange:"108-118"},
  { id:"s261", title:"Moscow Mule",           artist:"Bad Bunny",                 youtubeVideoId:"8nfCuHw9R-s", energyScore:86, dholScore:12, danceability:90, moments:["cocktail_hour","family_dance","afterparty"],      cultureTags:["afro_caribbean","mixed"],     languageTags:["spanish"],         tags:["reggaeton","trap","latin","smooth"],            familyFriendly:false, bpmRange:"106-116"},
  { id:"s262", title:"Mi Gente",              artist:"J Balvin & Willy William",  youtubeVideoId:"wnJ6LuUFpMo", energyScore:94, dholScore:18, danceability:96, moments:["family_dance","afterparty"],                      cultureTags:["afro_caribbean","mixed","american"], languageTags:["spanish","french"], tags:["reggaeton","dance","hype","banger","crowd-pleaser"], familyFriendly:true, bpmRange:"115-128"},
  { id:"s263", title:"Reggaetón",             artist:"J Balvin",                  youtubeVideoId:"8olyFGSSiKY", energyScore:90, dholScore:15, danceability:93, moments:["family_dance","afterparty"],                      cultureTags:["afro_caribbean","mixed"],     languageTags:["spanish"],         tags:["reggaeton","dance","latin","hype"],             familyFriendly:true,  bpmRange:"112-124"},
  { id:"s264", title:"Gasolina",              artist:"Daddy Yankee",              youtubeVideoId:"CCF-RqVe9JM", energyScore:95, dholScore:20, danceability:97, moments:["family_dance","afterparty"],                      cultureTags:["afro_caribbean","american"],  languageTags:["spanish"],         tags:["reggaeton","classic","hype","banger","iconic"], familyFriendly:true,  bpmRange:"120-132"},
  { id:"s265", title:"Dura",                  artist:"Daddy Yankee",              youtubeVideoId:"OdDDBafOXOo", energyScore:90, dholScore:18, danceability:93, moments:["family_dance","afterparty","cocktail_hour"],      cultureTags:["afro_caribbean"],            languageTags:["spanish"],         tags:["reggaeton","dance","latin","hype"],             familyFriendly:true,  bpmRange:"115-125"},
  { id:"s266", title:"Con Calma",             artist:"Daddy Yankee & Snow",       youtubeVideoId:"uel-4zCpJAE", energyScore:88, dholScore:18, danceability:92, moments:["family_dance","cocktail_hour","afterparty"],      cultureTags:["afro_caribbean","mixed"],     languageTags:["spanish"],         tags:["reggaeton","dance","latin","party"],            familyFriendly:true,  bpmRange:"112-124"},
  { id:"s267", title:"Vivir Mi Vida",         artist:"Marc Anthony",              youtubeVideoId:"YfGSMTWR1Bk", energyScore:90, dholScore:20, danceability:92, moments:["family_dance","afterparty","cocktail_hour"],      cultureTags:["afro_caribbean","mixed","american"], languageTags:["spanish"], tags:["salsa","latin","dance","classic","feel-good"],  familyFriendly:true,  bpmRange:"122-132"},
  { id:"s268", title:"Propuesta Indecente",   artist:"Romeo Santos",              youtubeVideoId:"PkVU1s8IXb8", energyScore:80, dholScore:15, danceability:82, moments:["cocktail_hour","first_dance","dinner"],            cultureTags:["afro_caribbean","mixed"],     languageTags:["spanish"],         tags:["bachata","latin","romantic","smooth"],          familyFriendly:true,  bpmRange:"100-112"},
  { id:"s269", title:"Waka Waka",             artist:"Shakira",                   youtubeVideoId:"pRpeEdMmmQ0", energyScore:92, dholScore:22, danceability:94, moments:["family_dance","afterparty"],                      cultureTags:["mixed","afro_caribbean","american"], languageTags:["spanish","english"], tags:["latin-pop","dance","iconic","crowd-pleaser","feel-good"], familyFriendly:true, bpmRange:"126-136"},
  { id:"s270", title:"Hips Don't Lie",        artist:"Shakira ft. Wyclef Jean",   youtubeVideoId:"DUT5rEU6pqM", energyScore:90, dholScore:20, danceability:93, moments:["family_dance","afterparty","cocktail_hour"],      cultureTags:["mixed","american"],           languageTags:["spanish","english"], tags:["latin-pop","dance","iconic","crowd-pleaser"],   familyFriendly:true,  bpmRange:"120-130"},
  { id:"s271", title:"Hawái",                 artist:"Maluma",                    youtubeVideoId:"LplOPCLv_aE", energyScore:78, dholScore:12, danceability:82, moments:["cocktail_hour","first_dance","family_dance"],     cultureTags:["afro_caribbean","mixed"],     languageTags:["spanish"],         tags:["reggaeton","pop","romantic","latin"],           familyFriendly:true,  bpmRange:"96-108" },
  { id:"s272", title:"Felices Los 4",         artist:"Maluma",                    youtubeVideoId:"DGjTIas_LSM", energyScore:84, dholScore:15, danceability:86, moments:["family_dance","cocktail_hour"],                  cultureTags:["afro_caribbean","mixed"],     languageTags:["spanish"],         tags:["reggaeton","latin","dance","fun"],              familyFriendly:false, bpmRange:"104-116"},
  { id:"s273", title:"Bailando",              artist:"Enrique Iglesias ft. Descemer Bueno", youtubeVideoId:"NUsoVlDFqZg", energyScore:88, dholScore:18, danceability:90, moments:["family_dance","afterparty","cocktail_hour"], cultureTags:["afro_caribbean","mixed"],  languageTags:["spanish"],         tags:["latin-pop","dance","iconic","feel-good"],       familyFriendly:true,  bpmRange:"110-122"},
  { id:"s274", title:"Livin' La Vida Loca",   artist:"Ricky Martin",              youtubeVideoId:"p47fEXGabaY", energyScore:94, dholScore:22, danceability:95, moments:["family_dance","afterparty"],                      cultureTags:["afro_caribbean","mixed","american"], languageTags:["spanish","english"], tags:["latin-pop","dance","iconic","classic","hype"],  familyFriendly:true,  bpmRange:"122-134"},
  { id:"s275", title:"Maria",                 artist:"Ricky Martin",              youtubeVideoId:"LUBLwV1bvRE", energyScore:88, dholScore:18, danceability:90, moments:["family_dance","afterparty"],                      cultureTags:["afro_caribbean","mixed"],     languageTags:["spanish"],         tags:["latin-pop","dance","classic","hype"],           familyFriendly:true,  bpmRange:"116-128"},
  { id:"s276", title:"Give Me Everything",    artist:"Pitbull ft. Ne-Yo",         youtubeVideoId:"EPo5wWmKEaI", energyScore:90, dholScore:15, danceability:92, moments:["family_dance","afterparty"],                      cultureTags:["afro_caribbean","american","mixed"], languageTags:["spanish","english"], tags:["latin-pop","dance","club","hype","classic"],   familyFriendly:true,  bpmRange:"130-140"},
  { id:"s277", title:"International Love",    artist:"Pitbull ft. Chris Brown",   youtubeVideoId:"pFsgHEfBBXQ", energyScore:88, dholScore:15, danceability:90, moments:["family_dance","afterparty","cocktail_hour"],      cultureTags:["afro_caribbean","american","mixed"], languageTags:["spanish","english"], tags:["latin-pop","dance","club","hype"],             familyFriendly:true,  bpmRange:"128-138"},
  { id:"s278", title:"Taki Taki",             artist:"DJ Snake ft. Ozuna, Cardi B", youtubeVideoId:"ixkoVwKQaJg", energyScore:92, dholScore:20, danceability:94, moments:["family_dance","afterparty"],                   cultureTags:["afro_caribbean","mixed","american"], languageTags:["spanish","english"], tags:["reggaeton","dance","banger","hype"],           familyFriendly:true,  bpmRange:"118-128"},
  { id:"s279", title:"Vida de Rico",          artist:"Camilo",                    youtubeVideoId:"rSEFe2ndYFk", energyScore:82, dholScore:15, danceability:85, moments:["cocktail_hour","family_dance"],                   cultureTags:["afro_caribbean","mixed"],     languageTags:["spanish"],         tags:["latin-pop","fun","dance","feel-good"],          familyFriendly:true,  bpmRange:"104-116"},
  { id:"s280", title:"La Bicicleta",          artist:"Carlos Vives & Shakira",    youtubeVideoId:"q_FS37BMiuI", energyScore:86, dholScore:18, danceability:88, moments:["family_dance","cocktail_hour"],                  cultureTags:["afro_caribbean","mixed"],     languageTags:["spanish"],         tags:["vallenato","cumbia","latin","dance","festive"], familyFriendly:true,  bpmRange:"108-120"},
  { id:"s281", title:"La Vida Es Un Carnaval", artist:"Celia Cruz",               youtubeVideoId:"KT5_WLkWXGY", energyScore:90, dholScore:22, danceability:92, moments:["family_dance","afterparty","cocktail_hour"],      cultureTags:["afro_caribbean"],            languageTags:["spanish"],         tags:["salsa","classic","latin","dance","feel-good"],  familyFriendly:true,  bpmRange:"120-132"},
  { id:"s282", title:"Conga",                 artist:"Gloria Estefan & Miami Sound Machine", youtubeVideoId:"UuS7Xb3DfhI", energyScore:92, dholScore:22, danceability:94, moments:["family_dance","afterparty"],          cultureTags:["afro_caribbean","american","mixed"], languageTags:["spanish","english"], tags:["salsa","conga","dance","classic","iconic"],    familyFriendly:true,  bpmRange:"122-132"},
  { id:"s283", title:"On the Floor",          artist:"Jennifer Lopez ft. Pitbull", youtubeVideoId:"t4H_Zoh7G5A", energyScore:94, dholScore:20, danceability:95, moments:["family_dance","afterparty"],                     cultureTags:["afro_caribbean","american","mixed"], languageTags:["spanish","english"], tags:["latin-pop","dance","hype","banger","iconic"],  familyFriendly:true,  bpmRange:"130-140"},
  { id:"s284", title:"Waiting for Tonight",   artist:"Jennifer Lopez",            youtubeVideoId:"r4Ry3EB7sXc", energyScore:86, dholScore:15, danceability:88, moments:["family_dance","afterparty","cocktail_hour"],      cultureTags:["afro_caribbean","american","mixed"], languageTags:["english"],  tags:["latin-pop","dance","90s","classic"],            familyFriendly:true,  bpmRange:"120-130"},
  { id:"s285", title:"Reggaetón Lento",       artist:"CNCO",                      youtubeVideoId:"bHsVh2Wfipg", energyScore:82, dholScore:15, danceability:86, moments:["family_dance","cocktail_hour","first_dance"],     cultureTags:["afro_caribbean","mixed"],     languageTags:["spanish"],         tags:["reggaeton","romantic","dance","latin"],         familyFriendly:true,  bpmRange:"102-114"},
  { id:"s286", title:"Despacito",             artist:"Luis Fonsi ft. Daddy Yankee", youtubeVideoId:"ktvTqknDobU", energyScore:88, dholScore:18, danceability:92, moments:["family_dance","cocktail_hour","first_dance"],   cultureTags:["afro_caribbean","mixed","american"], languageTags:["spanish"], tags:["reggaeton","pop","iconic","viral","dance"],      familyFriendly:true,  bpmRange:"110-122"},
  { id:"s287", title:"Échame La Culpa",       artist:"Luis Fonsi & Demi Lovato",  youtubeVideoId:"L-iKXVVkFAw", energyScore:82, dholScore:14, danceability:85, moments:["family_dance","cocktail_hour"],                  cultureTags:["afro_caribbean","mixed"],     languageTags:["spanish","english"], tags:["latin-pop","dance","fun"],                     familyFriendly:true,  bpmRange:"106-118"},
  { id:"s288", title:"Tusa",                  artist:"Karol G & Nicki Minaj",     youtubeVideoId:"IFFDGkf7MNo", energyScore:88, dholScore:15, danceability:92, moments:["family_dance","afterparty"],                      cultureTags:["afro_caribbean","mixed","american"], languageTags:["spanish","english"], tags:["reggaeton","trap","dance","hype","viral"],     familyFriendly:false, bpmRange:"110-122"},
  { id:"s289", title:"Bichota",               artist:"Karol G",                   youtubeVideoId:"rRzxEiBLQCA", energyScore:92, dholScore:18, danceability:94, moments:["family_dance","afterparty"],                      cultureTags:["afro_caribbean","mixed"],     languageTags:["spanish"],         tags:["reggaeton","trap","hype","baddie"],             familyFriendly:false, bpmRange:"114-126"},
  { id:"s290", title:"Todo de Ti",            artist:"Rauw Alejandro",            youtubeVideoId:"GOdTkZ-ybsw", energyScore:86, dholScore:15, danceability:89, moments:["cocktail_hour","family_dance","first_dance"],     cultureTags:["afro_caribbean","mixed"],     languageTags:["spanish"],         tags:["reggaeton","pop","romantic","dance"],           familyFriendly:true,  bpmRange:"108-120"},
  { id:"s291", title:"El Perdón",             artist:"Nicky Jam & Enrique Iglesias", youtubeVideoId:"J6zsLpRMJBs", energyScore:82, dholScore:14, danceability:85, moments:["cocktail_hour","family_dance","first_dance"],  cultureTags:["afro_caribbean","mixed"],     languageTags:["spanish"],         tags:["reggaeton","pop","romantic","dance"],           familyFriendly:true,  bpmRange:"104-116"},
  { id:"s292", title:"Bidi Bidi Bom Bom",     artist:"Selena",                    youtubeVideoId:"0nO1jh0Ll48", energyScore:85, dholScore:18, danceability:88, moments:["family_dance","cocktail_hour"],                  cultureTags:["american","mixed"],           languageTags:["spanish"],         tags:["tejano","latin","dance","iconic","classic"],    familyFriendly:true,  bpmRange:"110-122"},
  { id:"s293", title:"I Like It",             artist:"Cardi B, Bad Bunny & J Balvin", youtubeVideoId:"HCjNJDNzw8Y", energyScore:92, dholScore:18, danceability:94, moments:["family_dance","afterparty"],                 cultureTags:["afro_caribbean","american","mixed"], languageTags:["spanish","english"], tags:["hip-hop","latin","hype","banger","dance"],    familyFriendly:false, bpmRange:"118-128"},
  { id:"s294", title:"Subeme la Radio",       artist:"Enrique Iglesias",          youtubeVideoId:"9JJGKplLJcY", energyScore:88, dholScore:16, danceability:90, moments:["family_dance","cocktail_hour","afterparty"],      cultureTags:["afro_caribbean","mixed"],     languageTags:["spanish"],         tags:["latin-pop","dance","fun","party"],              familyFriendly:true,  bpmRange:"112-122"},
  { id:"s295", title:"China",                 artist:"Anuel AA ft. Daddy Yankee", youtubeVideoId:"oCiIfMhz3RY", energyScore:88, dholScore:16, danceability:90, moments:["family_dance","afterparty"],                      cultureTags:["afro_caribbean","mixed"],     languageTags:["spanish"],         tags:["reggaeton","trap","dance","hype"],              familyFriendly:false, bpmRange:"110-120"},
  { id:"s296", title:"Te Robaré",             artist:"Ozuna & Nicky Jam",         youtubeVideoId:"aA6S5bUbVtI", energyScore:80, dholScore:14, danceability:84, moments:["cocktail_hour","family_dance","first_dance"],     cultureTags:["afro_caribbean","mixed"],     languageTags:["spanish"],         tags:["reggaeton","romantic","smooth","latin"],        familyFriendly:true,  bpmRange:"100-112"},
  { id:"s297", title:"La Canción",            artist:"J Balvin & Bad Bunny",      youtubeVideoId:"xRXe5dSBSXM", energyScore:84, dholScore:15, danceability:86, moments:["cocktail_hour","family_dance"],                  cultureTags:["afro_caribbean","mixed"],     languageTags:["spanish"],         tags:["reggaeton","trap","collab","latin"],            familyFriendly:false, bpmRange:"106-116"},
  { id:"s298", title:"Que Calor",             artist:"Major Lazer & J Balvin",    youtubeVideoId:"h8kFRPpINHg", energyScore:90, dholScore:18, danceability:92, moments:["family_dance","afterparty"],                      cultureTags:["afro_caribbean","mixed","american"], languageTags:["spanish","english"], tags:["latin","dance","electronic","hype"],          familyFriendly:true,  bpmRange:"114-124"},
  { id:"s299", title:"Contigo",               artist:"Carlos Vives",              youtubeVideoId:"5W0r5GpGVkg", energyScore:78, dholScore:14, danceability:80, moments:["first_dance","dinner","cocktail_hour"],            cultureTags:["afro_caribbean","mixed"],     languageTags:["spanish"],         tags:["vallenato","romantic","wedding","latin"],       familyFriendly:true,  bpmRange:"96-108" },
  { id:"s300", title:"Lean On",               artist:"Major Lazer & MØ",          youtubeVideoId:"YqeW9_5kURI", energyScore:88, dholScore:15, danceability:90, moments:["family_dance","afterparty","cocktail_hour"],      cultureTags:["mixed","afro_caribbean","american"], languageTags:["english"], tags:["dance-pop","global","hype","crowd-pleaser"],   familyFriendly:true,  bpmRange:"116-126"},
  { id:"s301", title:"Pepas",                 artist:"Farruko",                   youtubeVideoId:"kP2C7Lk3Y5I", energyScore:92, dholScore:18, danceability:94, moments:["family_dance","afterparty"],                      cultureTags:["afro_caribbean","mixed"],     languageTags:["spanish"],         tags:["reggaeton","latin","dance","hype"],             familyFriendly:false, bpmRange:"120-130"},
  { id:"s302", title:"Ojitos Lindos",         artist:"Bad Bunny & Bomba Estéreo", youtubeVideoId:"rMTsPaO5e6M", energyScore:75, dholScore:12, danceability:78, moments:["first_dance","cocktail_hour","dinner"],            cultureTags:["afro_caribbean","mixed"],     languageTags:["spanish"],         tags:["latin","indie","romantic","alternative"],       familyFriendly:true,  bpmRange:"94-106" },
  { id:"s303", title:"Butter",                artist:"BTS",                       youtubeVideoId:"WMweEpGlu_U", energyScore:90, dholScore:12, danceability:92, moments:["family_dance","afterparty","cocktail_hour"],      cultureTags:["korean","mixed","american"], languageTags:["english","korean"],  tags:["k-pop","dance","fun","hype","crossover"],       familyFriendly:true,  bpmRange:"110-120"},
  ...(EXTENDED_SONGS as Song[]),
];

export function getRecommendations(
  momentId: string,
  cultures: string[],
  languages: string[],
  vibe: number,
  energy: number,
  cleanLyrics: boolean
): Song[] {
  const weights = {
    energy: 0.3,
    dhol: 0.2,
    matchMoment: 0.25,
    matchCulture: 0.15,
    matchLanguage: 0.1,
  };

  const scored = SONG_DATABASE.map((song) => {
    if (cleanLyrics && !song.familyFriendly) return { song, score: -1 };

    const matchMoment = song.moments.includes(momentId) ? 100 : 0;
    const matchCulture =
      cultures.length === 0
        ? 50
        : song.cultureTags.includes("mixed")
        ? 50
        : cultures.some((c) => song.cultureTags.includes(c))
        ? 100
        : 0;
    const matchLanguage =
      languages.length === 0
        ? 50
        : languages.some((l) => song.languageTags.includes(l))
        ? 100
        : 30;

    const energyDiff = Math.abs(song.energyScore - energy * 100);
    const energyMatch = Math.max(0, 100 - energyDiff * 1.2);

    const isTraditional = vibe < 0.5;
    const vibeBonus =
      isTraditional && song.dholScore > 70
        ? 15
        : !isTraditional && song.danceability > 80
        ? 15
        : 0;

    const score =
      weights.energy * energyMatch +
      weights.dhol * song.dholScore +
      weights.matchMoment * matchMoment +
      weights.matchCulture * matchCulture +
      weights.matchLanguage * matchLanguage +
      vibeBonus;

    return { song, score };
  });

  return scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 20)
    .map((s) => s.song);
}

// ─── SONG METADATA (duration + release year) ────────────────────────────────
// durationSec = estimated runtime; year = release year

export type SongMeta = { durationSec: number; year: number };

export const SONG_META: Record<string, SongMeta> = {
  s1:   { durationSec: 213, year: 2020 }, // Sauda Khara Khara
  s2:   { durationSec: 195, year: 2021 }, // Morni Banke
  s3:   { durationSec: 225, year: 2016 }, // 3 Peg
  s4:   { durationSec: 200, year: 2002 }, // Mundian To Bach Ke
  s5:   { durationSec: 208, year: 2021 }, // Sher Aaya Sher
  s6:   { durationSec: 230, year: 2011 }, // Tum Jo Aaye
  s7:   { durationSec: 242, year: 2008 }, // Tere Liye
  s8:   { durationSec: 220, year: 2014 }, // Jeena Jeena
  s9:   { durationSec: 255, year: 2014 }, // Gallan Goodiyan
  s10:  { durationSec: 215, year: 2014 }, // London Thumakda
  s11:  { durationSec: 320, year: 2016 }, // Afreen Afreen (Coke Studio)
  s12:  { durationSec: 270, year: 2011 }, // Dama Dam Mast Qalandar
  s13:  { durationSec: 232, year: 2019 }, // Tera Ban Jaunga
  s14:  { durationSec: 310, year: 2008 }, // Tujh Mein Rab Dikhta Hai
  s15:  { durationSec: 225, year: 2013 }, // Nagada Sang Dhol
  s16:  { durationSec: 202, year: 2018 }, // Chogada
  s17:  { durationSec: 425, year: 2011 }, // Kun Faya Kun
  s18:  { durationSec: 295, year: 2002 }, // Ik Onkar
  s19:  { durationSec: 250, year: 1967 }, // Babul Ki Duayen
  s20:  { durationSec: 265, year: 2008 }, // Alvida
  s21:  { durationSec: 210, year: 2012 }, // Amplifier
  s22:  { durationSec: 222, year: 2014 }, // Lovely
  s23:  { durationSec: 228, year: 1985 }, // Take On Me
  s26:  { durationSec: 243, year: 2018 }, // Rowdy Baby
  s28:  { durationSec: 235, year: 2018 }, // Laung Laachi
  s29:  { durationSec: 198, year: 2018 }, // Nikle Currant
  s30:  { durationSec: 208, year: 2016 }, // Proper Patola
  s31:  { durationSec: 220, year: 2017 }, // Pehli Dafa
  s32:  { durationSec: 268, year: 2017 }, // Hawayein
  s33:  { durationSec: 282, year: 2019 }, // Kannaana Kanney
  s34:  { durationSec: 268, year: 2022 }, // Kesariya
  s35:  { durationSec: 217, year: 2021 }, // Ranjha
  s36:  { durationSec: 305, year: 2001 }, // Bole Chudiyan
  s37:  { durationSec: 310, year: 2012 }, // Woh Humsafar Tha
  s38:  { durationSec: 255, year: 2015 }, // Chaap Tilak
  s39:  { durationSec: 262, year: 2016 }, // Ik Vaari Aa
  s40:  { durationSec: 281, year: 2014 }, // Thinking Out Loud
  s41:  { durationSec: 263, year: 2017 }, // Perfect
  s42:  { durationSec: 212, year: 2008 }, // Desi Girl
  s43:  { durationSec: 235, year: 2010 }, // Ainvayi Ainvayi
  s44:  { durationSec: 268, year: 2015 }, // Prem Ratan Dhan Payo
  s45:  { durationSec: 243, year: 2013 }, // Tum Hi Ho
  s46:  { durationSec: 324, year: 2016 }, // Channa Mereya
  s47:  { durationSec: 192, year: 2020 }, // Samajavaragamana
  s48:  { durationSec: 270, year: 1985 }, // Tujhse Naraaz Nahin
  s49:  { durationSec: 215, year: 2021 }, // Vaathi Coming
  s50:  { durationSec: 228, year: 2022 }, // Arabic Kuthu
  s51:  { durationSec: 445, year: 1998 }, // Chaiyya Chaiyya
  s52:  { durationSec: 250, year: 2020 }, // Butta Bomma
  s53:  { durationSec: 178, year: 2021 }, // Kutti Story
  s54:  { durationSec: 225, year: 2015 }, // Runaway (Aurora)
  s55:  { durationSec: 208, year: 2017 }, // Don't Kill My Vibe
  s56:  { durationSec: 268, year: 2014 }, // A Sky Full of Stars
  s57:  { durationSec: 310, year: 1995 }, // Mehndi Laga Ke Rakhna
  s58:  { durationSec: 225, year: 2012 }, // Chan Kitthan
  s59:  { durationSec: 262, year: 1987 }, // Morni
  s60:  { durationSec: 238, year: 1994 }, // Mehendi Hai Rachne Wali
  s61:  { durationSec: 303, year: 2006 }, // Aaj Ki Raat
  s62:  { durationSec: 215, year: 2019 }, // Haldi (Jugaadi Thumka)
  s63:  { durationSec: 228, year: 1998 }, // Aaj Mere Yaar Ki Shaadi Hai
  s64:  { durationSec: 202, year: 2021 }, // Nach Punjaban
  s65:  { durationSec: 217, year: 2021 }, // Ranjha (Shershaah)
  s66:  { durationSec: 195, year: 1999 }, // Balle Balle
  s67:  { durationSec: 320, year: 2016 }, // Afreen Afreen v2
  s68:  { durationSec: 268, year: 2015 }, // Tere Bin
  s69:  { durationSec: 255, year: 2016 }, // Mere Rashke Qamar
  s70:  { durationSec: 232, year: 2019 }, // Ve Maahi
  s71:  { durationSec: 245, year: 2010 }, // Sooha Saaha
  s72:  { durationSec: 255, year: 2014 }, // Gallan Goodiyaan v2
  s73:  { durationSec: 202, year: 2018 }, // Chogada Tara
  s74:  { durationSec: 218, year: 2013 }, // Balam Pichkari
  s75:  { durationSec: 225, year: 2013 }, // Nagada Sang Dhol v2
  s76:  { durationSec: 210, year: 2017 }, // Badri Ki Dulhania
  s77:  { durationSec: 215, year: 2013 }, // Tattad Tattad
  s78:  { durationSec: 195, year: 2018 }, // Khalibali
  s79:  { durationSec: 215, year: 2014 }, // London Thumakda v2
  s80:  { durationSec: 195, year: 2016 }, // Zingaat
  s81:  { durationSec: 228, year: 2019 }, // Ghungroo
  s82:  { durationSec: 230, year: 2022 }, // Pasoori
  s83:  { durationSec: 205, year: 2019 }, // Lamberghini
  s84:  { durationSec: 218, year: 2021 }, // Naach Meri Rani
  s85:  { durationSec: 215, year: 2022 }, // What Jhumka
  s86:  { durationSec: 262, year: 2016 }, // Ik Vaari Aa v2
  s87:  { durationSec: 255, year: 2021 }, // Tu Jhoom
  s88:  { durationSec: 245, year: 2016 }, // Bol Do Na Zara
  s89:  { durationSec: 275, year: 2006 }, // Woh Lamhe
  s90:  { durationSec: 380, year: 2015 }, // Tajdar-e-Haram
  s91:  { durationSec: 262, year: 2018 }, // Dil Diyaan Gallaan
  s92:  { durationSec: 228, year: 2022 }, // Arabic Kuthu v2
  s93:  { durationSec: 243, year: 2018 }, // Rowdy Baby v2
  s94:  { durationSec: 250, year: 2020 }, // Butta Bomma v2
  s95:  { durationSec: 215, year: 2021 }, // Vaathi Coming v2
  s96:  { durationSec: 208, year: 2021 }, // Srivalli
  s97:  { durationSec: 218, year: 2012 }, // Marry Me (Train)
  s98:  { durationSec: 182, year: 1961 }, // Can't Help Falling in Love
  s99:  { durationSec: 207, year: 2005 }, // Better Together (Jack Johnson)
  s100: { durationSec: 200, year: 2019 }, // Blinding Lights
  s101: { durationSec: 234, year: 2017 }, // Shape of You
  s102: { durationSec: 248, year: 1680 }, // Canon in D
  s103: { durationSec: 285, year: 2011 }, // A Thousand Years
  s104: { durationSec: 295, year: 1825 }, // Ave Maria
  s105: { durationSec: 270, year: 2013 }, // All of Me
  s106: { durationSec: 181, year: 1960 }, // At Last
  s107: { durationSec: 147, year: 1964 }, // Fly Me to the Moon
  s108: { durationSec: 212, year: 1936 }, // The Way You Look Tonight
  s109: { durationSec: 175, year: 1965 }, // Feeling Good
  s110: { durationSec: 210, year: 1946 }, // La Vie En Rose
  s111: { durationSec: 168, year: 1961 }, // Moon River
  s112: { durationSec: 138, year: 1967 }, // What a Wonderful World
  s113: { durationSec: 180, year: 1961 }, // Stand By Me
  s114: { durationSec: 392, year: 1976 }, // Isn't She Lovely
  s115: { durationSec: 231, year: 1976 }, // Dancing Queen
  s116: { durationSec: 214, year: 1978 }, // September
  s117: { durationSec: 209, year: 1978 }, // Don't Stop Me Now
  s118: { durationSec: 201, year: 1969 }, // Sweet Caroline
  s119: { durationSec: 233, year: 2013 }, // Happy
  s120: { durationSec: 235, year: 2014 }, // Sugar
  s121: { durationSec: 229, year: 2010 }, // Marry You
  s122: { durationSec: 270, year: 2014 }, // Uptown Funk
  s123: { durationSec: 222, year: 2014 }, // Firestone
  s124: { durationSec: 219, year: 2015 }, // Stole the Show
  s125: { durationSec: 213, year: 2019 }, // Higher Love
  s126: { durationSec: 175, year: 2017 }, // Galway Girl
  s127: { durationSec: 195, year: 1900 }, // Hava Nagila
  s128: { durationSec: 245, year: 1964 }, // Zorba the Greek
  s129: { durationSec: 210, year: 1958 }, // Volare
  s130: { durationSec: 215, year: 1977 }, // 月亮代表我的心
  s131: { durationSec: 185, year: 1977 }, // One Love
  s132: { durationSec: 221, year: 2014 }, // Ojuelegba
  s133: { durationSec: 565, year: 1964 }, // Inta Omri

  // ── Arabic / Middle Eastern ──
  s134: { durationSec: 253, year: 1996 }, // Nour El Ein
  s135: { durationSec: 227, year: 2001 }, // Tamally Maak
  s136: { durationSec: 210, year: 2003 }, // Awedoony
  s137: { durationSec: 198, year: 2004 }, // Ah W Noss
  s138: { durationSec: 195, year: 2008 }, // Shakhbat Shakhabit
  s139: { durationSec: 222, year: 2006 }, // Lawn Einy
  s140: { durationSec: 280, year: 1978 }, // Nassam Alayna El Hawa
  s141: { durationSec: 260, year: 1975 }, // Bhebbak
  s142: { durationSec: 224, year: 2015 }, // LM3ALLEM
  s143: { durationSec: 232, year: 2017 }, // Ghazali
  s144: { durationSec: 220, year: 2019 }, // Mal Hbibi Malou
  s145: { durationSec: 228, year: 1992 }, // Didi
  s146: { durationSec: 255, year: 1996 }, // Aicha
  s147: { durationSec: 244, year: 1999 }, // C'est La Vie
  s148: { durationSec: 285, year: 2009 }, // For the Rest of My Life
  s149: { durationSec: 312, year: 2012 }, // Insha Allah
  s150: { durationSec: 295, year: 2011 }, // Ya Nabi Salam Alayka
  s151: { durationSec: 310, year: 2003 }, // Al Mu'allim
  s152: { durationSec: 218, year: 2018 }, // Ya Lili
  s153: { durationSec: 225, year: 2004 }, // Habibi Ana
  s154: { durationSec: 238, year: 2009 }, // Mosh Adra Aboad
  s155: { durationSec: 245, year: 2007 }, // Law Bayny W Baynak
  s156: { durationSec: 220, year: 2013 }, // Yelomo
  s157: { durationSec: 245, year: 2010 }, // Bahebak
  s158: { durationSec: 230, year: 2015 }, // Ana Masry
  s159: { durationSec: 220, year: 2018 }, // Ana Gheir
  s160: { durationSec: 228, year: 2020 }, // Nassini El Dounya
  s161: { durationSec: 215, year: 2016 }, // Matigi Hena
  s162: { durationSec: 260, year: 2002 }, // Ahla W Ahla
  s163: { durationSec: 250, year: 2015 }, // Ya Habayeb
  s164: { durationSec: 270, year: 2010 }, // Galbak Tayeb
  s165: { durationSec: 235, year: 2016 }, // Habibti
  s166: { durationSec: 198, year: 2021 }, // Rani Rani
  s167: { durationSec: 210, year: 2021 }, // Sofia
  s168: { durationSec: 230, year: 2011 }, // Meen Dah Elly Nasak
  s169: { durationSec: 215, year: 2022 }, // Kammalna
  s170: { durationSec: 200, year: 2018 }, // Oliver Twist Arabic Mix
  s171: { durationSec: 230, year: 2008 }, // Wana Masha'a Allah
  s172: { durationSec: 238, year: 1998 }, // Habibi Sawah
  s173: { durationSec: 250, year: 2014 }, // Wala Ala Balo
  s174: { durationSec: 240, year: 2015 }, // Leil El Eid
  s175: { durationSec: 290, year: 1967 }, // Zahrat El Mada'en
  s176: { durationSec: 205, year: 2012 }, // Toot Toot
  s177: { durationSec: 232, year: 2009 }, // Ya Salam
  s178: { durationSec: 235, year: 2017 }, // Bent El Sultan
  s179: { durationSec: 210, year: 2020 }, // Coucou
  s180: { durationSec: 225, year: 2019 }, // Basha El Masry
  s181: { durationSec: 248, year: 2015 }, // Hayat Alby
  s182: { durationSec: 220, year: 2016 }, // Albi
  s183: { durationSec: 230, year: 2018 }, // El Oum

  // ── Turkish ──
  s184: { durationSec: 228, year: 1999 }, // Şımarık
  s185: { durationSec: 235, year: 2003 }, // Dudu
  s186: { durationSec: 256, year: 2012 }, // Adını Kalbime Yazdım
  s187: { durationSec: 188, year: 2003 }, // Everyway That I Can
  s188: { durationSec: 220, year: 2006 }, // Aya Benzer
  s189: { durationSec: 242, year: 1994 }, // Gülümse
  s190: { durationSec: 198, year: 2009 }, // Düm Tek Tek
  s191: { durationSec: 230, year: 2010 }, // Bu Gece
  s192: { durationSec: 225, year: 2015 }, // Hayat Güzel
  s193: { durationSec: 215, year: 2021 }, // Can Dosta
  s194: { durationSec: 268, year: 2019 }, // Muhtaç
  s195: { durationSec: 225, year: 2020 }, // Yara Yara
  s196: { durationSec: 220, year: 2019 }, // Tövbe
  s197: { durationSec: 248, year: 1998 }, // Paramparça
  s198: { durationSec: 245, year: 2004 }, // Holocaust
  s199: { durationSec: 265, year: 2007 }, // Senden Daha Güzel
  s200: { durationSec: 218, year: 2000 }, // Araba
  s201: { durationSec: 215, year: 2021 }, // Çıkmaz Sokak
  s202: { durationSec: 240, year: 2014 }, // Yüksek Sesle
  s203: { durationSec: 225, year: 2018 }, // Müptezhel
  s204: { durationSec: 238, year: 2016 }, // Aşkı Bulamam Ben
  s205: { durationSec: 250, year: 2013 }, // Doğru Bilirim
  s206: { durationSec: 220, year: 2019 }, // Annen Güzel
  s207: { durationSec: 242, year: 2020 }, // Sonsuz
  s208: { durationSec: 235, year: 2007 }, // İnsanlar
  s209: { durationSec: 220, year: 2017 }, // Aşk Kaç Beden Giyer
  s210: { durationSec: 228, year: 2018 }, // Deli
  s211: { durationSec: 245, year: 2004 }, // Yandı Kalbim
  s212: { durationSec: 262, year: 2001 }, // Yalnızca Sen
  s213: { durationSec: 235, year: 2021 }, // Beraber

  // ── West African / Afrobeats ──
  s214: { durationSec: 248, year: 2020 }, // Essence
  s215: { durationSec: 228, year: 2017 }, // Come Closer
  s216: { durationSec: 215, year: 2018 }, // Soco
  s217: { durationSec: 222, year: 2015 }, // Ojuelegba
  s218: { durationSec: 218, year: 2018 }, // Ye
  s219: { durationSec: 225, year: 2019 }, // On The Low
  s220: { durationSec: 232, year: 2022 }, // Last Last
  s221: { durationSec: 205, year: 2023 }, // Way Too Big
  s222: { durationSec: 238, year: 2017 }, // Fall
  s223: { durationSec: 220, year: 2018 }, // Assurance
  s224: { durationSec: 245, year: 2019 }, // Jowo
  s225: { durationSec: 215, year: 2018 }, // FIA
  s226: { durationSec: 255, year: 2020 }, // Free Mind
  s227: { durationSec: 248, year: 2023 }, // Higher
  s228: { durationSec: 200, year: 2019 }, // Love Nwantiti
  s229: { durationSec: 218, year: 2017 }, // Leg Over
  s230: { durationSec: 222, year: 2017 }, // Pour Me Water
  s231: { durationSec: 210, year: 2020 }, // Koroba
  s232: { durationSec: 235, year: 2021 }, // Somebody's Son
  s233: { durationSec: 195, year: 2017 }, // Wo!
  s234: { durationSec: 210, year: 2018 }, // Science Student
  s235: { durationSec: 205, year: 2021 }, // Peru
  s236: { durationSec: 225, year: 2019 }, // Jealous
  s237: { durationSec: 218, year: 2022 }, // Calm Down
  s238: { durationSec: 205, year: 2022 }, // Bounce
  s239: { durationSec: 230, year: 2021 }, // Attention
  s240: { durationSec: 202, year: 2022 }, // Buga
  s241: { durationSec: 238, year: 2019 }, // Baby
  s242: { durationSec: 200, year: 2022 }, // Rush
  s243: { durationSec: 210, year: 2021 }, // Bloody Samaritan
  s244: { durationSec: 198, year: 2022 }, // Sungba
  s245: { durationSec: 205, year: 2022 }, // Palazzo
  s246: { durationSec: 212, year: 2022 }, // Finesse
  s247: { durationSec: 215, year: 2014 }, // Johnny
  s248: { durationSec: 210, year: 2015 }, // Oh My Gosh
  s249: { durationSec: 228, year: 2016 }, // Personally
  s250: { durationSec: 215, year: 2012 }, // Oliver Twist
  s251: { durationSec: 220, year: 2018 }, // Sexy Dance
  s252: { durationSec: 238, year: 2021 }, // Deja Vu
  s253: { durationSec: 215, year: 2023 }, // Super Powers
  s254: { durationSec: 235, year: 2022 }, // Stand Strong
  s255: { durationSec: 228, year: 2022 }, // Midnight
  s256: { durationSec: 218, year: 2021 }, // Bolo Bolo
  s257: { durationSec: 208, year: 2022 }, // EMOTION
  s258: { durationSec: 225, year: 2022 }, // Mood

  // ── Latin ──
  s259: { durationSec: 218, year: 2020 }, // Dakiti
  s260: { durationSec: 215, year: 2022 }, // Tití Me Preguntó
  s261: { durationSec: 228, year: 2022 }, // Moscow Mule
  s262: { durationSec: 200, year: 2017 }, // Mi Gente
  s263: { durationSec: 192, year: 2019 }, // Reggaetón
  s264: { durationSec: 212, year: 2004 }, // Gasolina
  s265: { durationSec: 198, year: 2018 }, // Dura
  s266: { durationSec: 205, year: 2019 }, // Con Calma
  s267: { durationSec: 228, year: 2013 }, // Vivir Mi Vida
  s268: { durationSec: 235, year: 2013 }, // Propuesta Indecente
  s269: { durationSec: 218, year: 2010 }, // Waka Waka
  s270: { durationSec: 215, year: 2014 }, // La La La
  s271: { durationSec: 225, year: 2017 }, // Chantaje
  s272: { durationSec: 198, year: 2014 }, // Lean On
  s273: { durationSec: 205, year: 2017 }, // MIA
  s274: { durationSec: 222, year: 2018 }, // X
  s275: { durationSec: 210, year: 2019 }, // Taki Taki
  s276: { durationSec: 215, year: 2018 }, // Mia
  s277: { durationSec: 225, year: 2018 }, // Te Boté
  s278: { durationSec: 210, year: 2019 }, // Con Altura
  s279: { durationSec: 218, year: 2019 }, // Soltera
  s280: { durationSec: 225, year: 2019 }, // Callaíta
  s281: { durationSec: 235, year: 2018 }, // Me Niego
  s282: { durationSec: 218, year: 1985 }, // Conga
  s283: { durationSec: 215, year: 2011 }, // On the Floor
  s284: { durationSec: 225, year: 1999 }, // Waiting for Tonight
  s285: { durationSec: 228, year: 2016 }, // Reggaetón Lento
  s286: { durationSec: 228, year: 2017 }, // Despacito
  s287: { durationSec: 212, year: 2017 }, // Échame La Culpa
  s288: { durationSec: 200, year: 2019 }, // Tusa
  s289: { durationSec: 195, year: 2020 }, // Bichota
  s290: { durationSec: 218, year: 2021 }, // Todo de Ti
  s291: { durationSec: 225, year: 2015 }, // El Perdón
  s292: { durationSec: 210, year: 1994 }, // Bidi Bidi Bom Bom
  s293: { durationSec: 205, year: 2018 }, // I Like It
  s294: { durationSec: 215, year: 2017 }, // Subeme la Radio
  s295: { durationSec: 208, year: 2019 }, // China
  s296: { durationSec: 222, year: 2019 }, // Te Robaré
  s297: { durationSec: 218, year: 2019 }, // La Canción
  s298: { durationSec: 200, year: 2019 }, // Que Calor
  s299: { durationSec: 235, year: 2019 }, // Contigo
  s300: { durationSec: 205, year: 2015 }, // Lean On
  s301: { durationSec: 195, year: 2021 }, // Pepas
  s302: { durationSec: 228, year: 2022 }, // Ojitos Lindos
  s303: { durationSec: 212, year: 2021 }, // Butter
  ...EXTENDED_META,
};

export function getSongMeta(songId: string): SongMeta {
  return SONG_META[songId] ?? { durationSec: 210, year: 2018 };
}

export function formatDuration(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function getSongDecade(year: number): string {
  if (year < 1980) return "70s";
  if (year < 1990) return "80s";
  if (year < 2000) return "90s";
  if (year < 2010) return "2000s";
  if (year < 2020) return "2010s";
  return "2020s";
}
