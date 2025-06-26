'use client';

import '../../../node_modules/react-easy-crop/react-easy-crop.css';
import { useState, useEffect, useRef } from 'react';
import Split from '../helper/split';
import { v4 as uuidv4 } from 'uuid';
import Cropper from 'react-easy-crop';
import { getCroppedImg } from '../helper/ImageCrop/cropUtils';

const defaultDetails = {
  employeeNumber: '',
  name: 'Test User',
  devField: 'Product Development',
  jobType: 'Engineer',
  domain: 'Data Science',
  type: 'Specialist',
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
  const [photoPreview, setPhotoPreview] = useState(null);
  const [previewLink, setPreviewLink] = useState(null);
  const [tempPdfPath, setTempPdfPath] = useState(null);
  const [sessionId, setSessionId] = useState(uuidv4());
  const [showCropper, setShowCropper] = useState(false);
  const [imageToCrop, setImageToCrop] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const previewCanvasRef = useRef(null);

  useEffect(() => {
    if (details.photo) {
      const objectUrl = URL.createObjectURL(details.photo);
      setPhotoPreview(objectUrl);
      console.log('Photo preview set:', objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    } else {
      setPhotoPreview(null);
      console.log('Photo preview cleared');
    }
  }, [details.photo]);

  useEffect(() => {
    console.log('Current previewLink:', previewLink);
    if (previewLink && !previewLink.startsWith('resume-') && !previewLink.endsWith('.pdf')) {
      console.warn('Invalid previewLink detected, resetting:', previewLink);
      setPreviewLink(null);
    }
  }, [previewLink]);

  useEffect(() => {
    if (showCropper && imageToCrop) {
      console.log('Cropper rendered');
    }
  }, [showCropper, imageToCrop]);

  const handleInputChange = (e) => {
    const { name, value, type, files } = e.target;
    console.log('Input change triggered:', { name, type, files });
    if (type === 'file') {
      const file = files[0];
      if (file && file.type === 'image/jpeg' && file.size <= 5 * 1024 * 1024) {
        const reader = new FileReader();
        reader.onload = (e) => {
          console.log('File loaded as data URL');
          setImageToCrop(e.target.result);
          setShowCropper(true);
          setZoom(1);
        };
        reader.readAsDataURL(file);
      } else {
        alert('Please upload a JPEG image under 5MB');
      }
    } else if (name in jlptScores) {
      setJlptScores((prev) => ({ ...prev, [name]: value }));
    } else {
      setDetails((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleRemovePhoto = () => {
    console.log('Remove photo clicked');
    setDetails((prev) => ({ ...prev, photo: null }));
    setPhotoPreview(null);
    setImageToCrop(null);
    setShowCropper(false);
  };

  const onCropComplete = (croppedArea, croppedAreaPixels) => {
    console.log('Crop complete:', croppedAreaPixels);
    setCroppedAreaPixels(croppedAreaPixels);
  };

  const handleCrop = async () => {
    console.log('Crop button clicked');
    try {
      const croppedImage = await getCroppedImg(imageToCrop, croppedAreaPixels, 'jpeg');
      const croppedFile = new File([croppedImage], 'cropped-photo.jpg', { type: 'image/jpeg' });
      
      // Verify image dimensions
      const img = new Image();
      img.src = URL.createObjectURL(croppedFile);
      await new Promise((resolve) => (img.onload = resolve));
      if (img.width !== 280 || img.height !== 360) {
        throw new Error(`Cropped image dimensions are ${img.width}x${img.height}, expected 280x360`);
      }

      setDetails((prev) => ({ ...prev, photo: croppedFile }));
      setShowCropper(false);
      setImageToCrop(null);
      setZoom(1);
    } catch (err) {
      console.error('Error cropping image:', err);
      alert('Failed to crop image. Please try again.');
    }
  };

  const handleCancelCrop = () => {
    console.log('Cancel button clicked');
    setShowCropper(false);
    setImageToCrop(null);
    setZoom(1);
  };

  const handleZoomChange = (e) => {
    const newZoom = parseFloat(e.target.value);
    setZoom(newZoom);
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

  const handleRefresh = async () => {
    await compileResume();
  };

  return (
    <div className="flex flex-col md:flex-row h-screen p-4 gap-6 overflow-hidden">
      {/* Left side - Form */}
      <div className="w-full md:w-1/2 bg-white p-6 rounded-lg shadow-md overflow-y-auto h-full">
        <h1 className="text-2xl text-black font-bold mb-6">履歴書ビルダー / Resume Builder</h1>

        {/* Personal Information */}
        <div className="mb-8">
          <h2 className="text-xl text-black font-semibold mb-3">個人情報 / Personal Information</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">社員番号 / Employee Number</label>
              <input
                type="text"
                name="employeeNumber"
                value={details.employeeNumber}
                onChange={handleInputChange}
                className="mt-1 block text-black w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
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
                accept="image/jpeg"
                onChange={handleInputChange}
                className="mt-1 block w-full text-black"
              />
              {photoPreview && !showCropper && (
                <div className="mt-2 flex items-center gap-2">
                  <img src={photoPreview} alt="Photo Preview" className="max-w-[140px] h-auto border" />
                  <button
                    onClick={handleRemovePhoto}
                    className="px-2 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm"
                  >
                    Remove
                  </button>
                </div>
              )}
              {showCropper && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                  <div className="bg-white p-4 rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
                    <h3 className="text-lg font-medium text-black mb-2">Crop Image to 280x360 pixels</h3>
                    <div className="relative" style={{ height: '60vh', width: '100%' }}>
                      <Cropper
                        image={imageToCrop}
                        crop={crop}
                        zoom={zoom}
                        aspect={280 / 360}
                        onCropChange={setCrop}
                        onZoomChange={setZoom}
                        onCropComplete={onCropComplete}
                        minZoom={0.5}
                        maxZoom={3}
                        cropSize={{ width: 280, height: 360 }}
                        style={{ containerStyle: { height: '100%', width: '100%' } }}
                      />
                    </div>
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700">Zoom</label>
                      <input
                        type="range"
                        min="0.5"
                        max="3"
                        step="0.1"
                        value={zoom}
                        onChange={handleZoomChange}
                        className="w-full"
                      />
                    </div>
                    <canvas ref={previewCanvasRef} style={{ display: 'none' }} />
                    <div className="flex justify-end gap-2 mt-4">
                      <button
                        onClick={handleCancelCrop}
                        className="px-4 py-2 bg-gray-300 text-black rounded-md hover:bg-gray-400"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleCrop}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                      >
                        Crop Image
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Career Aspirations */}
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

        {/* Education */}
        <div className="mb-8">
          <h2 className="text-xl text-black font-semibold mb-3">学歴 / Education</h2>
          {details.education.map((edu, index) => (
            <div key={index} className="space-y-4 mb-4 border-b pb-4 relative">
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
              {details.education.length > 1 && (
                <button
                  onClick={() => removeEducation(index)}
                  className="absolute top-0 right-0 text-red-600 hover:text-red-800 p-1"
                  title="Delete this education entry"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </button>
              )}
            </div>
          ))}
          <button
            onClick={addEducation}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            学歴を追加 / Add Education
          </button>
        </div>

        {/* Languages and Tools */}
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

        {/* Projects */}
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

        {/* Product Development */}
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

        {/* Fields of Interest */}
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

        {/* Japanese Companies */}
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

        {/* Career Development */}
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

        {/* JLPT Experience */}
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
            disabled={isLoading}
            className={`px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isLoading ? '保存中... / Saving...' : '履歴書を保存 / Save Resume'}
          </button>
          {error && <p className="mt-2 text-red-600 text-sm">{error}</p>}
        </div>
      </div>

      {/* Right side - Preview */}
      <div className="w-full md:w-1/2 bg-white p-6 rounded-lg shadow-md overflow-y-auto h-full">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl text-black font-bold">履歴書プレビュー / Resume Preview</h1>
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className={`px-4 py-2 rounded-md text-white ${isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
          >
            {isLoading ? 'Compiling...' : 'Refresh'}
          </button>
        </div>
        <div className="border border-gray-300 rounded-md h-[calc(100%-4rem)]">
          {isLoading ? (
            <div className="flex justify-center items-center h-full">
              <p className="text-gray-600">Compiling resume...</p>
            </div>
          ) : previewLink && previewLink.startsWith('resume-') && previewLink.endsWith('.pdf') ? (
            <iframe
              src={`/api/serveTemp?path=${previewLink}`}
              className="w-full h-full border-none"
              title="Resume Preview"
            />
          ) : (
            <div className="flex justify-center items-center h-full flex-col">
              <p className="text-gray-600">Preview will appear here after compilation.</p>
              {previewLink && <p className="text-red-600 text-sm mt-2">Invalid preview URL: {previewLink}</p>}
              {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}