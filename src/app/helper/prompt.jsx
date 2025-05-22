/*
    This is a helper function for different types of prompts.
    In the whatFor array we have defined the types for which we have the prompts.
*/
const whatForTypes = ['cvFormatting','others'];
//these are the options for the prompt.
export default function Prompt(data,whatFor){
    if(whatFor === whatForTypes[0] ){
        const {total,listening,vocabulary,reading } = data;
        // #region cvFormatting
        const prompt = 
        `
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
    }
    else{
        throw new Error("Invalid prompt type used");
    }
}