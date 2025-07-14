export default function FieldsOfInterest({ details, handleArrayInputChange, isLoading, error, fetchFieldsOfInterest }) {
  return (
    <div className="mb-8 whitespace-pre-line">
      <div className="flex items-center justify-between mb-4 whitespace-pre-line">
        <h2 className="text-xl text-black font-semibold mb-3">{"興味ある分野 \n Fields of Interest"}</h2>
        <button
          onClick={fetchFieldsOfInterest}
          disabled={isLoading}
          className={`mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isLoading ? '生成中... \n Generating...' : '提案を生成 \n Generate Suggestions'}
        </button>
        {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
      </div>
      <div className="space-y-4">
        {details.interestFields.map((field, index) => (
          <div key={index}>
            <label className="block text-sm font-medium text-gray-700">分野 {index + 1} / Field {index + 1}</label>
            <input
              type="text"
              value={field}
              onChange={(e) => handleArrayInputChange(e, index, 'value', 'interestFields')}
              className="mt-1 block text-black w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
        ))}
      </div>
    </div>
  );
}