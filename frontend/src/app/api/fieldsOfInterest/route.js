import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { OpenAI } from 'openai';
import  Prompt  from '../../helper/prompt';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL , process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export async function POST(request) {
  try {
    const { id_number } = await request.json();
    console.log('Fields of Interest request data:', { id_number });

    // Fetch relevant data from Supabase
    const { data, error } = await supabase
      .from('data')
      .select('job_role_priority_1, job_role_priority_2, job_role_priority_3')
      .eq('id_number', id_number)
      .single();

    if (error || !data) {
      console.error('Supabase error:', error?.message || 'No data found', { id_number });
      return NextResponse.json({ error: 'Fields of interest data not found' }, { status: 404 });
    }

    // Construct prompt for起身
    const prompt = Prompt({
      job_role_priority_1: data.job_role_priority_1,
      job_role_priority_2: data.job_role_priority_2,
      job_role_priority_3: data.job_role_priority_3,
    }, 'fieldsOfInterest');
    console.log('Generated prompt for Fields of Interest:', prompt);

    const token = process.env.NVIDIA_DEEPSEEK_R1_KEY;
    const endpoint = "https://integrate.api.nvidia.com/v1";

    if (!token) {
      throw new Error('NVIDIA_DEEPSEEK_R1_KEY is not set in environment variables');
    }
    // Configure OpenAI client for NVIDIA API
    const openai = new OpenAI({
          apiKey: token,
          baseURL: endpoint,
    });
    const response = await openai.chat.completions.create({
      model: "qwen/qwen3-235b-a22b",
      messages: [
        {
          role: 'system',
          content: ""
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0.2,
    top_p: 0.7,
    max_tokens: 8192,
    chat_template_kwargs: {"thinking":false},
    stream: false
    });

    let suggestions = response.choices[0].message.content;
    console.log('RAAND:', suggestions);

    // Parse suggestions with improved regex
    let forms = [];
    if (suggestions && suggestions.includes('===FORM1-START===')) {
      const regex = /===FORM\d-START===\s*([\s\S]*?)\s*===FORM\d-END===/g;
      let match;
      while ((match = regex.exec(suggestions)) !== null) {
        forms.push(match[1].trim());
      }
    }

    // Fallback if parsing fails or insufficient forms
    if (forms.length < 3) {
      console.warn('Incomplete or malformed suggestions:', forms, 'Raw:', suggestions);
      forms = [
        data.job_role_priority_1 || 'データサイエンス',
        data.job_role_priority_2 || 'ソフトウェア開発',
        data.job_role_priority_3 || 'プロジェクト管理',
      ];
    }

    return NextResponse.json({
      suggestions: {
        field1: forms[0],
        field2: forms[1],
        field3: forms[2],
      }
    });
  } catch (error) {
    console.error('Error generating fields of interest:', error);
    return NextResponse.json({ error: error.message || 'An error occurred' }, { status: 500 });
  }
}