const { useState, useRef, useEffect } = React;

const HHTAssistant = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [responseMode, setResponseMode] = useState('Crisp');
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

      if (!response.ok) throw new Error(data.error || 'Failed to search');

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

    setMessages(prev => [...prev, { type: 'user', content: userMessage }]);

    try {
      const videoData = await searchYouTube(userMessage);

      setMessages(prev => [
        ...prev,
        {
          type: 'assistant',
          content: `I found a helpful resource about "${userMessage}". Here's a video that explains it:`,
          videoId: videoData.videoId,
          videoTitle: videoData.title
        }
      ]);
    } catch (error) {
      setMessages(prev => [
        ...prev,
        {
          type: 'assistant',
          content: 'I encountered an issue finding resources for your query. Please try rephrasing your question.',
          error: true
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

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
    <div className="flex flex-col w-full h-screen bg-gradient-to-br from-blue-50 to-orange-50">

      {/* HEADER */}
      <div className="bg-white w-full shadow-md border-b border-gray-200 p-4">
        <div className=" mx-auto relative flex items-center justify-center">

          {/* LEFT LOGO */}
          <img
            src="/logo.png"
            alt="HHT Logo"
            className="h-10 w-auto object-contain absolute left-0"
          />

          {/* CENTER TITLE */}
          <h1 className="text-2xl font-bold text-center">
            <span className="text-gray-700">HHT Training Assistant</span>
          </h1>
        </div>
      </div>


      {/* MAIN CONTENT */}
      <div className="flex-1 flex my-auto flex-col px-4">


        {/* Messages / Videos */}
        <div className="flex-1 pt-2 pb-28 max-w-4xl w-full my-auto mx-auto">
          {messages.map((message, idx) => (
            <div key={idx} className="mb-8">
              {message.type === "assistant" && (
                <p className="text-gray-800 mb-2 font-medium">Assistant Response:</p>
              )}
              <p className="text-gray-700 mb-4">{message.content}</p>

              {message.videoId && (
                <iframe
                  className="rounded-xl shadow border border-gray-200"
                  width="100%"
                  height="400"
                  src={`https://www.youtube.com/embed/${message.videoId}`}
                  allowFullScreen
                />
              )}
            </div>
          ))}

          <div ref={messagesEndRef} />
        </div>

        {/* INPUT BAR FIXED AT BOTTOM */}
        <div className="w-full max-w-3xl my-auto mx-auto pb-10">
          <div className="flex items-center gap-3 w-full">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown} // updated here
              placeholder="Type your question here..."
              className="flex-1 px-5 py-3 border-2 border-yellow-300 rounded-full text-gray-700 focus:outline-none focus-visible:outline-none focus:ring-0 focus:ring-offset-0"
            />
            <button
              onClick={handleSubmit}
              disabled={!input.trim() || loading}
              className="px-6 py-3 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-medium rounded-full shadow disabled:bg-gray-300"
            >
              {loading ? "Thinking..." : "Generate"}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

// Render
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<HHTAssistant />);
