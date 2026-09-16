import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: targets, error } = await supabase
    .from('user_targets')
    .select(`
      *,
      nutrients (
        id,
        name,
        unit_name,
        category
      )
    `)
    .eq('user_id', user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ targets: targets || [] });
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { nutrient_id, min_amount, max_amount, unit_name } = body;

  const { data: target, error } = await supabase
    .from('user_targets')
    .upsert({
      user_id: user.id,
      nutrient_id,
      min_amount,
      max_amount,
      unit_name,
    }, {
      onConflict: 'user_id,nutrient_id',
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ target });
}

export async function DELETE(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const nutrientId = searchParams.get('nutrient_id');

  if (!nutrientId) {
    return NextResponse.json({ error: 'nutrient_id is required' }, { status: 400 });
  }

  const { error } = await supabase
    .from('user_targets')
    .delete()
    .eq('user_id', user.id)
    .eq('nutrient_id', parseInt(nutrientId));

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
