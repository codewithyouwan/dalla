'use client';
import React, { useState, useEffect, useRef } from 'react';
import { fetchEventSource } from '@microsoft/fetch-event-source';

const LangGraphUI = () => {
  const [threadId, setThreadId] = useState('');
  const [inputMessage, setInputMessage] = useState('');
  const [commandInput, setCommandInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [awaitingCommand, setAwaitingCommand] = useState(false);
  const [error, setError] = useState('');
  
  const messagesEndRef = useRef(null);
  const controllerRef = useRef(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const processChunk = (chunk) => {
  setMessages(prev => {
    const last = prev[prev.length - 1];

    if (chunk.llm) {
      if (!last || last.type !== 'llm') {
        return [...prev, { type: 'llm', content: chunk.llm }];
      } else {
        return [
          ...prev.slice(0, -1),
          { ...last, content: last.content + chunk.llm }
        ];
      }
    }

    if (chunk.text || chunk.interrupt || chunk.end) {
      const aiContent = chunk.text || chunk.interrupt || chunk.end;

      if (last?.type === 'ai') {
        return [
          ...prev.slice(0, -1),
          { ...last, content: last.content + '\n' + aiContent }
        ];
      }

      return [...prev, { type: 'ai', content: aiContent }];
    }

    return prev;
  });

  if (chunk.interrupt) {
    setAwaitingCommand(true);
  } else if (chunk.end) {
    setAwaitingCommand(false);
    setIsProcessing(false);
  }
};



  const startNewRequest = async (url, body) => {
    if (controllerRef.current) {
      controllerRef.current.abort();
    }
    
    controllerRef.current = new AbortController();
    const signal = controllerRef.current.signal;
    setError('');
    
    try {
      await fetchEventSource(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal,
        openWhenHidden: true,
        retry: 0,
        onmessage(ev) {
          try {
            const chunk = JSON.parse(ev.data);
            console.log('Received chunk:', chunk);
            processChunk(chunk);
          } catch (error) {
            console.error('Error parsing chunk:', error);
          }
        },
        onclose() {
          if (!signal.aborted) {
            setIsProcessing(false);
          }
        },
        onerror(err) {
          if (err.name !== 'AbortError') {
            setError(err.message || 'Connection error');
            setIsProcessing(false);
          }
        }
      });
    } catch (error) {
      if (error.name !== 'AbortError') {
        setError(error.message || 'Request failed');
        setIsProcessing(false);
      }
    }
  };

  const handleStart = async () => {
    if (!inputMessage.trim()) {
      setError('Please enter a message');
      return;
    }
    
    setIsProcessing(true);
    setAwaitingCommand(false);
    const newThreadId = crypto.randomUUID();
    setThreadId(newThreadId);
    
    setMessages([
      { type: 'user', content: inputMessage },
      { type: 'ai', content: '' }
    ]);
    
    await startNewRequest('http://localhost:5175/start', {
      thread_id: newThreadId,
      message: inputMessage
    });
    
    setInputMessage('');
  };

  const handleContinue = async () => {
    if (!commandInput.trim()) {
      setError('Please enter a command');
      return;
    }
    
    setIsProcessing(true);
    setMessages(prev => [
      ...prev,
      { type: 'command', content: commandInput },
      { type: 'ai', content: '' }
    ]);
    
    await startNewRequest('http://localhost:5175/continue', {
      thread_id: threadId,
      command_data: commandInput
    });
    
    setCommandInput('');
  };

  const handleReset = () => {
    if (controllerRef.current) {
      controllerRef.current.abort();
      controllerRef.current = null;
    }
    
    setThreadId('');
    setInputMessage('');
    setCommandInput('');
    setMessages([]);
    setIsProcessing(false);
    setAwaitingCommand(false);
    setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 p-4 md:p-8 text-black">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-3xl font-bold text-indigo-800">DALL-A Agent</h1>
          {error && (
            <div className="mt-2 p-2 bg-red-100 text-red-700 rounded-md">
              Error: {error}
            </div>
          )}
        </header>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="h-96 overflow-y-auto p-4 bg-gray-50">
            {messages.length === 0 ? (
              <div className="h-full flex items-center justify-center text-gray-500">
                <p>Enter a message to start conversation</p>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((msg, index) => (
                  <div 
                    key={index} 
                    className={`p-4 rounded-lg max-w-[85%] ${
                      msg.type === 'user' 
                        ? 'bg-indigo-100 text-indigo-800 ml-auto' 
                        : msg.type === 'command'
                          ? 'bg-yellow-100 text-yellow-800 ml-auto'
                          : 'bg-white border border-gray-200'
                    }`}
                  >
                    <div className="flex items-start">
                      <div className="mr-2">
                        {msg.type === 'user' ? '👤' : 
                         msg.type === 'command' ? '⚡' : '🤖'}
                      </div>
                      <div>
                        <div className="font-medium text-xs mb-1">
                          {msg.type === 'user' ? 'You' : 
                           msg.type === 'command' ? 'Command' : 
                           msg.type === 'llm' ? 'LLM' :'Assistant'}
                        </div>
                        <pre className={`whitespace-pre-wrap overflow-x-auto ${msg.type === 'llm' ? 'text-gray-500 text-xs' : 'text-sm'}`}>
                          {msg.content}
                          </pre>
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          <div className="p-4 border-t border-gray-200">
            {awaitingCommand ? (
              <div className="flex">
                <input
                  type="text"
                  value={commandInput}
                  onChange={(e) => setCommandInput(e.target.value)}
                  placeholder="Enter command..."
                  className="flex-1 border border-gray-300 rounded-l-lg px-4 py-2"
                  disabled={isProcessing}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !isProcessing) {
                      handleContinue();
                    }
                  }}
                />
                <button
                  onClick={handleContinue}
                  disabled={isProcessing || !commandInput.trim()}
                  className="px-4 py-2 bg-yellow-500 text-white rounded-r-lg disabled:bg-gray-300"
                >
                  Continue
                </button>
              </div>
            ) : (
              <div className="flex">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Enter your message..."
                  className="flex-1 border border-gray-300 rounded-l-lg px-4 py-2"
                  disabled={isProcessing}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !isProcessing) {
                      handleStart();
                    }
                  }}
                />
                <button
                  onClick={handleStart}
                  disabled={isProcessing || !inputMessage.trim()}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-r-lg disabled:bg-gray-300"
                >
                  Start
                </button>
              </div>
            )}

            <div className="mt-3 flex justify-between items-center">
              <button
                onClick={handleReset}
                className="text-sm text-gray-600 hover:text-gray-900 px-3 py-1 bg-gray-100 rounded-md"
              >
                Reset
              </button>
              
              <div className="text-xs text-gray-500 flex items-center">
                {isProcessing && (
                  <span className="flex items-center mr-2">
                    <span className="animate-ping h-2 w-2 rounded-full bg-yellow-500 mr-1"></span>
                    Processing...
                  </span>
                )}
                {threadId && (
                  <span className="bg-indigo-100 px-2 py-1 rounded text-indigo-800">
                    Thread: {threadId.substring(0, 8)}...
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LangGraphUI;