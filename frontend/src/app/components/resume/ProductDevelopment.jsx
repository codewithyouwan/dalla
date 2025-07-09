export default function ProductDevelopment({ details, handleInputChange }) {
  return (
    <div className="mb-8 whitespace-pre-line">
      <h2 className="text-xl text-black font-semibold mb-3">{"製品開発について \n Product Development"}</h2>
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