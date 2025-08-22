import OpenAI from 'openai';
import {NextResponse} from 'next/server';

export const runtime = 'nodejs';
export async function POST(request){
    if(request.method!== 'POST'){
        return NextResponse.json({ error: 'Method not allowed' }, { status: 405});
    }
    const prompt = await request.json().then(data => data.PromptData);
    if(!prompt) { 
        return NextResponse.json({error:"Invalid prompt provided. Please provide a valid string."},{status: 400});
    }
    console.log("Received prompt:", prompt);
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
    const suggestions = completion.choices[0].message.content;
    return NextResponse.json({Suggestions: suggestions}, { status: 200 });
    }
    catch (err){
        return NextResponse.json({ error: 'Error processing request', details: err.message }, { status: 500 });
    }
}