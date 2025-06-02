import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function GET() {
  try {
    console.log('Fetching resumes from Supabase via API at', new Date().toISOString());
    const { data, error } = await supabase
      .from('resumes')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: `Supabase error: ${error.message}` }, { status: 500 });
    }

    // Map resumes to include number and fallback for modified_at
    const formattedResumes = (data || []).map((resume, index = 0) => ({
      ...resume,
      number: index + 1,
      modified_at: resume.updated_at || "Not Modified After created.", // Fallback to created_at
    }));

    console.log('Fetched resumes:', formattedResumes);
    return NextResponse.json(formattedResumes, { status: 200 });
  } catch (err) {
    console.error('Error fetching resumes:', err);
    return NextResponse.json({ error: `Failed to fetch resumes: ${err.message}` }, { status: 500 });
  }
}