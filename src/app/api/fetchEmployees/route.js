import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET() {
  try {
    // Fetch English name, Katakana name, and ID number from the data table
    const { data, error } = await supabase
      .from('data')
      .select('id_number, full_name_english, full_name_katakana'); // Assuming you want to fetch records where ID number is null;

    if (error) {
      console.error('Supabase error:', error.message);
      return NextResponse.json({ error: `Failed to fetch employees: ${error.message}` }, { status: 500 });
    }

    return NextResponse.json({ employees: data }, { status: 200 });
  } catch (error) {
    console.error('Error fetching employees:', error.message);
    return NextResponse.json({ error: `Server error: ${error.message}` }, { status: 500 });
  }
}