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

    // Fetch only full_name_english from the data table
    const { data, error } = await supabase
      .from('data')
      .select('full_name_english')
      .eq('id_number', idNumber)
      .single();

    if (error || !data) {
      console.error('Supabase error:', error?.message || 'No employee found', { id_number: idNumber });
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
    }

    // Preprocess the name
    const name = data.full_name_english ? data.full_name_english.trim() : 'Unknown Employee';

    console.log('Fetched and processed name:', name); // Log for debugging

    return NextResponse.json({ name }, { status: 200 });
  } catch (error) {
    console.error('Error fetching employee name:', {
      message: error.message,
      stack: error.stack,
      id_number: idNumber || 'undefined',
    });
    return NextResponse.json({ error: `Server error: ${error.message}` }, { status: 500 });
  }
}