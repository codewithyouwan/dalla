import ModelClient, { isUnexpected } from "@azure-rest/ai-inference";
import { AzureKeyCredential } from "@azure/core-auth";
import Prompt from "../../../helper/prompt";
import OpenAI  from "openai";

export const runtime = 'nodejs';
function checkValidityOfScores(total, vocabulary, reading, listening, language_and_reading) {
  if (total < 0 || vocabulary < 0 || reading < 0 || listening < 0 || language_and_reading < 0) {
    return "スコアは0以上でなければなりません。 \n Scores must be 0 or above.";
  }
  return (Number(total)===(Number(vocabulary) + Number(reading) + Number(listening)+Number(language_and_reading)));
}
export async function POST(request) {
    const data= await request.json()
    const {marks, japaneseLevel, examMonth, userFeedback, previousSuggestion} = data;
    console.log("Marks received for JLPT description generation:", marks);
    const {total, vocabulary, reading, listening, language_and_reading} = marks;
    const prompt = Prompt({marks,japaneseLevel,examMonth,userFeedback,previousSuggestion}, 'rethinkJLPTExperience');
    let validity = checkValidityOfScores(total, vocabulary, reading, listening,language_and_reading);
    if(validity!==true) {
      if(validity === false)
      {
        validity = "合計スコアは、語彙、読解、リスニングの合計と一致する必要があります。\n Total score must match the sum of vocabulary, reading, and listening scores.";
      }
      return Response.json({error: validity}, {status:400});
    }
    // const token = process.env.GROK3_API_KEY;
    // const endpoint = "https://models.github.ai/inference";
    // const model = "openai/gpt-4.1";

    // const client = ModelClient(endpoint, new AzureKeyCredential(token));

    // const response = await client.path("/chat/completions").post({
    //   body: {
    //     messages: [
    //       { role: "system", content: "" },
    //       { role: "user", content: prompt }
    //     ],
    //     temperature: 1,
    //     top_p: 1,
    //     model: model
    //   }
    // });

    // if (isUnexpected(response)) {
    //   throw new Error(response.body.error.message || "Unexpected error");
    // }

    // const suggestions = response.body.choices[0].message.content;
    const token = process.env.NVIDIA_DEEPSEEK_R1_KEY;
    const endpoint = 'https://integrate.api.nvidia.com/v1';
    const openai = new OpenAI({
        apiKey: token,
        baseURL: endpoint,
    });
    if (!token) {
    console.error('NVIDIA_DEEPSEEK_R1_KEY is not set in environment variables');
    return NextResponse.json({error: 'NVIDIA_DEEPSEEK_R1_KEY is not set'}, { status: 500 });
    }
    try{
        // qwen/qwen3-coder-480b-a35b-instruct
        const completion = await openai.chat.completions.create({
            model: 'qwen/qwen3-coder-480b-a35b-instruct',
            messages: [
            {
                role: 'system',
                content:
                'Generate the response exactly as specified in the prompt. Include only the formatted output with no additional text, explanations, or deviations.',
            },
            { role: 'user', content: prompt },
            ],
            temperature: 0.3,
            top_p: 0.9,
            max_tokens: 4096,
            frequency_penalty: 0,
            presence_penalty: 0,
            stream: false,
        });
        const suggestions = completion.choices[0].message.content;
        return Response.json({ suggestions });
  } catch (error) {
    console.error("Error generating JLPT descriptions:", error);
    return Response.json({ error: error.message || "An error occurred" }, { status: 500 });
  }
}