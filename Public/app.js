const { useState, useRef, useEffect } = React;

const HHTAssistant = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Call backend API
  const searchYouTube = async (query) => {
    const response = await fetch(`/api/search?query=${encodeURIComponent(query)}`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to fetch videos");
    }

    return data;
  };

  const handleSubmit = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput("");
    setLoading(true);

    setMessages((prev) => [
      ...prev,
      { type: "user", content: userMessage },
    ]);

    try {
      const videoData = await searchYouTube(userMessage);

      setMessages((prev) => [
        ...prev,
        {
          type: "assistant",
          content: `Top videos for "${userMessage}" (sorted by views):`,
          videos: videoData.videos,
        },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          type: "assistant",
          content:
            "I couldn’t find suitable videos. Try rephrasing your question.",
          error: true,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="flex flex-col w-full h-screen bg-gradient-to-br from-blue-50 to-orange-50">

      {/* HEADER */}
      <div className="bg-white w-full shadow-md border-b border-gray-200 p-4">
        <h1 className="text-2xl font-bold text-center text-gray-700">
          HHT Training Assistant
        </h1>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col px-4">

        {/* MESSAGES */}
        <div className="flex-1 pt-4 pb-28 max-w-4xl w-full mx-auto">
          {messages.map((message, idx) => (
            <div key={idx} className="mb-10">
              {message.type === "assistant" && (
                <p className="text-gray-800 mb-2 font-medium">
                  Assistant Response:
                </p>
              )}

              <p className="text-gray-700 mb-4">{message.content}</p>

              {/* MULTIPLE VIDEOS */}
              {message.videos &&
                message.videos.map((video, i) => (
                  <div key={i} className="mb-6">
                    <p className="font-medium text-gray-800 mb-2">
                      {i + 1}. {video.title}
                    </p>
                    <iframe
                      className="rounded-xl shadow border border-gray-200"
                      width="100%"
                      height="360"
                      src={`https://www.youtube.com/embed/${video.videoId}`}
                      allowFullScreen
                    />
                  </div>
                ))}
            </div>
          ))}

          <div ref={messagesEndRef} />
        </div>

        {/* INPUT BAR */}
        <div className="w-full max-w-3xl mx-auto pb-10">
          <div className="flex items-center gap-3 w-full">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your question here..."
              className="flex-1 px-5 py-3 border-2 border-yellow-300 rounded-full text-gray-700 focus:outline-none"
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

// Render app
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<HHTAssistant />);
