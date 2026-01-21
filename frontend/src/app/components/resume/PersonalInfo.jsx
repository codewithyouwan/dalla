import { useState, useEffect, useRef } from 'react';
import Cropper from 'react-easy-crop';
import { getCroppedImg } from '../../helper/ImageCrop/cropUtils';
import DeleteButton from '../buttons/DeleteButton';
import UndoButton from '../buttons/UndoButton';
import { set } from 'date-fns';

export default function PersonalInfo({ 
  details, handleInputChange, fetchPersonalDetails, isLoading, 
  setDetails, newDetails, setNewDetails, prevDetails, setPrevDetails
}) {
  const [photoPreview, setPhotoPreview] = useState(null);
  const [showCropper, setShowCropper] = useState(false);
  const [imageToCrop, setImageToCrop] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);
  const previewCanvasRef = useRef(null);

// In PersonalInfo.jsx
useEffect(() => {
  console.log('Photo State:', {
    hasFile: !!details.photo,
    photo_url: details.photo_url,
    fallbackPhoto: details.fallbackPhoto,
    preview: photoPreview
  });
}, [details.photo, details.photo_url, details.fallbackPhoto, photoPreview]);
// In PersonalInfo.jsx – useEffect
useEffect(() => {
  let previewUrl = null;

  if (details.photo) {
    const objectUrl = URL.createObjectURL(details.photo);
    previewUrl = objectUrl;
    setPhotoPreview(previewUrl);
    return () => URL.revokeObjectURL(objectUrl);
  } else if (details.photo_url) {
    // Add cache-busting
    const url = new URL(details.photo_url);
    url.searchParams.set('t', Date.now());
    previewUrl = url.toString();
  } else if (details.fallbackPhoto) {
    const url = new URL(details.fallbackPhoto, window.location.origin);
    url.searchParams.set('t', Date.now());
    previewUrl = url.toString();
  }

  setPhotoPreview(previewUrl);
}, [details.photo, details.photo_url, details.fallbackPhoto]);

