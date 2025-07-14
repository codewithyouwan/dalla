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

const defaultDetails = {
  id_number: '',
  employeeNumber: '',
  name: 'Test User',
  devField: '',
  jobType: '',
  domain: '',
  type: '',
  education: [{ year: '2024', institution: 'University', degree: 'Masters' }],
  languages: 'Python',
  devTools: 'Git, VS Code',
  projectRole: 'Programmer',
  projectDescription: 'ML Project',
  projectChallenges: 'Data Cleaning',
  leadership: 'Project Leader',
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
  isInternship: true,
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
  const searchParams = useSearchParams();
  const hasFetchedCareerData = useRef(false);

  const fetchCareerAspirations = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const careerData = {
        preferred_industry: details.interestFields || [],
        job_role_priority_1: details.careerRoles || '',
        future_career_goals: details.careerPriorities || [],
        work_style_preference: details.japanCompanySkills ? [details.japanCompanySkills] : [],
      };
      console.log('Sending career data to API:', careerData);
      const res = await fetch('/api/careerAspirations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(careerData),
      });
      if (!res.ok) throw new Error(`Career aspirations API error: ${res.statusText}`);
      const gptData = await res.json();
      console.log('Career aspirations response:', gptData);
      if (gptData.suggestions) {
        const form2Match = gptData.suggestions.match(/===FORM2-START===[\s\S]*?\n([\s\S]*?)\n===FORM2-END===/);
        if (form2Match) {
          const lines = form2Match[1].trim().split('\n').map(line => line.trim());
          console.log('Parsed FORM2 lines:', lines);
          if (lines.length >= 4) {
            setDetails((prev) => ({
              ...prev,
              devField: lines[0] || '',
              jobType: lines[1] || '',
              domain: lines[2] || '',
              type: lines[3] || '',
            }));
          } else {
            setError('Invalid career aspirations response format');
            console.error('Expected 4 lines, got:', lines);
          }
        } else {
          setError('Failed to parse career aspirations response');
          console.error('No FORM2 in response:', gptData.suggestions);
        }
      } else {
        setError('No career aspirations suggestions');
        console.error('No suggestions in GPT response:', gptData);
      }
    } catch (err) {
      setError(`Career aspirations fetch error: ${err.message}`);
      console.error('Career aspirations fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchLanguagesAndTools = async () => {
    setIsLoading(true);
    setError(null);
    try {
      console.log('Sending id_number to /api/languagesAndTools:', details.id_number);
      const res = await fetch('/api/languagesAndTools', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_number: details.id_number }),
      });
      if (!res.ok) throw new Error(`Languages and tools API error: ${res.statusText}`);
      const gptData = await res.json();
      console.log('Languages and tools response:', gptData);
      if (gptData.suggestions) {
        const form2Match = gptData.suggestions.match(/===FORM2-START===[\s\S]*?\n([\s\S]*?)\n===FORM2-END===/);
        if (form2Match) {
          const lines = form2Match[1].trim().split('\n').map(line => line.trim());
          console.log('Parsed FORM2 lines:', lines);
          if (lines.length >= 2) {
            setDetails((prev) => ({
              ...prev,
              languages: lines[0].replace('プログラミング言語: ', '') || '',
              devTools: lines[1].replace('開発ツール: ', '') || '',
            }));
          } else {
            setError('Invalid languages and tools response format');
            console.error('Expected 2 lines, got:', lines);
          }
        } else {
          setError('Failed to parse languages and tools response');
          console.error('No FORM2 in response:', gptData.suggestions);
        }
      } else {
        setError('No languages and tools suggestions');
        console.error('No suggestions in GPT response:', gptData);
      }
    } catch (err) {
      setError(`Languages and tools fetch error: ${err.message}`);
      console.error('Languages and tools fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchInternshipExperience = async () => {
    setIsLoading(true);
    setError(null);
    try {
      console.log('Sending id_number to /api/internship:', details.id_number);
      const res = await fetch('/api/internship', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_number: details.id_number }),
      });
      if (!res.ok) throw new Error(`Experience API error: ${res.statusText}`);
      const gptData = await res.json();
      console.log('Experience response:', gptData);
      if (gptData.suggestions) {
        const { projectRole, projectDescription, projectChallenges, leadership, isInternship } = gptData.suggestions;
        setDetails((prev) => ({
          ...prev,
          projectRole: projectRole || prev.projectRole,
          projectDescription: projectDescription || prev.projectDescription,
          projectChallenges: projectChallenges || prev.projectChallenges,
          leadership: leadership || prev.leadership,
          isInternship: isInternship,
        }));
      } else {
        setError('No experience suggestions');
        console.error('No suggestions in LLaMA response:', gptData);
      }
    } catch (err) {
      setError(`Experience fetch error: ${err.message}`);
      console.error('Experience fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handlefetchEducation = async () => {
    setIsLoading(true);
    setError(null);
    try {
      console.log('Sending id_number to /api/fetchEducation:', details.id_number);
      const res = await fetch('/api/fetchEducation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_number: details.id_number }),
      });
      if (!res.ok) throw new Error(`Education fetch error: ${res.statusText}`);
      const data = await res.json();
      console.log('Education response:', data);
      if (data.education && Array.isArray(data.education)) {
        setDetails((prev) => ({
          ...prev,
          education: data.education.length > 0 ? data.education : prev.education,
        }));
      } else {
        setError('No education data found');
        console.error('No education data in response:', data);
      }
    } catch (err) {
      setError(`Education fetch error: ${err.message}`);
      console.error('Education fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchJapaneseCompanies = async () => {
    setIsLoading(true);
    setError(null);
    try {
      console.log('Sending id_number to /api/japaneseCompanies:', details.id_number);
      const res = await fetch('/api/japaneseCompanies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_number: details.id_number }),
      });
      if (!res.ok) throw new Error(`Japanese companies API error: ${res.statusText}`);
      const gptData = await res.json();
      console.log('Japanese companies response:', gptData);
      if (gptData.suggestions) {
        const lines = gptData.suggestions.split('\n').map(line => line.trim());
        console.log('Parsed response lines:', lines);
        if (lines.length >= 2) {
          setDetails((prev) => ({
            ...prev,
            japanCompanyInterest: lines[0] || '',
            japanCompanySkills: lines[1] || '',
          }));
        } else {
          setError('Invalid Japanese companies response format');
          console.error('Expected 2 lines, got:', lines);
        }
      } else {
        setError('No Japanese companies suggestions');
        console.error('No suggestions in response:', gptData);
      }
    } catch (err) {
      setError(`Japanese companies fetch error: ${err.message}`);
      console.error('Japanese companies fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCareerDevelopment = async () => {
  setIsLoading(true);
  setError(null);
  try {
    console.log('Sending id_number to /api/careerDevelopment:', details.id_number);
    const res = await fetch('/api/careerDevelopment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id_number: details.id_number }),
    });
    if (!res.ok) throw new Error(`Career development API error: ${res.statusText}`);
    const gptData = await res.json();
    console.log('Career development response:', gptData);
    if (gptData.suggestions && gptData.suggestions.careerPriority1) {
      const { careerPriority1, careerPriority2, careerPriority3, careerRoles } = gptData.suggestions;
      const newPriorities = [careerPriority1, careerPriority2, careerPriority3].filter(p => p && p.trim());
      if (newPriorities.length < 3) {
        console.warn('Incomplete career priorities:', newPriorities);
        setError('Incomplete career priorities received');
        return;
      }
      setDetails((prev) => ({
        ...prev,
        careerPriorities: newPriorities,
        careerRoles: careerRoles || prev.careerRoles,
      }));
    } else {
      setError('No valid career development suggestions');
      console.error('Invalid suggestions:', gptData);
    }
  } catch (err) {
    setError(`Career development fetch error: ${err.message}`);
    console.error('Career development fetch error:', err);
  } finally {
    setIsLoading(false);
  }
};

  useEffect(() => {
    const encryptedId = searchParams.get('encrypted_id');
    if (encryptedId && !hasFetchedCareerData.current) {
      hasFetchedCareerData.current = true;
      setIsLoading(true);
      try {
        const secretKey = process.env.NEXT_PUBLIC_ENCRYPTION_SECRET || 'default-secure-key-32chars1234567';
        const bytes = CryptoJS.AES.decrypt(decodeURIComponent(encryptedId), secretKey);
        const idNumber = bytes.toString(CryptoJS.enc.Utf8);
        if (idNumber) {
          console.log('Selected employee ID:', idNumber);
          fetch(`/api/fetchDetails?id_number=${encodeURIComponent(idNumber)}`)
            .then((res) => {
              if (!res.ok) throw new Error(`Fetch error: ${res.statusText}`);
              return res.json();
            })
            .then((data) => {
              if (data.name) {
                console.log('Fetched name:', data.name);
                setDetails((prev) => ({
                  ...prev,
                  id_number: idNumber,
                  name: data.name,
                }));
              } else {
                setError('Employee name not found');
                console.error('No name in response:', data);
              }
            })
            .catch((err) => {
              setError(`Fetch error: ${err.message}`);
              console.error('Fetch error:', err);
            })
            .finally(() => setIsLoading(false));
        } else {
          console.error('Failed to decrypt id_number');
          setError('Invalid employee ID');
          setIsLoading(false);
        }
      } catch (err) {
        console.error('Decryption error:', err.message);
        setError('Decryption error');
        setIsLoading(false);
      }
    } else if (!encryptedId) {
      console.error('No encrypted_id in URL');
      setError('No employee ID provided');
      setIsLoading(false);
    }
  }, [searchParams]);

  const handleInputChange = (e) => {
  const { name, value, type, files } = e.target;
  console.log('Input change:', { name, type, value, files: files?.length });
  if (type === 'file') {
    const file = files[0];
    if (file && file.type === 'image/jpeg' && file.size <= 5 * 1024 * 1024) {
      setDetails((prev) => ({ ...prev, photo: file }));
    } else {
      alert('Please upload a JPEG image under 5MB');
    }
  } else {
    if (name === 'employeeNumber' && value !== '' && !/^\d+$/.test(value)) {
      alert('Employee Number must be a number');
      return;
    }
    setDetails((prev) => {
      const updatedDetails = { ...prev, [name]: value };
      console.log('Updated details:', updatedDetails); // Log state
      return updatedDetails;
    });
  }
};

  const handleArrayInputChange = (e, index, field, arrayName) => {
    const { value } = e.target;
    console.log('Array input change:', { arrayName, index, field, value });
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

 const compileResume = async () => {
  setIsLoading(true);
  setError(null);
  try {
    if (!Array.isArray(details.careerPriorities) || details.careerPriorities.length === 0) {
      console.warn('careerPriorities is invalid:', details.careerPriorities);
      setError('Career priorities are missing or invalid');
      return;
    }
    const formData = new FormData();
    formData.append('details', JSON.stringify(details));
    if (details.photo) {
      console.log('Appending photo:', details.photo.name, details.photo.size);
      formData.append('photo', details.photo);
    }
    formData.append('sessionId', sessionId);
    const response = await fetch('/api/generateResume', {
      method: 'POST',
      body: formData,
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`HTTP ${response.status}: ${errorData.error || 'Unknown error'}`);
    }
    const data = await response.json();
    console.log('Response from /api/generateResume:', data);
    if (!data.previewUrl || !data.previewUrl.startsWith('resume-') || !data.previewUrl.endsWith('.pdf')) {
      throw new Error(`Invalid preview URL: ${data.previewUrl}`);
    }
    setPreviewLink(data.previewUrl);
    setTempPdfPath(data.tempPdfPath);
    setSessionId(data.sessionId);
  } catch (err) {
    setError(`Failed to generate preview: ${err.message}`);
    console.error('Generate resume error:', err);
    setPreviewLink(null);
  } finally {
    setIsLoading(false);
  }
};
  const fetchFieldsOfInterest = async () => {
  setIsLoading(true);
  setError(null);
  try {
    console.log('Sending id_number to /api/fieldsOfInterest:', details.id_number);
    const res = await fetch('/api/fieldsOfInterest', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id_number: details.id_number }),
    });
    if (!res.ok) throw new Error(`Fields of Interest API error: ${res.statusText}`);
    const data = await res.json();
    console.log('Fields of Interest response:', data);
    if (data.suggestions) {
      const { field1, field2, field3 } = data.suggestions;
      const newFields = [field1, field2, field3].filter(Boolean);
      if (newFields.length < 3) {
        console.warn('Incomplete fields of interest:', newFields);
        setError('Incomplete fields of interest received');
        return;
      }
      setDetails((prev) => ({
        ...prev,
        interestFields: newFields, // Auto-populate inputs
      }));
    } else {
      setError('No fields of interest suggestions');
      console.error('No suggestions in response:', data);
    }
  } catch (err) {
    setError(`Fields of Interest fetch error: ${err.message}`);
    console.error('Fields of Interest fetch error:', err);
  } finally {
    setIsLoading(false);
  }
};
const fetchProductDevelopment = async () => {
    setIsLoading(true);
    setError(null);
    try {
      console.log('Sending id_number to /api/productDevelopment:', details.id_number);
      const res = await fetch('/api/productDevelopment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_number: details.id_number }),
      });
      if (!res.ok) throw new Error(`Product development API error: ${res.statusText}`);
      const data = await res.json();
      console.log('Product development response:', data);
      if (data.suggestions) {
        const { productDevReason, productDevRole } = data.suggestions;
        if (!productDevReason || !productDevRole) {
          console.warn('Incomplete product development suggestions:', data.suggestions);
          setError('Incomplete product development suggestions received');
          return;
        }
        setDetails((prev) => ({
          ...prev,
          productDevReason,
          productDevRole
        }));
      } else {
        setError('No product development suggestions');
        console.error('No suggestions in response:', data);
      }
    } catch (err) {
      setError(`Product development fetch error: ${err.message}`);
      console.error('Product development fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const saveResume = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('details', JSON.stringify(details));
      if (details.photo) {
        console.log('Appending photo for save:', details.photo.name, details.photo.size);
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
        throw new Error(`HTTP ${response.status}: ${errorData.error || 'Unknown error'}`);
      }
      const data = await response.json();
      alert(`Resume saved successfully! Access it here: ${data.resumeLink}`);
      setPreviewLink(data.resumeLink.replace('/view', '/preview').split('/temp/')[1]);
      setTempPdfPath(null);
    } catch (err) {
      setError(`Failed to save resume: ${err.message}`);
      console.error('Save resume error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex flex-col md:flex-row h-screen p-4 gap-6 overflow-hidden">
      {isLoading && <Loader />}
      <div className="w-full md:w-1/2 bg-white p-6 rounded-lg shadow-md overflow-y-auto h-full">
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
          details={details} 
          handleInputChange={handleInputChange} 
          fetchInternshipExperience={fetchInternshipExperience}
          isLoading={isLoading}
        />
        <ProductDevelopment 
        details={details} 
        handleInputChange={handleInputChange}
        fetchProductDevelopment={fetchProductDevelopment}
        isLoading={isLoading}
        error={error} 
        />
        <FieldsOfInterest
          details={details}
          handleArrayInputChange={handleArrayInputChange}
          isLoading={isLoading}
          error={error}
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
          details={details}
          handleInputChange={handleInputChange}
          handleArrayInputChange={handleArrayInputChange}
          fetchCareerDevelopment={fetchCareerDevelopment}
          isLoading={isLoading}
        />
        <JLPTExperience
          details={details}
          handleInputChange={handleInputChange}
          setDetails={setDetails}
          isLoading={isLoading}
          error={error}
          setError={setError}
          setIsLoading={setIsLoading}
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
          {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
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