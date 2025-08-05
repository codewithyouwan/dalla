import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import Prompt from '../../helper/prompt';

export const runtime = 'nodejs';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(request) {
  let id_number;
  try {
    const body = await request.json();
    id_number = body.id_number;
    
    if (!id_number) {
      return NextResponse.json({ error: 'id_number is required' }, { status: 400 });
    }

    // Fetch career aspirations from Supabase
    const { data, error } = await supabase
      .from('data')
      .select('preferred_industry, jobs_to_try_in_japan, job_role_priority_1, job_role_priority_2, job_role_priority_3, job_role_priority_4, job_role_priority_5, work_style_preference')
      .eq('id_number', id_number)
      .single();

    if (error || !data) {
      console.error('Supabase error:', error?.message || 'No career data found', { id_number });
      return NextResponse.json({ error: 'Career data not found' }, { status: 404 });
    }

    // Preprocess data
    let jobsToTry = data.jobs_to_try_in_japan || [];
    if (typeof jobsToTry === 'string') {
      try {
        // Attempt to parse if it's a JSON string
        jobsToTry = JSON.parse(jobsToTry);
      } catch (e) {
        // If not JSON, assume comma-separated string
        jobsToTry = jobsToTry.split(',').map(item => item.trim()).filter(Boolean);
      }
    }
    if (!Array.isArray(jobsToTry)) {
      console.warn('jobs_to_try_in_japan is not an array, defaulting to empty array', { jobsToTry });
      jobsToTry = [];
    }

    const careerData = {
      preferred_industry: Array.isArray(data.preferred_industry) ? data.preferred_industry : [],
      jobs_to_try_in_japan: jobsToTry,
      job_role_priorities: [
        data.job_role_priority_1,
        data.job_role_priority_2,
        data.job_role_priority_3,
        data.job_role_priority_4,
        data.job_role_priority_5
      ].filter(Boolean),
      work_style_preference: Array.isArray(data.work_style_preference) ? data.work_style_preference : [],
    };

    const prompt = Prompt(careerData, 'careerAspirations');

    const token = process.env.NVIDIA_DEEPSEEK_R1_KEY;
    if (!token) {
      throw new Error('NVIDIA_DEEPSEEK_R1_KEY is not set in environment variables');
    }

    const openai = new OpenAI({
      apiKey: token,
      baseURL: "https://integrate.api.nvidia.com/v1",
    });

    const response = await openai.chat.completions.create({
      model: "nvidia/llama-3.1-nemotron-ultra-253b-v1",
      messages: [
        {
          role: "system",
          content: "Generate the response exactly as specified in the prompt. Include only the formatted output with no additional text, explanations, or deviations. Use ===FORM2-START=== and ===FORM2-END=== with exactly four lines of Japanese text, each starting with the specified labels."
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.1,
      top_p: 0.9,
      max_tokens: 200,
      frequency_penalty: 0,
      presence_penalty: 0,
      stream: false,
    });

    const suggestions = response.choices[0]?.message?.content || '';
    if (!suggestions) {
      throw new Error('No suggestions returned from LLaMA API');
    }
    console.log('Generated career aspirations:', suggestions);

    // Parse FORM2
    const form2Match = suggestions.match(/===FORM2-START===[\s\S]*?\n([\s\S]*?)\n===FORM2-END===/);
    if (!form2Match) {
      throw new Error('Failed to parse LLaMA response: FORM2 not found');
    }

    const lines = form2Match[1].trim().split('\n').map(line => line.trim());
    if (lines.length !== 4) {
      throw new Error(`Invalid LLaMA response format: Expected 4 lines, got ${lines.length}`);
    }

    const result = {
      desiredIndustry: lines[0].startsWith('希望業界: ') ? lines[0].replace('希望業界: ', '') : '',
      desiredJobType: lines[1].startsWith('希望職種: ') ? lines[1].replace('希望職種: ', '') : '',
      targetRole: lines[2].startsWith('目指す役割: ') ? lines[2].replace('目指す役割: ', '') : '',
      workStyle: lines[3].startsWith('ワークスタイル: ') ? lines[3].replace('ワークスタイル: ', '') : '',
    };
    console.log("RESULT: ", result);

    // Validate non-empty fields
    if (!result.desiredIndustry || !result.desiredJobType || !result.targetRole || !result.workStyle) {
      throw new Error('Invalid LLaMA response: One or more fields are empty');
    }

    return NextResponse.json({ suggestions: result }, { status: 200 });
  } catch (error) {
    console.error('Error generating career aspirations:', {
      message: error.message,
      stack: error.stack,
      id_number: id_number || 'undefined',
    });
    return NextResponse.json({ error: `Server error: ${error.message}` }, { status: 500 });
  }
}