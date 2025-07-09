import { createClient } from '@supabase/supabase-js';

export async function POST(request) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    const { id_number } = await request.json();
    if (!id_number) {
      return new Response(JSON.stringify({ error: 'id_number is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { data, error } = await supabase
      .from('data')
      .select(`
        high_school_years_attended,
        high_school_name,
        high_school_education_level,
        bachelor_years_attended,
        bachelor_university,
        bachelor_degree,
        master_years_attended,
        master_university,
        master_degree
      `)
      .eq('id_number', id_number)
      .single();

    if (error) {
      console.error('Supabase query error:', error);
      return new Response(JSON.stringify({ error: 'Failed to fetch education data' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!data) {
      return new Response(JSON.stringify({ error: 'No education data found for this id_number' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const education = [];

    if (data.high_school_name && data.high_school_years_attended) {
      education.push({
        year: data.high_school_years_attended,
        institution: data.high_school_name,
        degree: data.high_school_education_level || '高校卒業',
      });
    }

    if (data.bachelor_university && data.bachelor_years_attended) {
      education.push({
        year: data.bachelor_years_attended,
        institution: data.bachelor_university,
        degree: data.bachelor_degree || '学士',
      });
    }

    if (data.master_university && data.master_years_attended) {
      education.push({
        year: data.master_years_attended,
        institution: data.master_university,
        degree: data.master_degree || '修士',
      });
    }

    return new Response(JSON.stringify({ education }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('Fetch education error:', err);
    return new Response(JSON.stringify({ error: 'Server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}