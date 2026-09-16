import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

config({ path: resolve(__dirname, '..', '.env.local') });

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function cleanup() {
  console.log('Starting cleanup...\n');

  const { data: allFoods, error } = await supabase
    .from('foods')
    .select('id, name')
    .order('id');

  if (error) {
    console.error('Error fetching foods:', error);
    process.exit(1);
  }

  const foodMap = new Map<string, number[]>();
  
  for (const food of allFoods) {
    if (!foodMap.has(food.name)) {
      foodMap.set(food.name, []);
    }
    foodMap.get(food.name)!.push(food.id);
  }

  let duplicatesRemoved = 0;

  for (const [name, ids] of foodMap.entries()) {
    if (ids.length > 1) {
      console.log(`Found ${ids.length} duplicates of "${name}"`);
      
      const keepId = ids[0];
      const removeIds = ids.slice(1);

      for (const removeId of removeIds) {
        await supabase.from('food_nutrients').delete().eq('food_id', removeId);
        await supabase.from('serving_sizes').delete().eq('food_id', removeId);
        await supabase.from('foods').delete().eq('id', removeId);
        duplicatesRemoved++;
      }
    }
  }

  console.log(`\n✅ Removed ${duplicatesRemoved} duplicate foods`);
}

cleanup().catch((error) => {
  console.error('Cleanup failed:', error);
  process.exit(1);
});
