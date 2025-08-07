export default function CareerAspirations({ details, handleInputChange, fetchCareerAspirations, isLoading }) {
  return (
    <div className="mb-8">
      <div className="flex justify-between items-center whitespace-pre-line">
        <h2 className="text-xl text-black font-semibold mb-3">{"志向 \n Career Aspirations"}</h2>
        <button
          onClick={fetchCareerAspirations}
          disabled={isLoading}
          className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 whitespace-pre-line ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isLoading ? '取得中... \n Fetching...' : '志向を取得 \n Generate'}
        </button>
      </div>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">希望業界 / Desired Industry</label>
          <input
            type="text"
            name="desiredIndustry"
            value={details.desiredIndustry}
            onChange={handleInputChange}
            className="mt-1 block text-black w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            placeholder="例: テクノロジー"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">希望職種 / Desired Job Type</label>
          <input
            type="text"
            name="desiredJobType"
            value={details.desiredJobType}
            onChange={handleInputChange}
            className="mt-1 block text-black w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            placeholder="例: エンジニア"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">目指す役割 / Target Role</label>
          <textarea
            rows={2}
            type="text"
            name="targetRole"
            value={details.targetRole}
            onChange={handleInputChange}
            className="mt-1 block text-black w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            placeholder="例: データサイエンス"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">ワークスタイル / Work Style</label>
          <textarea
            rows={2}
            type="text"
            name="workStyle"
            value={details.workStyle}
            onChange={handleInputChange}
            className="mt-1 block text-black w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            placeholder="例: スペシャリスト"
          />
        </div>
      </div>
    </div>
  );
}