'use client';
import PersonalInfo from './resume/PersonalInfo';
import Education from './resume/Education';
import CareerAspirations from './resume/CareerAspirations';
import LanguagesAndTools from './resume/LanguagesAndTools';
import Projects from './resume/Projects';
import ProductDevelopment from './resume/ProductDevelopment';
import FieldsOfInterest from './resume/FieldsOfInterest';
import JapaneseCompanies from './resume/JapaneseCompanies';
import CareerDevelopment from './resume/CareerDevelopment';
import JLPTExperience from './resume/JLPTExperience';
import ResumePreview from './resume/ResumePreview';
import CustomToaster from './Toast';
import toast from 'react-hot-toast';
export default function LeftPage({
    details,setDetails,
    newDetails,setNewDetails,
    prevDetails,setPrevDetails,
    handleInputChange,
    handleArrayInputChange,
    addEducation,removeEducation,
    addExperience,removeExperience,
    fetchWithToast,
    fetchInternshipExperience,
    fetchFieldsOfInterest,
    fetchJapaneseCompanies,
    fetchWorkValues,
    fetchJLPTSuggestions,
    saveResume,
    isLoading,setIsLoading,
    error,setError,
    userPrompt,setUserPrompt,
}){
    return (
        <div className="bg-white p-6 rounded-lg shadow-md overflow-y-auto h-full flex-none basis-1/2">
                <CustomToaster />
                <h1 className="text-2xl text-black font-bold mb-6">履歴書ビルダー / Resume Builder</h1>
                {
                //#region PersonalInfo
                <PersonalInfo
                  details={details}
                  setDetails={setDetails}
                  newDetails={newDetails}
                  prevDetails={prevDetails}
                  setPrevDetails={setPrevDetails}
                  setNewDetails={setNewDetails}
                  handleInputChange={handleInputChange}
                  fetchPersonalDetails={() => fetchWithToast('Personal Details', async () => {
                    const id = details.id_number;
                    console.log("Personal Info ID:", id);
                    const res = await fetch(`/api/fetchDetails?id_number=${id}`);
                    if (!res.ok) {
                      const errorData = await res.json();
                      throw new Error(`HTTP ${res.status}: ${errorData.error || 'Unknown error'}`);
                    }
                    const data = await res.json();
                    setDetails((prev) => ({
                      ...prev,
                      name: data.name || prev.name,
                      katakana: data.katakana || '',
                      initials: data.initials || '',
                      hometown: data.hometown || '',
                      selectedName: data.name || prev.selectedName,
                    }));
                    if(details.hobby===''){
                      setDetails((prev) => ({...prev, hobby: data.hobby || '',}));
                    }else{
                      setNewDetails((prev) => ({...prev, hobby: data.hobby || '',}));
                    }
                  })}
                  isLoading={isLoading}
                />
                //#endregion
                }
                {
                  //#region CareerAspirations
                  <CareerAspirations
                  details={details}
                  setDetails={setDetails}
                  newDetails={newDetails}
                  setNewDetails={setNewDetails}
                  isLoading={isLoading}
                  prevDetails={prevDetails}
                  setPrevDetails={setPrevDetails}
                  fetchWithToast={fetchWithToast}
                />
                //#endregion
                }
                {
                  //#region Education
                  <Education
                  education={details.education}
                  handleArrayInputChange={handleArrayInputChange}
                  addEducation={addEducation}
                  removeEducation={removeEducation}
                  isLoading={isLoading}
                  fetchWithToast={fetchWithToast}
                />
                //#endregion
                }
                {
                  //#region LanguageAndTools
                  <LanguagesAndTools
                  details={details}
                  handleInputChange={handleInputChange}
                  isLoading={isLoading}
                  fetchWithToast={fetchWithToast}
                />
                //#endregion
                }
                {
                  //#region Projects and Internships
                  <Projects
                  internships={details.internships}
                  projects={details.projects}
                  handleArrayInputChange={handleArrayInputChange}
                  addExperience={addExperience}
                  removeExperience={removeExperience}
                  fetchInternshipExperience={fetchInternshipExperience}
                  isLoading={isLoading}
                />
                //#endregion
                }
                {
                  //#region FieldOfInterest
                  <FieldsOfInterest
                  details={details}
                  handleArrayInputChange={handleArrayInputChange}
                  isLoading={isLoading}
                  fetchFieldsOfInterest={fetchFieldsOfInterest}
                />
                    //#endregion
                }
                {
                  //#region JapaneseCompanies
                <JapaneseCompanies
                  setError={setError}
                  setIsLoading={setIsLoading}
                  userPrompt={userPrompt}
                  setUserPrompt={setUserPrompt}
                  details={details}
                  setDetails={setDetails}
                  newDetails={newDetails}
                  setNewDetails={setNewDetails}
                  prevDetails={prevDetails}
                  setPrevDetails={setPrevDetails}
                  handleInputChange={handleInputChange}
                  fetchJapaneseCompanies={fetchJapaneseCompanies}
                  isLoading={isLoading}
                />
                // #endregion
                }
                { 
                  // #region careerDev
                <CareerDevelopment
                  details={details}
                  setDetails={setDetails}
                  newDetails={newDetails}
                  setNewDetails={setNewDetails}
                  userPrompt={userPrompt}
                  setUserPrompt={setUserPrompt}
                  fetchWorkValues={fetchWorkValues}
                  isLoading={isLoading}
                  setIsLoading={setIsLoading}
                  setError={setError}
                  prevDetails={prevDetails}
                  setPrevDetails={setPrevDetails}
                />
                 // #endregion
                }
               { 
                  // #region JLPTExperience
                <JLPTExperience
                  details={details}
                  handleInputChange={handleInputChange}
                  setDetails={setDetails}
                  prevDetails={prevDetails}
                  setPrevDetails={setPrevDetails}
                  newDetails={newDetails}
                  setNewDetails={setNewDetails}
                  isLoading={isLoading}
                  fetchJLPTSuggestions={fetchJLPTSuggestions}
                />
                // #endregion
                }
                {
                  //#region Sugestions
                //   <Suggestions
                //   suggestions={details.suggestions}
                //   setDetail={setDetails}
                //   selectedIndex={selectedIndex}
                //   setSelectedSuggestion={(index,suggestions)=>setDetails((prev)=>({...prev,selectedSuggestion:suggestions[index]}))}
                //   setSelectedIndex={setSelectedIndex}
                // />
                // #endregion
                }
                <div className="mb-8">
                  <button
                    onClick={saveResume}
                    disabled={isLoading}
                    className={`px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {isLoading ? '保存中... / Saving Data...' : 'データを保存 / Save Data'}
                  </button>
                </div>
              </div>
    );
}
