export default function Projects({
  internships,
  projects,
  handleArrayInputChange,
  addExperience,
  removeExperience,
  fetchInternshipExperience,
  isLoading,
}) {
  return (
    <div className="mb-8">
      <div className="flex justify-between items-center">
        <h2 className="text-xl text-black font-semibold mb-3 whitespace-pre-line">
          {'プロジェクト / インターンシップ経験 \n Projects & Internship Experience'}
        </h2>
        <button
          onClick={fetchInternshipExperience}
          disabled={isLoading}
          className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 whitespace-pre-line ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isLoading ? '取得中... \n Fetching...' : '経験情報を取得 \n Fetch Experience Data'}
        </button>
      </div>
      {/* Internships Section */}
      <div className="space-y-4 mb-4">
        <h3 className="text-lg font-bold text-gray-700">{`インターンシップ / Internships`}</h3>
        {internships.slice(0, 2).map((internship, index) => (
          <div key={`internship-${index}`} className="space-y-4 border-b pb-4 relative">
            <div>
              <span className="font-bold text-gray-700">インターンシップ {index + 1}</span>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">タイトル / Title</label>
              <textarea
                type="text"
                value={internship.title || ''}
                onChange={(e) => handleArrayInputChange(e, index, 'title', 'internships')}
                className="mt-1 block text-black w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">期間 / Period</label>
              <textarea
                type="text"
                value={internship.period || ''}
                onChange={(e) => handleArrayInputChange(e, index, 'period', 'internships')}
                className="mt-1 block text-black w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">企業 / Company</label>
              <textarea
                type="text"
                value={internship.company || ''}
                onChange={(e) => handleArrayInputChange(e, index, 'company', 'internships')}
                className="mt-1 block text-black w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">役割 / Role</label>
              <textarea
                type="text"
                value={internship.role || ''}
                onChange={(e) => handleArrayInputChange(e, index, 'role', 'internships')}
                className="mt-1 block text-black w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">具体的な内容 / Description</label>
              <textarea
                value={internship.description || ''}
                onChange={(e) => handleArrayInputChange(e, index, 'description', 'internships')}
                className="mt-1 block text-black w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                rows="5"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">直面した課題 / Challenges</label>
              <textarea
                value={internship.challenges || ''}
                onChange={(e) => handleArrayInputChange(e, index, 'challenges', 'internships')}
                className="mt-1 block text-black w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                rows="3"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">成果 / Outcome</label>
              <textarea
                type="text"
                value={internship.outcome || ''}
                onChange={(e) => handleArrayInputChange(e, index, 'outcome', 'internships')}
                className="mt-1 block text-black w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
            {internships.length > 0 && (
              <button
                onClick={() => removeExperience('internships', index)}
                className="absolute top-0 right-0 text-red-600 hover:text-red-800 p-1"
                title="Delete this internship entry"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            )}
          </div>
        ))}
        {internships.length < 2 && (
          <button
            onClick={() => addExperience('internships')}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            インターンシップを追加 / Add Internship
          </button>
        )}
      </div>
      {/* Projects Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-700">{`プロジェクト / Projects`}</h3>
        {projects.slice(0, 2).map((project, index) => (
          <div key={`project-${index}`} className="space-y-4 border-b pb-4 relative">
            <div>
              <span className="font-bold  text-gray-700">{`プロジェクト ${index + 1}`}</span>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">タイトル / Title</label>
              <textarea
                type="text"
                value={project.title || ''}
                onChange={(e) => handleArrayInputChange(e, index, 'title', 'projects')}
                className="mt-1 block text-black w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">期間 / Period</label>
              <textarea
                type="text"
                value={project.period || ''}
                onChange={(e) => handleArrayInputChange(e, index, 'period', 'projects')}
                className="mt-1 block text-black w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">役割 / Role</label>
              <textarea
                type="text"
                value={project.role || ''}
                onChange={(e) => handleArrayInputChange(e, index, 'role', 'projects')}
                className="mt-1 block text-black w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">具体的な内容 / Description</label>
              <textarea
                value={project.description || ''}
                onChange={(e) => handleArrayInputChange(e, index, 'description', 'projects')}
                className="mt-1 block text-black w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                rows="5"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">直面した課題 / Challenges</label>
              <textarea
                value={project.challenges || ''}
                onChange={(e) => handleArrayInputChange(e, index, 'challenges', 'projects')}
                className="mt-1 block text-black w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                rows="3"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">成果 / Outcome</label>
              <textarea
                rows={2}
                type="text"
                value={project.outcome || ''}
                onChange={(e) => handleArrayInputChange(e, index, 'outcome', 'projects')}
                className="mt-1 block text-black w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
            {projects.length > 0 && (
              <button
                onClick={() => removeExperience('projects', index)}
                className="absolute top-0 right-0 text-red-600 hover:text-red-800 p-1"
                title="Delete this project entry"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            )}
          </div>
        ))}
        {projects.length < 2 && (
          <button
            onClick={() => addExperience('projects')}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            プロジェクトを追加 / Add Project
          </button>
        )}
      </div>
    </div>
  );
}