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

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-blue-50 to-orange-50">
      
      {/* HEADER */}
      <div className="bg-white shadow-md border-b border-gray-200 p-4">
        <div className="max-w-5xl mx-auto flex items-center justify-center relative">
          
          {/* Logo on top-left */}
          <div className="absolute left-0 top-1/2 transform -translate-y-1/2">
            <img src="/images/logo.png" alt="HHT Logo" className="h-10 w-auto" />
          </div>

          {/* Centered Title */}
          <h1 className="text-xl font-semibold">
            HHT Training Assistant
          </h1>
        </div>
      </div>

      {/* MAIN CONTENT */}
      {messages.length === 0 ? (
        // WELCOME SCREEN CENTERED
        <div className="flex flex-col items-center justify-center flex-1 max-w-xl mx-auto text-center px-6">
          <h2 className="text-2xl font-bold mb-3">Welcome to HHT Training Assistant</h2>
          <p className="text-gray-700 mb-8">
            Ask me anything you'd like to learn, and I'll help you find the best educational resources!
          </p>

          {/* INPUT BAR */}
          <div className="flex items-center gap-3 w-full max-w-md">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your question here..."
              className="flex-1 px-5 py-3 border-2 border-yellow-300 rounded-full text-gray-700"
              disabled={loading}
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
        // CHAT AREA AFTER FIRST SEARCH
        <div className="flex flex-col flex-1">
          <div className="flex-1 overflow-y-auto pt-4 pb-28 max-w-4xl w-full mx-auto px-6">
            {messages.map((message, idx) => (
              <div key={idx} className="mb-8">
                <p className="text-lg font-medium text-gray-800 mb-3">
                  {message.type === "assistant" ? "Assistant Response:" : ""}
                </p>
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

          {/* INPUT BAR ALWAYS AT BOTTOM */}
          <div className="w-full max-w-3xl mx-auto pb-10 px-6">
            <div className="flex items-center gap-3 w-full">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your question here..."
                className="flex-1 px-5 py-3 border-2 border-yellow-300 rounded-full text-gray-700"
                disabled={loading}
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
      )}
    </div>
  );
};

// Render the component
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<HHTAssistant />);
