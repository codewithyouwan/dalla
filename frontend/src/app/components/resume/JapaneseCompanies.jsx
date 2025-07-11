
export default function JapaneseCompanies({ details, handleInputChange, fetchJapaneseCompanies, isLoading }) {
  return (
    <div className="mb-8 whitespace-pre-line">
      <h2 className="text-xl text-black font-semibold mb-3">{"日本企業について \n Japanese Companies"}</h2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">番興味がある点 / Most Interesting Aspect</label>
          <input
            type="text"
            name="japanCompanyInterest"
            value={details.japanCompanyInterest}
            onChange={handleInputChange}
            className="mt-1 block text-black w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">習得したいこと / Skills to Acquire</label>
          <input
            type="text"
            name="japanCompanySkills"
            value={details.japanCompanySkills}
            onChange={handleInputChange}
            className="mt-1 block text-black w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
        <div>
          <button
            onClick={fetchJapaneseCompanies}
            disabled={isLoading}
            className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isLoading ? '生成中... / Generating...' : '提案を生成 / Generate Suggestions'}
          </button>
        </div>
      </div>
    </div>
  );
}