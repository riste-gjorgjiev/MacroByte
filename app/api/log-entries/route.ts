import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const date = searchParams.get('date') || new Date().toISOString().split('T')[0];

  const { data: logEntries, error } = await supabase
    .from('log_entries')
    .select(`
      *,
      foods (
        id,
        name,
        category
      ),
      serving_sizes (
        id,
        amount,
        unit_name,
        gram_weight
      )
    `)
    .eq('user_id', user.id)
    .eq('logged_date', date)
    .order('logged_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ logEntries: logEntries || [] });
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { food_id, serving_size_id, logged_amount, logged_unit, gram_equivalent, meal, logged_date } = body;

  if (!food_id || !logged_amount || !logged_unit || !gram_equivalent || !logged_date) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const { data: logEntry, error: insertError } = await supabase
    .from('log_entries')
    .insert({
      user_id: user.id,
      food_id,
      serving_size_id,
      logged_amount,
      logged_unit,
      gram_equivalent,
      meal,
      logged_date,
    })
    .select()
    .single();

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  await recalculateDailySummary(supabase, user.id, logged_date);

  return NextResponse.json({ logEntry }, { status: 201 });
}

async function recalculateDailySummary(supabase: any, userId: string, date: string) {
  const { data: logEntries } = await supabase
    .from('log_entries')
    .select(`
      gram_equivalent,
      foods (
        food_nutrients (
          nutrient_id,
          amount,
          nutrients (
            id,
            name,
            unit_name
          )
        )
      )
    `)
    .eq('user_id', userId)
    .eq('logged_date', date);

  if (!logEntries || logEntries.length === 0) {
    await supabase
      .from('daily_summaries')
      .delete()
      .eq('user_id', userId)
      .eq('date', date);
    return;
  }

  const nutrientTotals = new Map<number, { total: number; unit_name: string }>();

  for (const entry of logEntries) {
    const gramEquivalent = parseFloat(entry.gram_equivalent);
    const foodNutrients = entry.foods?.food_nutrients || [];

    for (const fn of foodNutrients) {
      const nutrientId = fn.nutrient_id;
      const amountPer100g = parseFloat(fn.amount);
      const actualAmount = (amountPer100g * gramEquivalent) / 100;

      if (!nutrientTotals.has(nutrientId)) {
        nutrientTotals.set(nutrientId, {
          total: 0,
          unit_name: fn.nutrients.unit_name,
        });
      }

      const current = nutrientTotals.get(nutrientId)!;
      current.total += actualAmount;
    }
  }

  const summaries = Array.from(nutrientTotals.entries()).map(([nutrientId, data]) => ({
    user_id: userId,
    date,
    nutrient_id: nutrientId,
    total_amount: data.total,
    unit_name: data.unit_name,
  }));

  await supabase
    .from('daily_summaries')
    .delete()
    .eq('user_id', userId)
    .eq('date', date);

  if (summaries.length > 0) {
    await supabase
      .from('daily_summaries')
      .insert(summaries);
  }
}
