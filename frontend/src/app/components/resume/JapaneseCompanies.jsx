import {useState,useEffect,useRef} from 'react';
import Prompt from '../../helper/prompt';
import { createClient } from '@supabase/supabase-js';
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);
export default function JapaneseCompanies({
  details, setDetails, handleInputChange, fetchJapaneseCompanies, isLoading, setIsLoading,fetchWithToast,setError, newDetails, setNewDetails, userPrompt, setUserPrompt
  }) {
const fetchRethinkJapaneseCompanies = async () => {
  setIsLoading(true);
  setError(null);
  try {
    const response = await fetch('/api/rethinkJapaneseCompany', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id_number: details.id_number || sessionId,
        previous_skills_to_acquire: details.japanCompanySkills,
        previous_interest_in_japanese_companies: details.japanCompanyInterest,
        user_prompt: userPrompt.japaneseCompany || '',
      }),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`HTTP ${response.status}: ${errorData.error || 'Unknown error'}`);
    }
    const data = await response.json();
    const [interest, skills] = data.suggestions.split('\n');
    setNewDetails((prev) => ({
      ...prev,
      japanCompanyInterest: interest,
      japanCompanySkills: skills,
    }));
    // toast.success('日本企業に関する情報が更新されました / Japanese company info updated', { id: 'rethinkJapaneseCompany-success' });
  } catch (err) {
    setError(`Failed to fetch Japanese company suggestions: ${err.message}`);
    // setIsLoading(false);
    // toast.error(`エラー: ${err.message} / Failed to fetch Japanese company suggestions: ${err.message}`, { id: 'rethinkJapaneseCompany-error' });
  } finally {
    setIsLoading(false);
  }
};
// const reThink=async()=>fetchWithToast("Rethinking",f)
  return (
    <div className="mb-8 whitespace-pre-line">
      <div className="flex justify-between items-center whitespace-pre-line">
        <h2 className="text-xl text-black font-semibold mb-3">{"日本企業について \n Japanese Companies"}</h2>
        <button
            onClick={fetchJapaneseCompanies}
            disabled={isLoading}
            className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isLoading ? '生成中... \n Generating...' : '提案を生成 \n Generate Suggestions'}
        </button>
      </div>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">番興味がある点 / Most Interesting Aspect</label>
          <textarea
            type="text"
            rows={3}
            name="japanCompanyInterest"
            value={details.japanCompanyInterest}
            onChange={handleInputChange}
            className="mt-1 block text-black w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">習得したいこと / Skills to Acquire</label>
          <textarea
            type="text"
            rows={2}
            name="japanCompanySkills"
            value={details.japanCompanySkills}
            onChange={handleInputChange}
            className="mt-1 block text-black w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
          <label className="block text-sm font-medium text-gray-700">User Prompt</label>
          <textarea
            type="text"
            rows={2}
            name="UserPrompt"
            value={userPrompt.japaneseCompany}
            onChange={(e)=>(setUserPrompt((prev)=>({...prev, japaneseCompany:e.target.value})))}
            className="mt-1 block text-black w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
          <button
            onClick={fetchRethinkJapaneseCompanies}
            disabled={isLoading}
            className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isLoading ? 'Loading' : 'Rethink'}
        </button>
        {newDetails.japanCompanyInterest!==''&&
        <div className="mt-4 border rounded-lg p-2">
          <label className="block text-sm font-medium text-black">New Generation for Japanese Companies.</label>
          <ol className="mt-2 space-y-2 text-black">
            <span>Interest</span>
            <li
              className={`p-2 cursor-pointer border rounded-lg bg-blue-100 hover:bg-gray-100`}
              onClick={()=>{
                setDetails((prev)=>({...prev,japanCompanyInterest:newDetails.japanCompanyInterest}))
              }}
              >
                {newDetails.japanCompanyInterest}
            </li>
            <span>Skills</span>
            <li
            className={`p-2 cursor-pointer border rounded-lg bg-blue-100 hover:bg-gray-100`}
            onClick={()=>{
                setDetails((prev)=>({...prev,japanCompanySkills:newDetails.japanCompanySkills}))
              }}
              >
                {newDetails.japanCompanySkills}
            </li>
          </ol>
        </div>
          }
        </div>
      </div>
    </div>
  );
}