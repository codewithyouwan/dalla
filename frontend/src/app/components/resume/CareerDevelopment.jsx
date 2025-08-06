export default function CareerDevelopment({ WorkValues, setDetails, fetchWorkValues, isLoading }) {
  return (
    <div className="mb-8 whitespace-pre-line">
      <div className="flex justify-between items-center">
        <h2 className="text-xl text-black font-semibold mb-3">キャリアアップについて<br />Career Development</h2>
        <button
          onClick={fetchWorkValues}
          disabled={isLoading}
          className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 whitespace-pre-line ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isLoading ? '取得中...\nFetching...' : 'キャリア情報を取得\nFetch Career Data'}
        </button>
      </div>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">働く上での価値観/ 3 WorkValues</label>
          <textarea
            value={WorkValues}
            onChange={(e)=>{setDetails((prev)=>({...prev, WorkValues: e.target.value}))}}
            className="mt-1 block text-black w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            rows="4"
          />
        </div>
      </div>
    </div>
  );
}