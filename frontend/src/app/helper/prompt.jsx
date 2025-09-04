/*
    This is a helper function for different types of prompts.
    In the whatFor array we have defined the types for which we have the prompts.
*/
const whatForTypes = ['jlptExperience', 'careerAspirations', 'languagesAndTools',
'internshipExperience', 'japaneseCompanies', 'workValues', 'fieldsOfInterest',
'productDevelopment', 'katakanaConversion', 'hobbyConversion','placeConversion','rethinkJapaneseCompany','rethinkWorkValues'];
export default function Prompt(data, whatFor) {
  if (whatFor === whatForTypes[0]) {// For jlpt
  const { marks, japaneseLevel, examMonth } = data;
  console.log(marks, "In prompt");
  const {total, vocabulary, reading, listening,language_and_reading} = marks;
  const validatedJapaneseLevel = japaneseLevel || 'Not certified';
  const currentYear = new Date().getFullYear(); // Get the current year dynamically
  const prompt = `
      ＜Reference Information>
      JLPT Level: ${validatedJapaneseLevel}
      Total Score: ${total || '未入力'}
      Vocabulary Score: ${vocabulary || '未入力'}
      ${validatedJapaneseLevel=='N5'||validatedJapaneseLevel=='N4'?('Language and Reading Score: '+(language_and_reading || '未入力')):
        'Reading Score: '+ (reading || '未入力')+' Listening Score: '+(listening || '未入力')}

      <Prompt>
      Based on this information (JLPT level and scores), please generate appropriate content to describe my Japanese language ability in vocabulary, reading, and listening for inclusion in a CV. 
      To ensure that companies can accurately understand my Japanese level, explicitly mention the JLPT level and concisely describe the three abilities (reading, vocabulary/grammar, listening) in **first person (“私は...”)** natural Japanese, as a single paragraph.
      Create 3 variations, each consisting of one paragraph.  
      At the beginning of each paragraph, mention the JLPT level (${validatedJapaneseLevel}), and reflect it in the ability description.
      ⚠️ Always use the current year (${currentYear}) and (${examMonth}) when writing the JLPT test date in the output. Do not hardcode 2025.

      Please follow the output format **strictly**. Enclose each variation as follows:

      - For the longer paragraph pattern, use ===FORM1-START=== and ===FORM1-END===.
      - For the medium-length paragraph pattern, use ===FORM2-START=== and ===FORM2-END===.
      - For the most concise paragraph pattern, use ===FORM3-START=== and ===FORM3-END===.

      【Rules for each pattern】

      - Each paragraph must start with “${currentYear}年${examMonth}${validatedJapaneseLevel}にJLPTのN4を受験し、合格。” and then describe reading, vocabulary, and listening skills naturally in first-person Japanese, within a single paragraph. 
      - Connect the three abilities smoothly, using professional expressions suitable for a CV.  
      - Do not include scores of the candidate.  
      - Sentences must end with 「だ」 or 「である」 style (plain form) only.  
      - Double check the sentence structure and ensure its error free and in the required format. 
      - Emphasize strengths based on ${validatedJapaneseLevel}.  
      - If ${validatedJapaneseLevel} is “Not certified”, instead write: 「私は日本語能力試験を受験していないが、日常会話レベルを目標に学習中。」 and describe abilities modestly.

      【Output format example】

      ===FORM1-START===
      ${currentYear}年${examMonth}月にJLPTのN4を受験し、合格。私は専門的な文書を正確に理解し、適切に対応できます。また、ビジネスシーンで使用される語彙や文法を幅広く活用でき、会議での発言や指示を聞き取り、適切に反応できます。
      ===FORM1-END===

      ===FORM2-START===
      ${currentYear}年${examMonth}月にJLPTのN4を受験し、合格。私は専門文書をスムーズに読解し、ビジネス語彙を効果的に使用でき、会議内容を正確に理解できます。
      ===FORM2-END===

      ===FORM3-START===
      ${currentYear}年${examMonth}月にJLPTのN4を受験し、合格。私は文書を読解し、ビジネス語彙を活用し、会議を理解できます。
      ===FORM3-END===

      【Not certified example】

      ===FORM1-START===
      私は日本語能力試験を受験していないが、日常会話レベルを目標に学習中。私は簡単な文書を理解し、日常的な語彙を適切に使用し、基本的な会話内容を聞き取れます。
      ===FORM1-END===
      `;
    return prompt;
  } else if (whatFor === whatForTypes[1]) { // For careerAspiration
    const { preferred_industry, jobs_to_try_in_japan, job_role_priorities, work_style_preference } = data;
    const prompt = `
    <System Instructions>
      Respond **only** with the exact format specified below, containing four Japanese lines within ===FORM2-START=== and ===FORM2-END===. Use professional Japanese suitable for a CV. Do not include any additional text, explanations, or deviations.
      <Prompt>
      Generate four items for the CV's "志向" section:
      - 希望業界: Use all Japanese katakana names from Preferred Industry (${preferred_industry?.length ? preferred_industry.join(', ') : 'なし'}), comma-separated. Remove any English names. Validate and correct katakana if incorrect (e.g., convert "テクノロジ" to "テクノロジー"). If empty or only English, use "技術".
      - 希望職種: Use all Japanese katakana names from Jobs to Try in Japan (${jobs_to_try_in_japan?.length ? jobs_to_try_in_japan.join(', ') : 'なし'}), comma-separated. Remove any English names. Validate and correct katakana if incorrect (e.g., "エンジニアリング" to "エンジニア"). If empty or only English, use "エンジニア".
      - 目指す役割: Use all Japanese katakana names from Job Role Priorities (${job_role_priorities?.length ? job_role_priorities.join(', ') : 'なし'}), comma-separated. Remove any English names. Validate and correct katakana if incorrect (e.g., "マネージャ" to "マネージャー"). If empty or only English, use "データ分析".
      - ワークスタイル: Based on Work Style Preference (${work_style_preference?.length ? work_style_preference.join(', ') : 'なし'}), describe the work style **in da/deru form** (plain declarative style, e.g., 重要である or 柔軟である). Filter out any English terms. If empty or only English, use "チームワークを重視する姿勢である".

      <Output Format>
      ===FORM2-START===
      希望業界: [comma-separated Japanese katakana names]
      希望職種: [comma-separated Japanese katakana names]
      目指す役割: [comma-separated Japanese katakana names]
      ワークスタイル: [1 sentence (Can have multiple lines) in da/deru form]
      ===FORM2-END===

      <Example>
      ===FORM2-START===
      希望業界: 情報技術、金融
      希望職種: 開発エンジニア、データサイエンティスト
      目指す役割: プロジェクト管理、チームリーダー
      ワークスタイル: 実装力を基盤に、企画・提案や研究的なアプローチも取り入れながら、多角的に課題解決に取り組むスタイルを志望する。特定分野にとらわれず、幅広い役割を担えるジェネラリストとしての成長を目指す。
      ===FORM2-END===

      <Rules> (Follow these strictly otherwise our system can break)
      - Output **exactly** four lines between ===FORM2-START=== and ===FORM2-END===.
      - Each line starts with the specified label (希望業界: , 希望職種: , 目指す役割: , ワークスタイル: ).
      - For 希望業界, 希望職種, and 目指す役割, use comma-separated Japanese katakana names, removing English terms and correcting invalid katakana.
      - For ワークスタイル, use a complete sentence or phrase strictly in da/deru form.
      - In the output if you comma use the Japanse comma '、' instead of the English comma ','.
      - If input is 'なし', empty, or contains only English terms, use defaults: 技術 (希望業界), エンジニア (希望職種), データ分析 (目指す役割), チームワークを重視する姿勢である (ワークスタイル).
      - Do **not** include other markers (e.g., FORM1, FORM3), text, or blank lines.`
    return prompt;
  } else if (whatFor === whatForTypes[2]) { // language and Tools
    const { programming_languages, databases_querying, version_control, code_editors_ides, ml_frameworks } = data;
    const prompt = `
    <System Instructions>
    Respond **only** with the exact format specified below, containing two Japanese lines within ===FORM-START=== and ===FORM-END===. Use professional Japanese suitable for a CV. Do not include any additional text, explanations, or deviations. If japanese sentence are required then keep them strictly in da/deru form only.

    <Employee Information>
    Programming Languages: ${programming_languages || 'None'}
    Databases Querying: ${databases_querying || 'None'}
    Version Control: ${version_control || 'None'}
    Code Editors & IDEs: ${code_editors_ides || 'None'}
    ML Frameworks: ${ml_frameworks || 'None'}

    <Prompt>
    Based on the provided employee information, generate concise, business-appropriate values for the CV's "Languages/Development Tools" section. Generate values for the following two items:
    - Programming Languages: List the programming languages (${programming_languages}) as a concise, comma-separated list using Japanese commas (、).
    - Development Tools: Combine databases querying (${databases_querying}), version control (${version_control}), code editors & IDEs (${code_editors_ides}), and ML frameworks (${ml_frameworks}) into a concise, comma-separated list using Japanese commas (、). Select and integrate relevant tools to clearly represent technical expertise.
    Ensure the values are **concise and accurate** to help employers understand the candidate's technical skills. Use professional Japanese for a CV, with Japanese commas (、) for all lists.

    <Output Format>
    ===FORM-START===
    プログラミング言語: [comma-separated list with Japanese commas]
    開発ツール: [comma-separated list with Japanese commas]
    ===FORM-END===

    <Example>
    ===FORM-START===
    プログラミング言語: Python、JavaScript、Java、SQL
    開発ツール: Git、VS Code、Docker、TensorFlow
    ===FORM-END===

    <Rules>
    - Output **exactly** two lines between ===FORM-START=== and ===FORM-END===.
    - Each line starts with the specified label (プログラミング言語: , 開発ツール: ).
    - Use Japanese commas (、) for separating items in both lists.
    - If an input is 'None', empty, or invalid, exclude it from the output or use a suitable default (e.g., 'Python' for languages, 'Git' for tools) if no valid items are provided.
    - Do **not** include other markers, text, or blank lines.
        `;
    return prompt;
  } else if (whatFor === whatForTypes[3]) { // internship
    const { title, company, period, team_size, technologies, summary, purpose, role, challenges, outcome, isInternship } = data;
    const experienceType = isInternship ? 'Internship' : 'Project';
    // #region internshipExperience
    const prompt = `
      <System Instructions>
      Based on the following ${experienceType} information, generate concise, professional values for the CV "${experienceType}" section.
      Strictly follow the specified format, including only 8 lines of Japanese text within the designated markers, with no additional explanations or text.
      Use natural, professional Japanese for each field, ensuring the Title, Period, and ${isInternship ? 'Company' : 'Project Name'} are in Japanese, with Period formatted as "YYYY年MM月 – YYYY年MM月".

      <${experienceType} Information>
      Title: ${title || 'None'}
      ${isInternship ? 'Company' : 'Project Name'}: ${company || 'None'}
      Period: ${period || 'None'}
      Team Size: ${team_size || 'Unknown'}
      Technologies: ${technologies || 'None'}
      Summary: ${summary || 'None'}
      Purpose: ${purpose || 'None'}
      Role: ${role || 'None'}
      Challenges: ${challenges || 'None'}
      Outcome: ${outcome || 'None'}

      <Prompt>
      Generate values for the following 8 fields:
      - Title: Describe the ${experienceType} title (${title}) concisely in Japanese.
      - ${isInternship ? 'Company' : 'Project Name'}: Describe the ${isInternship ? 'company name (${company})' : 'project name (${title})'} in Japanese.
      - Period: Format the period (${period}) as "YYYY年MM月 – YYYY年MM月" in Japanese.
      - Role: Describe the role in the ${experienceType} (${role}) concisely in Japanese, using "果たした役割" and end the sentence with (。) ALWAYS.
      - Description: Combine the purpose (${purpose}), technologies (${technologies}), and team size (${team_size}) into a detailed, concise description, distinct from the summary ending with a (。) ALWAYS.
      - Summary: Provide a concise overview of the ${experienceType} (${summary}) in Japanese, focusing on the main objective or scope also ending with (。).
      - Challenges: Describe the challenges (${challenges}) concisely and specifically in Japanese, using "課題" also ending with (。).
      - Outcome: Describe the outcome (${outcome}) concisely in Japanese, emphasizing team or individual contributions, using "得られた成果" also ending with (。).

      <Output Format>
      Strictly follow the format below, including only 8 lines between ===FORM1-START=== and ===FORM1-END===. Each line starts with the specified label, written in concise, professional Japanese.

      <Output Example>
      ===FORM1-START===
      タイトル: 機械学習インターンシップ
      会社: テック株式会社
      期間: 2023年06月 – 2023年08月
      果たした役割: データサイエンティスト。
      内容: 3人チームでPythonを使用し、機械学習モデルの設計・開発。
      概要: 顧客データの分析モデル構築。
      課題: データクリーニングの複雑さ。
      得られた成果: モデル精度を20%向上。
      ===FORM1-END===

      <Rules> (Follow them strictly otherwise our system can break)
      - Include exactly 8 lines, one for each field, in concise, accurate Japanese.
      - Reflect the input data for Title, ${isInternship ? 'Company' : 'Project Name'}, and Period directly, with Period in "YYYY年MM月 – YYYY年MM月" format.
      - Ensure "Description" is distinct from "Summary" by integrating purpose, technologies, and team size, avoiding redundancy.
      - Use professional, CV-appropriate expressions, emphasizing expertise and outcomes.
      - Use the "da/de aru" (plain) style and place a (。) in the end this is a strict requirement without this our system can break.
      - Include only the 8 lines between ===FORM1-START=== and ===FORM1-END===, with no other text or markers.
    `;
    // #endregion
    return prompt;
  } else if (whatFor === whatForTypes[4]) { //JapaneseCompanies
    const {interest_in_japanese_companies, aspects_to_learn} = data;
    const prompt = `
        <System Instructions>
        Respond **only** with the exact format specified below, containing two Japanese phrases (Each one a concise sentence 2-3 lines.) within ===FORM2-START=== and ===FORM2-END===. Do **not** include any other text, headers, blank lines, or markers (e.g., FORM1, FORM3). Use professional Japanese suitable for a CV, reflecting Japanese corporate culture (e.g., teamwork, continuous improvement, technical innovation). For the sentences always follow the da/deru form only.

        <Employee Information>
        Interest in Japanese Companies: ${interest_in_japanese_companies || 'なし'}
        Aspects to Learn: ${aspects_to_learn || 'なし'}

        <Prompt>
        Generate two items for the CV's "日本企業について" section:
        - Most Interesting Aspect: Based on Interest in Japanese Companies (${interest_in_japanese_companies}), describe what excites the person about working at Japanese companies in a single phrase prefereable have 2-3 lines.
        - Skills to Acquire: (${aspects_to_learn}) From this just remove the english names (after the '/') and just check the japanese names if there is any error then correct it and return it(Seperated by commas).

        <Output Format>
        ===FORM2-START===
        番興味がある点: [Japanse phrase for why the person is interested in Japanese companies in da/deru form only.]
        習得したいこと: [Japanse phrase for why the person wants to learn about Japanese companies in da/deru form only.]
        ===FORM2-END===

        <Example>
        ===FORM2-START===
        番興味がある点: 日本企業の品質や継続的改善（カイゼン）へのこだわり、チームワークを重んじる文化に強く共感し、そういった環境でエンジニアとして成長したいと思っている。
        習得したいこと: ものづくり現場の課題を発見し改善する提案力と技術力
        ===FORM2-END===

        <Rules>
        - Write as the person is writing the sentences himself.
        - Use the da/deru form for the japanse sentences.
        - Output **exactly** two phrases between ===FORM2-START=== and ===FORM2-END===.
        - Each phrase starts with "番興味がある点: " or "習得したいこと: ", followed by 1 phrase (2-3 lines).
        - Do **not** include other markers, text, or blank lines.
        - **Strictly** follow the format; any deviation will break the system.
      `;
    return prompt;
  } else if (whatFor === whatForTypes[5]) { //workValues
    const { work_values } = data;
    const prompt = `
      <System Instructions>
      Generate a concise, professional response for the "Career Development" section of a CV based on the provided work values. The output must strictly follow the specified format, containing only one line of Japanese text (Only in da/deru form) within the designated markers, without any additional explanations or text. Use natural, professional Japanese suitable for a CV.

      <Career Information>
      Work Values: ${work_values.join(', ') || 'none'}

      <Prompt>
      Generate a single paragraph for the "3大優先要素" (Three Priority Elements) row, integrating the provided work values into a cohesive, professional statement. The paragraph should be 1-2 sentences, emphasizing professionalism and enthusiasm, and reflect the candidate's priorities based solely on the work values.

      [Output Format]
      The output must strictly follow this format, containing only one line of Japanese text between ===FORM1-START=== and ===FORM1-END===, with no additional text or markers.

      ===FORM1-START===
      3大優先要素: [Concise paragraph integrating work values in professional Japanese in "da, de aru" style]
      ===FORM1-END===

      [Output Example]
      ===FORM1-START===
      3大優先要素: チームワークを大切にし、安定した環境の中で自らの技術力と人間的成長の両面を追求したいと思っている。多様な文化の中で学び続ける姿勢を持ち、周囲と協調しながら成長することを重視している。
      ===FORM1-END===

      [Construction Rules]
      - Generate one paragraph (1-2 sentences) in natural, professional Japanese.
      - Integrate the work values into a cohesive statement, emphasizing professionalism and enthusiasm.
      - Do not use other career information (e.g., job roles, career goals).
      - Avoid directly quoting the input; rephrase into a polished CV-appropriate expression.
      - Output only the single line within ===FORM1-START=== and ===FORM1-END===, with no additional text.
      - I would like all sentence endings to follow the “da/de aru” (plain) style.
      `;
    return prompt;
  } else if (whatFor === whatForTypes[6]) { //fieldofInteres
    const { job_role_priority_1, job_role_priority_2, job_role_priority_3} = data;
    return `
        Based on the following user data:
        - Job Role Priority 1: ${job_role_priority_1 || 'N/A'}
        - Job Role Priority 2: ${job_role_priority_2 || 'N/A'}
        - Job Role Priority 3: ${job_role_priority_3 || 'N/A'}

        Generate three distinct fields of interest relevant to the user's career goals and job preferences in Japan. The output must be formatted as follows, with exactly three fields, each on a new line within its own FORM section:

        ===FORM1-START===
        [Field 1]
        ===FORM1-END===
        ===FORM2-START===
        [Field 2]
        ===FORM2-END===
        ===FORM3-START===
        [Field 3]
        ===FORM3-END===

        【Rules】
        - Each field must be unique and relevant to the user's data.
        - Just remove the English names (after the '/') in the input data and just check the japanese names if there is any error then correct it and retur it.
        - Everything before the '/' is the Japanese name so don't exclude anything if it's not incorrect of misspelled (Even things in brackets).
        - I would like all sentence endings to follow the “da/de aru” (plain) style.
      `;
  } else if (whatFor === whatForTypes[7]) { //product Dev
    const { job_role_priority_1, job_role_priority_2, job_role_priority_3, jobs_to_try_in_japan } = data;
    return `
        <System Instructions>
        Respond **only** with the exact format specified below, containing two Japanese lines within ===FORM1-START=== and ===FORM1-END===. Do **not** include any other text, headers, blank lines, or markers (e.g., FORM2, FORM3). Use professional Japanese suitable for a CV, reflecting Japanese corporate culture (e.g., teamwork, continuous improvement, technical innovation). Limit each line to one sentence, maximum 15 words. Do **not** include the labels "興味を持つ理由: " or "果たしたい役割: " in the output lines; only provide the content after these labels. If japanese sentences are required then always use da/deru form only.

        <Employee Information>
        Job Role Priority 1: ${job_role_priority_1 || 'なし'}
        Job Role Priority 2: ${job_role_priority_2 || 'なし'}
        Job Role Priority 3: ${job_role_priority_3 || 'なし'}
        Jobs to Try in Japan: ${jobs_to_try_in_japan || 'なし'}

        <Prompt>
        Generate two items for the CV's "製品開発について" section:
        - Reason for Interest: Based on Jobs to Try in Japan (${jobs_to_try_in_japan}) and Job Role Priorities (${job_role_priority_1}, ${job_role_priority_2}, ${job_role_priority_3}), describe why you are interested in product development in 1 sentence (max 15 words), excluding the label "興味を持つ理由: ".
        - Desired Role: Based on Job Role Priorities (${job_role_priority_1}, ${job_role_priority_2}, ${job_role_priority_3}), describe the desired role in product development in 1 sentence (max 15 words), excluding the label "果たしたい役割: ".

        <Output Format>
        ===FORM1-START===
        [Reason for Interest, max 15 words, without label]
        [Desired Role, max 15 words, without label]
        ===FORM1-END===

        <Example>
        ===FORM1-START===
        プロジェクトに取り組んだ後、何かが出来上がっていくのを見るのが好きだからだ。
        アンドロイド開発やウェブ開発のような技術的な仕事がしたい。
        ===FORM1-END===

        <Rules>
        - Output **exactly** two lines between ===FORM1-START=== and ===FORM1-END===.
        - Each line is a sentence (max 15 words) without the labels "興味を持つ理由: " or "果たしたい役割: ".
        - Convert input data into professional, CV-appropriate Japanese; do not copy verbatim.
        - Reflect Japanese corporate culture (e.g., innovation, problem-solving).
        - Do **not** include other markers, text, or blank lines.
        - **Strictly** follow the format; any deviation will break the system.
        - Suggested max_tokens: 100 to ensure concise output.
        - I would like all sentence endings to follow the “da/de aru” (plain) style.
      `;
  } else if (whatFor === whatForTypes[8]) { //Name conversion into katakana
    const { institution_name, date_string, major } = data;
    const prompt = `
    <System Instructions>
    Process the provided institution name, date string, and major for a Japanese CV. Respond **only** with the exact format specified below, containing two lines within ===FORM1-START=== and ===FORM1-END===: one for the Katakana institution name (with major in bold brackets if provided) and one for the date range in Japanese format. Do **not** include any other text, headers, blank lines, or markers (e.g., FORM2, FORM3).

    <Input Information>
    Institution Name: ${institution_name || 'なし'}
    Date String: ${date_string || 'なし'}
    Major: ${major || 'なし'}

    <Prompt>
    Perform the following tasks:
    - **Institution Name**: Convert the institution name (${institution_name}) to Katakana, ensuring:
      - Output a single Katakana string representing the phonetic pronunciation in Japanese.
      - If the input is empty, 'なし', or already in Katakana, return the input as-is (if Katakana) or an empty string (if empty or 'なし').
      - Remove non-institution details (e.g., "Science", "Higher Secondary", "Bachelor's").
      - Use standard Japanese Katakana conventions (e.g., "Tokyo University" → "トウキョウダイガク").
      - For complex names, provide a phonetically accurate Katakana representation, keeping it concise.
    - **Major**: If a major (${major}) is provided and not empty or 'なし', convert it to Katakana and append it in bold brackets (e.g., **[土木工学]**) to the institution name.
      - Convert the major to Katakana using Japanese phonetic conventions (e.g., "Civil Engineering" → "土木工学").
      - If the major is empty or 'なし', do not append anything.
      - Also there won't be any major for highschools or schools.
    - **Date String**: Convert the date string (${date_string}) to a Japanese date range in the format "YYYY年MM月 – YYYY年MM月", ensuring:
      - For ranges like "Apr 2014 – Mar 2016" or "Aug 2016 – Oct 2017", output the full range (e.g., "2014年4月 – 2016年3月", "2016年8月 – 2017年10月").
      - For single years like "2016", output "2016年".
      - If the input is empty, 'なし', or invalid, return an empty string.
      - Use Japanese month names (e.g., "January" → "1月", "October" → "10月").

    <Output Format>
    ===FORM1-START===
    [Katakana institution name] **[Katakana major]** (if major is provided)
    [Date range in format YYYY年MM月 – YYYY年MM月 or YYYY年]
    ===FORM1-END===

    <Examples>
    Input: Institution Name: "Tokyo University", Date String: "Apr 2014 – Mar 2016", Major: "Computer Science"
    ===FORM1-START===
    トウキョウダイガク **[コンピューターサイエンス]**
    2014年04月 – 2016年03月
    ===FORM1-END===

    Input: Institution Name: "B.S.S Pranavananda Academy Raipur Science Higher Secondary", Date String: "Aug 2016 – Oct 2017", Major: "なし"
    ===FORM1-START===
    ビーエスエス プラナヴァナンダ アカデミー
    2016年08月 – 2017年10月
    ===FORM1-END===

    Input: Institution Name: "Shri Shankaracharya Institute of Professional Management and Technology", Date String: "August 2016 – September 2021", Major: "Civil Engineering"
    ===FORM1-START===
    シュリ シャンカラチャリヤ インスティテュート **[土木工学]**
    2016年8月 – 2021年9月
    ===FORM1-END===

    Input: Institution Name: "なし", Date String: "なし", Major: "なし"
    ===FORM1-START===
    
    ===FORM1-END===

    Input: Institution Name: "トウキョウダイガク", Date String: "2016", Major: "なし"
    ===FORM1-START===
    トウキョウダイガク
    2016年
    ===FORM1-END===

    <Rules>
    - Output **exactly** two lines between ===FORM1-START=== and ===FORM1-END===.
    - First line: Katakana institution name, followed by Katakana major in bold brackets (e.g., **[土木工学]**) if major is provided and not empty or 'なし', or just the institution name otherwise.
    - Second line: Date range as "YYYY年MM月 – YYYY年MM月" for ranges, "YYYY年" for single years, or empty string.
    - Exclude non-institution details from the institution name.
    - If the institution name is IIT then not need to convert it to katakana just return it as it is.
    - Ensure phonetic accuracy for institution names and majors, and correct date range conversion.
    - Use Japanese month names (e.g., "January" → "01月", "October" → "10月").
    - Do **not** include any labels, additional text, or blank lines.
    - **Strictly** follow the format; any deviation will break the system.
    - Suggested max_tokens: 60 for concise output.
    - I would like all sentence endings to follow the “da/de aru” (plain) style.
    `;
    return prompt;
  } else if (whatFor === whatForTypes[9]) { //hobbies
    const { hobbies_Interests } = data;
    const prompt = `
     <System Instructions>
      Respond **only** with the exact format specified below, containing one Japanese line within ===FORM1-START=== and ===FORM1-END===. Do **not** include any other text, headers, blank lines, or markers (e.g., FORM2, FORM3). Use professional Japanese suitable for a CV. Output 3-4 short phrases (each 2-4 words) separated by Japanese commas.

      <Employee Information>
      Hobby: ${hobbies_Interests || 'なし'}

      <Prompt>
      Convert the hobby (${hobbies_Interests}) into 3-4 concise Japanese phrases for a CV's "趣味" section.
      - If the hobby is in English or lengthy, simplify it to 3-4 professional, CV-appropriate Japanese phrases (e.g., "Playing cricket" → "クリケットをする").
      - Each phrase must be 2-4 words, describing an activity (e.g., "サッカーをする", not just "サッカー").
      - Ignore any URLs or non-hobby text in the input.
      - Ensure the output reflects a professional tone suitable for a Japanese CV.
      - VERY IMPORTANT: ONLY USE JAPANESE COMMAS (、) to separate the phrases, not English commas (,) otherwise our system can break.

      <Output Format>
      ===FORM1-START===
      [3-4 phrases, each 2-4 words, comma-separated, in Japanese]
      ===FORM1-END===

      <Example>
      ===FORM1-START===
      ギターを弾く、サッカーをする、バンドで演奏。
      ===FORM1-END===

      <Rules>
      - Output **exactly** one line between ===FORM1-START=== and ===FORM1-END===.
      - The line contains 3-4 phrases, each 2-4 words, separated by commas, without the label "趣味: ".
      - Phrases must describe activities (e.g., "クリケットをする", not "クリケット").
      - Convert input data into professional, CV-appropriate Japanese; do not copy verbatim.
      - If the input is vague or lengthy, simplify to relevant phrases; exclude non-hobby text like URLs.
      - Do **not** include other markers, text, or blank lines.
      - **Strictly** follow the format; any deviation will break the system.
      - I would like all sentence endings to follow the “da/de aru” (plain) style.
      - Finish the sentence with a full stop (。) at the end of the line.
    `;
    return prompt;
  } 
  else if(whatFor === whatForTypes[10]){ //place conversion from english to katakana.
    const { place_of_belonging } = data;
    const prompt = `
      <System Instructions>
      Respond **only** with the exact format specified below, containing one Japanese line within ===FORM1-START=== and ===FORM1-END===. Do **not** include any other text, headers, blank lines, or markers. Use professional Japanese suitable for a CV.

      <Employee Information>
      Place of Belonging: ${place_of_belonging || 'なし'}

      <Prompt>
      Convert the place of belonging (${place_of_belonging}) into a single Japanese phrase for a CV's "出身地" section.
      - Assume the person is always from India.
      - If the input is empty or 'なし', output "インド".
      - If the input is a specific place (e.g., city or state), convert it to katakana and append the region (South India, North India, or North-East India) in katakana within parentheses.
      - Regions: 
        - South India (南インド): States like Tamil Nadu, Kerala, Karnataka, Andhra Pradesh, Telangana
        - North India (北インド): States like Delhi, Uttar Pradesh, Punjab, Rajasthan, Haryana
        - North-East India (北東インド): States like Assam, Meghalaya, Arunachal Pradesh
      - Use standard katakana for the place (e.g., "Delhi" → "デリー", "Tamil Nadu" → "タミルナードゥ").
      - Ensure the output is concise and professional, e.g., "デリー (北インド)".
      - If the place is not a recognizable Indian city/state, default to "インド".
      - Ignore any non-place text in the input.

      <Output Format>
      ===FORM1-START===
      [Single katakana phrase, optionally with region in full-width parentheses ]
      ===FORM1-END===

      <Examples>
      ===FORM1-START===
      デリー (北インド)
      ===FORM1-END===
      ===FORM1-START===
      チェンナイ (南インド)
      ===FORM1-END===
      ===FORM1-START===
      インド
      ===FORM1-END===

      <Rules>
      - Output **exactly** one line between ===FORM1-START=== and ===FORM1-END===.
      - The line must be in katakana, with region in parentheses if applicable.
      - Default to "インド" if input is empty, invalid, or not a recognizable Indian place.
      - Use professional tone suitable for a Japanese CV.
      - Do **not** include other markers, text, or blank lines.
      - **Strictly** follow the format; any deviation will break the system.
      - Suggested max_tokens: 50 for concise output.
      - I would like all sentence endings to follow the “da/de aru” (plain) style.
    `;
    return prompt;
  }
  else if(whatFor === whatForTypes[11]){ //For rethinking japanese companies.
    const{
      interest_in_japanese_companies,
      aspects_to_learn,
      previous_skills_to_acquire,
      previous_interest_in_japanese_companies,
      user_prompt,}=data;
    const prompt=
    `
    <System Instructions>
    Respond **only** with the exact format specified below, containing two Japanese phrases (Each one a concise sentence 2-3 lines.) within ===FORM2-START=== and ===FORM2-END===. Do **not** include any other text, headers, blank lines, or markers (e.g., FORM1, FORM3). Use professional Japanese suitable for a CV, reflecting Japanese corporate culture (e.g., teamwork, continuous improvement, technical innovation). For the sentences always follow the da/deru form only.

    <Employee Information>
        Interest in Japanese Companies: ${interest_in_japanese_companies || 'なし'}
        Aspects to Learn: ${aspects_to_learn || 'なし'}
    Previous Output from the employee Information:
      番興味がある点: ${previous_interest_in_japanese_companies || 'なし'}
      習得したいこと: ${previous_skills_to_acquire || 'なし'}

    <User Prompt>
        ${user_prompt}
    <Prompt>
    Generate these two items again tailoring to the user's need:
    - Most Interesting Aspect: Based on Interest in Japanese Companies (${interest_in_japanese_companies}), describe what excites the person about working at Japanese companies in a single phrase preferable have 2-3 lines. If a previous output exists modify it based on the user special prompt: "${user_prompt || 'なし'}".
    - Skills to Acquire: (${aspects_to_learn}) From this just remove the english names (after the '/') and just check the japanese names if there is any error then correct it and return it (Separated by commas). If a previous output exists, modify it based on the user special prompt: "${user_prompt || 'なし'}".

    <Output Format>
    ===FORM2-START===
    番興味がある点: [Japanese phrase for why the person is interested in Japanese companies in da/deru form only.]
    習得したいこと: [Japanese phrase for why the person wants to learn about Japanese companies in da/deru form only.]
    ===FORM2-END===

    <Rules>
    - Write as the person is writing the sentences himself.
    - Use the da/deru form for the Japanese sentences and end them with japanse FullStop always.
    - Output **exactly** two phrases between ===FORM2-START=== and ===FORM2-END===.
    - Each phrase starts with "番興味がある点: " or "習得したいこと: ", followed by 1 phrase (2-3 lines).
    - Do **not** include other markers, text, or blank lines.
    - **Strictly** follow the format; any deviation will break the system.
    return prompt;
}
  else if(whatFor === whatForTypes[12]){
    const {previous_work_value,work_value,user_prompt}=data;
    const prompt=
    `
      <System Instructions>
      Generate a concise, professional response for the "Career Development" section of a CV based on the provided work values. The output must strictly follow the specified format, containing only one line of Japanese text (Only in da/deru form) within the designated markers, without any additional explanations or text. Use natural, professional Japanese suitable for a CV.

      <Career Information>
      Work Values: ${work_value.join(', ') || 'none'}
      Previous Work Value: ${previous_work_value || 'none'}
      User Prompt: ${user_prompt || 'none'}

      <Prompt>
      Generate a single paragraph for the "3大優先要素" (Three Priority Elements) row, integrating the provided work values into a cohesive, professional statement, strictly following the user's instructions specified in the user prompt: "${user_prompt || 'none'}". If a previous output exists (${previous_work_value || 'none'}), modify it according to the user prompt while maintaining a polished, CV-appropriate expression. The paragraph should emphasize professionalism and enthusiasm, reflecting the candidate's priorities based on the work values.

      [Output Format]
      The output must strictly follow this format, containing a paragraph of Japanese text between ===FORM1-START=== and ===FORM1-END===, with no additional text or markers outside.

      ===FORM1-START===
      3大優先要素: [Concise paragraph according to the user's need specified in the userPrompt integrating work values in professional Japanese in "da, de aru" style only and always ending with japanese full-stop]
      ===FORM1-END===

      [Output Example]
      ===FORM1-START===
      3大優先要素: チームワークを大切にし、安定した環境の中で自らの技術力と人間的成長の両面を追求したいと思っている。多様な文化の中で学び続ける姿勢を持ち、周囲と協調しながら成長することを重視している。
      ===FORM1-END===

      [Construction Rules]
      - Avoid directly quoting the input; rephrase into a polished CV-appropriate expression.
      - The output should always be within ===FORM1-START=== and ===FORM1-END===, with no additional text outside it.
      - All sentence endings must follow the “da/de aru” (plain) style and should always end with japanese full stop.
      - Strictly follow the User Prompt strict requirement.
      - There's no strict limit on the size of the paragraph.
    `;
    return prompt;
  }
  else {
    throw new Error("Invalid prompt type used");
  }
}