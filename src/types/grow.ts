// src/types/grow.ts:

export enum GrowsSortField {
  NAME = "name",
  CREATED_AT = "createdAt",
  UPDATED_AT = "updatedAt",
}

export enum GrowsViewMode {
  PAGINATION = "pagination",
  INFINITE_SCROLL = "infinite-scroll",
}

// Grow environment types for filtering
export enum GrowEnvironment {
  INDOOR = "indoor",
  OUTDOOR = "outdoor",
  GREENHOUSE = "greenhouse",
}

// Culture medium types for filtering
export enum CultureMedium {
  SOIL = "soil",
  COCO = "coco",
  HYDROPONIC = "hydroponic",
  ROCKWOOL = "rockwool",
  PERLITE = "perlite",
}

// Fertilizer types for filtering
export enum FertilizerType {
  ORGANIC = "organic",
  MINERAL = "mineral",
}

// Fertilizer form/application method for filtering
export enum FertilizerForm {
  LIQUID = "liquid",
  GRANULAR = "granular",
  SLOW_RELEASE = "slow_release",
}

// Emoji prefixes for consistent visual representation across the app
export const GROW_ENVIRONMENT_EMOJIS = {
  [GrowEnvironment.INDOOR]: "💡",
  [GrowEnvironment.OUTDOOR]: "🌞",
  [GrowEnvironment.GREENHOUSE]: "🏕️",
} as const;

export const CULTURE_MEDIUM_EMOJIS = {
  [CultureMedium.SOIL]: "🌱",
  [CultureMedium.COCO]: "🥥",
  [CultureMedium.HYDROPONIC]: "🌊",
  [CultureMedium.ROCKWOOL]: "🧱",
  [CultureMedium.PERLITE]: "⚪",
} as const;

export const FERTILIZER_TYPE_EMOJIS = {
  [FertilizerType.MINERAL]: "🧪",
  [FertilizerType.ORGANIC]: "🌿",
} as const;

export const FERTILIZER_FORM_EMOJIS = {
  [FertilizerForm.LIQUID]: "💧",
  [FertilizerForm.GRANULAR]: "💎",
  [FertilizerForm.SLOW_RELEASE]: "⏱️",
} as const;

// Translation key mappings for each enum
export const GROW_ENVIRONMENT_TRANSLATION_KEYS = {
  [GrowEnvironment.INDOOR]: "environment-indoor",
  [GrowEnvironment.OUTDOOR]: "environment-outdoor",
  [GrowEnvironment.GREENHOUSE]: "environment-greenhouse",
} as const;

export const CULTURE_MEDIUM_TRANSLATION_KEYS = {
  [CultureMedium.SOIL]: "culture-medium-soil",
  [CultureMedium.COCO]: "culture-medium-coco",
  [CultureMedium.HYDROPONIC]: "culture-medium-hydro",
  [CultureMedium.ROCKWOOL]: "culture-medium-rockwool",
  [CultureMedium.PERLITE]: "culture-medium-perlite",
} as const;

export const FERTILIZER_TYPE_TRANSLATION_KEYS = {
  [FertilizerType.ORGANIC]: "fertilizer-type-organic",
  [FertilizerType.MINERAL]: "fertilizer-type-mineral",
} as const;

export const FERTILIZER_FORM_TRANSLATION_KEYS = {
  [FertilizerForm.LIQUID]: "fertilizer-form-liquid",
  [FertilizerForm.GRANULAR]: "fertilizer-form-granular",
  [FertilizerForm.SLOW_RELEASE]: "fertilizer-form-slow_release",
} as const;

// Helper function to create emoji-prefixed translated labels
export const createLabelWithEmoji = (
  emoji: string,
  translatedText: string,
): string => `${emoji} ${translatedText}`;

// Helper functions to get emoji prefixes
export const getGrowEnvironmentEmoji = (value: GrowEnvironment): string =>
  GROW_ENVIRONMENT_EMOJIS[value] || "";

export const getCultureMediumEmoji = (value: CultureMedium): string =>
  CULTURE_MEDIUM_EMOJIS[value] || "";

export const getFertilizerTypeEmoji = (value: FertilizerType): string =>
  FERTILIZER_TYPE_EMOJIS[value] || "";

export const getFertilizerFormEmoji = (value: FertilizerForm): string =>
  FERTILIZER_FORM_EMOJIS[value] || "";

// Helper functions to get translation keys
export const getGrowEnvironmentTranslationKey = (
  value: GrowEnvironment,
): string => GROW_ENVIRONMENT_TRANSLATION_KEYS[value] || value;

export const getCultureMediumTranslationKey = (value: CultureMedium): string =>
  CULTURE_MEDIUM_TRANSLATION_KEYS[value] || value;

export const getFertilizerTypeTranslationKey = (
  value: FertilizerType,
): string => FERTILIZER_TYPE_TRANSLATION_KEYS[value] || value;

export const getFertilizerFormTranslationKey = (
  value: FertilizerForm,
): string => FERTILIZER_FORM_TRANSLATION_KEYS[value] || value;
