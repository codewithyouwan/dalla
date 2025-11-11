// app/api/saveResume/route.js
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);
const supabaseService = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY // Required for storage upload
);

export async function POST(req) {
  try {
    const formData = await req.formData();
    const detailsRaw = formData.get('details');
    const id_number = formData.get('id_number');
    const photoFile = formData.get('photo'); // File object

    if (!id_number) return NextResponse.json({ error: 'id_number required' }, { status: 400 });

    let details;
    try {
      details = JSON.parse(detailsRaw || '{}');
    } catch (parseError) {
      return NextResponse.json({ error: `Invalid JSON: ${parseError.message}` }, { status: 400 });
    }

    let photoUrl = details.photo_url || null;

    // Upload photo if provided
    if (photoFile && photoFile instanceof File && photoFile.size > 0) {
      const fileExt = photoFile.name.split('.').pop();
      const fileName = `${id_number}/profile.jpeg`;
      const fileBuffer = Buffer.from(await photoFile.arrayBuffer());

      const { data: uploadData, error: uploadError } = await supabaseService.storage
        .from('photos') // Make sure this bucket exists
        .upload(fileName, fileBuffer, {
          contentType: photoFile.type,
          upsert: true,
        });

      if (uploadError && !uploadError.message.includes('duplicate')) {
        throw uploadError;
      }

      // Get public URL
      const { data: urlData } = supabaseService.storage
        .from('photos')
        .getPublicUrl(fileName);

      photoUrl = urlData.publicUrl;
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
      exam_month: details.examMonth,
      total_score: Number(details.marks.total),
      vocabulary_score: Number(details.marks.vocabulary),
      work_values: details.WorkValues,
      interest_fields: details.interestFields,
      reading_score: Number(details.marks.reading),
      listening_score: Number(details.marks.listening),
      language_and_reading: Number(details.marks.language_and_reading),
      jlpt_description: details.selectedSuggestion || '',
      photo_url: photoUrl, // Save URL
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