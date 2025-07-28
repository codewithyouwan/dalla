export default function Education({ education, handleArrayInputChange, addEducation, removeEducation, fetchEducation, isLoading }) {
  // Sort education by year (latest first)
  const sortedEducation = [...education].sort((a, b) => {
    const endYearA = parseInt(a.year.match(/– (\d{4})年/)?.[1] || a.year.replace(/年.*$/, '')) || 0;
    const endYearB = parseInt(b.year.match(/– (\d{4})年/)?.[1] || b.year.replace(/年.*$/, '')) || 0;
    return endYearB - endYearA;
  });

  const displayInstitution = (institution) => {
    const match = institution.match(/^(.*)\s*\*\*\[(.*?)\]\*\*$/);
    if (match) {
      const name = match[1].trim();
      const major = match[2].trim();
      return `${name} (<strong>${major}</strong>)`;
    }
    return institution;
  };

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between whitespace-pre-line">
        <h2 className="text-xl text-black font-semibold mb-3">{"学歴 \n Education"}</h2>
        <button
          onClick={fetchEducation}
          disabled={isLoading}
          className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 whitespace-pre-line ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isLoading ? '取得中... \n Fetching...' : '学歴を取得 \n Fetch Education'}
        </button>
      </div>
      {sortedEducation.map((edu, index) => (
        <div key={index} className="space-y-4 mb-4 border-b pb-4 relative">
          <div>
            <label className="block text-sm font-medium text-gray-700">年 / Year</label>
            <input
              type="text"
              value={edu.year ? `${edu.year}` : ''}
              onChange={(e) => handleArrayInputChange({ target: { value: e.target.value.replace('年', '') } }, index, 'year', 'education')}
              className="mt-1 block text-black w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              placeholder="例: 2016年8月 – 2017年10月"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">機関 / Institution and Major</label>
            <div
              className="mt-1 block text-black w-full rounded-md border-gray-300 shadow-sm p-2"
              dangerouslySetInnerHTML={{ __html: displayInstitution(edu.institution) }}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">学位 / Degree</label>
            <select
              value={edu.degree}
              onChange={(e) => handleArrayInputChange(e, index, 'degree', 'education')}
              className="mt-1 block text-black w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="高校">高校</option>
              <option value="学士">学士</option>
              <option value="修士">修士</option>
              <option value="博士">博士</option>
            </select>
          </div>
          {sortedEducation.length > 1 && (
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
      <div className="flex space-x-4">
        <button
          onClick={addEducation}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 whitespace-pre-line"
        >
          {'学歴を追加 \n Add Education'}
        </button>
      </div>
    </div>
  );
}