const handleRemovePhoto = () => {
  console.log('Remove photo clicked');
  setDetails(prev => ({
    ...prev,
    photo: null,
    photo_url: null,     // Clear Supabase URL
    fallbackPhoto: null  // Clear fallback
  }));
  setPhotoPreview(null);
  setImageToCrop(null);
  setDragActive(false);
  setShowCropper(false);
  if (fileInputRef.current) {
    fileInputRef.current.value = '';
  }
};

  const onCropComplete = (croppedArea, croppedAreaPixels) => {
    console.log('Crop complete:', croppedAreaPixels);
    setCroppedAreaPixels(croppedAreaPixels);
  };

  const handleCrop = async () => {
    console.log('Crop button clicked');
    try {
      const croppedImage = await getCroppedImg(imageToCrop, croppedAreaPixels, 'jpeg');
      const croppedFile = new File([croppedImage], 'cropped-photo.jpeg', { type: 'image/jpeg' });
      const img = new Image();
      img.src = URL.createObjectURL(croppedFile);
      await new Promise((resolve) => (img.onload = resolve));
      if (img.width !== 280 || img.height !== 360) {
        throw new Error(`Cropped image dimensions are ${img.width}x${img.height}, expected 280x360`);
      }
      handleInputChange({ target: { name: 'photo', type: 'file', files: [croppedFile] } });
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
    if (fileInputRef.current) {
      fileInputRef.current.value = ''; // Reset file input
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0] || e.dataTransfer.files[0];
    if (file && file.type === 'image/jpeg' && file.size <= 5 * 1024 * 1024) {
      const reader = new FileReader();
      reader.onload = (e) => {
        console.log('File loaded as data URL');
        setImageToCrop(e.target.result);
        setShowCropper(true);
        setZoom(1);
        setDragActive(true);
      };
      reader.readAsDataURL(file);
    } else if (file) {
      alert('Please upload a JPEG image under 5MB');
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    handleFileChange(e);
  };

  const handleClick = () => {
    fileInputRef.current.click();
  };

  const nameOptions = [
    { value: `${details.name} / ${details.katakana}`, label: `English/Katkana: ` },
    details.katakana && { value: `${details.katakana} / ${details.name}`, label: `カタカナ/英語: ` },
    details.initials && { value: details.initials, label: `Initials(イニシャル): ` },
  ].filter(Boolean);

  return (
    <div className="mb-8 whitespace-pre-line">
      <div className="flex justify-between items-center">
        <h2 className="text-xl text-black font-semibold mb-3">個人情報<br />Personal Information</h2>
        <button
          onClick={fetchPersonalDetails}
          disabled={isLoading}
          className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 whitespace-pre-line ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isLoading ? '取得中...\nFetching...' : '個人情報を取得\nFetch Personal Data'}
        </button>
      </div>
      <div className="block border rounded-lg border-black p-2 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">社員番号 / Employee Number</label>
          <input
            type="text"
            name="employeeNumber"
            value={details.employeeNumber}
            onChange={handleInputChange}
            className="mt-1 block text-black w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            placeholder="例: 123456"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">名前 / Name</label>
          <select
            name="selectedName"
            value={details.selectedName}
            onChange={handleInputChange}
            className="mt-1 block text-black w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 "
          >
            {nameOptions.map((option) => (
              <option key={option.value} >
                {option.value}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">出身地 / Hometown</label>
          <input
            type="text"
            name="hometown"
            value={details.hometown}
            onChange={handleInputChange}
            className="mt-1 block text-black w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            placeholder="例: 東京"
          />
        </div>
        <div className='relative border p-2 rounded-md justify-between items-center'>
          <label className="block text-sm font-medium text-gray-700">趣味 / Hobby</label>
          <textarea
            type="text"
            name="hobby"
            value={details.hobby}
            onChange={handleInputChange}
            className="mt-1 block text-black w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            placeholder="例: 読書"
          />
          {prevDetails.hobby !== '' && prevDetails.hobby !== details.hobby && (
            <div className='absolute top-0 right-0 flex'>
              <UndoButton
                clickFunction={() => {
                  setDetails(prev => ({ ...prev, hobby: prevDetails.hobby }));
                  setPrevDetails(prev => ({ ...prev, hobby: '' }));
                }}
              />
            </div>
          )}
        </div>
        {newDetails.hobby !== '' && (
          <div className="relative border p-2 rounded-md bg-gray-200 justify-between items-center">
            <ul className="text-sm font-medium text-gray-700 font-semibold">AI提案された趣味 / AI Suggested Hobby
              <li 
                className='p-2 cursor-pointer border rounded-lg bg-blue-100 hover:bg-gray-100'
                onClick={() => {
                  setPrevDetails((prev) => ({ ...prev, hobby: details.hobby }));
                  setDetails((prev) => ({ ...prev, hobby: newDetails.hobby }));
                }}
              > 
                {newDetails.hobby} 
              </li>
            </ul>
            <div className="absolute top-0 right-0 flex">
              <DeleteButton
                clickFunction={() => setNewDetails((prev) => ({ ...prev, hobby: '' }))}
              />
            </div>
          </div>
        )}
        <div>
          <label className="text-sm font-medium text-gray-700">プロフィール写真 / Profile Photo</label>
          <span className="text-sm font-semibold text-red-700"> (Only JPEG format supported.)</span>
          <div
            className={`mt-1 border-2 border-dashed rounded-md p-4 text-center cursor-pointer ${dragActive ? 'border-gray-300':'border-blue-500 bg-blue-50'}`}
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            onClick={handleClick}
          >
            <input
              type="file"
              name="photo"
              accept="image/jpeg"
              onChange={handleFileChange}
              className="hidden"
              ref={fileInputRef}
            />
            <p className="text-gray-600">
              Drag and drop a JPEG image here, or click to select
            </p>
          </div>
          {photoPreview && !showCropper && (
            <div className="mt-2 flex items-center gap-2">
              <img
                key={photoPreview}  // This forces re-render
                src={photoPreview}
                alt="Profile"
                className="max-w-[140px] h-auto border rounded"
                crossOrigin="anonymous"
                onLoad={() => console.log('Image loaded')}
                onError={(e) => {
                  console.error('Image failed to load:', photoPreview);
                  e.currentTarget.src = '/placeholder-photo.jpg';
                }}
              />
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
                    onChange={(e) => setZoom(parseFloat(e.target.value))}
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
  );
}