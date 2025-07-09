import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import Prompt from '../../helper/prompt'; // Adjust path based on your project structure
import OpenAI from 'openai';

export const runtime = 'nodejs';

// Initialize Supabase client
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

    // Fetch internship details from the data table
    const { data, error } = await supabase
      .from('data')
      .select('internship_1_title, internship_1_company, internship_1_period, internship_1_team_size, internship_1_technologies, internship_1_summary, internship_1_purpose, internship_1_role, internship_1_challenges, internship_1_outcome')
      .eq('id_number', id_number)
      .single();

    if (error || !data) {
      console.error('Supabase error:', error?.message || 'No internship data found', { id_number });
      return NextResponse.json({ error: 'Internship data not found' }, { status: 404 });
    }

    // Preprocess data
    const internshipData = {
      internship_1_title: data.internship_1_title || '',
      internship_1_company: data.internship_1_company || '',
      internship_1_period: data.internship_1_period || '',
      internship_1_team_size: data.internship_1_team_size || '',
      internship_1_technologies: data.internship_1_technologies || '',
      internship_1_summary: data.internship_1_summary || '',
      internship_1_purpose: data.internship_1_purpose || '',
      internship_1_role: data.internship_1_role || '',
      internship_1_challenges: data.internship_1_challenges || '',
      internship_1_outcome: data.internship_1_outcome || '',
    };

    // Generate prompt using Prompt function
    const prompt = Prompt(internshipData, 'internshipExperience');

    const token = process.env.NVIDIA_DEEPSEEK_R1_KEY;
    const endpoint = "https://integrate.api.nvidia.com/v1";

    if (!token) {
      throw new Error('NVIDIA_DEEPSEEK_R1_KEY is not set in environment variables');
    }

    const openai = new OpenAI({
      apiKey: token,
      baseURL: endpoint,
    });

    // Call NVIDIA API without streaming
    const completion = await openai.chat.completions.create({
      model: "nvidia/llama-3.1-nemotron-ultra-253b-v1",
      messages: [
        {
          role: "system",
          content: "Generate the response exactly as specified in the prompt. Include only the formatted output with no additional text, explanations, or deviations. Use ===FORM1-START=== and ===FORM1-END=== with exactly four lines of Japanese text, each starting with the specified labels."
        },
        { role: "user", content: prompt }
      ],
      temperature: 0.1, // Low temperature for strict adherence
      top_p: 0.9,
      max_tokens: 512, // Sufficient for concise output
      frequency_penalty: 0,
      presence_penalty: 0,
      stream: false, // Non-streaming response
    });

    // Extract response content
    const suggestions = completion.choices[0]?.message?.content || '';
    console.log('Raw LLaMA response:', suggestions);

    if (!suggestions) {
      throw new Error('No suggestions returned from LLaMA API');
    }

    // Extract FORM1 from response
    const form1Match = suggestions.match(/===FORM1-START===[\s\S]*?\n([\s\S]*?)\n===FORM1-END===/);
    if (!form1Match) {
      console.error('FORM1 parsing failed. Full response:', suggestions);
      throw new Error('Failed to parse LLaMA response: FORM1 not found');
    }

    const lines = form1Match[1].trim().split('\n').map(line => line.trim());
    if (lines.length !== 4) {
      console.error('Invalid line count in FORM1. Lines:', lines);
      throw new Error(`Invalid LLaMA response format: Expected 4 lines, got ${lines.length}`);
    }

    // Parse response into fields
    const result = {
      projectRole: lines[0].startsWith('担当した役割: ') ? lines[0].replace('担当した役割: ', '') : '',
      projectDescription: lines[1].startsWith('具体的な内容: ') ? lines[1].replace('具体的な内容: ', '') : '',
      projectChallenges: lines[2].startsWith('直面した課題: ') ? lines[2].replace('直面した課題: ', '') : '',
      leadership: lines[3].startsWith('リーダー経験: ') ? lines[3].replace('リーダー経験: ', '') : '',
    };

    // Validate that all fields are non-empty
    if (!result.projectRole || !result.projectDescription || !result.projectChallenges || !result.leadership) {
      console.error('Empty fields in parsed result:', result);
      throw new Error('Invalid LLaMA response: One or more fields are empty');
    }

    return NextResponse.json({ suggestions: result }, { status: 200 });
  } catch (error) {
    console.error('Error processing internship experience:', {
      message: error.message,
      stack: error.stack,
      id_number: id_number || 'undefined',
    });
    return NextResponse.json({ error: `Server error: ${error.message}` }, { status: 500 });
  }
}