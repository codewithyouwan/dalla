import ModelClient, { isUnexpected } from "@azure-rest/ai-inference";
import { AzureKeyCredential } from "@azure/core-auth";
import Prompt from "../../helper/prompt";

export const runtime = 'nodejs';

export async function POST(request) {
  try {
    const { total, vocabulary, reading, listening } = await request.json();
    
    const prompt=Prompt({total,vocabulary,reading,listening},'cvFormatting');

    const token = process.env["GROK3_API_KEY"];
    const endpoint = "https://models.github.ai/inference";
    // const model = "xai/grok-3";
    const model = "openai/gpt-4.1";

    const client = ModelClient(
      endpoint,
      new AzureKeyCredential(token),
    );

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
    
    return Response.json({ suggestions });
  } catch (error) {
    console.error("Error generating JLPT descriptions:", error);
    return Response.json({ error: error.message || "An error occurred" }, { status: 500 });
  }
}
