export default function CareerAspirations({ details, handleInputChange }) {
  return (
    <div className="mb-8">
      <h2 className="text-xl text-black font-semibold mb-3">志向 / Career Aspirations</h2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">開発分野 / Development Field</label>
          <input
            type="text"
            name="devField"
            value={details.devField}
            onChange={handleInputChange}
            className="mt-1 block text-black w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">職種 / Job Type</label>
          <input
            type="text"
            name="jobType"
            value={details.jobType}
            onChange={handleInputChange}
            className="mt-1 block text-black w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">領域 / Domain</label>
          <input
            type="text"
            name="domain"
            value={details.domain}
            onChange={handleInputChange}
            className="mt-1 block text-black w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">タイプ / Type</label>
          <input
            type="text"
            name="type"
            value={details.type}
            onChange={handleInputChange}
            className="mt-1 block text-black w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
      </div>
    </div>
  );
}