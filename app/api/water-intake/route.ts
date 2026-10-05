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

  const { data: waterEntries, error } = await supabase
    .from('water_intake')
    .select('*')
    .eq('user_id', user.id)
    .eq('logged_date', date)
    .order('logged_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const totalMl = waterEntries?.reduce((sum, entry) => sum + entry.amount_ml, 0) || 0;

  return NextResponse.json({ 
    entries: waterEntries || [],
    total_ml: totalMl 
  });
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { amount_ml, logged_date } = body;

  if (!amount_ml || amount_ml <= 0) {
    return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
  }

  const { data: entry, error } = await supabase
    .from('water_intake')
    .insert({
      user_id: user.id,
      amount_ml,
      logged_date: logged_date || new Date().toISOString().split('T')[0],
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ entry }, { status: 201 });
}

export async function DELETE(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'Missing entry id' }, { status: 400 });
  }

  const { error } = await supabase
    .from('water_intake')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
