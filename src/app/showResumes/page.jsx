'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import ResumeList from '../components/resumeList';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function ShowResume() {
  const [resumes, setResumes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchResumes = async () => {
      try {
        console.log('Fetching resumes from Supabase...');
        const { data, error } = await supabase
          .from('resumes')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          throw new Error(`Supabase error: ${error.message}`);
        }

        console.log('Fetched resumes:', data);
        setResumes(data || []);
      } catch (err) {
        console.error('Error fetching resumes:', err);
        setError(err.message);
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
        <ResumeList resumes={resumes} number={1} />
      )}
    </div>
  );
}