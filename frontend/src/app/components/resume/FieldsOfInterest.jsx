export default function FieldsOfInterest({ interestFields, interestDetails, handleInputChange, handleArrayInputChange }) {
  return (
    <div className="mb-8 whitespace-pre-line">
      <h2 className="text-xl text-black font-semibold mb-3">{"興味ある分野 \n Fields of Interest"}</h2>
      <div className="space-y-4">
        {interestFields.map((field, index) => (
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
        <div>
          <label className="block text-sm font-medium text-gray-700">詳細 / Additional Details</label>
          <textarea
            name="interestDetails"
            value={interestDetails}
            onChange={handleInputChange}
            className="mt-1 block text-black w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            rows="3"
          />
        </div>
      </div>
    </div>
  );
}