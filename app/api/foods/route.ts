import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');
  const category = searchParams.get('category');

  if (!query || query.trim().length === 0) {
    return NextResponse.json({ foods: [] });
  }

  let supabaseQuery = supabase
    .from('foods')
    .select('id, name, category, data_type')
    .ilike('name', `%${query}%`)
    .order('name')
    .limit(50);

  if (category && category !== 'all') {
    supabaseQuery = supabaseQuery.eq('category', category);
  }

  const { data: foods, error } = await supabaseQuery;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ foods: foods || [] });
}
