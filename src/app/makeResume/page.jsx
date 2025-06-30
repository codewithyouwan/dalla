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

const defaultDetails = {
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
  interestDetails: 'Interested in ML',
  japanCompanyInterest: 'Technology',
  japanCompanySkills: 'Work Culture',
  careerPriorities: ['Growth', 'Impact', 'Balance'],
  careerRoles: 'Project Manager',
  japaneseLevel: 'N3',
  personality: 'Diligent',
  selectedSuggestion: 'Studying for N3',
  photo: null,
};

export default function Page() {
  const [details, setDetails] = useState(defaultDetails);
  const [jlptScores, setJlptScores] = useState({
    total: '',
    vocabulary: '',
    reading: '',
    listening: '',
  });
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
        preferred_industry: details.preferred_industry || [],
        job_role_priority_1: details.job_role_priority_1 || '',
        future_career_goals: details.future_career_goals || [],
        work_style_preference: details.work_style_preference || [],
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
        const form2Match = gptData.suggestions.match(/===FORM2-START===\n([\s\S]*?)\n===FORM2-END===/);
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
            setError('Invalid career aspirations response format: Insufficient lines');
            console.error('Expected 4 lines, got:', lines);
          }
        } else {
          setError('Failed to parse career aspirations response: FORM2 not found');
          console.error('No FORM2 in response:', gptData.suggestions);
        }
      } else {
        setError('Failed to generate career aspirations: No suggestions in response');
        console.error('No suggestions in GPT response:', gptData);
      }
    } catch (err) {
      setError(`Career aspirations fetch error: ${err.message}`);
      console.error('Career aspirations fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const encryptedId = searchParams.get('encrypted_id');
    if (encryptedId && !hasFetchedCareerData.current) {
      hasFetchedCareerData.current = true;
      try {
        const secretKey = process.env.NEXT_PUBLIC_ENCRYPTION_SECRET || 'default-secure-key-32chars1234567';
        const bytes = CryptoJS.AES.decrypt(decodeURIComponent(encryptedId), secretKey);
        const idNumber = bytes.toString(CryptoJS.enc.Utf8);
        if (idNumber) {
          console.log('Selected employee ID:', idNumber);
          setIsLoading(true);
          fetch(`/api/fetchDetails?id_number=${encodeURIComponent(idNumber)}`)
            .then((res) => {
              if (!res.ok) throw new Error(`Fetch error: ${res.statusText}`);
              return res.json();
            })
            .then((data) => {
              if (data.employee) {
                console.log('Employee data fetched:', data.employee);
                const careerFields = {
                  preferred_industry: data.employee.preferred_industry || [],
                  job_role_priority_1: data.employee.job_role_priority_1 || '',
                  future_career_goals: data.employee.future_career_goals || [],
                  work_style_preference: data.employee.work_style_preference || [],
                };
                console.log('Validated career fields:', careerFields);
                const hasValidCareerData = Object.values(careerFields).some(
                  (value) => (Array.isArray(value) && value.length > 0) || (typeof value === 'string' && value.trim() !== '')
                );
                if (!hasValidCareerData) {
                  console.warn('Career data is empty or invalid:', careerFields);
                  setError('No valid career aspiration data available for this employee');
                  setIsLoading(false);
                  return;
                }
                setDetails((prev) => ({
                  ...prev,
                  employeeNumber: data.employee.id_number || '',
                  name: data.employee.full_name_english || '',
                  japaneseLevel: data.employee.japanese_jlpt_level || 'N/A',
                  preferred_industry: careerFields.preferred_industry,
                  job_role_priority_1: careerFields.job_role_priority_1,
                  future_career_goals: careerFields.future_career_goals,
                  work_style_preference: careerFields.work_style_preference,
                }));
              } else {
                setError('Employee not found');
                console.error('No employee data in response:', data);
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
    console.log('Input change triggered:', { name, type, value });
    if (type === 'file') {
      const file = files[0];
      if (file && file.type === 'image/jpeg' && file.size <= 5 * 1024 * 1024) {
        setDetails((prev) => ({ ...prev, photo: file }));
      } else {
        alert('Please upload a JPEG image under 5MB');
      }
    } else if (name in jlptScores) {
      setJlptScores((prev) => ({ ...prev, [name]: value }));
    } else {
      setDetails((prev) => ({ ...prev, [name]: value }));
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
      const formData = new FormData();
      const resumeDetails = { ...details, photo: null };
      formData.append('details', JSON.stringify(resumeDetails));
      if (details.photo) {
        formData.append('photo', details.photo);
      }
      formData.append('sessionId', sessionId);
      const response = await fetch('/api/generateResume', {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) {
        const text = await response.text();
        throw new Error(`HTTP ${response.status}: ${text}`);
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
      setPreviewLink(null);
    } finally {
      setIsLoading(false);
    }
  };

  const saveResume = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      const resumeDetails = { ...details, photo: null };
      formData.append('details', JSON.stringify(resumeDetails));
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
        const text = await response.text();
        throw new Error(`HTTP ${response.status}: ${text}`);
      }
      const data = await response.json();
      alert(`Resume saved successfully! Access it here: ${data.resumeLink}`);
      setPreviewLink(data.resumeLink.replace('/view', '/preview').split('/temp/')[1]);
      setTempPdfPath(null);
    } catch (err) {
      setError(`Failed to save resume: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-screen p-4 gap-6 overflow-hidden">
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
        />
        <LanguagesAndTools details={details} handleInputChange={handleInputChange} />
        <Projects details={details} handleInputChange={handleInputChange} />
        <ProductDevelopment details={details} handleInputChange={handleInputChange} />
        <FieldsOfInterest
          interestFields={details.interestFields}
          interestDetails={details.interestDetails}
          handleInputChange={handleInputChange}
          handleArrayInputChange={handleArrayInputChange}
        />
        <JapaneseCompanies details={details} handleInputChange={handleInputChange} />
        <CareerDevelopment
          careerPriorities={details.careerPriorities}
          details={details}
          handleInputChange={handleInputChange}
          handleArrayInputChange={handleArrayInputChange}
        />
        <JLPTExperience
          jlptScores={jlptScores}
          handleInputChange={handleInputChange}
          isLoading={isLoading}
          error={error}
          setSuggestions={setSuggestions}
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
          {error && <p className="mt-2 text-red-600 text-sm">{error}</p>}
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