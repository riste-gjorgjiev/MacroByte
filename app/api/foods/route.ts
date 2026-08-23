import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  if (!query || query.trim().length === 0) {
    return NextResponse.json({ foods: [] });
  }

  const { data: foods, error } = await supabase
    .from('foods')
    .select('id, name, category, data_type')
    .ilike('name', `%${query}%`)
    .order('name')
    .limit(50);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ foods: foods || [] });
}
