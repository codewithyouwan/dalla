export default function CareerDevelopment({ careerPriorities, handleArrayInputChange, fetchCareerDevelopment, isLoading }) {
  return (
    <div className="mb-8 whitespace-pre-line">
      <div className="flex justify-between items-center">
        <h2 className="text-xl text-black font-semibold mb-3">キャリアアップについて<br />Career Development</h2>
        <button
          onClick={fetchCareerDevelopment}
          disabled={isLoading}
          className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 whitespace-pre-line ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isLoading ? '取得中...\nFetching...' : 'キャリア情報を取得\nFetch Career Data'}
        </button>
      </div>
      <div className="space-y-4">
        {careerPriorities.map((priority, index) => (
          <div key={index}>
            <label className="block text-sm font-medium text-gray-700">優先要素 {index + 1} / Priority {index + 1}</label>
            <input
              type="text"
              value={priority}
              onChange={(e) => handleArrayInputChange(e, index, 'value', 'careerPriorities')}
              className="mt-1 block text-black w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
        ))}
      </div>
    </div>
  );
}