export interface Profile {
  id: string;
  email: string;
  age: number | null;
  sex: 'male' | 'female' | null;
  weight_kg: number | null;
  diet_type: string;
  created_at: string;
  updated_at: string;
}

export interface Nutrient {
  id: number;
  name: string;
  unit_name: string;
  nutrient_nbr: string | null;
  category: 'macronutrient' | 'vitamin' | 'mineral' | 'other';
}

export interface Food {
  id: number;
  fdc_id: string | null;
  name: string;
  data_type: 'seed' | 'usda' | 'custom' | 'recipe';
  brand_owner: string | null;
  category: string | null;
  created_at: string;
}

export interface ServingSize {
  id: number;
  food_id: number;
  amount: number;
  unit_name: string;
  gram_weight: number;
  is_default: boolean;
}

export interface FoodNutrient {
  id: number;
  food_id: number;
  nutrient_id: number;
  amount: number;
}

export interface LogEntry {
  id: string;
  user_id: string;
  food_id: number;
  serving_size_id: number | null;
  logged_amount: number;
  logged_unit: string;
  gram_equivalent: number;
  meal: 'breakfast' | 'lunch' | 'dinner' | 'snack' | null;
  logged_date: string;
  logged_at: string;
  created_at: string;
  updated_at: string;
}

export interface DailySummary {
  id: string;
  user_id: string;
  date: string;
  nutrient_id: number;
  total_amount: number;
  unit_name: string;
  updated_at: string;
}

export interface UserTarget {
  id: number;
  user_id: string;
  nutrient_id: number;
  min_amount: number | null;
  max_amount: number | null;
  unit_name: string;
}

export interface FoodWithNutrients extends Food {
  serving_sizes?: ServingSize[];
  food_nutrients?: (FoodNutrient & { nutrients?: Nutrient })[];
}

export interface DailySummaryWithNutrient extends DailySummary {
  nutrients?: Nutrient;
}

export interface LogEntryWithFood extends LogEntry {
  foods?: Food;
  serving_sizes?: ServingSize;
}

export interface LogEntryInput {
  food_id: number;
  serving_size_id: number | null;
  logged_amount: number;
  logged_unit: string;
  gram_equivalent: number;
  meal: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  logged_date: string;
}

export interface ProfileInput {
  age: number | null;
  sex: 'male' | 'female' | null;
  weight_kg: number | null;
  diet_type: string;
}

export interface NutrientDisplay {
  nutrient: Nutrient;
  current: number;
  target_min: number | null;
  target_max: number | null;
  unit: string;
  status: 'present' | 'zero' | 'missing';
}

export interface DailyDashboard {
  date: string;
  nutrients: NutrientDisplay[];
  totalCalories: number;
}
