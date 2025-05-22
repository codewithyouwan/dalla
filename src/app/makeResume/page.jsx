'use client';

import { useState } from 'react';
import Split from '../helper/split'; //for splitting the content into 3 options or forms.

export default function MakeResume() {
  const [jlptScores, setJlptScores] = useState({
    total: '',
    vocabulary: '',
    reading: '',
    listening: ''
  });
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedSuggestion, setSelectedSuggestion] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setJlptScores(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const generateSuggestions = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/grok3', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(jlptScores),
      });
      
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate suggestions');
      }
      // Split the content into three forms
      const content = data.suggestions;
      
      // Try to parse the new structured format with explicit markers
      const forms = Split(content);
      // If all else fails, just take the whole content as one form
      if (forms.length === 0) {
        forms.push(content);
      }
      // Take at most 3 forms
      const finalForms = forms.slice(0, 3);
      
      setSuggestions(finalForms.map(form => form.trim()));
      setSelectedSuggestion(''); // Clear any previous selection
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

  return (
    <div className="flex flex-col md:flex-row min-h-screen p-4 gap-6">
      {/* Left side - Form */}
      <div className="w-full md:w-1/2 bg-white p-6 rounded-lg shadow-md overflow-y-auto">
        <h1 className="text-2xl text-black font-bold mb-6">Resume Builder</h1>
        
        <div className="mb-8">
          <h2 className="text-xl text-black font-semibold mb-3">JLPT Experience</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Total Score (out of 180)</label>
              <input
                type="number"
                name="total"
                value={jlptScores.total}
                onChange={handleInputChange}
                className="mt-1 block text-black w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Vocabulary Score</label>
              <input
                type="number"
                name="vocabulary"
                value={jlptScores.vocabulary}
                onChange={handleInputChange}
                className="mt-1 block text-black w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Reading Score</label>
              <input
                type="number"
                name="reading"
                value={jlptScores.reading}
                onChange={handleInputChange}
                className="mt-1 block text-black w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Listening Score</label>
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
                {isLoading ? 'Generating...' : 'Generate Suggestions'}
              </button>
              
              {error && (
                <p className="mt-2 text-red-600 text-sm">{error}</p>
              )}
            </div>
          </div>
        </div>
        
        {/* Japanese Suggestions Section */}
        {suggestions.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg text-black font-medium mb-2">選択肢 / Choose a Japanese Description:</h3>
            <div className="space-y-4">
              {suggestions.map((suggestion, index) => {
                // Generate form labels based on length
                const formLabels = ["Form 1 (Longest)", "Form 2 (Shorter)", "Form 3 (Shortest)"];
                const formLabel = formLabels[index] || `Form ${index + 1}`;
                
                return (
                  <div 
                    key={index} 
                    onClick={() => selectSuggestion(suggestion, index)}
                    className={`p-4 border text-black rounded-md cursor-pointer transition-all hover:border-blue-500 ${
                      selectedIndex === index 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200'
                    }`}
                  >
                    <div className="flex items-center mb-2">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center mr-2 ${
                        selectedIndex === index 
                          ? 'bg-blue-500 text-white' 
                          : 'bg-gray-200'
                      }`}>
                        {selectedIndex === index && (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
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
        
        {/* Other form sections would go here */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-3">技術スキル / Technical Skills</h2>
          <p className="text-gray-500 text-sm">Coming soon...</p>
        </div>
        
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-3">プロジェクト経験 / Projects</h2>
          <p className="text-gray-500 text-sm">Coming soon...</p>
        </div>
        
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-3">インターン経験 / Internship</h2>
          <p className="text-gray-500 text-sm">Coming soon...</p>
        </div>
      </div>
      
      {/* Right side - Preview */}
      <div className="w-full md:w-1/2 bg-white p-6 rounded-lg shadow-md overflow-y-auto">
        <h1 className="text-2xl text-black font-bold mb-6">Resume Preview</h1>
        
        {selectedSuggestion && (
          <div className="mb-6">
            <h2 className="text-xl text-black font-semibold mb-2">日本語能力 / Japanese Ability</h2>
            <div className="bg-gray-50 text-black p-4 rounded whitespace-pre-line">
              {selectedSuggestion}
            </div>
          </div>
        )}
        
        <div className="text-black italic">
          {!selectedSuggestion && "Your resume preview will appear here as you fill out the form."}
        </div>
      </div>
    </div>
  );
}