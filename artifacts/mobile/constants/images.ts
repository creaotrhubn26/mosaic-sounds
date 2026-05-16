const MOMENT_IMAGES: Record<string, ReturnType<typeof require>> = {
  // Western / universal moments
  guest_arrival:   require("@/assets/images/moments/guest_arrival.png"),
  ceremony:        require("@/assets/images/moments/ceremony.png"),
  wedding_march:   require("@/assets/images/moments/wedding_march.png"),
  signing:         require("@/assets/images/moments/signing.png"),
  cocktail_hour:   require("@/assets/images/moments/cocktail_hour.png"),
  first_dance:     require("@/assets/images/moments/first_dance.png"),
  toast_speeches:  require("@/assets/images/moments/toast_speeches.png"),
  dinner:          require("@/assets/images/moments/dinner.png"),
  cake_cutting:    require("@/assets/images/moments/cake_cutting.png"),
  family_dance:    require("@/assets/images/moments/family_dance.png"),
  afterparty:      require("@/assets/images/moments/afterparty.png"),
  // South Asian moments
  baraat:          require("@/assets/images/moments/baraat.png"),
  bride_entry:     require("@/assets/images/moments/bride_entry.png"),
  couple_entry:    require("@/assets/images/moments/couple_entry.png"),
  pheras:          require("@/assets/images/moments/pheras.png"),
  sangeet:         require("@/assets/images/moments/sangeet.png"),
  mehndi:          require("@/assets/images/moments/mehndi.png"),
  haldi:           require("@/assets/images/moments/haldi.png"),
  vidaai:          require("@/assets/images/moments/vidaai.png"),
  mehndi_groom:    require("@/assets/images/moments/mehndi_groom.png"),
  // Islamic moments
  nikah:           require("@/assets/images/moments/nikah.png"),
  walima:          require("@/assets/images/moments/walima.png"),
};

export function getMomentImage(momentId: string) {
  return MOMENT_IMAGES[momentId] ?? null;
}
