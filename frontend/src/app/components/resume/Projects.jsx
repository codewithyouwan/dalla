export default function Projects({ details, handleInputChange, fetchInternshipExperience, isLoading }) {
  return (
    <div className="mb-8">
      <div className="flex justify-between items-center">
        <h2 className="text-xl text-black font-semibold mb-3">プロジェクト / インターンシップ経験 /<br></br> Projects & Internship Experience</h2>
          <button
            onClick={fetchInternshipExperience}
            disabled={isLoading}
            className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 whitespace-pre-line ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isLoading ? '取得中... \n Fetching...' : 'インターンシップ情報を取得 \n Fetch Internship Data'}
          </button>
      </div>
      <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">担当した役割 / Role</label>
            <input
              type="text"
              name="projectRole"
              value={details.projectRole}
              onChange={handleInputChange}
              className="mt-1 block text-black w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">具体的な内容 / Description</label>
            <textarea
              name="projectDescription"
              value={details.projectDescription}
              onChange={handleInputChange}
              className="mt-1 block text-black w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              rows="5"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">直面した課題 / Challenges</label>
            <textarea
              name="projectChallenges"
              value={details.projectChallenges}
              onChange={handleInputChange}
              className="mt-1 block text-black w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              rows="3"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">リーダー経験 / Leadership Experience</label>
            <input
              type="text"
              name="leadership"
              value={details.leadership}
              onChange={handleInputChange}
              className="mt-1 block text-black w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
       </div>
    </div>
  );
}