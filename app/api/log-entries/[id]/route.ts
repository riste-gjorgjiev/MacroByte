import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();

  const { data: existing, error: fetchError } = await supabase
    .from('log_entries')
    .select('logged_date')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (fetchError || !existing) {
    return NextResponse.json({ error: 'Log entry not found' }, { status: 404 });
  }

  const { data: logEntry, error: updateError } = await supabase
    .from('log_entries')
    .update({
      ...body,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single();

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  const dateToUpdate = body.logged_date || existing.logged_date;
  await recalculateDailySummary(supabase, user.id, dateToUpdate);

  if (body.logged_date && body.logged_date !== existing.logged_date) {
    await recalculateDailySummary(supabase, user.id, existing.logged_date);
  }

  return NextResponse.json({ logEntry });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  const { data: existing, error: fetchError } = await supabase
    .from('log_entries')
    .select('logged_date')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (fetchError || !existing) {
    return NextResponse.json({ error: 'Log entry not found' }, { status: 404 });
  }

  const { error: deleteError } = await supabase
    .from('log_entries')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 500 });
  }

  await recalculateDailySummary(supabase, user.id, existing.logged_date);

  return NextResponse.json({ success: true });
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
