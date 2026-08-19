export const NUTRIENT_CATEGORIES = {
  MACRONUTRIENT: 'macronutrient',
  VITAMIN: 'vitamin',
  MINERAL: 'mineral',
  OTHER: 'other',
} as const;

export const COMMON_NUTRIENTS = {
  CALORIES: 'Calories',
  PROTEIN: 'Protein',
  CARBOHYDRATE: 'Carbohydrate',
  FAT: 'Fat',
  FIBER: 'Fiber',
  SUGAR: 'Sugar',
  CALCIUM: 'Calcium',
  IRON: 'Iron',
  MAGNESIUM: 'Magnesium',
  PHOSPHORUS: 'Phosphorus',
  POTASSIUM: 'Potassium',
  SODIUM: 'Sodium',
  ZINC: 'Zinc',
  VITAMIN_C: 'Vitamin C',
  VITAMIN_A: 'Vitamin A',
  VITAMIN_D: 'Vitamin D',
  VITAMIN_B6: 'Vitamin B6',
  VITAMIN_B12: 'Vitamin B12',
} as const;

export const MEAL_TYPES = {
  BREAKFAST: 'breakfast',
  LUNCH: 'lunch',
  DINNER: 'dinner',
  SNACK: 'snack',
} as const;

export const DIET_TYPES = {
  OMNIVORE: 'omnivore',
  VEGETARIAN: 'vegetarian',
  VEGAN: 'vegan',
  KETO: 'keto',
  PALEO: 'paleo',
} as const;

export const DEFAULT_TARGETS = {
  CALORIES: { min: 2000, max: 2500, unit: 'kcal' },
  PROTEIN: { min: 50, max: 70, unit: 'g' },
  CARBOHYDRATE: { min: 225, max: 325, unit: 'g' },
  FAT: { min: 44, max: 78, unit: 'g' },
  FIBER: { min: 25, max: 35, unit: 'g' },
  SUGAR: { min: null, max: 50, unit: 'g' },
  CALCIUM: { min: 1000, max: 2500, unit: 'mg' },
  IRON: { min: 8, max: 45, unit: 'mg' },
  MAGNESIUM: { min: 400, max: 350, unit: 'mg' },
  PHOSPHORUS: { min: 700, max: 4000, unit: 'mg' },
  POTASSIUM: { min: 3400, max: 4700, unit: 'mg' },
  SODIUM: { min: null, max: 2300, unit: 'mg' },
  ZINC: { min: 8, max: 40, unit: 'mg' },
  VITAMIN_C: { min: 75, max: 2000, unit: 'mg' },
  VITAMIN_A: { min: 700, max: 3000, unit: 'µg' },
  VITAMIN_D: { min: 15, max: 100, unit: 'µg' },
  VITAMIN_B6: { min: 1.3, max: 100, unit: 'mg' },
  VITAMIN_B12: { min: 2.4, max: null, unit: 'µg' },
} as const;

export const QUERY_KEYS = {
  FOODS: 'foods',
  FOOD_DETAIL: 'foodDetail',
  DAILY_SUMMARY: 'dailySummary',
  LOG_ENTRIES: 'logEntries',
  PROFILE: 'profile',
  USER_TARGETS: 'userTargets',
} as const;
