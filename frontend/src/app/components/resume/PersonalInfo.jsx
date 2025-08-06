import { useState, useEffect, useRef } from 'react';
import Cropper from 'react-easy-crop';
import { getCroppedImg } from '../../helper/ImageCrop/cropUtils';

export default function PersonalInfo({ details, handleInputChange }) {
  const [photoPreview, setPhotoPreview] = useState(null);
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

  const handleRemovePhoto = () => {
    console.log('Remove photo clicked');
    handleInputChange({ target: { name: 'photo', type: 'file', files: [] } });
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
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
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
  };

  const nameOptions = [
    { value: details.name, label: `English: ${details.name}` },
    details.katakana && { value: details.katakana, label: `カタカナ: ${details.katakana}` },
    details.initials && { value: details.initials, label: `Initials(イニシャル): ${details.initials}` },
  ].filter(Boolean);

  return (
    <div className="mb-8 whitespace-pre-line">
      <h2 className="text-xl text-black font-semibold mb-3">{"個人情報 \n Personal Information"}</h2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">社員番号 \n Employee Number</label>
          <input
            type="number"
            name="employeeNumber"
            value={details.employeeNumber}
            onChange={handleInputChange}
            className="mt-1 block text-black w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">名前 / Name</label>
          <select
            name="selectedName"
            value={details.selectedName}
            onChange={handleInputChange}
            className="mt-1 block text-black w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            {nameOptions.map((option, index) => (
              <option key={index} value={option.value}>
                {option.label}
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
            placeholder="例: デリー (北インド)"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">趣味 / Hobby</label>
          <textarea
            name="hobby"
            type="text"
            value={details.hobby}
            onChange={handleInputChange}
            className="mt-1 block text-black w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            placeholder="例: 読書"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700">プロフィール写真 / Profile Photo</label>
          <span className="text-sm font-semibold text-red-700"> (Only jpeg format supported.)</span>
          <input
            type="file"
            name="photo"
            accept="image/jpeg"
            onChange={handleFileChange}
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