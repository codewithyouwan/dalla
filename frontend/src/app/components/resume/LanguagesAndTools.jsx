export default function LanguagesAndTools({ details, handleInputChange, isLoading, fetchWithToast }) {
    const fetchLanguagesAndTools = async () => {
    return fetchWithToast('Languages and Tools', async () => {
      const res = await fetch('/api/languagesAndTools', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_number: details.id_number }),
      });
      if (!res.ok) throw new Error(`Languages and tools API error: ${res.statusText}`);
      const gptData = await res.json();
      if (gptData.suggestions) {
        const formMatch = gptData.suggestions.match(/===FORM-START===[\s\S]*?\n([\s\S]*?)\n===FORM-END===/);
        if (formMatch) {
          const lines = formMatch[1].trim().split('\n').map(line => line.trim());
          if (lines.length >= 2) {
            setDetails((prev) => ({
              ...prev,
              languages: lines[0].replace('プログラミング言語: ', '') || '',
              devTools: lines[1].replace('開発ツール: ', '') || '',
            }));
          } else {
            setError('Invalid languages and tools response format');
          }
        } else {
          setError('Failed to parse languages and tools response');
        }
      } else {
        setError('No languages and tools suggestions');
      }
    });
  };
  return (
    <div className="mb-8">
      <div className="flex justify-between items-center whitespace-pre-line">
        <h2 className="text-xl text-black font-semibold mb-3">{"言語/開発ツール \n Languages & Tools"}</h2>
        <button
          onClick={fetchLanguagesAndTools}
          disabled={isLoading}
          className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 whitespace-pre-line ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isLoading ? '取得中... \n/ Fetching...' : 'スキルを取得 \n Fetch Skills'}
        </button>
      </div>
      <div className="block border rounded-lg border-black p-2 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">言語 / Languages</label>
          <input
            type="text"
            name="languages"
            value={details.languages}
            onChange={handleInputChange}
            className="mt-1 block text-black w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">開発ツール / Development Tools</label>
          <textarea
            name="devTools"
            value={details.devTools}
            onChange={handleInputChange}
            className="mt-1 block text-black w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            rows="3"
          />
        </div>
      </div>
    </div>
  );
}