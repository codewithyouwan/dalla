import ModelClient, { isUnexpected } from "@azure-rest/ai-inference";
import { AzureKeyCredential } from "@azure/core-auth";

export const runtime = 'nodejs';

export async function POST(request) {
  try {
    const { total, vocabulary, reading, listening } = await request.json();
    
    const prompt = `Write three forms of formal Japanese sentences suitable for a resume, with each form containing three sentences.
    Label them clearly with:
    
    ### Form 1 (Longest)
    ### Form 2 (Shorter)
    ### Form 3 (Shortest)
    
    Each sentence should describe my Japanese ability in reading, grammar, and listening,
    based on this JLPT experience:
    
    Total: ${total} out of 180
    Vocabulary: ${vocabulary}
    Reading: ${reading}
    Listening: ${listening}
    
    Do not mention scores, percentages, or test details.
    
    Keep each sentence extremely short (about 10 words) and professional.
    Use polite, humble first-person phrasing.
    Number the sentences in each form.`;

    const token = process.env.GROK3_API_KEY;
    const endpoint = "https://models.github.ai/inference";
    const model = "xai/grok-3";

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
