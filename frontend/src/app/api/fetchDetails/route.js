import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import Prompt from '../../helper/prompt';

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

    // Process hobby
    const baseUrl = `${request.headers.get("x-forwarded-proto") || "https"}://${request.headers.get("host")}`;
    console.log('This is the baseUrl', baseUrl);
    if(!hobby) hobby = '読書';
      try {
        const hobbyPrompt = Prompt({ hobbies_Interests: hobby }, 'hobbyConversion');
        // https://dalla-mauve.vercel.app/api/aiRequests
        //Change top ${baseUrl} for localhost.
        const completion = await fetch(`https://dalla-mauve.vercel.app/api/aiRequests`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({PromptData: hobbyPrompt })
        });
        console.log(JSON.stringify({PromptData: hobbyPrompt}));
        const suggestions=await completion.json();
        // const suggestions = completion.choices[0]?.message?.content || '';
        if (!suggestions) {
          console.error("There is an error from the aiRequests api. ",suggestions.details);
          hobby = '読書';
        } else {
          const form1Match = suggestions.Suggestions.match(/===FORM1-START===[\s\S]*?\n([\s\S]*?)\n===FORM1-END===/);
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

    // Process place of belonging
      try {
        const placePrompt = Prompt({ place_of_belonging: hometown }, 'placeConversion');
        // https://dalla-mauve.vercel.app/api/aiRequests
//         const completion = await fetch(`${baseUrl}/api/aiRequests`, {
        const completion = await fetch(`https://dalla-mauve.vercel.app/api/aiRequests`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({PromptData: placePrompt })
        });
        const suggestions = await completion.json();
        if (!suggestions) {
          console.error('No place suggestions returned from NVIDIA API');
          hometown = 'インド';
        } else {
          console.log('Place suggestions:', suggestions);
          const form1Match = suggestions.Suggestions.match(/===FORM1-START===[\s\S]*?\n([\s\S]*?)\n===FORM1-END===/);
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

    const nameParts = fullNameEnglish.split(' ').filter(Boolean);
    const initials = nameParts.length >= 2 
      ? `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`.toUpperCase()
      : fullNameEnglish[0]?.toUpperCase() || '';

    console.log('Fetched and processed data:', { fullNameEnglish, fullNameKatakana, hobby, hometown, initials });

    return NextResponse.json({
      name: fullNameEnglish,
      katakana: fullNameKatakana,
      hobby:hobby,
      hometown:hometown,
      initials:initials
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching employee data:', {
      message: error.message,
      stack: error.stack,
    });
    return NextResponse.json({ error: `Server error: ${error.message}` }, { status: 500 });
  }
}