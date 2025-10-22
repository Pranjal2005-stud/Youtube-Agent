const { useState, useRef, useEffect } = React;

const HHTAssistant = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const searchYouTube = async (query) => {
    try {
      const response = await fetch(`/api/search?query=${encodeURIComponent(query)}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to search');
      }

      return data;
    } catch (error) {
      console.error('Search error:', error);
      throw error;
    }
  };

  const handleSubmit = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setLoading(true);

    setMessages(prev => [...prev, { 
      type: 'user', 
      content: userMessage 
    }]);

    try {
      const videoData = await searchYouTube(userMessage);

      setMessages(prev => [...prev, { 
        type: 'assistant', 
        content: `I found a helpful resource about "${userMessage}". Here's a video that explains it:`,
        videoId: videoData.videoId,
        videoTitle: videoData.title
      }]);
    } catch (error) {
      setMessages(prev => [...prev, { 
        type: 'assistant', 
        content: 'I apologize, but I encountered an issue finding resources for your query. Please try rephrasing your question.',
        error: true
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // HHT Logo SVG Component
  const HHTLogo = ({ className = "h-12" }) => (
    <svg className={className} viewBox="0 0 920 380" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Cloud */}
      <path d="M80 190C80 150 108 120 145 120C155 85 190 60 235 60C280 60 315 85 325 120C362 120 390 150 390 190C390 230 362 260 325 260H145C108 260 80 230 80 190Z" fill="#003366" stroke="#003366" strokeWidth="8"/>
      {/* Connection points */}
      <circle cx="175" cy="215" r="15" fill="#FFA500"/>
      <circle cx="235" cy="190" r="15" fill="#FFA500"/>
      <circle cx="295" cy="215" r="15" fill="#FFA500"/>
      {/* Lines */}
      <line x1="175" y1="230" x2="175" y2="290" stroke="#FFA500" strokeWidth="12"/>
      <line x1="235" y1="205" x2="235" y2="290" stroke="#FFA500" strokeWidth="12"/>
      <line x1="295" y1="230" x2="295" y2="290" stroke="#FFA500" strokeWidth="12"/>

      {/* H */}
      <rect x="420" y="60" width="60" height="260" rx="30" fill="#003366"/>
      <rect x="540" y="60" width="60" height="260" rx="30" fill="#003366"/>
      <rect x="450" y="160" width="120" height="60" rx="30" fill="#003366"/>

      {/* H */}
      <rect x="620" y="60" width="60" height="260" rx="30" fill="#003366"/>
      <rect x="740" y="60" width="60" height="260" rx="30" fill="#003366"/>
      <rect x="650" y="160" width="120" height="60" rx="30" fill="#003366"/>

      {/* T */}
      <rect x="690" y="60" width="230" height="60" rx="30" fill="#FFA500"/>
      <rect x="815" y="90" width="60" height="230" rx="30" fill="#FFA500"/>
    </svg>
  );

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-blue-50 to-orange-50">
      {/* Header */}
      <div className="bg-white shadow-md border-b border-gray-200 p-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <HHTLogo className="h-14" />
            <div className="border-l-2 border-gray-300 h-12 mx-2"></div>
            <div>
              <h1 className="text-2xl font-bold">
                <span className="bg-gradient-to-r from-blue-900 to-blue-700 text-transparent bg-clip-text">HHT</span>
                <span className="text-gray-700"> Training Assistant</span>
              </h1>
            </div>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-5xl mx-auto space-y-6">
          {messages.length === 0 && (
            <div className="text-center py-16">
              <div className="bg-white rounded-2xl shadow-lg p-8 max-w-2xl mx-auto">
                <HHTLogo className="h-24 mx-auto mb-6" />
                <h2 className="text-2xl font-bold text-gray-800 mb-3">
                  Welcome to <span className="text-blue-900">HHT</span> Training Assistant
                </h2>
                <p className="text-gray-600 mb-6">Ask me anything you'd like to learn, and I'll help you find the best educational resources!</p>
                <div className="space-y-3 text-left bg-gradient-to-br from-blue-50 to-orange-50 rounded-lg p-6 border border-blue-100">
                  <p className="text-sm text-gray-700 font-semibold mb-3">💡 Try asking:</p>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600 pl-4 py-2 bg-white rounded-lg shadow-sm">"How does cloud computing work?"</p>
                    <p className="text-sm text-gray-600 pl-4 py-2 bg-white rounded-lg shadow-sm">"Explain artificial intelligence"</p>
                    <p className="text-sm text-gray-600 pl-4 py-2 bg-white rounded-lg shadow-sm">"What is cybersecurity?"</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {messages.map((message, idx) => (
            <div
              key={idx}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-3xl rounded-2xl p-5 ${
                  message.type === 'user'
                    ? 'bg-gradient-to-r from-blue-900 to-blue-800 text-white shadow-lg'
                    : 'bg-white shadow-lg border border-gray-100'
                }`}
              >
                {message.type === 'user' ? (
                  <div>
                    <p className="text-sm font-semibold mb-2 opacity-80 flex items-center gap-2">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"/>
                      </svg>
                      You
                    </p>
                    <p className="text-base leading-relaxed">{message.content}</p>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-100">
                      <HHTLogo className="h-6" />
                      <p className="text-sm font-bold text-blue-900">HHT Assistant</p>
                    </div>
                    <p className="text-gray-800 mb-4 leading-relaxed">{message.content}</p>
                    {message.videoId && (
                      <div className="mt-4 rounded-xl overflow-hidden shadow-md border-2 border-blue-100">
                        <iframe
                          width="100%"
                          height="400"
                          src={`https://www.youtube.com/embed/${message.videoId}`}
                          title="Training Video"
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          className="rounded-xl"
                        />
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-white shadow-lg border border-gray-100 rounded-2xl p-5 max-w-3xl">
                <div className="flex items-center gap-3">
                  <HHTLogo className="h-6" />
                  <div className="flex items-center gap-2 text-gray-700">
                    <svg className="w-5 h-5 animate-spin text-blue-900" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                    </svg>
                    <span className="font-medium">HHT Assistant is thinking...</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="bg-white border-t-2 border-gray-200 shadow-lg p-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything you want to learn..."
              className="flex-1 px-5 py-4 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-transparent text-base transition-all"
              disabled={loading}
            />
            <button
              onClick={handleSubmit}
              disabled={loading || !input.trim()}
              className="px-8 py-4 bg-gradient-to-r from-blue-900 to-blue-800 text-white rounded-xl hover:from-blue-800 hover:to-blue-700 disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed transition-all font-semibold flex items-center gap-2 shadow-lg"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
              </svg>
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Render the component
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<HHTAssistant />);
