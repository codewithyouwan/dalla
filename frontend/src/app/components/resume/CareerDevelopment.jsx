export default function CareerDevelopment({ 
  details, setDetails,newDetails,setNewDetails,userPrompt,setUserPrompt,fetchWorkValues, isLoading, setIsLoading, setError
}) {
  const fetchRethinkWorkValues = async () => {
  setIsLoading(true);
  setError(null);
  console.log(userPrompt.CareerDevelopment);
  try {
    const response = await fetch('/api/rethink/rethinkWorkValues', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id_number: details.id_number || sessionId,
        previous_work_value: details.WorkValues,
        user_prompt:userPrompt.workValues || '',
      }),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`HTTP ${response.status}: ${errorData.error || 'Unknown error'}`);
    }
    const data = await response.json();
    setNewDetails((prev) => ({
      ...prev,
      WorkValues: data.suggestions.careerPriorities,
    }));
    // toast.success('仕事の価値観が更新されました / Work values updated', { id: 'rethinkWorkValues-success' });
  } catch (err) {
    setError(`Failed to fetch work values: ${err.message}`);
    // toast.error(`エラー: ${err.message} / Failed to fetch work values: ${err.message}`, { id: 'rethinkWorkValues-error' });
  } finally {
    setIsLoading(false);
  }
};
  return (
    <div className="mb-8 whitespace-pre-line">
      <div className="flex justify-between items-center">
        <h2 className="text-xl text-black font-semibold mb-3">キャリアアップについて<br />Career Development</h2>
        <button
          onClick={fetchWorkValues}
          disabled={isLoading}
          className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 whitespace-pre-line ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isLoading ? '取得中...\nFetching...' : 'キャリア情報を取得\nFetch Career Data'}
        </button>
      </div>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">働く上での価値観/ 3 WorkValues</label>
          <textarea
            value={details.WorkValues}
            onChange={(e)=>{setDetails((prev)=>({...prev, WorkValues: e.target.value}))}}
            className="mt-1 block text-black w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            rows="4"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">User Prompt</label>
          <textarea
            value={userPrompt.CareerDevelopment}
            onChange={(e)=>{setUserPrompt((prev)=>({...prev, CareerDevelopment: e.target.value}))}}
            className="mt-1 block text-black w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            rows="2"
          />
        </div>
         <button
          onClick={fetchRethinkWorkValues}
          disabled={isLoading || userPrompt.CareerDevelopment.trim()===''}
          className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 whitespace-pre-line ${isLoading||userPrompt.CareerDevelopment==='' ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isLoading ? 'Thinking...' : 'Rethink'}
        </button>
        {newDetails.WorkValues!==''&&
          <div className="mt-4 border rounded-lg p-6 justify-center align-center relative">
            <ol className='block text-black'>
              <li
              className={`p-2 cursor-pointer border rounded-lg bg-blue-100 hover:bg-gray-100`}
              onClick={()=>setDetails((prev)=>({...prev,WorkValues:newDetails.WorkValues}))}
              >
                {newDetails.WorkValues}
              </li>
            </ol>
            <button
                onClick={() => setNewDetails((prev)=>({...prev,WorkValues:''}))}
                className="absolute top-0 right-0 text-red-600 hover:text-red-800 p-1"
                title="Delete this suggestion"
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
          </div>
        }
      </div>
    </div>
  );
}