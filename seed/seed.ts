import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

config({ path: resolve(__dirname, '..', '.env.local') });

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing environment variables. Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface SeedFood {
  name: string;
  category: string;
  servingSizes: {
    amount: number;
    unit_name: string;
    gram_weight: number;
    is_default?: boolean;
  }[];
  nutrients: Record<string, number>;
}

const NUTRIENT_DEFINITIONS = [
  { name: 'Calories', unit_name: 'kcal', nutrient_nbr: '208', category: 'macronutrient' },
  { name: 'Protein', unit_name: 'g', nutrient_nbr: '203', category: 'macronutrient' },
  { name: 'Carbohydrate', unit_name: 'g', nutrient_nbr: '205', category: 'macronutrient' },
  { name: 'Fat', unit_name: 'g', nutrient_nbr: '204', category: 'macronutrient' },
  { name: 'Fiber', unit_name: 'g', nutrient_nbr: '291', category: 'macronutrient' },
  { name: 'Sugar', unit_name: 'g', nutrient_nbr: '269', category: 'macronutrient' },
  { name: 'Calcium', unit_name: 'mg', nutrient_nbr: '301', category: 'mineral' },
  { name: 'Iron', unit_name: 'mg', nutrient_nbr: '303', category: 'mineral' },
  { name: 'Magnesium', unit_name: 'mg', nutrient_nbr: '304', category: 'mineral' },
  { name: 'Phosphorus', unit_name: 'mg', nutrient_nbr: '305', category: 'mineral' },
  { name: 'Potassium', unit_name: 'mg', nutrient_nbr: '306', category: 'mineral' },
  { name: 'Sodium', unit_name: 'mg', nutrient_nbr: '307', category: 'mineral' },
  { name: 'Zinc', unit_name: 'mg', nutrient_nbr: '309', category: 'mineral' },
  { name: 'Vitamin C', unit_name: 'mg', nutrient_nbr: '401', category: 'vitamin' },
  { name: 'Vitamin A', unit_name: 'µg', nutrient_nbr: '318', category: 'vitamin' },
  { name: 'Vitamin D', unit_name: 'µg', nutrient_nbr: '431', category: 'vitamin' },
  { name: 'Vitamin B6', unit_name: 'mg', nutrient_nbr: '415', category: 'vitamin' },
  { name: 'Vitamin B12', unit_name: 'µg', nutrient_nbr: '417', category: 'vitamin' },
];

async function seed() {
  console.log('Starting seed process...\n');

  console.log('Step 1: Inserting nutrients...');
  const nutrientMap = new Map<string, number>();
  
  for (const nutrient of NUTRIENT_DEFINITIONS) {
    const { data, error } = await supabase
      .from('nutrients')
      .upsert(nutrient, { onConflict: 'name' })
      .select()
      .single();

    if (error) {
      console.error(`Error inserting nutrient ${nutrient.name}:`, error);
      process.exit(1);
    }

    nutrientMap.set(nutrient.name, data.id);
  }
  console.log(`✓ Inserted ${nutrientMap.size} nutrients\n`);

  console.log('Step 2: Reading foods.json...');
  const foodsPath = path.join(__dirname, 'foods.json');
  const foodsData: SeedFood[] = JSON.parse(fs.readFileSync(foodsPath, 'utf-8'));
  console.log(`✓ Found ${foodsData.length} foods\n`);

  console.log('Step 3: Inserting foods, serving sizes, and nutrients...');
  
  for (let i = 0; i < foodsData.length; i++) {
    const food = foodsData[i];
    const progress = `[${i + 1}/${foodsData.length}]`;

    const { data: insertedFood, error: foodError } = await supabase
      .from('foods')
      .insert({
        name: food.name,
        category: food.category,
        data_type: 'seed',
      })
      .select()
      .single();

    if (foodError) {
      console.error(`${progress} Error inserting food ${food.name}:`, foodError);
      continue;
    }

    const foodId = insertedFood.id;

    for (const serving of food.servingSizes) {
      const { error: servingError } = await supabase
        .from('serving_sizes')
        .insert({
          food_id: foodId,
          amount: serving.amount,
          unit_name: serving.unit_name,
          gram_weight: serving.gram_weight,
          is_default: serving.is_default || false,
        });

      if (servingError) {
        console.error(`${progress} Error inserting serving size for ${food.name}:`, servingError);
      }
    }

    for (const [nutrientName, amount] of Object.entries(food.nutrients)) {
      const nutrientId = nutrientMap.get(nutrientName);
      
      if (!nutrientId) {
        console.warn(`${progress} Warning: Nutrient "${nutrientName}" not found in definitions, skipping`);
        continue;
      }

      const { error: nutrientError } = await supabase
        .from('food_nutrients')
        .insert({
          food_id: foodId,
          nutrient_id: nutrientId,
          amount: amount,
        });

      if (nutrientError) {
        console.error(`${progress} Error inserting nutrient ${nutrientName} for ${food.name}:`, nutrientError);
      }
    }

    console.log(`${progress} ✓ ${food.name}`);
  }

  console.log('\n✅ Seed process completed successfully!');
}

seed().catch((error) => {
  console.error('Seed process failed:', error);
  process.exit(1);
});
