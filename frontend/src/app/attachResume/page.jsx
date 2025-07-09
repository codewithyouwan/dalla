'use client';
import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useRouter } from 'next/navigation';

export default function UploadPage() {
  const router = useRouter();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const onDrop = useCallback(async (acceptedFiles) => {
    if (acceptedFiles.length === 0 || acceptedFiles[0].type !== 'application/pdf') {
      setError('Please upload a valid PDF file.');
      return;
    }

    setUploading(true);
    setError(null);

    const file = acceptedFiles[0];
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/upload-resume', {
        method: 'POST',
        body: JSON.stringify({
          file: await file.arrayBuffer(),
        }),
        headers: { 'Content-Type': 'application/json' },
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Upload failed');

      // Store extracted text in localStorage
      localStorage.setItem('extractedResumeText', result.extractedText);

      // Redirect to makeResume page
      router.push('/makeResume');
    } catch (err) {
      setError(err.message);
      setUploading(false);
    }
  }, [router]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024, // 5MB limit
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4 text-center">Upload Your Resume</h1>
        <div
          {...getRootProps()}
          className={`border-2 border-dashed p-6 rounded-lg text-center ${
            isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
          }`}
        >
          <input {...getInputProps()} />
          <p className="text-gray-600">
            {isDragActive
              ? 'Drop the PDF here'
              : 'Drag & drop your English resume (PDF) here, or click to select'}
          </p>
          <p className="text-sm text-gray-500 mt-2">Max file size: 5MB</p>
        </div>
        {uploading && <p className="mt-4 text-blue-500">Processing...</p>}
        {error && <p className="mt-4 text-red-500">{error}</p>}
      </div>
    </div>
  );
}