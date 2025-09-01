import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id_number = searchParams.get('id_number');

    if (!id_number) {
      return NextResponse.json({ error: 'id_number is required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('resume')
      .select('*')
      .eq('id_number', id_number)
      .single();

    if (error) {
      console.error('Supabase error:', error?.message || 'No resume data found', { id_number });
      return NextResponse.json({ error: 'Resume data not found' }, { status: 404 });
    }else if(!data){
        console.warning('No resume data found for this id_number', { id_number });
        return NextResponse.json({ error: 'Resume data not found' }, { status: 404 });
    }

    return NextResponse.json({ data }, { status: 200 });
  } catch (error) {
    console.error('Fetch resume error:', error.message);
    return NextResponse.json({ error: `Failed to fetch resume: ${error.message}` }, { status: 500 });
  }
}