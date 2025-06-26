export default function ResumePreview({ isLoading, previewLink, error, handleRefresh }) {
  return (
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
  );
}