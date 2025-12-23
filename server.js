const express = require("express");
const cors = require("cors");
const axios = require("axios");
const path = require("path");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "Public")));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "Public", "index.html"));
});

// YouTube Search Endpoint (TOP VIDEOS BY VIEW COUNT)
app.get("/api/search", async (req, res) => {
    const { query } = req.query;

    if (!query) {
        return res.status(400).json({ error: "Query parameter is required" });
    }

    try {
        const response = await axios.get(
            "https://www.googleapis.com/youtube/v3/search",
            {
                params: {
                    part: "snippet",
                    q: query,
                    type: "video",
                    maxResults: 8,                
                    order: "viewCount",          
                    key: process.env.YOUTUBE_API_KEY,
                    videoEmbeddable: "true",
                    relevanceLanguage: "en",
                    safeSearch: "strict",
                },
            }
        );

        if (!response.data.items || response.data.items.length === 0) {
            return res.status(404).json({ error: "No videos found" });
        }

        const videos = response.data.items.map(item => ({
            videoId: item.id.videoId,
            title: item.snippet.title,
            description: item.snippet.description,
            thumbnail: item.snippet.thumbnails.medium.url,
        }));

        res.json({ videos });

    } catch (error) {
        console.error(
            "YouTube API Error:",
            error.response?.data || error.message
        );

        res.status(500).json({
            error: "Failed to search YouTube",
            details: error.response?.data?.error?.message || error.message,
        });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
