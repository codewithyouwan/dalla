export default function LanguagesAndTools({ details, handleInputChange }) {
  return (
    <div className="mb-8">
      <h2 className="text-xl text-black font-semibold mb-3">言語/開発ツール / Languages & Tools</h2>
      <div className="space-y-4">
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