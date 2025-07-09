import dotenv from 'dotenv';
dotenv.config();
const prompt = 
`Write three forms with three sentences each(Each set if smaller than the other the last one is the smallest), formal Japanese sentences suitable for a resume.
Each sentence should describe my Japanese ability in reading, grammar, and listening,
based on this JLPT experience:

Total: 80 out of 180
Vocabulary: 21
Reading: 36
Listening: 23

Do not mention scores, percentages, or test details.

Keep each sentence extremely short (about 10 words) and professional.
Use polite, humble first-person phrasing.
Number the sentences.`;

import ModelClient, { isUnexpected } from "@azure-rest/ai-inference";
import { AzureKeyCredential } from "@azure/core-auth";

const token = process.env.GROK3_API_KEY;
const endpoint = "https://models.github.ai/inference";
const model = "xai/grok-3";

export async function main() {

  const client = ModelClient(
    endpoint,
    new AzureKeyCredential(token),
  );

  const response = await client.path("/chat/completions").post({
    body: {
      messages: [
        { role:"system", content: "" },
        { role:"user", content: prompt }
      ],
      temperature: 1,
      top_p: 1,
      model: model
    }
  });

  if (isUnexpected(response)) {
    throw response.body.error;
  }

  console.log(response.body.choices[0].message.content);
}

main().catch((err) => {
  console.error("The sample encountered an error:", err);
});

