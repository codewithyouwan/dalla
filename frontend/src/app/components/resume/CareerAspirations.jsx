import { set } from 'date-fns';
import {useState,useEffect, useRef} from 'react';
export default function CareerAspirations({ 
    details, handleInputChange, fetchCareerAspirations, isLoading, setDetails, newDetails, setNewDetails 
}) {
    const [error,setError] = useState(null);
    const [copy,setCopy] = useState(null);
    const errorTimerRef = useRef(null);
    const copyTimerRef = useRef(null);
    // ❌✅
    // const showError = (msg) => {
    //   // Clear previous error timer if exists
    //   if (errorTimerRef.current) clearTimeout(errorTimerRef.current);

    //   // Start new timer
    //   errorTimerRef.current = setTimeout(() => {
    //     setError(null);
    //     errorTimerRef.current = null;
    //   }, 3000);
    // };
    // const showSuccess = (msg) => {

    //   // Clear previous copy timer if exists
    //   if (copyTimerRef.current) clearTimeout(copyTimerRef.current);

    //   // Start new timer
    //   copyTimerRef.current = setTimeout(() => {
    //     setCopy(null);
    //     copyTimerRef.current = null;
    //   }, 3000);
    // };
  return (
    <div className="mb-8">
      <div className="flex justify-between items-center whitespace-pre-line">
        <h2 className="text-xl text-black font-semibold mb-3">{"志向 \n Career Aspirations"}</h2>
        <button
          onClick={fetchCareerAspirations}
          disabled={isLoading}
          className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 whitespace-pre-line ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isLoading ? '取得中... \n Fetching...' : '志向を取得 \n Generate'}
        </button>
      </div>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">希望業界 / Desired Industry</label>
          <input
            type="text"
            name="desiredIndustry"
            value={details.desiredIndustry}
            onChange={handleInputChange}
            className="mt-1 block text-black w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            placeholder="例: テクノロジー"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">希望職種 / Desired Job Type</label>
          <input
            type="text"
            name="desiredJobType"
            value={details.desiredJobType}
            onChange={handleInputChange}
            className="mt-1 block text-black w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            placeholder="例: エンジニア"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">目指す役割 / Target Role</label>
          <textarea
            rows={2}
            type="text"
            name="targetRole"
            value={details.targetRole}
            onChange={handleInputChange}
            className="mt-1 block text-black w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            placeholder="例: データサイエンス"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">ワークスタイル / Work Style</label>
          <textarea
            rows={2}
            type="text"
            name="workStyle"
            value={details.workStyle}
            onChange={handleInputChange}
            className="mt-1 block text-black w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            placeholder="例: スペシャリスト"
          />
        </div>
        {(newDetails.desiredIndustry!==''||newDetails.desiredJobType!==''||newDetails.targetRole!==''||newDetails.workStyle!=='')&&(
          <div className="justify-between p-4 border rounded-md bg-gray-50 relative">
            {error&&<span className="block text-red-600 font-medium bg-white">{`❌${error}`}</span>}
            {copy&&<span className="block text-green-600 font-medium bg-white">{`✅${copy}`}</span>}
            <label className="block text-sm font-medium text-black">AI提案 / AI Suggestions</label>
            <ol className="mt-2 space-y-2 text-black">
            <li
              className = 'p-2 cursor-pointer border rounded-lg bg-blue-100 hover:bg-gray-100'
              onClick ={()=>{
                if(newDetails.desiredIndustry===''){setError("希望業界が空です / Desired Industry is empty"); return;}
                setDetails((prev)=>({...prev,desiredIndustry:newDetails.desiredIndustry}));
                setNewDetails((prev)=>({...prev,desiredIndustry:''}));
                setError(null);
                setCopy("希望業界が更新されました / Desired Industry updated");
                // toast.success('希望業界が更新されました / Desired Industry updated');
              }} 
              >
              <span className="text-black font-medium test-sm whitespace-pre-line">{`希望業界 / Desired Industry\n${newDetails.desiredIndustry}`}</span>
            </li>
            <li
              className = 'p-2 cursor-pointer border rounded-lg bg-blue-100 hover:bg-gray-100'
              onClick ={()=>{
                if(newDetails.desiredJobType===''){setError("希望職種が空です / Desired Job Type is empty"); return;}
                setDetails((prev)=>({...prev,desiredJobType:newDetails.desiredJobType}));
                setNewDetails((prev)=>({...prev,desiredJobType:''}));
                // toast.success('希望職種が更新されました / Desired Job Type updated');
                setError(null);
                setCopy("希望職種が更新されました / Desired Job Type updated");
              }} 
              >
              <span className="text-black font-medium test-sm whitespace-pre-line">{`希望職種 / Desired Job Type\n${newDetails.desiredJobType}`}</span>

            </li>
            <li
              className = 'p-2 cursor-pointer border rounded-lg bg-blue-100 hover:bg-gray-100'
              onClick ={()=>{
                if(newDetails.targetRole===''){setError("目指す役割が空です / Target Role is empty"); return;}
                setDetails((prev)=>({...prev,targetRole:newDetails.targetRole}));
                setNewDetails((prev)=>({...prev,targetRole:''}));
                setError(null);
                setCopy("目指す役割が更新されました / Target Role updated");
                // toast.success('目指す役割が更新されました / Target Role updated');
              }} 
              >
              <span className="text-black font-medium test-sm whitespace-pre-line">{`目指す役割 / Target Role\n${newDetails.targetRole}`}</span>
            </li>
            <li
              className = 'p-2 cursor-pointer border rounded-lg bg-blue-100 hover:bg-gray-100'
              onClick ={()=>{
                if(newDetails.workStyle===''){setError("ワークスタイルが空です / Work Style is empty"); return;}
                setDetails((prev)=>({...prev,workStyle:newDetails.workStyle}));
                setNewDetails((prev)=>({...prev,workStyle:''}));
                setError(null);
                setCopy("ワークスタイルが更新されました / Work Style updated");
                // toast.success('ワークスタイルが更新されました / Work Style updated');
              }} 
              >
              <span className="text-black font-medium test-sm whitespace-pre-line">{`ワークスタイル / Work Style\n${newDetails.workStyle}`}</span>
            </li>
          </ol>
          <button
                onClick={() => setNewDetails({desiredIndustry:'',desiredJobType:'',targetRole:'',workStyle:''})}
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
          </div>
        )}
      </div>
    </div>
  );
}