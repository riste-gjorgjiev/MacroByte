import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { readFileSync } from 'fs';

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

async function runMigration() {
  console.log('Running migration: 003_add_water_intake.sql\n');

  const migrationPath = resolve(__dirname, '..', 'supabase', 'migrations', '003_add_water_intake.sql');
  const sql = readFileSync(migrationPath, 'utf-8');

  // Split by semicolons and execute each statement
  const statements = sql.split(';').filter(s => s.trim());
  
  for (const statement of statements) {
    const { error } = await supabase.rpc('exec_sql', { sql: statement + ';' });
    
    if (error) {
      console.error('Migration failed:', error);
      process.exit(1);
    }
  }

  console.log('✅ Migration completed successfully!');
}

runMigration().catch((error) => {
  console.error('Migration failed:', error);
  process.exit(1);
});
