'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import Split from '../helper/split';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function MakeResume() {
  const [details, setDetails] = useState({
    name: '',
    photo: null,
    devField: '',
    jobType: '',
    domain: '',
    type: '',
    education: [{ year: '', institution: '', degree: '' }],
    languages: '',
    devTools: '',
    projectRole: '',
    projectDescription: '',
    projectChallenges: '',
    leadership: '',
    productDevReason: '',
    productDevRole: '',
    interestFields: ['', '', ''],
    interestDetails: '',
    japanCompanyInterest: '',
    japanCompanySkills: '',
    careerPriorities: ['', '', ''],
    careerRoles: '',
    japaneseLevel: '',
    personality: '',
  });
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
  const [photoPreview, setPhotoPreview] = useState(null);

  // Retrieve and parse extracted text
  useEffect(() => {
    const extractedText = localStorage.getItem('extractedResumeText');
    if (extractedText) {
      const nameMatch = extractedText.match(/Name:\s*([^\n]+)/i) || extractedText.match(/^[A-Za-z\s]+(?=\n)/);
      const educationMatch = extractedText.match(/Education[\s\S]*?(?=\n\n|\n[A-Z])/i);
      const experienceMatch = extractedText.match(/(Experience|Work)[\s\S]*?(?=\n\n|\n[A-Z])/i);
      const skillsMatch = extractedText.match(/Skills[\s\S]*?(?=\n\n|\n[A-Z])/i);

      setDetails((prev) => ({
        ...prev,
        name: nameMatch ? nameMatch[1]?.trim() : '',
        education: educationMatch
          ? [{ year: '', institution: educationMatch[0]?.trim(), degree: '' }]
          : prev.education,
        projectDescription: experienceMatch ? experienceMatch[0]?.trim() : '',
        languages: skillsMatch ? skillsMatch[0]?.match(/Languages:\s*([^\n]+)/i)?.[1]?.trim() : '',
        devTools: skillsMatch ? skillsMatch[0]?.match(/Tools:\s*([^\n]+)/i)?.[1]?.trim() : '',
      }));
    }
  }, []);

  // Update photo preview when a new photo is selected
  useEffect(() => {
    if (details.photo) {
      const objectUrl = URL.createObjectURL(details.photo);
      setPhotoPreview(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    } else {
      setPhotoPreview(null);
    }
  }, [details.photo]);

  const handleInputChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === 'file') {
      setDetails((prev) => ({ ...prev, [name]: files[0] }));
    } else if (name in jlptScores) {
      setJlptScores((prev) => ({ ...prev, [name]: value }));
    } else {
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

  const generateSuggestions = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/grok3', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(jlptScores),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to generate suggestions');

      const content = data.suggestions;
      const forms = Split(content);
      const finalForms = forms.length > 0 ? forms.slice(0, 3) : [content];

      setSuggestions(finalForms.map((form) => form.trim()));
      setSelectedSuggestion('');
      setSelectedIndex(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const selectSuggestion = (suggestion, index) => {
    setSelectedSuggestion(suggestion);
    setSelectedIndex(index);
  };

  const saveResume = async () => {
    try {
      const formData = new FormData();
      formData.append('details', JSON.stringify({ ...details, photo: null, selectedSuggestion }));
      if (details.photo) {
        formData.append('photo', details.photo);
      }

      const response = await fetch('/api/generate-resume', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to generate resume');

      alert('Resume saved successfully!');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen p-4 gap-6">
      {/* Left side - Form */}
      <div className="w-full md:w-1/2 bg-white p-6 rounded-lg shadow-md overflow-y-auto">
        <h1 className="text-2xl text-black font-bold mb-6">履歴書ビルダー / Resume Builder</h1>

        {/* 1. Personal Information */}
        <div className="mb-8">
          <h2 className="text-xl text-black font-semibold mb-3">個人情報 / Personal Information</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">名前 / Name</label>
              <input
                type="text"
                name="name"
                value={details.name}
                onChange={handleInputChange}
                className="mt-1 block text-black w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">プロフィール写真 / Profile Photo (Optional)</label>
              <input
                type="file"
                name="photo"
                accept="image/*"
                onChange={handleInputChange}
                className="mt-1 block w-full text-black"
              />
            </div>
          </div>
        </div>

        {/* 2. Career Aspirations */}
        <div className="mb-8">
          <h2 className="text-xl text-black font-semibold mb-3">志向 / Career Aspirations</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">開発分野 / Development Field</label>
              <input
                type="text"
                name="devField"
                value={details.devField}
                onChange={handleInputChange}
                className="mt-1 block text-black w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">職種 / Job Type</label>
              <input
                type="text"
                name="jobType"
                value={details.jobType}
                onChange={handleInputChange}
                className="mt-1 block text-black w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">領域 / Domain</label>
              <input
                type="text"
                name="domain"
                value={details.domain}
                onChange={handleInputChange}
                className="mt-1 block text-black w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">タイプ / Type</label>
              <input
                type="text"
                name="type"
                value={details.type}
                onChange={handleInputChange}
                className="mt-1 block text-black w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* 3. Education */}
        <div className="mb-8">
          <h2 className="text-xl text-black font-semibold mb-3">学歴 / Education</h2>
          {details.education.map((edu, index) => (
            <div key={index} className="space-y-4 mb-4 border-b pb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">年 / Year</label>
                <input
                  type="text"
                  value={edu.year}
                  onChange={(e) => handleArrayInputChange(e, index, 'year', 'education')}
                  className="mt-1 block text-black w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">機関 / Institution</label>
                <input
                  type="text"
                  value={edu.institution}
                  onChange={(e) => handleArrayInputChange(e, index, 'institution', 'education')}
                  className="mt-1 block text-black w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">学位 / Degree</label>
                <input
                  type="text"
                  value={edu.degree}
                  onChange={(e) => handleArrayInputChange(e, index, 'degree', 'education')}
                  className="mt-1 block text-black w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
            </div>
          ))}
          <button
            onClick={addEducation}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            学歴を追加 / Add Education
          </button>
        </div>

        {/* 4. Languages and Tools */}
        <div className="mb-8">
          <h2 className="text-xl text-black font-semibold mb-3">言語/開発ツール / Languages & Tools</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">言語 / Languages</label>
              <input
                type="text"
                name="languages"
                value={details.languages}
                onChange={handleInputChange}
                className="mt-1 block text-black w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">開発ツール / Development Tools</label>
              <textarea
                name="devTools"
                value={details.devTools}
                onChange={handleInputChange}
                className="mt-1 block text-black w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                rows="3"
              />
            </div>
          </div>
        </div>

        {/* 5. Projects */}
        <div className="mb-8">
          <h2 className="text-xl text-black font-semibold mb-3">プロジェクト / Projects</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">担当した役割 / Role</label>
              <input
                type="text"
                name="projectRole"
                value={details.projectRole}
                onChange={handleInputChange}
                className="mt-1 block text-black w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">具体的な内容 / Description</label>
              <textarea
                name="projectDescription"
                value={details.projectDescription}
                onChange={handleInputChange}
                className="mt-1 block text-black w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                rows="5"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">直面した課題 / Challenges</label>
              <textarea
                name="projectChallenges"
                value={details.projectChallenges}
                onChange={handleInputChange}
                className="mt-1 block text-black w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                rows="3"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">リーダー経験 / Leadership Experience</label>
              <input
                type="text"
                name="leadership"
                value={details.leadership}
                onChange={handleInputChange}
                className="mt-1 block text-black w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* 6. Product Development */}
        <div className="mb-8">
          <h2 className="text-xl text-black font-semibold mb-3">製品開発について / Product Development</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">興味を持つ理由 / Reason for Interest</label>
              <textarea
                name="productDevReason"
                value={details.productDevReason}
                onChange={handleInputChange}
                className="mt-1 block text-black w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                rows="3"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">果たしたい役割 / Desired Role</label>
              <textarea
                name="productDevRole"
                value={details.productDevRole}
                onChange={handleInputChange}
                className="mt-1 block text-black w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                rows="3"
              />
            </div>
          </div>
        </div>

        {/* 7. Fields of Interest */}
        <div className="mb-8">
          <h2 className="text-xl text-black font-semibold mb-3">興味ある分野 / Fields of Interest</h2>
          <div className="space-y-4">
            {details.interestFields.map((field, index) => (
              <div key={index}>
                <label className="block text-sm font-medium text-gray-700">分野 {index + 1} / Field {index + 1}</label>
                <input
                  type="text"
                  value={field}
                  onChange={(e) => handleArrayInputChange(e, index, 'value', 'interestFields')}
                  className="mt-1 block text-black w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
            ))}
            <div>
              <label className="block text-sm font-medium text-gray-700">詳細 / Additional Details</label>
              <textarea
                name="interestDetails"
                value={details.interestDetails}
                onChange={handleInputChange}
                className="mt-1 block text-black w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                rows="3"
              />
            </div>
          </div>
        </div>

        {/* 8. Japanese Companies */}
        <div className="mb-8">
          <h2 className="text-xl text-black font-semibold mb-3">日本企業について / Japanese Companies</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">一番興味がある点 / Most Interesting Aspect</label>
              <input
                type="text"
                name="japanCompanyInterest"
                value={details.japanCompanyInterest}
                onChange={handleInputChange}
                className="mt-1 block text-black w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">習得したいこと / Skills to Acquire</label>
              <input
                type="text"
                name="japanCompanySkills"
                value={details.japanCompanySkills}
                onChange={handleInputChange}
                className="mt-1 block text-black w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* 9. Career Development */}
        <div className="mb-8">
          <h2 className="text-xl text-black font-semibold mb-3">キャリアアップについて / Career Development</h2>
          <div className="space-y-4">
            {details.careerPriorities.map((priority, index) => (
              <div key={index}>
                <label className="block text-sm font-medium text-gray-700">優先要素 {index + 1} / Priority {index + 1}</label>
                <input
                  type="text"
                  value={priority}
                  onChange={(e) => handleArrayInputChange(e, index, 'value', 'careerPriorities')}
                  className="mt-1 block text-black w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
            ))}
            <div>
              <label className="block text-sm font-medium text-gray-700">興味ある役割 / Desired Roles</label>
              <input
                type="text"
                name="careerRoles"
                value={details.careerRoles}
                onChange={handleInputChange}
                className="mt-1 block text-black w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">日本語レベル / Japanese Level</label>
              <textarea
                name="japaneseLevel"
                value={details.japaneseLevel}
                onChange={handleInputChange}
                className="mt-1 block text-black w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                rows="3"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">性格 / Personality</label>
              <input
                type="text"
                name="personality"
                value={details.personality}
                onChange={handleInputChange}
                className="mt-1 block text-black w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* 10. JLPT Experience */}
        <div className="mb-8">
          <h2 className="text-xl text-black font-semibold mb-3">JLPT経験 / JLPT Experience</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">総合スコア / Total Score (out of 180)</label>
              <input
                type="number"
                name="total"
                value={jlptScores.total}
                onChange={handleInputChange}
                className="mt-1 block text-black w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">語彙スコア / Vocabulary Score</label>
              <input
                type="number"
                name="vocabulary"
                value={jlptScores.vocabulary}
                onChange={handleInputChange}
                className="mt-1 block text-black w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">読解スコア / Reading Score</label>
              <input
                type="number"
                name="reading"
                value={jlptScores.reading}
                onChange={handleInputChange}
                className="mt-1 block text-black w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">聴解スコア / Listening Score</label>
              <input
                type="number"
                name="listening"
                value={jlptScores.listening}
                onChange={handleInputChange}
                className="mt-1 block text-black w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
            <div>
              <button
                onClick={generateSuggestions}
                disabled={isLoading}
                className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
              >
                {isLoading ? '生成中... / Generating...' : '提案を生成 / Generate Suggestions'}
              </button>
              {error && <p className="mt-2 text-red-600 text-sm">{error}</p>}
            </div>
          </div>
        </div>

        {/* Japanese Suggestions Section */}
        {suggestions.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg text-black font-medium mb-2">選択肢 / Choose a Japanese Description:</h3>
            <div className="space-y-4">
              {suggestions.map((suggestion, index) => {
                const formLabels = ['Form 1 (最長 / Longest)', 'Form 2 (短め / Shorter)', 'Form 3 (最短 / Shortest)'];
                const formLabel = formLabels[index] || `Form ${index + 1}`;
                return (
                  <div
                    key={index}
                    onClick={() => selectSuggestion(suggestion, index)}
                    className={`p-4 border text-black rounded-md cursor-pointer transition-all hover:border-blue-500 ${
                      selectedIndex === index ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                    }`}
                  >
                    <div className="flex items-center mb-2">
                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center mr-2 ${
                          selectedIndex === index ? 'bg-blue-500 text-white' : 'bg-gray-200'
                        }`}
                      >
                        {selectedIndex === index && (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-3 w-3"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                      </div>
                      <h4 className="font-medium">{formLabel}</h4>
                    </div>
                    <div className="whitespace-pre-line text-sm">{suggestion}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Save Resume */}
        <div className="mb-8">
          <button
            onClick={saveResume}
            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
          >
            履歴書を保存 / Save Resume
          </button>
        </div>
      </div>

      {/* Right side - Preview */}
      <div className="w-full md:w-1/2 bg-white p-6 rounded-lg shadow-md overflow-y-auto">
        <h1 className="text-2xl text-black font-bold mb-6">履歴書プレビュー / Resume Preview</h1>
        <div className="text-black p-4 rounded whitespace-pre-line font-sans">
          <table className="w-full border-collapse border border-gray-300">
            <tbody>
              <tr>
                <td className="border border-gray-300 p-2 text-center font-bold w-12">No.</td>
                <td className="border border-gray-300 p-2 text-center font-bold" colSpan="2">2407039</td>
                <td className="border border-gray-300 p-2 w-24">
                  {photoPreview && (
                    <img src={photoPreview} alt="Profile" className="w-12 h-12 object-cover" />
                  )}
                </td>
              </tr>
              <tr>
                <td className="border border-gray-300 p-2 text-center font-bold">氏名</td>
                <td className="border border-gray-300 p-2 text-center font-bold" colSpan="2">{details.name || '未入力 / Not entered'}</td>
                <td className="border border-gray-300"></td>
              </tr>
              <tr>
                <td className="border border-gray-300 p-2 text-center font-bold" rowSpan="4">志向</td>
                <td className="border border-gray-300 p-2 font-medium w-32">開発分野</td>
                <td className="border border-gray-300 p-2">{details.devField || '未入力 / Not entered'}</td>
                <td className="border border-gray-300"></td>
              </tr>
              <tr>
                <td className="border border-gray-300 p-2 font-medium">職種</td>
                <td className="border border-gray-300 p-2">{details.jobType || '未入力 / Not entered'}</td>
                <td className="border border-gray-300"></td>
              </tr>
              <tr>
                <td className="border border-gray-300 p-2 font-medium">領域</td>
                <td className="border border-gray-300 p-2">{details.domain || '未入力 / Not entered'}</td>
                <td className="border border-gray-300"></td>
              </tr>
              <tr>
                <td className="border border-gray-300 p-2 font-medium">タイプ</td>
                <td className="border border-gray-300 p-2">{details.type || '未入力 / Not entered'}</td>
                <td className="border border-gray-300"></td>
              </tr>
              {details.education.map((edu, index) => (
                <tr key={index}>
                  {index === 0 && (
                    <td className="border border-gray-300 p-2 text-center font-bold" rowSpan={details.education.length}>学歴</td>
                  )}
                  <td className="border border-gray-300 p-2 font-medium">{edu.year || '未入力 / Not entered'}</td>
                  <td className="border border-gray-300 p-2">{edu.institution || '未入力 / Not entered'}</td>
                  <td className="border border-gray-300 p-2">{edu.degree || '未入力 / Not entered'}</td>
                </tr>
              ))}
              <tr className="bg-gray-100">
                <td className="border border-gray-300 p-2 text-center font-bold" colSpan="4">言語/開発ツール</td>
              </tr>
              <tr>
                <td className="border border-gray-300 p-2 text-center font-medium" colSpan="2">言語</td>
                <td className="border border-gray-300 p-2" colSpan="2">{details.languages || '未入力 / Not entered'}</td>
              </tr>
              <tr>
                <td className="border border-gray-300 p-2 text-center font-medium" colSpan="2">開発ツール</td>
                <td className="border border-gray-300 p-2" colSpan="2">{details.devTools || '未入力 / Not entered'}</td>
              </tr>
              <tr className="bg-green-100">
                <td className="border border-gray-300 p-2 text-center font-bold" colSpan="4">プロジェクト（大学のコースの一部）</td>
              </tr>
              <tr>
                <td className="border border-gray-300 p-2 text-center font-medium" colSpan="2">担当した役割</td>
                <td className="border border-gray-300 p-2" colSpan="2">{details.projectRole || '未入力 / Not entered'}</td>
              </tr>
              <tr>
                <td className="border border-gray-300 p-2 text-center font-medium" colSpan="2">具体的な内容</td>
                <td className="border border-gray-300 p-2" colSpan="2">{details.projectDescription || '未入力 / Not entered'}</td>
              </tr>
              <tr>
                <td className="border border-gray-300 p-2 text-center font-medium" colSpan="2">直面した課題</td>
                <td className="border border-gray-300 p-2" colSpan="2">{details.projectChallenges || '未入力 / Not entered'}</td>
              </tr>
              <tr>
                <td className="border border-gray-300 p-2 text-center font-medium" colSpan="2">リーダー経験</td>
                <td className="border border-gray-300 p-2" colSpan="2">{details.leadership || '未入力 / Not entered'}</td>
              </tr>
              <tr className="bg-yellow-100">
                <td className="border border-gray-300 p-2 text-center font-bold" colSpan="4">製品開発について</td>
              </tr>
              <tr>
                <td className="border border-gray-300 p-2 text-center font-medium" colSpan="2">興味を持つ理由</td>
                <td className="border border-gray-300 p-2" colSpan="2">{details.productDevReason || '未入力 / Not entered'}</td>
              </tr>
              <tr>
                <td className="border border-gray-300 p-2 text-center font-medium" colSpan="2">果たしたい役割</td>
                <td className="border border-gray-300 p-2" colSpan="2">{details.productDevRole || '未入力 / Not entered'}</td>
              </tr>
              <tr className="bg-blue-100">
                <td className="border border-gray-300 p-2 text-center font-bold" colSpan="4">興味ある分野（左から1番〜3番）</td>
              </tr>
              <tr>
                <td className="border border-gray-300 p-2" colSpan="4">{details.interestFields.join('  ') || '未入力 / Not entered'}</td>
              </tr>
              <tr>
                <td className="border border-gray-300 p-2 text-center font-medium" colSpan="2">その他詳細</td>
                <td className="border border-gray-300 p-2" colSpan="2">{details.interestDetails || '未入力 / Not entered'}</td>
              </tr>
              <tr className="bg-pink-100">
                <td className="border border-gray-300 p-2 text-center font-bold" colSpan="4">日本企業について</td>
              </tr>
              <tr>
                <td className="border border-gray-300 p-2 text-center font-medium" colSpan="2">一番興味がある点</td>
                <td className="border border-gray-300 p-2" colSpan="2">{details.japanCompanyInterest || '未入力 / Not entered'}</td>
              </tr>
              <tr>
                <td className="border border-gray-300 p-2 text-center font-medium" colSpan="2">習得したいこと</td>
                <td className="border border-gray-300 p-2" colSpan="2">{details.japanCompanySkills || '未入力 / Not entered'}</td>
              </tr>
              <tr className="bg-purple-100">
                <td className="border border-gray-300 p-2 text-center font-bold" colSpan="4">キャリアアップについて</td>
              </tr>
              <tr>
                <td className="border border-gray-300 p-2 text-center font-medium" colSpan="2">3大優先要素</td>
                <td className="border border-gray-300 p-2" colSpan="2">{details.careerPriorities.join(', ') || '未入力 / Not entered'}</td>
              </tr>
              <tr>
                <td className="border border-gray-300 p-2 text-center font-medium" colSpan="2">興味ある役割</td>
                <td className="border border-gray-300 p-2" colSpan="2">{details.careerRoles || '未入力 / Not entered'}</td>
              </tr>
              <tr>
                <td className="border border-gray-300 p-2 text-center font-medium" colSpan="2">日本語レベル</td>
                <td className="border border-gray-300 p-2" colSpan="2">{selectedSuggestion || details.japaneseLevel || '未入力 / Not entered'}</td>
              </tr>
              <tr>
                <td className="border border-gray-300 p-2 text-center font-medium" colSpan="2">性格</td>
                <td className="border border-gray-300 p-2" colSpan="2">{details.personality || '未入力 / Not entered'}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="text-black italic mt-4">
          {!details.name && !selectedSuggestion && !photoPreview && 'フォームに入力すると履歴書プレビューがここに表示されます。 / Your resume preview will appear as you fill out the form.'}
        </div>
      </div>
    </div>
  );
}