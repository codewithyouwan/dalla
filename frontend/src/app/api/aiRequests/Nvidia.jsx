import OpenAI from 'openai';

export const runtime = 'nodejs';
export default async function AI(prompt){
    if(!prompt || typeof prompt !== 'string') {
        return "Invalid prompt provided. Please provide a valid string.";
    }
    const token = process.env.NVIDIA_DEEPSEEK_R1_KEY;
    const endpoint = 'https://integrate.api.nvidia.com/v1';
    const openai = new OpenAI({
    apiKey: token,
    baseURL: endpoint,
    });
    if (!token) {
    console.error('NVIDIA_DEEPSEEK_R1_KEY is not set in environment variables');
    return "No API key provided. Please set the NVIDIA_DEEPSEEK_R1_KEY environment variable.";
    }
    try {
    const completion = await openai.chat.completions.create({
        model: 'nvidia/llama-3.1-nemotron-ultra-253b-v1',
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
    const suggestions = completion.choices[0]?.message?.content || '';
    return suggestions;
    }
    catch (err){
        return {"error": "NVIDIA API error: " + err.message};
    }
}