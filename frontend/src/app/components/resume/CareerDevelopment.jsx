import UndoButton from "../buttons/UndoButton";
import DeleteButton from "../buttons/DeleteButton";
export default function CareerDevelopment({ 
  details, setDetails,newDetails,setNewDetails,userPrompt,setUserPrompt,
  fetchWorkValues, isLoading, setIsLoading, setError, prevDetails, setPrevDetails
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
      <div className="block border rounded-lg border-black p-2 space-y-4">
        <div className='block border rounded-lg p-2 relative justify-center align-center'>
          <div>
          <label className="block text-sm font-medium text-gray-700">働く上での価値観/ 3 WorkValues</label>
          <textarea
            value={details.WorkValues}
            onChange={(e)=>{setDetails((prev)=>({...prev, WorkValues: e.target.value}))}}
            className="mt-1 block text-black w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            rows="4"
          />
        </div>
        { prevDetails.WorkValues!==''&&prevDetails.WorkValues!==details.WorkValues&&
          <div className='top-0 right-0 absolute'>
          <UndoButton
            clickFunction={
              ()=>{
                setDetails((prev)=>({...prev,WorkValues:prevDetails.WorkValues}));
              }
            }
          />
          </div>
        }
        </div>
        <div>
          <label className="block text-sm font-semibold text-green-700">User Prompt</label>
          <textarea
            value={userPrompt.CareerDevelopment}
            onChange={(e)=>{setUserPrompt((prev)=>({...prev, CareerDevelopment: e.target.value}))}}
            className="block text-black w-full bg-green-100 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            rows="2"
          />
        </div>
         <button
          onClick={fetchRethinkWorkValues}
          disabled={isLoading || userPrompt.CareerDevelopment.trim()===''}
          className={`px-4 py-2 bg-green-600 text-white rounded-md hover:bg-red-700 whitespace-pre-line ${isLoading||userPrompt.CareerDevelopment==='' ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isLoading ? 'Thinking...' : 'Rethink'}
        </button>
        {newDetails.WorkValues!==''&&
          <div className="mt-4 border rounded-lg p-6 justify-center align-center relative">
            <ol className='block text-black'>
              <li
              className={`p-2 cursor-pointer border rounded-lg bg-blue-100 hover:bg-gray-100`}
              onClick={
                ()=>{
                  setPrevDetails((prev)=>({...prev, WorkValues:details.WorkValues}));
                  setDetails((prev)=>({...prev,WorkValues:newDetails.WorkValues}));
                }
              }
              >
                {newDetails.WorkValues}
              </li>
            </ol>
            <div className='absolute top-0 right-0'>
              <DeleteButton
                clickFunction={
                  ()=>{
                    setNewDetails((prev)=>({...prev,WorkValues:''}))
                  }
                }
              />
            </div>
          </div>
        }
      </div>
    </div>
  );
}