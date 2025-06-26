export default function Education({ education, handleArrayInputChange, addEducation, removeEducation }) {
  return (
    <div className="mb-8">
      <h2 className="text-xl text-black font-semibold mb-3">学歴 / Education</h2>
      {education.map((edu, index) => (
        <div key={index} className="space-y-4 mb-4 border-b pb-4 relative">
          <div>
            <label className="block text-sm font-medium text-gray-700">年 / Year</label>
            <input
              type="text"
              value={edu.year}
              onChange={(e) => handleArrayInputChange(e, index, 'year', 'education')}
              className="mt-1 block text-black w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">機関 / Institution</label>
            <input
              type="text"
              value={edu.institution}
              onChange={(e) => handleArrayInputChange(e, index, 'institution', 'education')}
              className="mt-1 block text-black w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">学位 / Degree</label>
            <input
              type="text"
              value={edu.degree}
              onChange={(e) => handleArrayInputChange(e, index, 'degree', 'education')}
              className="mt-1 block text-black w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
          {education.length > 1 && (
            <button
              onClick={() => removeEducation(index)}
              className="absolute top-0 right-0 text-red-600 hover:text-red-800 p-1"
              title="Delete this education entry"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </button>
          )}
        </div>
      ))}
      <button
        onClick={addEducation}
        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
      >
        学歴を追加 / Add Education
      </button>
    </div>
  );
}