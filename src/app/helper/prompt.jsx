/*
    This is a helper function for different types of prompts.
    In the whatFor array we have defined the types for which we have the prompts.
*/
const whatForTypes = ['cvFormatting', 'careerAspirations', 'others'];

export default function Prompt(data, whatFor) {
  if (whatFor === whatForTypes[0]) {
    const { total, listening, vocabulary, reading } = data;
    // #region cvFormatting
    const prompt = `
        ＜参考スコア/Reference Scores>
        Total : ${total}
        Vocabulary : ${vocabulary}
        Reading : ${reading}
        Listening : ${listening}

        <プロンプト/Prompt>
        このスコアを元に、語彙、読み、リスニングについて、日本語がどの程度出来るかをCVに記載したい。  
        企業がこの人材の日本語について、どういうレベルかを適切に知らせるための内容の説明を簡潔に書いてみて。3パターン作って。

        出力は以下のフォーマットに**厳密に**従ってください。各パターンの出力は、それぞれ次のようにマーカーで囲ってください：

        - 長めの文章パターンには ===FORM1-START=== と ===FORM1-END=== を使用してください。  
        - 中くらいの長さの文章パターンには ===FORM2-START=== と ===FORM2-END=== を使用してください。  
        - 最も簡潔な文章パターンには ===FORM3-START=== と ===FORM3-END=== を使用してください。

        【各パターンの構成ルール】

        - 3つの能力(読解、語彙[文法]、リスニング)について、それぞれ1文ずつ、**自然な日本語で丁寧かつ簡潔に**記載してください。
        - 各パターンは3文で構成してください(読解→語彙→リスニングの順）。
        - JLPTのスコアや点数、試験名や級などの**数値情報は一切記載しないでください**。
        - 自然な連続性を意識しつつ、CVにふさわしいビジネス的な表現でお願いします。

        【出力形式の例】

        ===FORM1-START===
        (3文の自然で丁寧な自己評価。最も長く、滑らかで丁寧な表現)
        ===FORM1-END===

        ===FORM2-START===
        （中程度の長さの評価文。やや簡潔だが丁寧でわかりやすい表現）
        ===FORM2-END===

        ===FORM3-START===
        (非常に簡潔で、CVで要点のみを伝える短文3つ)
        ===FORM3-END===
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
        企業がこの人材のキャリア目標と専門性を適切に理解できるように、**1単語または短いフレーズ (最大5語) **で、4つの項目それぞれを記述してください。
        3パターンの値セットを作成し、各パターンは4つの値 (希望業界→優先職種→将来のキャリア目標→ワークスタイルの順) で構成してください。
        各値は改行で区切り、**日本語で簡潔かつ正確に**記載してください。

        出力は以下のフォーマットに**厳密に**従ってください。各パターンの出力は、それぞれ次のようにマーカーで囲ってください：

        - 長めのフレーズ (3-5語) には ===FORM1-START=== と ===FORM1-END=== を使用してください。  
        - 中くらいのフレーズ (2-3語) には ===FORM2-START=== と ===FORM2-END=== を使用してください。  
        - 最も簡潔な値 (1-2語) には ===FORM3-START=== と ===FORM3-END=== を使用してください。

        【各パターンの構成ルール】

        - 4つの項目 (希望業界、優先職種、将来のキャリア目標、ワークスタイル) について、それぞれ1行ずつ、**日本語で簡潔に**記載してください。
        - 各パターンは4行で構成してください (希望業界→優先職種→将来のキャリア目標→ワークスタイルの順）。
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
  } else {
    throw new Error("Invalid prompt type used");
  }
}