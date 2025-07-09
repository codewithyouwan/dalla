'use client';
import { useState, useEffect } from 'react';
import ResumeList from '../components/resumeList';

export default function ShowResume() {
  const [resumes, setResumes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchResumes = async () => {
      try {
        console.log('Fetching resumes from /api/fetchResumes at');
        const response = await fetch('/api/fetchResumes', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || `HTTP ${response.status}: Failed to fetch resumes`);
        }

        // Data is an array (empty or populated)
        console.log('Fetched resumes:', data);
        setResumes(data);
      } catch (err) {
        console.error('Error fetching resumes:', err.message);
        setError(`Unable to load resumes: ${err.message}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchResumes();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Your Resumes</h1>
      {isLoading && <p className="text-gray-600">Loading resumes...</p>}
      {error && <p className="text-red-600">Error: {error}</p>}
      {!isLoading && resumes.length === 0 && (
        <p className="text-gray-600">No resumes found.</p>
      )}
      {!isLoading && resumes.length > 0 && (
        <ResumeList resumes={resumes} />
      )}
    </div>
  );
}