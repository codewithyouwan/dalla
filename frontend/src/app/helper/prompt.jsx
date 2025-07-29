/*
    This is a helper function for different types of prompts.
    In the whatFor array we have defined the types for which we have the prompts.
*/
const whatForTypes = ['cvFormatting', 'careerAspirations', 'languagesAndTools', 'internshipExperience', 'japaneseCompanies', 'careerDevelopment', 'fieldsOfInterest', 'productDevelopment', 'katakanaConversion'];

export default function Prompt(data, whatFor) {
  if (whatFor === whatForTypes[0]) {
    const { total, listening, vocabulary, reading, japaneseLevel } = data;
    const validatedJapaneseLevel = japaneseLevel || 'Not certified';
    // #region cvFormatting
    const prompt = `
        ＜参考情報/Reference Information>
        JLPTレベル/Japanese Level: ${validatedJapaneseLevel}
        総合スコア/Total Score: ${total || '未入力'}
        語彙スコア/Vocabulary Score: ${vocabulary || '未入力'}
        読解スコア/Reading Score: ${reading || '未入力'}
        聴解スコア/Listening Score: ${listening || '未入力'}

        <プロンプト/Prompt>
        この情報（JLPTレベルとスコア）を元に、語彙、読み、リスニングについて、日本語能力をCVに記載するための適切な内容を生成してください。
        企業が私の日本語レベルを正確に理解できるように、JLPTレベルを明示的に記載しつつ、3つの能力（読解、語彙[文法]、リスニング）を**一人称（「私は...」）**の自然な日本語で、1つの段落として簡潔に説明してください。
        3パターンを作成し、各パターンは1段落で構成してください。
        JLPTレベル（${validatedJapaneseLevel}）を段落の冒頭で言及し、能力の説明に反映してください。

        出力は以下のフォーマットに**厳密に**従ってください。各パターンの出力は、それぞれ次のようにマーカーで囲ってください：

        - 長めの段落パターンには ===FORM1-START=== と ===FORM1-END=== を使用してください。
        - 中くらいの長さの段落パターンには ===FORM2-START=== と ===FORM2-END=== を使用してください。
        - 最も簡潔な段落パターンには ===FORM3-START=== と ===FORM3-END=== を使用してください。

        【各パターンの構成ルール】

        - 各パターンは、最初に「私は${validatedJapaneseLevel}を取得済み。」と明記し、その後1段落内で読解、語彙、リスニングの能力を**「私は...」で始まる自然な日本語**で丁寧かつ簡潔に記述してください。
        - 段落内で3つの能力を自然につなげ、CVに適したビジネス的な表現を使用してください。
        - スコアや点数、試験名（JLPTを除く）は記載しないでください。
        - ${validatedJapaneseLevel}に基づく能力の強みを強調してください。
        - ${validatedJapaneseLevel}が「Not certified」の場合、代わりに「私は日本語能力試験を受験していないが、日常会話レベルを目標に学習中。」と記載し、能力を控えめに記述してください。

        【出力形式の例】

        ===FORM1-START===
        私はN3を取得済み。私は専門的な文書を正確に理解し、適切に対応できます。また、ビジネスシーンで使用される語彙や文法を幅広く活用でき、会議での発言や指示を聞き取り、適切に反応できます。
        ===FORM1-END===

        ===FORM2-START===
        私はN3を取得済み。私は専門文書をスムーズに読解し、ビジネス語彙を効果的に使用でき、会議内容を正確に理解できます。
        ===FORM2-END===

        ===FORM3-START===
        私はN3を取得済み。私は文書を読解し、ビジネス語彙を活用し、会議を理解できます。
        ===FORM3-END===

        【Not certifiedの例】

        ===FORM1-START===
        私は日本語能力試験を受験していないが、日常会話レベルを目標に学習中。私は簡単な文書を理解し、日常的な語彙を適切に使用し、基本的な会話内容を聞き取れます。
        ===FORM1-END===
        `;
    // #endregion
    return prompt;
  // In prompt.jsx, replace the careerAspirations section
} else if (whatFor === whatForTypes[1]) {
    const { preferred_industry, job_role_priority_1, future_career_goals, work_style_preference } = data;
    const prompt = `
      <System Instructions>
      Respond **only** with the exact format specified below, containing four Japanese lines within ===FORM2-START=== and ===FORM2-END===. Use professional Japanese suitable for a CV, with concise expressions (1-3 words per line).

      <Employee Information>
      Preferred Industry: ${preferred_industry?.length ? preferred_industry.join(', ') : 'なし'}
      Job Role Priority: ${job_role_priority_1 || 'なし'}
      Future Career Goals: ${future_career_goals?.length ? future_career_goals.join(', ') : 'なし'}
      Work Style Preference: ${work_style_preference?.length ? work_style_preference.join(', ') : 'なし'}

      <Prompt>
      Generate four items for the CV's "志向" section:
      - 希望業界: Based on Preferred Industry (${preferred_industry?.length ? preferred_industry.join(', ') : 'なし'}), describe the desired industry in 1-3 words.
      - 希望職種: Based on Job Role Priority (${job_role_priority_1 || 'なし'}), describe the desired job type in 1-3 words.
      - 目指す役割: Based on Future Career Goals (${future_career_goals?.length ? future_career_goals.join(', ') : 'なし'}), describe the target role in 1-3 words.
      - ワークスタイル: Based on Work Style Preference (${work_style_preference?.length ? work_style_preference.join(', ') : 'なし'}), describe the work style in 1-3 words.

      <Output Format>
      ===FORM2-START===
      希望業界: [1-3 words]
      希望職種: [1-3 words]
      目指す役割: [1-3 words]
      ワークスタイル: [1-3 words]
      ===FORM2-END===

      <Example>
      ===FORM2-START===
      希望業界: テクノロジー
      希望職種: 開発エンジニア
      目指す役割: ソフトウェア開発
      ワークスタイル: スペシャリスト
      ===FORM2-END===

      <Rules>
      - Output **exactly** four lines between ===FORM2-START=== and ===FORM2-END===.
      - Each line starts with the specified label (希望業界: , 希望職種: , 目指す役割: , ワークスタイル: ) followed by 1-3 words.
      - Convert input data into professional, CV-appropriate Japanese; do not copy verbatim.
      - If input is 'なし' or empty, use generic but relevant terms (e.g., 技術, エンジニア, データ分析, スペシャリスト).
      - Do **not** include other markers (e.g., FORM1, FORM3), text, or blank lines.
      - Suggested max_tokens: 100 for concise output.
    `;
    return prompt;
  } else if (whatFor === whatForTypes[2]) {
    const { programming_languages, databases_querying, version_control, code_editors_ides, ml_frameworks } = data;
    // #region languagesAndTools
    const prompt = `
        ＜従業員情報/Employee Information>
        プログラミング言語/Programming Languages: ${programming_languages || 'なし'}
        データベースクエリ/Databases Querying: ${databases_querying || 'なし'}
        バージョン管理/Version Control: ${version_control || 'なし'}
        コードエディタ・IDE/Code Editors & IDEs: ${code_editors_ides || 'なし'}
        機械学習フレームワーク/ML Frameworks: ${ml_frameworks || 'なし'}

        <プロンプト/Prompt>
        この従業員情報を元に、CVの「言語/開発ツール」セクションに記載するための簡潔でビジネスに適した値を生成してください。
        以下の2つの項目について、適切な値を生成してください :
        - プログラミング言語/Languages: プログラミング言語（${programming_languages}）をカンマ区切りで簡潔に記述。
        - 開発ツール/Development Tools: データベースクエリ（${databases_querying}）、バージョン管理（${version_control})、コードエディタ・IDE（${code_editors_ides}）、機械学習フレームワーク（${ml_frameworks}）を統合し、適切な開発ツールをカンマ区切りで簡潔に記述。
        企業が私の技術的スキルを適切に理解できるように、**簡潔かつ正確に**記載してください。
        2パターンの値セットを作成し、各パターンは2つの値 (プログラミング言語→開発ツールの順) で構成してください。
        各値は改行で区切り、**日本語で簡潔かつ正確に**記載してください。
        各行の先頭に「プログラミング言語: 」および「開発ツール: 」のラベルを付けてください。

        出力は以下のフォーマットに**厳密に**従ってください。各パターンの出力は、それぞれ次のようにマーカーで囲ってください：

        - 詳細な記述 (複数のスキル/ツールを詳細に) には ===FORM1-START=== と ===FORM1-END=== を使用してください。
        - 中程度の記述 (主要なスキル/ツールに絞る) には ===FORM2-START=== と ===FORM2-END=== を使用してください。

        【各パターの構成ルール】

        - 2つの項目 (プログラミング言語、開発ツール) について、それぞれ1行ずつ、**日本語で簡潔に**記載してください。
        - 各パターンは2行で構成してください (プログラミング言語→開発ツールの順)。
        - 入力データをそのまま記載せず、適切に変換してください。開発ツールは、データベースクエリ、バージョン管理、コードエディタ・IDE、機械学習フレームワークから適切に選択・統合してください。
        - CVにふさわしいビジネス的な表現を使用し、専門性を強調してください。

        【出力形式の例】

        ===FORM1-START===
        プログラミング言語: Python, JavaScript, Java, SQL
        開発ツール: Git, VS Code, Docker, TensorFlow
        ===FORM1-END===

        ===FORM2-START===
        プログラミング言語: Python, JavaScript
        開発ツール: Git, VS Code
        ===FORM2-END===
        `;
    // #endregion
    return prompt;
  } else if (whatFor === whatForTypes[3]) {
    const { title, company, period, team_size, technologies, summary, purpose, role, challenges, outcome, isInternship } = data;
    const experienceType = isInternship ? 'インターンシップ' : 'プロジェクト';
    const prompt = `
      ＜システム指示/System Instructions>
      以下の${experienceType}情報を元に、CVの「${experienceType}」セクションに記載するための簡潔でビジネスに適した値を生成してください。
      出力は指定されたフォーマットに**厳密に**従い、余計な説明や追加のテキストを含めず、指定されたマーカー内に7行の日本語テキストのみを提供してください。
      各項目は自然な日本語で、CVに適したプロフェッショナルな表現を使用してください。
      タイトル、期間、${isInternship ? '会社' : 'プロジェクト名'}は必ず日本語で記述し、期間は「YYYY年MM月 – YYYY年MM月」の形式で統一してください。

      ＜${experienceType}情報/${isInternship ? 'Internship' : 'Project'} Information>
      タイトル/Title: ${title || 'なし'}
      ${isInternship ? '会社/Company' : 'プロジェクト名/Project Name'}: ${company || 'なし'}
      期間/Period: ${period || 'なし'}
      チームサイズ/Team Size: ${team_size || '不明'}
      使用技術/Technologies: ${technologies || 'なし'}
      概要/Summary: ${summary || 'なし'}
      目的/Purpose: ${purpose || 'なし'}
      役割/Role: ${role || 'なし'}
      課題/Challenges: ${challenges || 'なし'}
      成果/Outcome: ${outcome || 'なし'}

      <プロンプト/Prompt>
      以下の7つの項目について、適切な値を生成してください :
      - タイトル/Title: ${experienceType}のタイトル（${title}）を日本語で簡潔に記述。
      - ${isInternship ? '会社/Company' : 'プロジェクト名/Project Name'}: ${isInternship ? '会社名（${company}）' : 'プロジェクト名（${title}）'}を日本語で記述。
      - 期間/Period: 期間（${period}）を「YYYY年MM月 – YYYY年MM月」の形式で日本語で記述。
      - 担当した役割/Role: ${experienceType}での役割（${role}）を簡潔に記述。
      - 具体的な内容/Description: ${experienceType}の概要（${summary}）、目的（${purpose}）、使用技術（${technologies}）、チームサイズ（${team_size}）を統合し、詳細な説明を生成。
      - 直面した課題/Challenges: 課題（${challenges}）を簡潔かつ具体的に記述。
      - 成果/Outcome: 成果（${outcome}）を簡潔に記述し、チームまたは個人の貢献を強調。

      【出力フォーマット】
      出力は以下のフォーマットに**厳密に**従ってください。余計なテキストや説明を一切含めず、===FORM1-START=== と ===FORM1-END=== の間に7行のみを記載してください。各行は指定されたラベルで始まり、内容は日本語で簡潔かつプロフェッショナルに記述してください。

      【出力例】
      ===FORM1-START===
      タイトル: 機械学習インターンシップ
      会社: テック株式会社
      期間: 2023年06月 – 2023年08月
      担当した役割: データサイエンティスト
      具体的な内容: 3人チームでPythonを使用し、機械学習モデルを開発
      直面した課題: データクリーニングの複雑さ
      成果: モデル精度を20%向上
      ===FORM1-END===

      【構成ルール】
      - 7つの項目をそれぞれ1行ずつ、**日本語で簡潔かつ正確に**記載。
      - タイトル、${isInternship ? '会社' : 'プロジェクト名'}、期間は入力データをそのまま反映し、日本語で記述。期間は「YYYY年MM月 – YYYY年MM月」の形式で統一。
      - 入力データを適切に変換し、CVにふさわしいビジネス的な表現を使用。
      - 専門性と成果を強調し、自然な日本語で記述。
      - 出力は===FORM1-START=== と ===FORM1-END=== の間に7行のみを含め、他のテキストやマーカーは一切含めない。
    `;
    return prompt;
  } else if (whatFor === whatForTypes[4]) {
    const {interest_in_japanese_companies, aspects_to_learn, future_career_goals} = data;
    // #region japaneseCompanies
    const prompt = `
        <System Instructions>
        Respond **only** with the exact format specified below, containing two Japanese lines within ===FORM2-START=== and ===FORM2-END===. Do **not** include any other text, headers, blank lines, or markers (e.g., FORM1, FORM3). Use professional Japanese suitable for a CV, reflecting Japanese corporate culture (e.g., teamwork, continuous improvement, technical innovation). Limit each line to one sentence, maximum 15 words.

        <Employee Information>
        Interest in Japanese Companies: ${interest_in_japanese_companies || 'なし'}
        Aspects to Learn: ${aspects_to_learn || 'なし'}
        Future Career Goals: ${future_career_goals?.join(', ') || 'なし'}

        <Prompt>
        Generate two items for the CV's "日本企業について" section:
        - Most Interesting Aspect: Based on Interest in Japanese Companies (${interest_in_japanese_companies}), describe what excites you about working at Japanese companies in 1 sentence (max 15 words).
        - Skills to Acquire: Combine Aspects to Learn (${aspects_to_learn}) and Future Career Goals (${future_career_goals}), describe skills to acquire in 1 sentence (max 15 words).

        <Output Format>
        ===FORM2-START===
        番興味がある点: [1 sentence, max 15 words, reflecting Japanese corporate culture]
        習得したいこと: [1 sentence, max 15 words, reflecting Japanese corporate culture]
        ===FORM2-END===

        <Example>
        ===FORM2-START===
        番興味がある点: 生産技術を通じてものづくりの革新を推進すること
        習得したいこと: ものづくり現場の課題を発見し改善する提案力と技術力
        ===FORM2-END===

        <Rules>
        - Output **exactly** two lines between ===FORM2-START=== and ===FORM2-END===.
        - Each line starts with "番興味がある点: " or "習得したいこと: ", followed by 1 sentence (max 15 words).
        - Convert input data into professional, CV-appropriate Japanese; do not copy verbatim.
        - Reflect Japanese corporate culture (e.g., teamwork, continuous improvement).
        - Do **not** include other markers, text, or blank lines.
        - **Strictly** follow the format; any deviation will break the system.
        - Suggested max_tokens: 100 to ensure concise output.
      `;
    // #endregion
    return prompt;
  } else if (whatFor === whatForTypes[5]) {
    const { job_role_priority_1, job_role_priority_2, job_role_priority_3, future_career_goals, work_values, jobs_to_try_in_japan } = data;
    // #region careerDevelopment
    const prompt = `
        ＜システム指示/System Instructions>
        以下のキャリア情報を元に、CVの「キャリアアップについて」セクションに記載するための簡潔でビジネスに適した値を生成してください。
        出力は指定されたフォーマットに**厳密に**従い、余計な説明や追加のテキストを含めず、指定されたマーカー内に4行の日本語テキストのみを提供してください。
        各項目は自然な日本語で、CVに適したプロフェッショナルな表現を使用してください。

        ＜キャリア情報/Career Information>
        優先職種1/Job Role Priority 1: ${job_role_priority_1 || 'なし'}
        優先職種2/Job Role Priority 2: ${job_role_priority_2 || 'なし'}
        優先職種3/Job Role Priority 3: ${job_role_priority_3 || 'なし'}
        将来のキャリア目標/Future Career Goals: ${future_career_goals.join(', ') || 'なし'}
        ワークバリュー/Work Values: ${work_values.join(', ') || 'なし'}
        日本で試したい職種/Jobs to Try in Japan: ${jobs_to_try_in_japan || 'なし'}

        <プロンプト/Prompt>
        以下の4つの項目について、適切な値を生成してください :
        - 優先要素1/Priority 1: 優先職種（${job_role_priority_1}）と将来のキャリア目標（${future_career_goals}）、ワークバリュー（${work_values}）を統合し、簡潔な文として記述。
        - 優先要素2/Priority 2: 優先職種（${job_role_priority_2}）と将来のキャリア目標、ワークバリューを統合し、簡潔な文として記述。
        - 優先要素3/Priority 3: 優先職種（${job_role_priority_3}）と将来のキャリア目標、ワークバリューを統合し、簡潔な文として記述。
        - 興味ある役割/Desired Roles: 日本で試したい職種（${jobs_to_try_in_japan}）を元に、1単語または短いフレーズ（最大3語）で記述。

        【出力フォーマット】
        出力は以下のフォーマットに**厳密に**従ってください。余計なテキストや説明を一切含めず、===FORM1-START=== と ===FORM1-END=== の間に4行のみを記載してください。各行は指定されたラベルで始まり、内容は日本語で簡潔かつプロフェッショナルに記述してください。

        ===FORM1-START===
        優先要素1: [優先職種1とキャリア目標・ワークバリューを統合した文]
        優先要素2: [優先職種2とキャリア目標・ワークバリューを統合した文]
        優先要素3: [優先職種3とキャリア目標・ワークバリューを統合した文]
        興味ある役割: [日本で試したい職種を元にした1単語または短いフレーズ]
        ===FORM1-END===

        【出力例】
        ===FORM1-START===
        優先要素1: 技術革新を通じて社会に貢献
        優先要素2: チームをリードして成果を達成
        優先要素3: ワークライフバランスを重視
        興味ある役割: プロジェクトマネージャー
        ===FORM1-END===

        【構成ルール】
        - 4つの項目をそれぞれ1行ずつ、**日本語で簡潔かつ正確に**記載。
        - 優先要素1-3は簡潔な文（10-15語程度）で、職種、キャリア目標、ワークバリューを自然に統合。
        - 興味ある役割は1単語または短いフレーズ（最大3語）で記述。
        - 入力データをそのまま記載せず、適切に変換し、CVにふさわしいビジネス的な表現を使用。
        - 専門性と意欲を強調し、自然な日本語で記述。
        - 出力は===FORM1-START=== と ===FORM1-END=== の間に4行のみを含め、他のテキストやマーカーは一切含めない。
      `;
    // #endregion
    return prompt;
  } else if (whatFor === whatForTypes[6]) {
    const { job_role_priority_1, job_role_priority_2, job_role_priority_3, jobs_to_try_in_japan } = data;
    // #region fieldsOfInterest
    return `
        Based on the following user data:
        - Job Role Priority 1: ${job_role_priority_1 || 'N/A'}
        - Job Role Priority 2: ${job_role_priority_2 || 'N/A'}
        - Job Role Priority 3: ${job_role_priority_3 || 'N/A'}
        - Jobs to Try in Japan: ${jobs_to_try_in_japan || 'N/A'}

        Generate three distinct fields of interest relevant to the user's career goals and job preferences in Japan. Each field should be a concise phrase (e.g., "データサイエンス", "ソフトウェア開発", "プロジェクト管理") suitable for a resume. The output must be formatted as follows, with exactly three fields, each on a new line within its own FORM section:

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
        - If data is missing or vague, use generic but relevant fields (e.g., "データサイエンス", "ソフトウェア開発", "プロジェクト管理").
        - Ensure each field is concise (2-5 words) and professional.
        - Ensure the output is in Japanese and suitable for a resume.
      `;
    // #endregion
  } else if (whatFor === whatForTypes[7]) {
    const { job_role_priority_1, job_role_priority_2, job_role_priority_3, jobs_to_try_in_japan } = data;
    // #region productDevelopment
    return `
        <System Instructions>
        Respond **only** with the exact format specified below, containing two Japanese lines within ===FORM1-START=== and ===FORM1-END===. Do **not** include any other text, headers, blank lines, or markers (e.g., FORM2, FORM3). Use professional Japanese suitable for a CV, reflecting Japanese corporate culture (e.g., teamwork, continuous improvement, technical innovation). Limit each line to one sentence, maximum 15 words. Do **not** include the labels "興味を持つ理由: " or "果たしたい役割: " in the output lines; only provide the content after these labels.

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
      `;
    // #endregion
  } else if (whatFor === whatForTypes[8]) {
    const { institution_name , date_string , major} = data;
    // #region katakanaConversion
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
    2014年4月 – 2016年3月
    ===FORM1-END===

    Input: Institution Name: "B.S.S Pranavananda Academy Raipur Science Higher Secondary", Date String: "Aug 2016 – Oct 2017", Major: "なし"
    ===FORM1-START===
    ビーエスエス プラナヴァナンダ アカデミー
    2016年8月 – 2017年10月
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
    - Ensure phonetic accuracy for institution names and majors, and correct date range conversion.
    - Use Japanese month names (e.g., "January" → "1月", "October" → "10月").
    - Do **not** include any labels, additional text, or blank lines.
    - **Strictly** follow the format; any deviation will break the system.
    - Suggested max_tokens: 60 for concise output.
`;
// #endregion
    return prompt;
  } else {
    throw new Error("Invalid prompt type used");
  }
}