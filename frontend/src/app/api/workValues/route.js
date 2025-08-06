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

    // Fetch career development details from the data table
    const { data, error } = await supabase
      .from('data')
      .select('work_values')
      .eq('id_number', id_number)
      .single();

    if (error || !data) {
      console.error('Supabase error:', error?.message || 'No career data found', { id_number });
      return NextResponse.json({ error: 'Career data not found' }, { status: 404 });
    }

    // Preprocess data
    const careerData = {
      work_values: data.work_values || [],
    };

    // Generate prompt using Prompt function
    const prompt = Prompt(careerData, 'workValues');

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
      chat_template_kwargs: {"thinking": false},
      stream: false
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
    if (lines.length !== 1) {
      console.error('Invalid line count in FORM1. Lines:', lines);
      throw new Error(`Invalid LLaMA response format: Expected 1 line, got ${lines.length}`);
    }

    // Parse response into field
    const careerPriorities = lines[0].startsWith('3大優先要素: ') ? lines[0].replace('3大優先要素: ', '') : '';

    // Validate that the field is non-empty
    if (!careerPriorities) {
      console.error('Empty careerPriorities in parsed result:', careerPriorities);
      throw new Error('Invalid LLaMA response: careerPriorities is empty');
    }

    return NextResponse.json({ suggestions: { careerPriorities } }, { status: 200 });
  } catch (error) {
    console.error('Error processing career development:', {
      message: error.message,
      stack: error.stack,
      id_number: id_number || 'undefined',
    });
    return NextResponse.json({ error: `Server error: ${error.message}` }, { status: 500 });
  }
}