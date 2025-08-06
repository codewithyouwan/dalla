'use client';

   import { useState, useEffect, useRef } from 'react';
   import { useSearchParams } from 'next/navigation';
   import { v4 as uuidv4 } from 'uuid';
   import CryptoJS from 'crypto-js';
   import PersonalInfo from '../components/resume/PersonalInfo';
   import Education from '../components/resume/Education';
   import CareerAspirations from '../components/resume/CareerAspirations';
   import LanguagesAndTools from '../components/resume/LanguagesAndTools';
   import Projects from '../components/resume/Projects';
   import ProductDevelopment from '../components/resume/ProductDevelopment';
   import FieldsOfInterest from '../components/resume/FieldsOfInterest';
   import JapaneseCompanies from '../components/resume/JapaneseCompanies';
   import CareerDevelopment from '../components/resume/CareerDevelopment';
   import JLPTExperience from '../components/resume/JLPTExperience';
   import Suggestions from '../components/resume/Suggestions';
   import ResumePreview from '../components/resume/ResumePreview';
   import Loader from '../components/Loader';
   import CustomToaster from '../components/Toast';
   import toast from 'react-hot-toast';

   const defaultDetails = {
     id_number: '',
     employeeNumber: '',
     name: 'Test User',
     katakana: '',
     initials: '',
     selectedName: 'Test User',
     devField: '',
     jobType: '',
     domain: '',
     hobby: '',
     hometown: '',
     type: '',
     education: [{ year: '2024', institution: 'University', degree: 'Masters' }],
     languages: 'Python',
     devTools: 'Git, VS Code',
     internships: [],
     projects: [],
     productDevReason: 'Problem Solving',
     productDevRole: 'Data Scientist',
     interestFields: ['AI', 'Data Analysis', 'Testing'],
     japanCompanyInterest: 'Technology',
     japanCompanySkills: 'Work Culture',
     careerPriorities: ['Growth', 'Impact', 'Balance'],
     careerRoles: 'Project Manager',
     japaneseLevel: 'Not certified',
     total: '',
     vocabulary: '',
     reading: '',
     listening: '',
     personality: 'Diligent',
     selectedSuggestion: '',
     photo: null,
   };

   export default function MakeResume() {
     const [details, setDetails] = useState(defaultDetails);
     const [suggestions, setSuggestions] = useState([]);
     const [isLoading, setIsLoading] = useState(false);
     const [error, setError] = useState(null);
     const [selectedSuggestion, setSelectedSuggestion] = useState('');
     const [selectedIndex, setSelectedIndex] = useState(null);
     const [previewLink, setPreviewLink] = useState(null);
     const [tempPdfPath, setTempPdfPath] = useState(null);
     const [sessionId, setSessionId] = useState(uuidv4());
     const [loadingComponent, setLoadingComponent] = useState(null); // New state which is loading.
     const searchParams = useSearchParams();
     const hasFetchedCareerData = useRef(false);
    useEffect(()=>{
      if(error){
        toast(error,{
          duration: 3000,
        }
        )
      };
    },[error]);
     const fetchWithToast = async (componentName, fetchFn) => {
       setLoadingComponent(componentName);
       setIsLoading(true);
       setError(null);
       return toast.promise(
         fetchFn(),
         {
           loading: `Loading ${componentName}...`,
           success: <b>{componentName} loaded successfully!</b>,
           error: <b>Failed to load {componentName}.{toast(error)}</b>,
         },
       ).finally(() => {
         setLoadingComponent(null);
         setIsLoading(false);
       });
     };

     // #region careeraspirations.
     const fetchCareerAspirations = async () => {
       return fetchWithToast('Career Aspirations', async () => {
         if (!details.id_number) throw new Error('id_number is required');
         const res = await fetch('/api/careerAspirations', {
           method: 'POST',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify({ id_number: details.id_number }),
         });
         if (!res.ok) throw new Error(`Career aspirations API error: ${res.statusText}`);
         const gptData = await res.json();
         if (gptData.suggestions) {
           setDetails((prev) => ({
             ...prev,
             desiredIndustry: gptData.suggestions.desiredIndustry || prev.desiredIndustry,
             desiredJobType: gptData.suggestions.desiredJobType || prev.desiredJobType,
             targetRole: gptData.suggestions.targetRole || prev.targetRole,
             workStyle: gptData.suggestions.workStyle || prev.workStyle,
           }));
         } else {
           setError('No career aspirations suggestions');
         }
       });
     };
     // #endregion

     const fetchLanguagesAndTools = async () => {
       return fetchWithToast('Languages and Tools', async () => {
         const res = await fetch('/api/languagesAndTools', {
           method: 'POST',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify({ id_number: details.id_number }),
         });
         if (!res.ok) throw new Error(`Languages and tools API error: ${res.statusText}`);
         const gptData = await res.json();
         if (gptData.suggestions) {
           const form2Match = gptData.suggestions.match(/===FORM2-START===[\s\S]*?\n([\s\S]*?)\n===FORM2-END===/);
           if (form2Match) {
             const lines = form2Match[1].trim().split('\n').map(line => line.trim());
             if (lines.length >= 2) {
               setDetails((prev) => ({
                 ...prev,
                 languages: lines[0].replace('プログラミング言語: ', '') || '',
                 devTools: lines[1].replace('開発ツール: ', '') || '',
               }));
             } else {
               setError('Invalid languages and tools response format');
             }
           } else {
             setError('Failed to parse languages and tools response');
           }
         } else {
           setError('No languages and tools suggestions');
         }
       });
     };

     const fetchInternshipExperience = async () => {
       return fetchWithToast('Internship Experience', async () => {
         const res = await fetch('/api/internship', {
           method: 'POST',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify({ id_number: details.id_number }),
         });
         if (!res.ok) setError(`Experience API error: ${res.statusText}`);
         const gptData = await res.json();
         if (gptData.suggestions) {
           const { internships, projects } = gptData.suggestions;
           setDetails((prev) => ({
             ...prev,
             internships: internships || [],
             projects: projects || [],
           }));
         } else {
           setError('No experience suggestions');
         }
       });
     };

     const handlefetchEducation = async () => {
       return fetchWithToast('Education', async () => {
         const res = await fetch('/api/fetchEducation', {
           method: 'POST',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify({ id_number: details.id_number }),
         });
         if (!res.ok) throw new Error(`Education fetch error: ${res.statusText}`);
         const data = await res.json();
         if (data.education && Array.isArray(data.education)) {
           setDetails((prev) => ({
             ...prev,
             education: data.education.length > 0 ? data.education : prev.education,
           }));
         } else {
           setError('No education data found');
         }
       });
     };

     const fetchJapaneseCompanies = async () => {
       return fetchWithToast('Japanese Companies', async () => {
         const res = await fetch('/api/japaneseCompanies', {
           method: 'POST',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify({ id_number: details.id_number }),
         });
         if (!res.ok) throw new Error(`Japanese companies API error: ${res.statusText}`);
         const gptData = await res.json();
         if (gptData.suggestions) {
           const lines = gptData.suggestions.split('\n').map(line => line.trim());
           if (lines.length >= 2) {
             setDetails((prev) => ({
               ...prev,
               japanCompanyInterest: lines[0] || '',
               japanCompanySkills: lines[1] || '',
             }));
           } else {
             setError('Invalid Japanese companies response format');
           }
         } else {
           setError('No Japanese companies suggestions');
         }
       });
     };

     const fetchCareerDevelopment = async () => {
       return fetchWithToast('Career Development', async () => {
         const res = await fetch('/api/careerDevelopment', {
           method: 'POST',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify({ id_number: details.id_number }),
         });
         if (!res.ok) throw new Error(`Career development API error: ${res.statusText}`);
         const gptData = await res.json();
         if (gptData.suggestions && gptData.suggestions.careerPriority1) {
           const { careerPriority1, careerPriority2, careerPriority3, careerRoles } = gptData.suggestions;
           const newPriorities = [careerPriority1, careerPriority2, careerPriority3].filter(p => p && p.trim());
           if (newPriorities.length < 3) {
             setError('Incomplete career priorities received');
           }
           setDetails((prev) => ({
             ...prev,
             careerPriorities: newPriorities,
             careerRoles: careerRoles || prev.careerRoles,
           }));
         } else {
           setError('No valid career development suggestions');
         }
       });
     };

     const fetchFieldsOfInterest = async () => {
       return fetchWithToast('Fields of Interest', async () => {
         const res = await fetch('/api/fieldsOfInterest', {
           method: 'POST',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify({ id_number: details.id_number }),
         });
         if (!res.ok) setError(`Fields of Interest API error: ${res.statusText}`);
         const data = await res.json();
         if (data.suggestions) {
           const { field1, field2, field3 } = data.suggestions;
           const newFields = [field1, field2, field3].filter(Boolean);
           if (newFields.length < 3) {
             setError('Incomplete fields of interest received');
           }
           setDetails((prev) => ({
             ...prev,
             interestFields: newFields,
           }));
         } else {
           setError('No fields of interest suggestions');
         }
       });
     };

     const fetchProductDevelopment = async () => {
       return fetchWithToast('Product Development', async () => {
         const res = await fetch('/api/productDevelopment', {
           method: 'POST',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify({ id_number: details.id_number }),
         });
         if (!res.ok) throw new Error(`Product development API error: ${res.statusText}`);
         const data = await res.json();
         if (data.suggestions) {
           const { productDevReason, productDevRole } = data.suggestions;
           if (!productDevReason || !productDevRole) {
             setError('Incomplete product development suggestions received');
           }
           setDetails((prev) => ({
             ...prev,
             productDevReason,
             productDevRole,
           }));
         } else {
           setError('No product development suggestions');
         }
       });
     };

      const fetchJLPTSuggestions = async () => {
       return fetchWithToast('JLPT Suggestions', async () => {
         const japaneseLevel = details.japaneseLevel || 'Not certified';
         const payload = {
           total: details.total,
           vocabulary: details.vocabulary,
           reading: details.reading,
           listening: details.listening,
           japaneseLevel,
         };
         const response = await fetch('/api/gpt', {
           method: 'POST',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify(payload),
         });
         if (!response.ok) {
           const data = await response.json();
           setError(data.error || 'Failed to generate JLPT suggestions');
         }
         const data = await response.json();
         const content = data.suggestions;
         const forms = Split(content);
         const finalForms = forms.length > 0 ? forms.slice(0, 3) : [content];
         const trimmedForms = finalForms.map((form) => form.trim());
         setDetails((prev) => ({
           ...prev,
           suggestions: trimmedForms,
           selectedIndex: null,
           selectedSuggestion: '',
         }));
       });
     };

     const compileResume = async () => {
       return fetchWithToast('Resume Compilation', async () => {
         if (!Array.isArray(details.careerPriorities) || details.careerPriorities.length === 0) {
           setError('Career priorities are missing or invalid');
         }
         const formData = new FormData();
         formData.append('details', JSON.stringify(details));
         if (details.photo) {
           formData.append('photo', details.photo);
         }
         formData.append('sessionId', sessionId);
         const response = await fetch('/api/generateResume', {
           method: 'POST',
           body: formData,
         });
         if (!response.ok) {
           const errorData = await response.json();
           setError(`HTTP ${response.status}: ${errorData.error || 'Unknown error'}`);
         }
         const data = await response.json();
         if (!data.previewUrl || !data.previewUrl.startsWith('resume-') || !data.previewUrl.endsWith('.pdf')) {
           setError(`Invalid preview URL: ${data.previewUrl}`);
         }
         setPreviewLink(data.previewUrl);
         setTempPdfPath(data.tempPdfPath);
         setSessionId(data.sessionId);
       });
     };

     const saveResume = async () => {
       return fetchWithToast('Resume Save', async () => {
         const formData = new FormData();
         formData.append('details', JSON.stringify(details));
         if (details.photo) {
           formData.append('photo', details.photo);
         }
         if (tempPdfPath) {
           formData.append('tempPdfPath', tempPdfPath);
         }
         formData.append('sessionId', sessionId);
         const response = await fetch('/api/uploadResume', {
           method: 'POST',
           body: formData,
         });
         if (!response.ok) {
           const errorData = await response.json();
           setError(`HTTP ${response.status}: ${errorData.error || 'Unknown error'}`);
         }
         const data = await response.json();
         setPreviewLink(data.resumeLink.replace('/view', '/preview').split('/temp/')[1]);
         setTempPdfPath(null);
         return data; // Return for toast success
       });
     };

     useEffect(() => {
       const encryptedId = searchParams.get('encrypted_id');
       if (encryptedId && !hasFetchedCareerData.current) {
         hasFetchedCareerData.current = true;
         fetchWithToast('Employee Details', async () => {
           const secretKey = process.env.NEXT_PUBLIC_ENCRYPTION_SECRET || 'default-secure-key-32chars1234567';
           const bytes = CryptoJS.AES.decrypt(decodeURIComponent(encryptedId), secretKey);
           const idNumber = bytes.toString(CryptoJS.enc.Utf8);
           if (!idNumber) setError('Invalid employee ID');
           const res = await fetch(`/api/fetchDetails?id_number=${encodeURIComponent(idNumber)}`);
           if (!res.ok) setError(`Fetch error: ${res.statusText}`);
           const data = await res.json();
           if (data.name) {
             setDetails((prev) => ({
               ...prev,
               id_number: idNumber,
               employeeNumber: idNumber,
               name: data.name,
               katakana: data.katakana || '',
               hobby: data.hobby || '',
               hometown: data.hometown || '',
               initials: data.initials || '',
               selectedName: data.name,
             }));
           } else {
             setError('Employee data not found');
           }
         });
       }
     }, [searchParams]);

     const handleInputChange = (e) => {
       const { name, value, type, files } = e.target;
       if (type === 'file') {
         const file = files[0];
         if (file && file.type === 'image/jpeg' && file.size <= 5 * 1024 * 1024) {
           setDetails((prev) => ({ ...prev, photo: file }));
         } else {
           toast.error('Please upload a JPEG image under 5MB');
         }
       } else {
         if (name === 'employeeNumber' && value !== '' && !/^\d+$/.test(value)) {
           toast.error('Employee Number must be a number');
           return;
         }
         setDetails((prev) => ({ ...prev, [name]: value }));
       }
     };

     const handleArrayInputChange = (e, index, field, arrayName) => {
       const { value } = e.target;
       setDetails((prev) => {
         const newArray = [...prev[arrayName]];
         if (arrayName === 'interestFields' || arrayName === 'careerPriorities') {
           newArray[index] = value;
         } else {
           newArray[index] = { ...newArray[index], [field]: value };
         }
         return { ...prev, [arrayName]: newArray };
       });
     };

     const addEducation = () => {
       setDetails((prev) => ({
         ...prev,
         education: [...prev.education, { year: '', institution: '', degree: '' }],
       }));
     };

     const removeEducation = (indexToRemove) => {
       setDetails((prev) => ({
         ...prev,
         education: prev.education.length > 1
           ? prev.education.filter((_, index) => index !== indexToRemove)
           : prev.education,
       }));
     };

     const addExperience = (type) => {
       setDetails((prev) => ({
         ...prev,
         [type]: [
           ...prev[type],
           {
             title: '',
             period: '',
             company: type === 'internships' ? '' : undefined,
             role: '',
             description: '',
             challenges: '',
             outcome: '',
           },
         ].slice(0, 2),
       }));
     };

     const removeExperience = (type, indexToRemove) => {
       setDetails((prev) => ({
         ...prev,
         [type]: prev[type].length > 0
           ? prev[type].filter((_, index) => index !== indexToRemove)
           : prev[type],
       }));
     };

     return (
       <div className="relative flex flex-col md:flex-row h-screen p-4 gap-6 overflow-hidden">
         {/* {isLoading && <Loader />} */}
         <div className="w-full md:w-1/2 bg-white p-6 rounded-lg shadow-md overflow-y-auto h-full">
           <CustomToaster />
           <h1 className="text-2xl text-black font-bold mb-6">履歴書ビルダー / Resume Builder</h1>
           <PersonalInfo details={details} handleInputChange={handleInputChange} />
           <CareerAspirations
             details={details}
             handleInputChange={handleInputChange}
             fetchCareerAspirations={fetchCareerAspirations}
             isLoading={isLoading}
           />
           <Education
             education={details.education}
             handleArrayInputChange={handleArrayInputChange}
             addEducation={addEducation}
             removeEducation={removeEducation}
             fetchEducation={handlefetchEducation}
             isLoading={isLoading}
           />
           <LanguagesAndTools
             details={details}
             handleInputChange={handleInputChange}
             fetchLanguagesAndTools={fetchLanguagesAndTools}
             isLoading={isLoading}
           />
           <Projects
             internships={details.internships}
             projects={details.projects}
             handleArrayInputChange={handleArrayInputChange}
             addExperience={addExperience}
             removeExperience={removeExperience}
             fetchInternshipExperience={fetchInternshipExperience}
             isLoading={isLoading}
           />
           <ProductDevelopment
             details={details}
             handleInputChange={handleInputChange}
             fetchProductDevelopment={fetchProductDevelopment}
             isLoading={isLoading}
           />
           <FieldsOfInterest
             details={details}
             handleArrayInputChange={handleArrayInputChange}
             isLoading={isLoading}
             fetchFieldsOfInterest={fetchFieldsOfInterest}
           />
           <JapaneseCompanies
             details={details}
             handleInputChange={handleInputChange}
             fetchJapaneseCompanies={fetchJapaneseCompanies}
             isLoading={isLoading}
           />
           <CareerDevelopment
             careerPriorities={details.careerPriorities}
             handleArrayInputChange={handleArrayInputChange}
             fetchCareerDevelopment={fetchCareerDevelopment}
             isLoading={isLoading}
           />
           <JLPTExperience
             details={details}
             handleInputChange={handleInputChange}
             setDetails={setDetails}
             isLoading={isLoading}
             fetchJLPTSuggestions={fetchJLPTSuggestions}
           />
           <Suggestions
             suggestions={suggestions}
             selectedIndex={selectedIndex}
             setSelectedSuggestion={setSelectedSuggestion}
             setSelectedIndex={setSelectedIndex}
           />
           <div className="mb-8">
             <button
               onClick={saveResume}
               disabled={isLoading}
               className={`px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
             >
               {isLoading ? '保存中... / Saving...' : '履歴書を保存 / Save Resume'}
             </button>
           </div>
         </div>
         <ResumePreview
           isLoading={isLoading}
           previewLink={previewLink}
           error={error}
           handleRefresh={compileResume}
         />
       </div>
     );
   }