// Auto-generated culture image registry
// All images are stored in assets/images/cultures/
const CULTURE_IMAGES: Record<string, any> = {
  punjabi:        require("../assets/images/cultures/punjabi.png"),
  pakistani:      require("../assets/images/cultures/pakistani.png"),
  north_indian:   require("../assets/images/cultures/north_indian.png"),
  south_indian:   require("../assets/images/cultures/south_indian.png"),
  sikh:           require("../assets/images/cultures/sikh.png"),
  hindu:          require("../assets/images/cultures/hindu.png"),
  muslim:         require("../assets/images/cultures/muslim.png"),
  bengali:        require("../assets/images/cultures/bengali.png"),
  gujarati:       require("../assets/images/cultures/gujarati.png"),
  marathi:        require("../assets/images/cultures/marathi.png"),
  tamil:          require("../assets/images/cultures/tamil.png"),
  telugu:         require("../assets/images/cultures/telugu.png"),
  malayali:       require("../assets/images/cultures/malayali.png"),
  arabic:         require("../assets/images/cultures/arabic.png"),
  moroccan:       require("../assets/images/cultures/moroccan.png"),
  turkish:        require("../assets/images/cultures/turkish.png"),
  persian:        require("../assets/images/cultures/persian.png"),
  nigerian:       require("../assets/images/cultures/nigerian.png"),
  ghanaian:       require("../assets/images/cultures/ghanaian.png"),
  afro_caribbean: require("../assets/images/cultures/afro_caribbean.png"),
  chinese:        require("../assets/images/cultures/chinese.png"),
  korean:         require("../assets/images/cultures/korean.png"),
  jewish:         require("../assets/images/cultures/jewish.png"),
  greek:          require("../assets/images/cultures/greek.png"),
  italian:        require("../assets/images/cultures/italian.png"),
  irish:          require("../assets/images/cultures/irish.png"),
  british:        require("../assets/images/cultures/british.png"),
  american:       require("../assets/images/cultures/american.png"),
  australian:     require("../assets/images/cultures/australian.png"),
  norwegian:      require("../assets/images/cultures/norwegian.png"),
  caribbean:      require("../assets/images/cultures/caribbean.png"),
  mixed:          require("../assets/images/cultures/mixed.png"),
};

export function getCultureImage(cultureId: string): any {
  return CULTURE_IMAGES[cultureId] ?? null;
}
