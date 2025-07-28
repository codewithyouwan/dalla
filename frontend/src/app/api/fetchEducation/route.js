import { createClient } from '@supabase/supabase-js';
import Prompt from '../../helper/prompt'; // Adjust path to prompt.jsx
import ModelClient, { isUnexpected } from "@azure-rest/ai-inference";
import { AzureKeyCredential } from "@azure/core-auth";

export const runtime = 'nodejs';

export async function POST(request) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const supabase = createClient(supabaseUrl, supabaseKey);

  // Configure Azure AI Inference client for GPT model
  const callGrokAPI = async (prompt) => {
    const token = process.env.GROK3_API_KEY;
    const endpoint = "https://models.github.ai/inference";
    const model = "openai/gpt-4.1";

    if (!token) {
      throw new Error('GROK3_API_KEY is not set in environment variables');
    }

    const client = ModelClient(endpoint, new AzureKeyCredential(token));

    try {
      const response = await client.path("/chat/completions").post({
        body: {
          messages: [
            { role: "system", content: "" },
            { role: "user", content: prompt }
          ],
          temperature: 0.2,
          top_p: 0.7,
          max_tokens: 50,
          model: model
        }
      });

      if (isUnexpected(response)) {
        throw new Error(response.body.error.message || "Unexpected error");
      }

      return response.body.choices[0].message.content;
    } catch (error) {
      console.error('Grok API error:', error);
      throw error;
    }
  };

  try {
    const { id_number } = await request.json();
    if (!id_number) {
      return new Response(JSON.stringify({ error: 'id_number is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { data, error } = await supabase
      .from('data')
      .select(`
        high_school_years_attended,
        high_school_name,
        high_school_education_level,
        bachelor_years_attended,
        bachelor_university,
        bachelor_degree,
        bachelor_major,
        master_years_attended,
        master_university,
        master_degree,
        master_major
      `)
      .eq('id_number', id_number)
      .single();

    if (error) {
      console.error('Supabase query error:', error);
      return new Response(JSON.stringify({ error: 'Failed to fetch education data' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!data) {
      return new Response(JSON.stringify({ error: 'No education data found for this id_number' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const education = [];

    // Helper function to convert institution name to Katakana and extract date range
    const convertToKatakana = async (name, dateString) => {
      if (!name || name === 'なし' || !dateString || dateString === 'なし') {
        return { institution: '', year: '' };
      }
      const prompt = Prompt({ institution_name: name, date_string: dateString }, 'katakanaConversion');
      try {
        const response = await callGrokAPI(prompt);
        console.log(`Raw response for ${name}, ${dateString}:`, response); // Debugging
        // Handle malformed end marker (e.g., ===FORM1 instead of ===FORM1-END===)
        const normalizedResponse = response.replace(/===FORM1($|\n)/, '===FORM1-END===');
        const match = normalizedResponse.match(/===FORM1-START===\n(.*)\n(.*)\n===FORM1-END===/);
        if (match) {
          return {
            institution: match[1].trim(),
            year: match[2].trim(),
          };
        }
        console.warn(`Parsing failed for ${name}, ${dateString}:`, response);
        return { institution: '', year: '' }; // Fallback if parsing fails
      } catch (error) {
        console.error(`Katakana/date conversion failed for ${name}, ${dateString}:`, error);
        return { institution: '', year: '' }; // Fallback to avoid breaking response
      }
    };

    // Map Supabase data to education array
    const degreeMap = {
      'High School': '高校',
      'Bachelor': '学士',
      'Master': '修士',
      'Doctorate': '博士',
    };

    if (data.high_school_name && data.high_school_years_attended) {
      const { institution, year } = await convertToKatakana(data.high_school_name, data.high_school_years_attended);
      education.push({
        year,
        institution,
        degree: degreeMap['High School'] || '高校',
      });
    }

    if (data.bachelor_university && data.bachelor_years_attended) {
      const { institution, year } = await convertToKatakana(data.bachelor_university, data.bachelor_years_attended);
      education.push({
        year,
        institution,
        degree: degreeMap['Bachelor'] || '学士',
        major: data.bachelor_major || '',
      });
    }

    if (data.master_university && data.master_years_attended) {
      const { institution, year } = await convertToKatakana(data.master_university, data.master_years_attended);
      education.push({
        year,
        institution,
        degree: degreeMap['Master'] || '修士',
        major: data.master_major || '',
      });
    }

    // Sort education by year (latest first, based on end year of range)
    education.sort((a, b) => {
      const endYearA = parseInt(a.year.match(/– (\d{4})年/)?.[1] || a.year.replace(/年.*$/, '')) || 0;
      const endYearB = parseInt(b.year.match(/– (\d{4})年/)?.[1] || b.year.replace(/年.*$/, '')) || 0;
      return endYearB - endYearA;
    });

    // Define strict output format
    const output = {
      education: education.map((entry) => ({
        year: entry.year,
        institution: entry.institution,
        degree: entry.degree,
        ...(entry.major && { major: entry.major }), // Include major only if present
      })),
    };

    return new Response(JSON.stringify(output), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('Fetch education error:', err);
    return new Response(JSON.stringify({ error: 'Server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}