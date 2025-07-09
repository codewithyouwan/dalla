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

    // Fetch employee details from the data table
    const { data, error } = await supabase
      .from('data')
      .select('programming_languages, databases_querying, version_control, code_editors_ides, ml_frameworks')
      .eq('id_number', id_number)
      .single();

    if (error || !data) {
      console.error('Supabase error:', error?.message || 'No employee found', { id_number });
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
    }

    // Preprocess data
    const skillsData = {
      programming_languages: Array.isArray(data.programming_languages) ? data.programming_languages.join(', ') : data.programming_languages || '',
      databases_querying: Array.isArray(data.databases_querying) ? data.databases_querying.join(', ') : data.databases_querying || '',
      version_control: Array.isArray(data.version_control) ? data.version_control.join(', ') : data.version_control || '',
      code_editors_ides: Array.isArray(data.code_editors_ides) ? data.code_editors_ides.join(', ') : data.code_editors_ides || '',
      ml_frameworks: Array.isArray(data.ml_frameworks) ? data.ml_frameworks.join(', ') : data.ml_frameworks || '',
    };

    // Generate prompt using Prompt function
    const prompt = Prompt(skillsData, 'languagesAndTools');
    // console.log('Generated prompt:', prompt); // Log for debugging 

    const token = process.env.NVIDIA_DEEPSEEK_R1_KEY;
    const endpoint = "https://integrate.api.nvidia.com/v1";

    if (!token) {
      throw new Error('GROK3_API_KEY is not set in environment variables');
    }

  const openai = new OpenAI({
    apiKey: token,
    baseURL: endpoint,
  })

    // Call NVIDIA API with streaming
    const completion = await openai.chat.completions.create({
    model: "nvidia/llama-3.1-nemotron-ultra-253b-v1",
    messages:[ 
    { 
      role: "system", 
      content: "Provide only the final answer in the specified format without any reasoning or explanation." 
    },
    { role: "user", content: prompt }],
    temperature: 0,
    top_p: 0.95,
    max_tokens: 4096,
    frequency_penalty: 0,
    presence_penalty: 0,
    stream: true,
    })

    let suggestions = '';
    for await (const chunk of completion) {
      const content = chunk.choices[0]?.delta?.content || '';
      suggestions += content;
    }

    console.log('GPT suggestions:', suggestions); // Log for debugging

    if (!suggestions) {
      throw new Error('No suggestions returned from GPT API');
    }

    return NextResponse.json({ suggestions }, { status: 200 });
  } catch (error) {
    console.error('Error processing languages and tools:', {
      message: error.message,
      stack: error.stack,
      id_number: id_number || 'undefined',
    });
    return NextResponse.json({ error: `Server error: ${error.message}` }, { status: 500 });
  }
}