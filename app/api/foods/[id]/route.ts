import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const { id } = await params;
  const foodId = parseInt(id, 10);

  if (isNaN(foodId)) {
    return NextResponse.json({ error: 'Invalid food ID' }, { status: 400 });
  }

  const { data: food, error: foodError } = await supabase
    .from('foods')
    .select('id, name, category, data_type, brand_owner')
    .eq('id', foodId)
    .single();

  if (foodError || !food) {
    return NextResponse.json({ error: 'Food not found' }, { status: 404 });
  }

  const { data: servingSizes, error: servingError } = await supabase
    .from('serving_sizes')
    .select('id, amount, unit_name, gram_weight, is_default')
    .eq('food_id', foodId)
    .order('is_default', { ascending: false });

  if (servingError) {
    return NextResponse.json({ error: servingError.message }, { status: 500 });
  }

  const { data: foodNutrients, error: nutrientError } = await supabase
    .from('food_nutrients')
    .select('id, nutrient_id, amount, nutrients(id, name, unit_name, category)')
    .eq('food_id', foodId);

  if (nutrientError) {
    return NextResponse.json({ error: nutrientError.message }, { status: 500 });
  }

  return NextResponse.json({
    food: {
      ...food,
      serving_sizes: servingSizes || [],
      food_nutrients: foodNutrients || [],
    },
  });
}
