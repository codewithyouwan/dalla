import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import Prompt from '../../helper/prompt';
import OpenAI from 'openai';

export const runtime = 'nodejs';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const idNumber = searchParams.get('id_number');

    if (!idNumber) {
      return NextResponse.json({ error: 'id_number is required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('data')
      .select('full_name_english, full_name_katakana, hobbies_interests, place_of_belonging')
      .eq('id_number', idNumber)
      .single();

    if (error || !data) {
      console.error('Supabase error:', error?.message || 'No employee found', { id_number: idNumber });
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
    }

    const fullNameEnglish = data.full_name_english ? data.full_name_english.trim() : 'Unknown Employee';
    const fullNameKatakana = data.full_name_katakana ? data.full_name_katakana.trim() : '';
    let hobby = data.hobbies_interests ? data.hobbies_interests.trim() : '';
    let hometown = data.place_of_belonging ? data.place_of_belonging.trim() : '';

    const token = process.env.NVIDIA_DEEPSEEK_R1_KEY;
    const endpoint = 'https://integrate.api.nvidia.com/v1';
    const openai = new OpenAI({
      apiKey: token,
      baseURL: endpoint,
    });

    // Process hobby
    if (!token) {
      console.error('NVIDIA_DEEPSEEK_R1_KEY is not set in environment variables');
      hobby = '読書';
    } else if (hobby) {
      try {
        const hobbyPrompt = Prompt({ hobbies_Interests: hobby }, 'hobbyConversion');
        const completion = await openai.chat.completions.create({
          model: 'nvidia/llama-3.1-nemotron-ultra-253b-v1',
          messages: [
            {
              role: 'system',
              content:
                'Generate the response exactly as specified in the prompt. Include only the formatted output with no additional text, explanations, or deviations. Use ===FORM1-START=== and ===FORM1-END=== with exactly one line of Japanese text.',
            },
            { role: 'user', content: hobbyPrompt },
          ],
          temperature: 0.3,
          top_p: 0.9,
          max_tokens: 50,
          frequency_penalty: 0,
          presence_penalty: 0,
          stream: false,
        });

        const suggestions = completion.choices[0]?.message?.content || '';
        if (!suggestions) {
          console.error('No hobby suggestions returned from NVIDIA API');
          hobby = '読書';
        } else {
          const form1Match = suggestions.match(/===FORM1-START===[\s\S]*?\n([\s\S]*?)\n===FORM1-END===/);
          if (!form1Match) {
            console.error('Hobby FORM1 parsing failed. Full response:', suggestions);
            hobby = '読書';
          } else {
            hobby = form1Match[1].trim();
            console.log('Converted hobby:', { input: data.hobbies_interests, output: hobby });
          }
        }
      } catch (err) {
        console.error('NVIDIA API error for hobby:', err.message);
        hobby = '読書';
      }
    } else {
      hobby = '読書';
    }

    // Process place of belonging
    if (!token) {
      console.error('NVIDIA_DEEPSEEK_R1_KEY is not set in environment variables');
      hometown = 'インド';
    } else {
      try {
        const placePrompt = Prompt({ place_of_belonging: hometown }, 'placeConversion');
        const completion = await openai.chat.completions.create({
          model: 'nvidia/llama-3.1-nemotron-ultra-253b-v1',
          messages: [
            {
              role: 'system',
              content:
                'Generate the response exactly as specified in the prompt. Include only the formatted output with no additional text, explanations, or deviations. Use ===FORM1-START=== and ===FORM1-END=== with exactly one line of Japanese text.',
            },
            { role: 'user', content: placePrompt },
          ],
          temperature: 0.3,
          top_p: 0.9,
          max_tokens: 50,
          frequency_penalty: 0,
          presence_penalty: 0,
          stream: false,
        });

        const suggestions = completion.choices[0]?.message?.content || '';
        if (!suggestions) {
          console.error('No place suggestions returned from NVIDIA API');
          hometown = 'インド';
        } else {
          const form1Match = suggestions.match(/===FORM1-START===[\s\S]*?\n([\s\S]*?)\n===FORM1-END===/);
          if (!form1Match) {
            console.error('Place FORM1 parsing failed. Full response:', suggestions);
            hometown = 'インド';
          } else {
            hometown = form1Match[1].trim();
            console.log('Converted place:', { input: data.place_of_belonging, output: hometown });
          }
        }
      } catch (err) {
        console.error('NVIDIA API error for place:', err.message);
        hometown = 'インド';
      }
    }

    const nameParts = fullNameEnglish.split(' ').filter(Boolean);
    const initials = nameParts.length >= 2 
      ? `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`.toUpperCase()
      : fullNameEnglish[0]?.toUpperCase() || '';

    console.log('Fetched and processed data:', { fullNameEnglish, fullNameKatakana, hobby, hometown, initials });

    return NextResponse.json({
      name: fullNameEnglish,
      katakana: fullNameKatakana,
      hobby,
      hometown,
      initials
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching employee data:', {
      message: error.message,
      stack: error.stack,
      id_number: idNumber || 'undefined',
    });
    return NextResponse.json({ error: `Server error: ${error.message}` }, { status: 500 });
  }
}