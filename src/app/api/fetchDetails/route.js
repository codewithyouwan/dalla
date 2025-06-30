import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const idNumber = searchParams.get('id_number');

    if (!idNumber) {
      return NextResponse.json({ error: 'id_number is required' }, { status: 400 });
    }

    // Fetch employee details from the data table
    const { data, error } = await supabase
      .from('data')
      .select('*')
      .eq('id_number', idNumber)
      .single();

    if (error || !data) {
      console.error('Supabase error:', error?.message || 'No employee found');
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
    }

    return NextResponse.json({ employee: data }, { status: 200 });
  } catch (error) {
    console.error('Error fetching employee details:', error.message);
    return NextResponse.json({ error: `Server error: ${error.message}` }, { status: 500 });
  }
}