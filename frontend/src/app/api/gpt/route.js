import ModelClient, { isUnexpected } from "@azure-rest/ai-inference";
import { AzureKeyCredential } from "@azure/core-auth";
import Prompt from "../../helper/prompt";

export const runtime = 'nodejs';
function checkValidityOfScores(total, vocabulary, reading, listening) {
  if (total < 0 || vocabulary < 0 || reading < 0 || listening < 0) {
    return "スコアは0以上でなければなりません。 \n Scores must be 0 or above.";
  }
  return (Number(total)===(Number(vocabulary) + Number(reading) + Number(listening)));
}
export async function POST(request) {
  try {
    const { total, vocabulary, reading, listening } = await request.json();
    
    const prompt = Prompt({ total, vocabulary, reading, listening }, 'jlptExperience');
    let validity = checkValidityOfScores(total, vocabulary, reading, listening);
    if(validity!==true) {
      if(validity === false)
      {
        validity = "合計スコアは、語彙、読解、リスニングの合計と一致する必要があります。\n Total score must match the sum of vocabulary, reading, and listening scores.";
      }
      return Response.json({error: validity}, {status:400});
    }
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
    
    return Response.json({ suggestions });
  } catch (error) {
    console.error("Error generating JLPT descriptions:", error);
    return Response.json({ error: error.message || "An error occurred" }, { status: 500 });
  }
}