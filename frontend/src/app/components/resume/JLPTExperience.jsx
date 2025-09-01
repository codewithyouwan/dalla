export default function JLPTExperience({ details, handleInputChange, setDetails, isLoading, fetchJLPTSuggestions }) {
  const isN5orN4 = details.japaneseLevel==='N5' || details.japaneseLevel==='N4';

  const handleSuggestionSelect = (suggestion, index) => {
    setDetails((prev) => ({
      ...prev,
      selectedSuggestion: suggestion,
      selectedIndex: index,
    }));
    console.log('Selected JLPT suggestion:', suggestion, 'Index:', index);
  };

  // marks: 
  // {
  //   total:'0',
  //   vocabulary:'0', 
  //   reading:'0',
  //   listening:'0',
  //   language_and_reading:'0'
  // },

  return (
    <div className="mb-8 whitespace-pre-line">
      <div className="flex items-center justify-between mb-4 whitespace-pre-line">
        <h2 className="text-xl text-black font-semibold mb-3">{"JLPT経験 \n JLPT Experience"}</h2>
        <button
          onClick={fetchJLPTSuggestions}
          disabled={isLoading || details.japaneseLevel === 'Not certified'}
          className={`mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${isLoading || details.japaneseLevel === 'Not certified' ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isLoading ? '生成中... \n Generating...' : '提案を生成 \n Generate Suggestions'}
        </button>
      </div>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">日本語レベル / Japanese Level</label>
          <select
            name="japaneseLevel"
            value={details.japaneseLevel || 'Not certified'}
            onChange={(e)=>{setDetails((prev)=>({...prev, japaneseLevel:e.target.value}));}}
            className="mt-1 block text-black w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="N1">N1</option>
            <option value="N2">N2</option>
            <option value="N3">N3</option>
            <option value="N4">N4</option>
            <option value="N5">N5</option>
            <option value="Not certified">Not certified</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">日本語レベル / Exam Month</label>
          <select
            name="examMonth"
            value={details.examMonth}
            onChange={(e)=>{setDetails((prev)=>({...prev, examMonth:e.target.value}));}}
            className="mt-1 block text-black w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="7月">7月</option>
            <option value="12月">12月</option>
            <option value="Not Selected">Other</option>
          </select>
        </div>
        {details.japaneseLevel !== 'Not certified' && (
          <>
            {isN5orN4 ? (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700">総合スコア / Total Score (180)</label>
                  <input
                    type="text"
                    name="total"
                    value={details.marks.total}
                    onChange={(e)=>{setDetails((prev)=>({...prev, marks:{...prev.marks,total:e.target.value}}));}}
                    className="mt-1 block text-black w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">言語知識（文字・語彙・文法）・読解スコア / Language Knowledge & Reading Score (120)</label>
                  <input
                    type="text"
                    name="vocabulary"
                    value={details.marks.language_and_reading}
                    onChange={(e)=>{setDetails((prev)=>({...prev, marks:{...prev.marks,language_and_reading:e.target.value}}));}}
                    className="mt-1 block text-black w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">聴解スコア / Listening Score (60)</label>
                  <input
                    type="text"
                    name="listening"
                    value={details.marks.listening}
                    onChange={(e)=>{setDetails((prev)=>({...prev, marks:{...prev.marks, listening:e.target.value}}));}}
                    className="mt-1 block text-black w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700">総合スコア / Total Score (180)</label>
                  <input
                    type="text"
                    name="total"
                    value={details.marks.total}
                    onChange={(e)=>{setDetails((prev)=>({...prev, marks:{...prev.marks,total:e.target.value}}));}}
                    className="mt-1 block text-black w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">語彙・文法スコア / Vocabulary&Grammar Score (60)</label>
                  <input
                    type="text"
                    name="vocabulary"
                    value={details.marks.vocabulary}
                    onChange={(e)=>{setDetails((prev)=>({...prev, marks:{...prev.marks,vocabulary:e.target.value}}));}}
                    className="mt-1 block text-black w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">読解スコア / Reading Score (60)</label>
                  <input
                    type="text"
                    name="reading"
                    value={details.marks.reading}
                    onChange={(e)=>{setDetails((prev)=>({...prev, marks:{...prev.marks,reading:e.target.value}}));}}
                    className="mt-1 block text-black w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">聴解スコア / Listening Score (60)</label>
                  <input
                    type="text"
                    name="listening"
                    value={details.marks.listening}
                    onChange={(e)=>{setDetails((prev)=>({...prev, marks:{...prev.marks, listening:e.target.value}}));}}
                    className="mt-1 block text-black w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
              </>
            )}
          </>
        )}
        {
          details.selectedSuggestion!==''&&(
            <div>
              <label className="block text-sm font-medium text-gray-700">選択された提案 / Selected Suggestion</label>
              <textarea
                value={details.selectedSuggestion}
                onChange={(e)=>{setDetails((prev)=>({...prev, selectedSuggestion: e.target.value}));}}
                className="mt-1 block text-black w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-gray-100"
                rows="4"
              />
            </div>
          )
        }
        {details.suggestions && details.suggestions.length > 0 && (
          <div className="mt-4">
            <h3 className="text-sm font-medium text-black">提案 / Suggestions</h3>
            <ul className="mt-2 space-y-2 text-black">
              {details.suggestions.map((suggestion, index) => (
                <li
                  key={index}
                  className={`p-2 cursor-pointer border rounded-lg ${details.selectedIndex === index ? 'bg-blue-100' : 'hover:bg-gray-100'}`}
                  onClick={() => handleSuggestionSelect(suggestion, index)}
                >
                  {suggestion}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}