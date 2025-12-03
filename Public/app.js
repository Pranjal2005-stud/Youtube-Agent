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

  // Simplified HHT logo (no cloud)
  const HHTLogoSmall = ({ className = "h-16" }) => (
    <div className={`flex items-center justify-center gap-1 ${className}`}>
      <span style={{fontWeight: '900', fontSize: '2.5rem', color: '#003366'}}>HHT</span>
      {/* Optional small accent for the T in yellow */}
      <span style={{fontWeight: '900', fontSize: '2.5rem', color: '#FFA500'}}>T</span>
    </div>
  );

  // Check if user has searched at least once
  const hasSearched = messages.length > 0;

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-blue-50 to-orange-50">

      {/* HEADER */}
      <div className="bg-white shadow-md border-b border-gray-200 p-4">
        <div className="max-w-5xl mx-auto flex items-center justify-center">
          <HHTLogoSmall />
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col px-4">

        {!hasSearched ? (
          // WELCOME SCREEN before search
          <div className="flex flex-col items-center justify-center flex-1 max-w-xl mx-auto text-center px-6">
            <h2 className="text-3xl font-bold mb-3 text-gray-900">Welcome to HHT Training Assistant</h2>
            <p className="text-gray-700 mb-10">
              Ask me anything you'd like to learn, and I'll help you find the best educational resources!
            </p>

            {/* Centered input and button */}
            <div className="flex w-full max-w-md gap-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your question here..."
                className="flex-1 px-5 py-3 border-2 border-yellow-300 rounded-full text-gray-700"
                autoFocus
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
        ) : (
          // CHAT SCREEN after search
          <>
            <div className="flex-1 overflow-y-auto pt-4 pb-28 max-w-4xl w-full mx-auto">
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
            <div className="w-full max-w-3xl mx-auto pb-10">
              <div className="flex items-center gap-3 w-full">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type your question here..."
                  className="flex-1 px-5 py-3 border-2 border-yellow-300 rounded-full text-gray-700"
                  autoFocus
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
          </>
        )}

      </div>
    </div>
  );
};

// Render
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<HHTAssistant />);
