import ModelClient, { isUnexpected } from "@azure-rest/ai-inference";
import { AzureKeyCredential } from "@azure/core-auth";
import Prompt from "../../helper/prompt";

export const runtime = 'nodejs';

export async function POST(request) {
  let body;
  try {
    body = await request.json();
    console.log('Career Aspirations API payload:', body);

    const { preferred_industry, job_role_priority_1, future_career_goals, work_style_preference } = body;

    // Validate and preprocess inputs
    if (!body || typeof body !== 'object') {
      throw new Error('Invalid request body: Expected JSON object');
    }

    const formattedData = {
      preferred_industry: Array.isArray(preferred_industry) && preferred_industry.every(item => typeof item === 'string' && item.trim()) 
        ? preferred_industry.map(item => item.trim()).join(', ') 
        : 'Not specified',
      job_role_priority_1: typeof job_role_priority_1 === 'string' && job_role_priority_1.trim() 
        ? job_role_priority_1.trim() 
        : 'Not specified',
      future_career_goals: Array.isArray(future_career_goals) && future_career_goals.every(item => typeof item === 'string' && item.trim()) 
        ? future_career_goals.map(item => item.trim()).join(', ') 
        : 'Not specified',
      work_style_preference: Array.isArray(work_style_preference) && work_style_preference.every(item => typeof item === 'string' && item.trim()) 
        ? work_style_preference.map(item => item.trim()).join(', ') 
        : 'Not specified',
    };

    // Check if all fields are 'Not specified'
    if (Object.values(formattedData).every(value => value === 'Not specified')) {
      throw new Error('All career aspiration fields are empty or invalid');
    }

    const prompt = Prompt(formattedData, 'careerAspirations');
    // console.log('Generated prompt:', prompt); // Log for debugging

    const token = process.env.GROK3_API_KEY;
    if (!token) {
      throw new Error('GROK3_API_KEY is not set in environment variables');
    }

    const endpoint = "https://models.github.ai/inference";
    const model = "openai/gpt-4.1";
    const client = ModelClient(endpoint, new AzureKeyCredential(token));

    const response = await client.path("/chat/completions").post({
      body: {
        messages: [
          { role: "system", content: "Provide only the final answer in the specified format without any reasoning or explanation." },
          { role: "user", content: prompt }
        ],
        temperature: 1,
        top_p: 1,
        model: model
      }
    });

    if (isUnexpected(response)) {
      throw new Error(response.body.error?.message || 'Unexpected error from GPT API');
    }

    const suggestions = response.body.choices[0].message.content;
    console.log('Generated career aspirations:', suggestions);

    if (!suggestions) {
      throw new Error('No suggestions returned from GPT API');
    }

    return Response.json({ suggestions });
  } catch (error) {
    console.error('Error generating career aspirations:', {
      message: error.message,
      stack: error.stack,
      body: body || 'undefined',
    });
    return Response.json({ error: `Server error: ${error.message}` }, { status: 500 });
  }
}