import { set } from 'date-fns';
import {useState,useEffect, useRef} from 'react';
import UndoButton from "../buttons/UndoButton";
export default function CareerAspirations({ 
    details, handleInputChange, fetchCareerAspirations, isLoading, setDetails, newDetails, setNewDetails, prevDetails, setPrevDetails
}) {
    const [error,setError] = useState(null);
    const [copy,setCopy] = useState(null);
    const [color,setColor] = useState(['bg-blue-100','bg-blue-100','bg-blue-100','bg-blue-100']);
    // const errorTimerRef = useRef(null);
    // const copyTimerRef = useRef(null);
    // ❌✅

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
        <div className='relative border p-2 rounded-md bg-gray-50 justify-between items-center'>
          <label className="block text-sm font-medium text-gray-700">希望業界 / Desired Industry</label>
          <textarea
            type="text"
            name="desiredIndustry"
            value={details.desiredIndustry}
            onChange={(e)=>{setDetails((prev)=>({...prev,desiredIndustry:e.target.value}))}}
            className="mt-1 block text-black w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            placeholder="例: テクノロジー"
          />
          {prevDetails.desiredIndustry!==''&&(prevDetails.desiredIndustry!==details.desiredIndustry)&&
            <div className='absolute top-0 right-0 flex'>
              <UndoButton
                clickFunction={
                  ()=>{
                    setDetails((prev)=>({...prev, desiredIndustry : prevDetails.desiredIndustry}));
                    setPrevDetails((prev)=>({...prev, desiredIndustry:''}));
                  }
                }
              />
            </div>
          }
        </div>
        <div className='relative border p-2 rounded-md bg-gray-50 justify-between items-center'>
          <label className="block text-sm font-medium text-gray-700">希望職種 / Desired Job Type</label>
          <textarea
            type="text"
            name="desiredJobType"
            value={details.desiredJobType}
            onChange={(e)=>
              setDetails((prev)=>({...prev,desiredJobType:e.target.value}))
            }
            className="mt-1 block text-black w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            placeholder="例: エンジニア"
          />
          {prevDetails.desiredJobType!==''&&(prevDetails.desiredJobType!==details.desiredJobType)&&
            <div className='absolute top-0 right-0 flex'>
              <UndoButton
                clickFunction={
                  ()=>{
                    setDetails((prev)=>({...prev, desiredJobType : prevDetails.desiredJobType}));
                    setPrevDetails((prev)=>({...prev, desiredJobType:''}));
                  }
                }
              />
            </div>
          }
        </div>
        <div className='relative border p-2 rounded-md bg-gray-50 justify-between items-center'>
          <label className="block text-sm font-medium text-gray-700">目指す役割 / Target Role</label>
          <textarea
            rows={2}
            type="text"
            name="targetRole"
            value={details.targetRole}
            onChange={(e)=>setDetails((prev)=>({...prev,targetRole:e.target.value}))}
            className="mt-1 block text-black w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            placeholder="例: データサイエンス"
          />
          {prevDetails.targetRole!==''&&(prevDetails.targetRole!==details.targetRole)&&
            <div className='absolute top-0 right-0 flex'>
              <UndoButton
              clickFunction={
                  ()=>{
                    setDetails((prev)=>({...prev, targetRole : prevDetails.targetRole}));
                    setPrevDetails((prev)=>({...prev, targetRole:''}));
                  }
                }
              />
            </div>
          }
        </div>
        <div className='relative border p-2 rounded-md bg-gray-50 justify-between items-center'>
          <label className="block text-sm font-medium text-gray-700">ワークスタイル / Work Style</label>
          <textarea
            rows={2}
            type="text"
            name="workStyle"
            value={details.workStyle}
            onChange={(e)=>(setDetails((prev)=>({...prev,workStyle:e.target.value})))}
            className="mt-1 block text-black w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            placeholder="例: スペシャリスト"
          />
          {prevDetails.workStyle!==''&&(prevDetails.workStyle!==details.workStyle)&&
            <div className='absolute top-0 right-0 flex'>
              <UndoButton
              clickFunction={
                  ()=>{
                    setDetails((prev)=>({...prev, workStyle : prevDetails.workStyle}));
                    setPrevDetails((prev)=>({...prev, workStyle:''}));
                  }
                }
              />
            </div>
          }
        </div>
        {(newDetails.desiredIndustry!==''||newDetails.desiredJobType!==''||newDetails.targetRole!==''||newDetails.workStyle!=='')&&(
          <div className="justify-between p-4 border rounded-md bg-gray-50 relative">
            {error&&<span className="block text-red-600 font-medium">{`❌${error}`}</span>}
            {copy&&<span className="block text-green-600 font-medium">{`✅${copy}`}</span>}
            <label className={`block text-sm font-medium text-black`}>AI提案 / AI Suggestions</label>
            <ol className="mt-2 space-y-2 text-black">
            <li
              className = {`p-2 cursor-pointer border rounded-lg ${color[0]} hover:bg-gray-100`}
              onClick ={()=>{
                if(newDetails.desiredIndustry===''){
                  setError("希望業界が空です / Desired Industry is empty");
                  setColor(prev=>prev.map((item,index)=>(index===0?'bg-red-100':item)));
                  return;
                }
                setPrevDetails((prev)=>({...prev,desiredIndustry:details.desiredIndustry}));
                setDetails((prev)=>({...prev,desiredIndustry:newDetails.desiredIndustry}));
                // setNewDetails((prev)=>({...prev,desiredIndustry:''}));
                // setError(null);
                setCopy("希望業界が更新されました / Desired Industry updated");
                setColor(prev=>prev.map((item,index)=>(index===0?'bg-green-100':item)));
                // toast.success('希望業界が更新されました / Desired Industry updated');
              }} 
              >
              <span className="text-black font-medium test-sm whitespace-pre-line">{`希望業界 / Desired Industry\n${newDetails.desiredIndustry}`}</span>
            </li>
            <li
              className = {`p-2 cursor-pointer border rounded-lg ${color[1]} hover:bg-gray-100`}
              onClick ={()=>{
                if(newDetails.desiredJobType===''){
                  setError("希望職種が空です / Desired Job Type is empty");
                  setColor(prev=>prev.map((item,index)=>(index===1?'bg-red-100':item)));
                  return;
                }
                setPrevDetails((prev)=>({...prev,desiredJobType:details.desiredJobType}));
                setDetails((prev)=>({...prev,desiredJobType:newDetails.desiredJobType}));
                // setNewDetails((prev)=>({...prev,desiredJobType:''}));
                // toast.success('希望職種が更新されました / Desired Job Type updated');
                // setError(null);
                setCopy("希望職種が更新されました / Desired Job Type updated");
                setColor(prev=>prev.map((item,index)=>(index===1?'bg-green-100':item)));
              }} 
              >
              <span className="text-black font-medium test-sm whitespace-pre-line">{`希望職種 / Desired Job Type\n${newDetails.desiredJobType}`}</span>

            </li>
            <li
              className = {`p-2 cursor-pointer border rounded-lg ${color[2]} hover:bg-gray-100`}
              onClick ={()=>{
                if(newDetails.targetRole===''){
                  setError("目指す役割が空です / Target Role is empty");
                  setColor(prev=>prev.map((item,index)=>(index===2?'bg-red-100':item)));
                  return;
                }
                setPrevDetails((prev)=>({...prev,targetRole:details.targetRole}));
                setDetails((prev)=>({...prev,targetRole:newDetails.targetRole}));
                // setNewDetails((prev)=>({...prev,targetRole:''}));
                // setError(null);
                setCopy("目指す役割が更新されました / Target Role updated");
                setColor(prev=>prev.map((item,index)=>(index===2?'bg-green-100':item)));
                // toast.success('目指す役割が更新されました / Target Role updated');
              }} 
              >
              <span className="text-black font-medium test-sm whitespace-pre-line">{`目指す役割 / Target Role\n${newDetails.targetRole}`}</span>
            </li>
            <li
              className = {`p-2 cursor-pointer border rounded-lg ${color[3]} hover:bg-gray-100`}
              onClick ={()=>{
                if(newDetails.workStyle===''){
                  setError("ワークスタイルが空です / Work Style is empty");
                  setColor(prev=>prev.map((item,index)=>index===3?'bg-red-100':item));
                  return;
                }
                setPrevDetails((prev)=>({...prev,workStyle:details.workStyle}));
                setDetails((prev)=>({...prev,workStyle:newDetails.workStyle}));
                // setNewDetails((prev)=>({...prev,workStyle:''}));
                // setError(null);
                setCopy("ワークスタイルが更新されました / Work Style updated");
                setColor(prev=>prev.map((item,index)=>(index===3?'bg-green-100':item)));
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