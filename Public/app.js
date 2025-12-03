const { useState, useRef, useEffect } = React;

const HHTAssistant = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const [responseMode, setResponseMode] = useState("Crisp");

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

    setMessages(prev => [...prev, { type: 'user', content: userMessage }]);

    try {
      const videoData = await searchYouTube(userMessage);

      setMessages(prev => [
        ...prev,
        {
          type: 'assistant',
          content: `Here is a helpful video related to: "${userMessage}"`,
          videoId: videoData.videoId,
          videoTitle: videoData.title
        }
      ]);
    } catch (error) {
      setMessages(prev => [
        ...prev,
        {
          type: 'assistant',
          content:
            'Sorry, I could not find any relevant learning resource. Try rephrasing.',
          error: true
        }
      ]);
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
      <path d="M80 190C80 150 108 120 145 120C155 85 190 60 235 60C280 60 315 85 325 120C362 120 390 150 390 190C390 230 362 260 325 260H145C108 260 80 230 80 190Z" fill="#003366" stroke="#003366" strokeWidth="8"/>
      <circle cx="175" cy="215" r="15" fill="#FFA500"/>
      <circle cx="235" cy="190" r="15" fill="#FFA500"/>
      <circle cx="295" cy="215" r="15" fill="#FFA500"/>
      <line x1="175" y1="230" x2="175" y2="290" stroke="#FFA500" strokeWidth="12"/>
      <line x1="235" y1="205" x2="235" y2="290" stroke="#FFA500" strokeWidth="12"/>
      <line x1="295" y1="230" x2="295" y2="290" stroke="#FFA500" strokeWidth="12"/>
      <rect x="420" y="60" width="60" height="260" rx="30" fill="#003366"/>
      <rect x="540" y="60" width="60" height="260" rx="30" fill="#003366"/>
      <rect x="450" y="160" width="120" height="60" rx="30" fill="#003366"/>
      <rect x="620" y="60" width="60" height="260" rx="30" fill="#003366"/>
      <rect x="740" y="60" width="60" height="260" rx="30" fill="#003366"/>
      <rect x="650" y="160" width="120" height="60" rx="30" fill="#003366"/>
      <rect x="690" y="60" width="230" height="60" rx="30" fill="#FFA500"/>
      <rect x="815" y="90" width="60" height="230" rx="30" fill="#FFA500"/>
    </svg>
  );

  return (
    <div className="flex flex-col h-screen bg-white">

      {/* HEADER */}
      <header className="w-full shadow-sm border-b border-gray-200 py-4 px-10 flex items-center justify-center">
  <HHTLogo className="h-10 mr-4" />
  <h1 className="text-xl font-semibold text-gray-800">
    HHT Personal Learning Assistant
  </h1>
</header>


      {/* MAIN CENTERED AREA */}
      <div className="flex-1 flex flex-col justify-center items-center px-4">
        
        {/* Crisp / Conceptual / Comprehensive Toggle */}
        <div className="flex bg-white shadow-sm rounded-full border border-gray-200 mb-6">
          {["Crisp", "Conceptual", "Comprehensive"].map((label) => (
            <button
              key={label}
              onClick={() => setResponseMode(label)}
              className={`px-6 py-2 rounded-full text-sm font-medium transition
              ${
                responseMode === label
                  ? "bg-yellow-300 text-gray-900"
                  : "text-gray-500 hover:bg-gray-100"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* INPUT AREA */}
        <div className="flex items-center gap-3 w-full max-w-3xl">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your question here..."
            className="flex-1 px-5 py-3 border-2 border-yellow-300 rounded-full focus:outline-none text-gray-700"
          />

          <button
            onClick={handleSubmit}
            disabled={!input.trim() || loading}
            className="px-6 py-3 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-medium rounded-full shadow disabled:bg-gray-300"
          >
            {loading ? "Thinking..." : "Generate"}
          </button>
        </div>

        {/* RESULT SECTION */}
        <div className="mt-10 w-full max-w-4xl">
          {messages.map((message, idx) => (
            <div key={idx} className="mb-8">
              <p className="text-lg font-medium text-gray-800 mb-3">
                {message.type === "user" ? "" : "Assistant Response:"}
              </p>

              <p className="text-gray-700 mb-4">{message.content}</p>

              {message.videoId && (
                <iframe
                  className="rounded-xl shadow border border-gray-200"
                  width="100%"
                  height="400"
                  src={`https://www.youtube.com/embed/${message.videoId}`}
                  title="Learning Video"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              )}
            </div>
          ))}

          <div ref={messagesEndRef} />
        </div>
      </div>
    </div>
  );
};

// Render component
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<HHTAssistant />);
