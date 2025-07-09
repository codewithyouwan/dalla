export default function CareerDevelopment({ careerPriorities, details, handleInputChange, handleArrayInputChange }) {
  return (
    <div className="mb-8">
      <h2 className="text-xl text-black font-semibold mb-3">キャリアアップについて / Career Development</h2>
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
        <div>
          <label className="block text-sm font-medium text-gray-700">興味ある役割 / Desired Roles</label>
          <input
            type="text"
            name="careerRoles"
            value={details.careerRoles}
            onChange={handleInputChange}
            className="mt-1 block text-black w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
      </div>
    </div>
  );
}