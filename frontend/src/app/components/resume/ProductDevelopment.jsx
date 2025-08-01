export default function ProductDevelopment({ details, handleInputChange, fetchProductDevelopment, isLoading, error,}) {
  return (
    <div className="mb-8 whitespace-pre-line">
      <div className="flex items-center justify-between mb-4 whitespace-pre-line">
        <h2 className="text-xl text-black font-semibold mb-3">{"製品開発について \n Product Development"}</h2>
        <button
          onClick={fetchProductDevelopment}
          disabled={isLoading}
          className={`mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isLoading ? '生成中... \n Generating...' : '提案を生成 \n Generate Suggestions'}
        </button>
      </div>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">興味を持つ理由 / Reason for Interest</label>
          <textarea
            name="productDevReason"
            value={details.productDevReason}
            onChange={handleInputChange}
            className="mt-1 block text-black w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            rows="3"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">果たしたい役割 / Desired Role</label>
          <textarea
            name="productDevRole"
            value={details.productDevRole}
            onChange={handleInputChange}
            className="mt-1 block text-black w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            rows="3"
          />
        </div>
      </div>
    </div>
  );
}