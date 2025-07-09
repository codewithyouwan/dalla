export default function Suggestions({ suggestions, selectedIndex, setSelectedSuggestion, setSelectedIndex }) {
  const selectSuggestion = (suggestion, index) => {
    setSelectedSuggestion(suggestion);
    setSelectedIndex(index);
  };

  if (suggestions.length === 0) return null;

  return (
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
  );
}