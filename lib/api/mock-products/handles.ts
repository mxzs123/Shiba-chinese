export const COLLECTION_HANDLES = {
  PHARMACY: "pharmacy",
  SUPPLEMENTS: "supplements",
  HEART_SUPPORT: "heart-support",
  GUT_HEALTH: "gut-health",
  BEAUTY_NUTRITION: "beauty-nutrition",
  BONE_JOINT: "bone-joint",
  EYE_CARE: "eye-care",
  HOME_FEATURED: "home-featured",
  HOME_CAROUSEL: "home-carousel",
} as const;

export type CollectionHandle =
  (typeof COLLECTION_HANDLES)[keyof typeof COLLECTION_HANDLES];
