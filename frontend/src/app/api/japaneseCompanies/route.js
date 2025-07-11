import { createClient } from '@supabase/supabase-js';
import { OpenAI } from 'openai';
import Prompt from '../../helper/prompt';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(req) {
  try {
    const { id_number } = await req.json();
    if (!id_number) {
      return new Response(JSON.stringify({ error: 'id_number is required' }), { status: 400 });
    }

    // Fetch relevant data from Supabase
    const { data, error } = await supabase
      .from('data')
      .select('interest_in_japanese_companies, aspects_to_learn, future_career_goals')
      .eq('id_number', id_number)
      .single();

    if (error || !data) {
      console.error('Supabase error:', error);
      return new Response(JSON.stringify({ error: 'No data found for the provided id_number' }), { status: 404 });
    }

    // Generate prompt using the Prompt function
    const prompt = Prompt(data, 'japaneseCompanies');

    // Configure OpenAI client for NVIDIA API
    const token = process.env.NVIDIA_DEEPSEEK_R1_KEY;
    const endpoint = 'https://integrate.api.nvidia.com/v1';

    if (!token) {
      throw new Error('NVIDIA_DEEPSEEK_R1_KEY is not set in environment variables');
    }

    const openai = new OpenAI({
      apiKey: token,
      baseURL: endpoint,
    });

    // Call DeepSeek API
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
    chat_template_kwargs: {"thinking":false},
    stream: false
    });

    let suggestions = completion.choices[0].message.content;

    // Normalize response: Remove extra whitespace and carriage returns
    suggestions = suggestions.replace(/\r\n/g, '\n').trim();

    // Log raw response for debugging
    console.log('Raw AI response:', suggestions);

    // Validate FORM2 format with robust regex
    const form2Match = suggestions.match(/===FORM2-START===\s*\n([\s\S]*?)\s*\n===FORM2-END===/);
    if (!form2Match) {
      console.warn('FORM2 markers missing or invalid in response:', suggestions);
      // Fallback: Wrap response in FORM2 markers if it has two valid lines
      const lines = suggestions.split('\n').map(line => line.trim());
      if (
        lines.length === 2 &&
        lines[0].startsWith('番興味がある点: ') &&
        lines[1].startsWith('習得したいこと: ')
      ) {
        suggestions = `===FORM2-START===\n${lines.join('\n')}\n===FORM2-END===`;
        console.log('Wrapped response in FORM2 markers:', suggestions);
      } else {
        console.error('Invalid FORM2 format in response:', suggestions);
        return new Response(JSON.stringify({ error: 'Invalid response format from AI' }), { status: 500 });
      }
    }

    // Validate FORM2 format again after fallback
    const finalForm2Match = suggestions.match(/===FORM2-START===\s*\n([\s\S]*?)\s*\n===FORM2-END===/);
    if (!finalForm2Match) {
      console.error('Invalid FORM2 format after fallback:', suggestions);
      return new Response(JSON.stringify({ error: 'Invalid response format from AI' }), { status: 500 });
    }

    // Extract the two lines and remove labels
    const extractedContent = finalForm2Match[1].split('\n').map(line => line.replace(/^(番興味がある点: |習得したいこと: )/, '').trim());
    console.log('Extracted content:', extractedContent);

    return new Response(JSON.stringify({ suggestions: extractedContent.join('\n') }), { status: 200 });
  } catch (error) {
    console.error('Error in japaneseCompanies route:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }
}