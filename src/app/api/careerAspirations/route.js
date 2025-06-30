import ModelClient, { isUnexpected } from "@azure-rest/ai-inference";
import { AzureKeyCredential } from "@azure/core-auth";
import Prompt from "../../helper/prompt";

export const runtime = 'nodejs';

export async function POST(request) {
  try {
    const body = await request.json();
    console.log('Career Aspirations API payload:', body);

    const { preferred_industry, job_role_priority_1, future_career_goals, work_style_preference } = body;

    // Convert ARRAY fields to comma-separated strings with fallbacks
    const formattedData = {
      preferred_industry: Array.isArray(preferred_industry) && preferred_industry.length > 0 ? preferred_industry.join(', ') : 'Not specified',
      job_role_priority_1: job_role_priority_1 || 'Not specified',
      future_career_goals: Array.isArray(future_career_goals) && future_career_goals.length > 0 ? future_career_goals.join(', ') : 'Not specified',
      work_style_preference: Array.isArray(work_style_preference) && work_style_preference.length > 0 ? work_style_preference.join(', ') : 'Not specified',
    };

    const prompt = Prompt(formattedData, 'careerAspirations');

    const token = process.env.GROK3_API_KEY;
    const endpoint = "https://models.github.ai/inference";
    const model = "openai/gpt-4.1";

    const client = ModelClient(endpoint, new AzureKeyCredential(token));

    const response = await client.path("/chat/completions").post({
      body: {
        messages: [
          { role: "system", content: "" },
          { role: "user", content: prompt }
        ],
        temperature: 1,
        top_p: 1,
        model: model
      }
    });

    if (isUnexpected(response)) {
      throw new Error(response.body.error.message || "Unexpected error");
    }

    const suggestions = response.body.choices[0].message.content;
    console.log("Generated career aspirations:", suggestions);
    
    return Response.json({ suggestions });
  } catch (error) {
    console.error("Error generating career aspirations:", error);
    return Response.json({ error: error.message || "An error occurred" }, { status: 500 });
  }
}