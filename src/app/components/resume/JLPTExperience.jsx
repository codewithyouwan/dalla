import Split from '../../helper/split';

export default function JLPTExperience({ jlptScores, handleInputChange, isLoading, error, setSuggestions, setError, setIsLoading,details }) {
  const generateSuggestions = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/gpt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(jlptScores),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to generate suggestions');
      const content = data.suggestions;
      const forms = Split(content);
      const finalForms = forms.length > 0 ? forms.slice(0, 3) : [content];
      setSuggestions(finalForms.map((form) => form.trim()));
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mb-8">
      <h2 className="text-xl text-black font-semibold mb-3">JLPT経験 / JLPT Experience</h2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">日本語レベル / Japanese Level</label>
          <textarea
            name="japaneseLevel"
            value={details.japaneseLevel}
            onChange={handleInputChange}
            className="mt-1 block text-black w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            rows="3"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">総合スコア / Total Score (out of 180)</label>
          <input
            type="number"
            name="total"
            value={jlptScores.total}
            onChange={handleInputChange}
            className="mt-1 block text-black w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">語彙スコア / Vocabulary Score</label>
          <input
            type="number"
            name="vocabulary"
            value={jlptScores.vocabulary}
            onChange={handleInputChange}
            className="mt-1 block text-black w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">読解スコア / Reading Score</label>
          <input
            type="number"
            name="reading"
            value={jlptScores.reading}
            onChange={handleInputChange}
            className="mt-1 block text-black w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">聴解スコア / Listening Score</label>
          <input
            type="number"
            name="listening"
            value={jlptScores.listening}
            onChange={handleInputChange}
            className="mt-1 block text-black w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
        <div>
          <button
            onClick={generateSuggestions}
            disabled={isLoading}
            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {isLoading ? '生成中... / Generating...' : '提案を生成 / Generate Suggestions'}
          </button>
          {error && <p className="mt-2 text-red-600 text-sm">{error}</p>}
        </div>
      </div>
    </div>
  );
}