import { useState, useEffect } from 'react';
import Modal from 'react-modal';
import UndoButton from '../buttons/UndoButton';
import Split from '../../helper/split';

// Bind modal to app element for accessibility only when DOM is ready
export default function JLPTExperience({
  details,
  setDetails,
  isLoading,
  setIsLoading,
  fetchJLPTSuggestions,
  newDetails,
  setNewDetails,
  prevDetails,
  setPrevDetails,
  userPrompt,
  setUserPrompt,
  error,
  setError,
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(null);

  // Bind Modal to #__next after component mounts
  useEffect(() => {
    if (typeof window !== 'undefined' && document.querySelector('#__next')) {
      Modal.setAppElement('#__next');
    } else {
      console.warn('Root element #__next not found. Ensure correct selector or DOM is loaded.');
    }
  }, []);

  const fetchRethinkJLPTSuggestions = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/rethink/rethinkJLPTExperience', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          marks: details.marks,
          japaneseLevel: details.japaneseLevel,
          examMonth: details.examMonth,
          userFeedback: userPrompt.JLPTExperience,
          previousSuggestion: details.selectedSuggestion,
        }),
      });
      if (!response.ok) {
        const data = await response.json();
        setError(data.error || 'Failed to generate JLPT suggestions');
      }
      const data = await response.json();
      const content = data.suggestions;
      console.log(content);
      const forms = Split(content);
      const finalForms = forms.length > 0 ? forms.slice(0, 3) : [content];
      const trimmedForms = finalForms.map((form) => form.trim());
      setDetails((prev) => ({
        ...prev,
        suggestions: trimmedForms,
      }));
    } catch (err) {
      setError(`Failed to rethink JLPT experience: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const isN5orN4 = details.japaneseLevel === 'N5' || details.japaneseLevel === 'N4';
  // console.log('IS N5 or N4:', isN5orN4);

  const handleSuggestionClick = (suggestion, index) => {
    if (details.selectedSuggestion !== '') {
      setSelectedSuggestion(suggestion);
      setSelectedIndex(index);
      setIsModalOpen(true);
    } else {
      setDetails((prev) => ({
        ...prev,
        selectedSuggestion: suggestion,
        selectedIndex: index,
      }));
    }
  };

  const handleConfirm = () => {
    setPrevDetails((prev) => ({
      ...prev,
      selectedSuggestion: details.selectedSuggestion,
      selectedIndex: details.selectedIndex,
    }));
    setDetails((prev) => ({
      ...prev,
      selectedSuggestion: selectedSuggestion,
      selectedIndex: selectedIndex,
    }));
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setSelectedSuggestion(null);
    setSelectedIndex(null);
  };

  return (
    <div className="mb-8 whitespace-pre-line">
      <div className="flex items-center justify-between mb-4 whitespace-pre-line">
        <h2 className="text-xl text-black font-semibold mb-3">{"JLPT経験 \n JLPT Experience"}</h2>
        <button
          onClick={fetchJLPTSuggestions}
          disabled={isLoading || details.japaneseLevel === 'Not certified'}
          className={`mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
            isLoading || details.japaneseLevel === 'Not certified' ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {isLoading ? '生成中... \n Generating...' : '提案を生成 \n Generate Suggestions'}
        </button>
      </div>
      <div className="block border rounded-lg border-black p-2 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">日本語レベル / Japanese Level</label>
          <select
            name="japaneseLevel"
            value={details.japaneseLevel || 'Not certified'}
            onChange={(e) => {
              setDetails((prev) => ({ ...prev, japaneseLevel: e.target.value }));
            }}
            className="mt-1 block text-black w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="N1">N1</option>
            <option value="N2">N2</option>
            <option value="N3">N3</option>
            <option value="N4">N4</option>
            <option value="N5">N5</option>
            <option value="Not certified">Not certified</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">日本語レベル / Exam Month</label>
          <select
            name="examMonth"
            value={details.examMonth}
            onChange={(e) => {
              setDetails((prev) => ({ ...prev, examMonth: e.target.value }));
            }}
            className="mt-1 block text-black w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="7月">7月</option>
            <option value="12月">12月</option>
            <option value="Not Selected">Other</option>
          </select>
        </div>
        {details.japaneseLevel !== 'Not certified' && (
          <>
            {isN5orN4 ? (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700">総合スコア / Total Score (180)</label>
                  <input
                    type="text"
                    name="total"
                    value={details.marks.total}
                    onChange={(e) => {
                      setDetails((prev) => ({ ...prev, marks: { ...prev.marks, total: e.target.value } }));
                    }}
                    className="mt-1 block text-black w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    言語知識（文字・語彙・文法）・読解スコア / Language Knowledge & Reading Score (120)
                  </label>
                  <input
                    type="text"
                    name="vocabulary"
                    value={details.marks.language_and_reading}
                    onChange={(e) => {
                      setDetails((prev) => ({
                        ...prev,
                        marks: { ...prev.marks, language_and_reading: e.target.value },
                      }));
                    }}
                    className="mt-1 block text-black w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">聴解スコア / Listening Score (60)</label>
                  <input
                    type="text"
                    name="listening"
                    value={details.marks.listening}
                    onChange={(e) => {
                      setDetails((prev) => ({ ...prev, marks: { ...prev.marks, listening: e.target.value } }));
                    }}
                    className="mt-1 block text-black w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700">総合スコア / Total Score (180)</label>
                  <input
                    type="text"
                    name="total"
                    value={details.marks.total}
                    onChange={(e) => {
                      setDetails((prev) => ({ ...prev, marks: { ...prev.marks, total: e.target.value } }));
                    }}
                    className="mt-1 block text-black w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    語彙・文法スコア / Vocabulary&Grammar Score (60)
                  </label>
                  <input
                    type="text"
                    name="vocabulary"
                    value={details.marks.vocabulary}
                    onChange={(e) => {
                      setDetails((prev) => ({ ...prev, marks: { ...prev.marks, vocabulary: e.target.value } }));
                    }}
                    className="mt-1 block text-black w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">読解スコア / Reading Score (60)</label>
                  <input
                    type="text"
                    name="reading"
                    value={details.marks.reading}
                    onChange={(e) => {
                      setDetails((prev) => ({ ...prev, marks: { ...prev.marks, reading: e.target.value } }));
                    }}
                    className="mt-1 block text-black w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">聴解スコア / Listening Score (60)</label>
                  <input
                    type="text"
                    name="listening"
                    value={details.marks.listening}
                    onChange={(e) => {
                      setDetails((prev) => ({ ...prev, marks: { ...prev.marks, listening: e.target.value } }));
                    }}
                    className="mt-1 block text-black w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
              </>
            )}
          </>
        )}
        {details.selectedSuggestion !== '' && (
          <div className="justify-center align-center p-2 block relative border rounded-lg">
            <label className="block text-sm font-medium text-gray-700">選択された提案 / Selected Suggestion</label>
            <textarea
              value={details.selectedSuggestion}
              onChange={(e) => {
                setDetails((prev) => ({ ...prev, selectedSuggestion: e.target.value }));
              }}
              className="mt-1 block text-black w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              rows="4"
            />
            {prevDetails.selectedSuggestion !== '' &&
              prevDetails.selectedSuggestion !== details.selectedSuggestion && (
                <div className="top-0 right-0 absolute">
                  <UndoButton
                    clickFunction={() => {
                      setDetails((prev) => ({
                        ...prev,
                        selectedSuggestion: prevDetails.selectedSuggestion,
                        selectedIndex: prevDetails.selectedIndex,
                      }));
                    }}
                  />
                </div>
              )}
          </div>
        )}
        <div>
          <div>
            <label className="block text-sm font-semibold text-green-700">User Prompt</label>
            <textarea
              value={userPrompt.JLPTExperience}
              onChange={(e) => {
                setUserPrompt((prev) => ({ ...prev, JLPTExperience: e.target.value }));
              }}
              className="block text-black w-full bg-green-100 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              rows="2"
            />
          </div>
          <button
            onClick={fetchRethinkJLPTSuggestions}
            disabled={isLoading || userPrompt.JLPTExperience.trim() === ''}
            className={`px-4 py-2 bg-green-600 text-white rounded-md hover:bg-red-700 whitespace-pre-line ${
              isLoading || userPrompt.JLPTExperience === '' ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isLoading ? 'Thinking...' : 'Rethink'}
          </button>
        </div>
        {details.suggestions && details.suggestions.length > 0 && (
          <div className="mt-4">
            <h3 className="text-sm font-medium text-black">提案 / Suggestions</h3>
            <ul className="mt-2 space-y-2 text-black">
              {details.suggestions.map((suggestion, index) => (
                <li
                  key={index}
                  className={`p-2 cursor-pointer border rounded-lg ${
                    details.selectedIndex === index ? 'bg-blue-100' : 'hover:bg-gray-100'
                  }`}
                  onClick={() => handleSuggestionClick(suggestion, index)}
                >
                  {suggestion}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      <Modal
        isOpen={isModalOpen}
        ariaHideApp={false}
        onRequestClose={handleCancel}
        style={{
          content: {
            top: '50%',
            left: '50%',
            right: 'auto',
            bottom: 'auto',
            transform: 'translate(-50%, -50%)',
            maxWidth: '400px',
            width: '90%',
            padding: '20px',
            borderRadius: '8px',
            textAlign: 'center',
          },
          overlay: {
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 1000,
          },
        }}
        contentLabel="Confirm Suggestion Change"
      >
        <h2 className="text-lg font-semibold mb-4 text-black">Confirm Change</h2>
        <p className="mb-4 text-black">
          Are you sure you want to change the current suggestion to a new one?<br />
          現在の選択を新しい提案に変更してもよろしいですか？
        </p>
        <div className="flex justify-center gap-4">
          <button
            onClick={handleCancel}
            className="px-4 py-2 bg-gray-300 text-black rounded-md hover:bg-gray-400"
          >
            Cancel / キャンセル
          </button>
          <button
            onClick={handleConfirm}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Confirm / 確認
          </button>
        </div>
      </Modal>
    </div>
  );
}