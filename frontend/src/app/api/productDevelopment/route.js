import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import {OpenAI} from 'openai';
import  Prompt  from '../../helper/prompt';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export async function POST(request) {
  try {
    const { id_number } = await request.json();
    console.log('Product Development request data:', { id_number });

    // Fetch relevant data from Supabase
    const { data, error } = await supabase
      .from('data')
      .select('job_role_priority_1, job_role_priority_2, job_role_priority_3, jobs_to_try_in_japan')
      .eq('id_number', id_number)
      .single();

    if (error || !data) {
      console.error('Supabase error:', error?.message || 'No data found', { id_number });
      return NextResponse.json({ error: 'Product development data not found' }, { status: 404 });
    }

    // Construct prompt for AI
    const prompt = Prompt({
      job_role_priority_1: data.job_role_priority_1,
      job_role_priority_2: data.job_role_priority_2,
      job_role_priority_3: data.job_role_priority_3,
      jobs_to_try_in_japan: data.jobs_to_try_in_japan,
    }, 'productDevelopment');

    // Call AI model
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
      console.log('Product Development suggestions:', suggestions);

    // Parse suggestions
    let productDevReason = '';
    let productDevRole = '';
    if (suggestions && suggestions.includes('===FORM1-START===')) {
      const match = suggestions.match(/===FORM1-START===[\s\S]*?\n([\s\S]*?)\n([\s\S]*?)\n===FORM1-END===/);
      if (match) {
        productDevReason = match[1].trim();
        productDevRole = match[2].trim();
      }
    }

    // Fallback if parsing fails
    if (!productDevReason || !productDevRole) {
      console.warn('Incomplete or malformed suggestions:', { productDevReason, productDevRole }, 'Raw:', suggestions);
      productDevReason = '技術的な課題解決に情熱があるからだ。';
      productDevRole = data.job_role_priority_1 || 'ソフトウェア開発者';
    }

    return NextResponse.json({
      suggestions: {
        productDevReason,
        productDevRole
      }
    });
  } catch (error) {
    console.error('Error generating product development suggestions:', error);
    return NextResponse.json({ error: error.message || 'An error occurred' }, { status: 500 });
  }
}