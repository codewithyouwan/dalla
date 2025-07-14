/*
    This is a helper function for different types of prompts.
    In the whatFor array we have defined the types for which we have the prompts.
*/
const whatForTypes = ['cvFormatting', 'careerAspirations', 'languagesAndTools', 'internshipExperience', 'japaneseCompanies','careerDevelopment','fieldsOfInterest'];

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
  } else if (whatFor === whatForTypes[1]) {
    const { preferred_industry, job_role_priority_1, future_career_goals, work_style_preference } = data;
    // #region careerAspirations
    const prompt = `
        ＜従業員情報/Employee Information>
        希望業界/Preferred Industry: ${preferred_industry}
        優先職種/Job Role Priority: ${job_role_priority_1}
        将来のキャリア目標/Future Career Goals: ${future_career_goals}
        ワークスタイル/Work Style Preference: ${work_style_preference}

        <プロンプト/Prompt>
        この従業員情報を元に、キャリア志向 (希望業界、優先職種、将来のキャリア目標、ワークスタイル) について、CVに記載するための簡潔でビジネスに適した値を生成してください。
        企業が私のキャリア目標と専門性を適切に理解できるように、**1単語または短いフレーズ (最大5語) **で、4つの項目それぞれを記述してください。
        3パターンの値セットを作成し、各パターンは4つの値 (希望業界→優先職種→将来のキャリア目標→ワークスタイルの順) で構成してください。
        各値は改行で区切り、**日本語で簡潔かつ正確に**記載してください。

        出力は以下のフォーマットに**厳密に**従ってください。各パターンの出力は、それぞれ次のようにマーカーで囲ってください：

        - 長めのフレーズ (3-5語) には ===FORM1-START=== と ===FORM1-END=== を使用してください。  
        - 中くらいのフレーズ (2-3語) には ===FORM2-START=== と ===FORM2-END=== を使用してください。  
        - 最も簡潔な値 (1-2語) には ===FORM3-START=== と ===FORM3-END=== を使用してください。

        【各パターの構成ルール】

        - 4つの項目 (希望業界、優先職種、将来のキャリア目標、ワークスタイル) について、それぞれ1行ずつ、**日本語で簡潔に**記載してください。
        - 各パターンは4行で構成してください (希望業界→優先職種→将来のキャリア目標→ワークスタイルの順)。
        - 入力データ（${preferred_industry}、${job_role_priority_1}、${future_career_goals}、${work_style_preference}）をそのまま記載せず、適切に変換してください。
        - CVにふさわしいビジネス的な表現を使用し、専門性と意欲を強調してください。

        【出力形式の例】

        ===FORM1-START===
        テクノロジー業界
        ソフトウェアエンジニア
        データサイエンス
        リモートワーク
        ===FORM1-END===

        ===FORM2-START===
        IT業界
        エンジニア
        AI開発
        スペシャリスト
        ===FORM2-END===

        ===FORM3-START===
        技術
        開発者
        機械学習
        フレキシブル
        ===FORM3-END===
        `;
    // #endregion
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
    const { internship_1_title, internship_1_company, internship_1_period, internship_1_team_size, internship_1_technologies, internship_1_summary, internship_1_purpose, internship_1_role, internship_1_challenges, internship_1_outcome } = data;
    // #region internshipExperience
    const isInternship = internship_1_company !== ''; // Detect if it's an internship based on company field
    const experienceType = isInternship ? 'インターンシップ' : 'プロジェクト';
    const prompt = `
        ＜システム指示/System Instructions>
        以下の${experienceType}情報を元に、CVの「${experienceType}」セクションに記載するための簡潔でビジネスに適した値を生成してください。
        出力は指定されたフォーマットに**厳密に**従い、余計な説明や追加のテキストを含めず、指定されたマーカー内に4行の日本語テキストのみを提供してください。
        各項目は自然な日本語で、CVに適したプロフェッショナルな表現を使用してください。

        ＜${experienceType}情報/${isInternship ? 'Internship' : 'Project'} Information>
        タイトル/Title: ${internship_1_title || 'なし'}
        ${isInternship ? '会社/Company' : 'プロジェクト名/Project Name'}: ${internship_1_company || 'なし'}
        期間/Period: ${internship_1_period || 'なし'}
        チームサイズ/Team Size: ${internship_1_team_size || '不明'}
        使用技術/Technologies: ${internship_1_technologies || 'なし'}
        概要/Summary: ${internship_1_summary || 'なし'}
        目的/Purpose: ${internship_1_purpose || 'なし'}
        役割/Role: ${internship_1_role || 'なし'}
        課題/Challenges: ${internship_1_challenges || 'なし'}
        成果/Outcome: ${internship_1_outcome || 'なし'}

        <プロンプト/Prompt>
        以下の4つの項目について、適切な値を生成してください :
        - 担当した役割/Role: ${experienceType}での役割（${internship_1_role}）を簡潔に記述。
        - 具体的な内容/Description: ${experienceType}の概要（${internship_1_summary}）、目的（${internship_1_purpose}）、使用技術（${internship_1_technologies}）、チームサイズ（${internship_1_team_size}）を統合し、詳細な説明を生成。
        - 直面した課題/Challenges: 課題（${internship_1_challenges}）を簡潔かつ具体的に記述。
        - リーダー経験/Leadership Experience: 成果（${internship_1_outcome}）からリーダーシップに関連する内容を抽出し、簡潔に記述。リーダーシップが明示されていない場合は、チームでの貢献を強調。

        【出力フォーマット】
        出力は以下のフォーマットに**厳密に**従ってください。余計なテキストや説明を一切含めず、===FORM1-START=== と ===FORM1-END=== の間に4行のみを記載してください。各行は指定されたラベルで始まり、内容は日本語で簡潔かつプロフェッショナルに記述してください。

        【出力例】
        ===FORM1-START===
        担当した役割: チームリーダー
        具体的な内容: 3人チームで、Pythonを使用し、電気自動車の走行距離予測モデルを開発
        直面した課題: データクリーニングとPythonの初学者としての技術習得に苦労
        リーダー経験: チームを統括し、モデルの評価と改善を主導
        ===FORM1-END===

        【構成ルール】
        - 4つの項目をそれぞれ1行ずつ、**日本語で簡潔かつ正確に**記載。
        - 入力データをそのまま記載せず、適切に変換し、CVにふさわしいビジネス的な表現を使用。
        - 専門性と成果を強調し、自然な日本語で記述。
        - 出力は===FORM1-START=== と ===FORM1-END=== の間に4行のみを含め、他のテキストやマーカーは一切含めない。
      `;
    // #endregion
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
  }else if(whatFor === whatForTypes[5]){
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
  }else if (whatFor === whatForTypes[6]) {
    const { job_role_priority_1, job_role_priority_2, job_role_priority_3, jobs_to_try_in_japan } = data;
    // #region fieldsOfInterest
    return `
        Based on the following user data:
        - Job Role Priority 1: ${data.job_role_priority_1 || 'N/A'}
        - Job Role Priority 2: ${data.job_role_priority_2 || 'N/A'}
        - Job Role Priority 3: ${data.job_role_priority_3 || 'N/A'}
        - Jobs to Try in Japan: ${data.jobs_to_try_in_japan || 'N/A'}

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
        - Ensure the output is in japanese and suitable for a resume.
      `;
      // #endregion
  }
   else {
    throw new Error("Invalid prompt type used");
  }
}