import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import Prompt from '../../helper/prompt';
import OpenAI from 'openai';

export const runtime = 'nodejs';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(request) {
  let id_number;
  try {
    const body = await request.json();
    id_number = body.id_number;

    if (!id_number) {
      return NextResponse.json({ error: 'id_number is required' }, { status: 400 });
    }

    // Fetch internship and project details from the data table
    const { data, error } = await supabase
      .from('data')
      .select(`
        internship_1_title, internship_1_company, internship_1_period, internship_1_team_size, internship_1_technologies, internship_1_summary, internship_1_purpose, internship_1_role, internship_1_challenges, internship_1_outcome,
        internship_2_title, internship_2_company, internship_2_period, internship_2_team_size, internship_2_technologies, internship_2_summary, internship_2_purpose, internship_2_role, internship_2_challenges, internship_2_outcome,
        project_1_title, project_1_period, project_1_team_size, project_1_technologies, project_1_summary, project_1_purpose, project_1_role, project_1_challenges, project_1_outcome,
        project_2_title, project_2_period, project_2_team_size, project_2_technologies, project_2_summary, project_2_purpose, project_2_role, project_2_challenges, project_2_outcome
      `)
      .eq('id_number', id_number)
      .single();

    if (error || !data) {
      console.error('Supabase error:', error?.message || 'No data found', { id_number });
      return NextResponse.json({ error: 'No data found' }, { status: 404 });
    }

    // Collect up to two internships
    const internships = [];
    const internshipFields = [
      {
        title: data.internship_1_title,
        company: data.internship_1_company,
        period: data.internship_1_period,
        team_size: data.internship_1_team_size,
        technologies: data.internship_1_technologies,
        summary: data.internship_1_summary,
        purpose: data.internship_1_purpose,
        role: data.internship_1_role,
        challenges: data.internship_1_challenges,
        outcome: data.internship_1_outcome,
        isInternship: true,
      },
      {
        title: data.internship_2_title,
        company: data.internship_2_company,
        period: data.internship_2_period,
        team_size: data.internship_2_team_size,
        technologies: data.internship_2_technologies,
        summary: data.internship_2_summary,
        purpose: data.internship_2_purpose,
        role: data.internship_2_role,
        challenges: data.internship_2_challenges,
        outcome: data.internship_2_outcome,
        isInternship: true,
      },
    ].filter((internship) => internship.title && internship.period); // Filter out incomplete entries

    // Collect up to two projects
    const projects = [];
    const projectFields = [
      {
        title: data.project_1_title,
        company: '', // Projects do not have a company
        period: data.project_1_period,
        team_size: data.project_1_team_size,
        technologies: data.project_1_technologies,
        summary: data.project_1_summary,
        purpose: data.project_1_purpose,
        role: data.project_1_role,
        challenges: data.project_1_challenges,
        outcome: data.project_1_outcome,
        isInternship: false,
      },
      {
        title: data.project_2_title,
        company: '', // Projects do not have a company
        period: data.project_2_period,
        team_size: data.project_2_team_size,
        technologies: data.project_2_technologies,
        summary: data.project_2_summary,
        purpose: data.project_2_purpose,
        role: data.project_2_role,
        challenges: data.project_2_challenges,
        outcome: data.project_2_outcome,
        isInternship: false,
      },
    ].filter((project) => project.title && project.period); // Filter out incomplete entries

    // Process internships and projects with LLaMA API
    const token = process.env.NVIDIA_DEEPSEEK_R1_KEY;
    const endpoint = "https://integrate.api.nvidia.com/v1";

    if (!token) {
      throw new Error('NVIDIA_DEEPSEEK_R1_KEY is not set in environment variables');
    }

    const openai = new OpenAI({
      apiKey: token,
      baseURL: endpoint,
    });

    const processExperience = async (experience) => {
      const prompt = Prompt(experience, 'internshipExperience');
      const completion = await openai.chat.completions.create({
        model: "nvidia/llama-3.1-nemotron-ultra-253b-v1",
        messages: [
          {
            role: "system",
            content:
              "Generate the response exactly as specified in the prompt. Include only the formatted output with no additional text, explanations, or deviations. Use ===FORM1-START=== and ===FORM1-END=== with exactly seven lines of Japanese text, each starting with the specified labels.",
          },
          { role: "user", content: prompt },
        ],
        temperature: 0.1,
        top_p: 0.9,
        max_tokens: 512,
        frequency_penalty: 0,
        presence_penalty: 0,
        stream: false,
      });

      const suggestions = completion.choices[0]?.message?.content || '';
      if (!suggestions) {
        throw new Error('No suggestions returned from LLaMA API');
      }

      const form1Match = suggestions.match(/===FORM1-START===[\s\S]*?\n([\s\S]*?)\n===FORM1-END===/);
      if (!form1Match) {
        console.error('FORM1 parsing failed. Full response:', suggestions);
        throw new Error('Failed to parse LLaMA response: FORM1 not found');
      }

      const lines = form1Match[1].trim().split('\n').map((line) => line.trim());
      if (lines.length !== 7) {
        console.error('Invalid line count in FORM1. Lines:', lines);
        throw new Error(`Invalid LLaMA response format: Expected 7 lines, got ${lines.length}`);
      }

      return {
        title: lines[0].startsWith('タイトル: ') ? lines[0].replace('タイトル: ', '') : '',
        company: experience.isInternship ? (lines[1].startsWith('会社: ') ? lines[1].replace('会社: ', '') : '') : undefined,
        period: lines[2].startsWith('期間: ') ? lines[2].replace('期間: ', '') : '',
        role: lines[3].startsWith('担当した役割: ') ? lines[3].replace('担当した役割: ', '') : '',
        description: lines[4].startsWith('具体的な内容: ') ? lines[4].replace('具体的な内容: ', '') : '',
        challenges: lines[5].startsWith('直面した課題: ') ? lines[5].replace('直面した課題: ', '') : '',
        outcome: lines[6].startsWith('成果: ') ? lines[6].replace('成果: ', '') : '',
      };
    };

    // Process up to two internships and two projects
    const processedInternships = await Promise.all(
      internshipFields.slice(0, 2).map((internship) => processExperience(internship))
    );
    const processedProjects = await Promise.all(
      projectFields.slice(0, 2).map((project) => processExperience(project))
    );

    // Validate non-empty fields
    const validateEntry = (entry) => entry.title && entry.period && entry.role && entry.description && entry.challenges && entry.outcome;
    const validInternships = processedInternships.filter(validateEntry);
    const validProjects = processedProjects.filter(validateEntry);

    return NextResponse.json({
      suggestions: {
        internships: validInternships,
        projects: validProjects,
      },
    }, { status: 200 });
  } catch (error) {
    console.error('Error processing experience:', {
      message: error.message,
      stack: error.stack,
      id_number: id_number || 'undefined',
    });
    return NextResponse.json({ error: `Server error: ${error.message}` }, { status: 500 });
  }
}