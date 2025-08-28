import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export async function POST(req) {
  try {
    const formData = await req.formData();
    const detailsRaw = formData.get('details');
    const id_number = formData.get('id_number');

    if (!id_number) return NextResponse.json({ error: 'id_number required' }, { status: 400 });

    let details;
    try {
      details = JSON.parse(detailsRaw || '{}');
    } catch (parseError) {
      console.error('JSON parse error:', parseError.message);
      return NextResponse.json({ error: `Invalid JSON: ${parseError.message}` }, { status: 400 });
    }

    const resumeData = {
      id_number,
      employee_number: parseInt(details.employeeNumber) || null,
      name: details.name || '',
      katakana: details.katakana || '',
      initials: details.initials || '',
      hometown: details.hometown || '',
      hobby: details.hobby || '',
      desired_industry: details.desiredIndustry || '',
      desired_job_type: details.desiredJobType || '',
      target_role: details.targetRole || '',
      work_style: details.workStyle || '',
      education: details.education || [],
      languages: details.languages || '',
      dev_tools: details.devTools || '',
      internships: details.internships || [],
      projects: details.projects || [],
      japan_company_interest: details.japanCompanyInterest || '',
      japan_company_skills: details.japanCompanySkills || '',
      career_priorities: details.careerPriorities || [],
      career_roles: details.careerRoles || '',
      japanese_level: details.japaneseLevel || 'Not certified',
      total_score: details.total || '',
      vocabulary_score: details.vocabulary || '',
      reading_score: details.reading || '',
      listening_score: details.listening || '',
      jlpt_description: details.selectedSuggestion || '',
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('resume')
      .upsert(resumeData, { onConflict: 'id_number' })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ message: 'Resume saved successfully', data }, { status: 200 });
  } catch (error) {
    console.error('Save resume error:', error.message);
    return NextResponse.json({ error: `Failed to save resume: ${error.message}` }, { status: 500 });
  }
}