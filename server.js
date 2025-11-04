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

// YouTube Search Endpoint
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
                    maxResults: 1,
                    key: process.env.YOUTUBE_API_KEY,
                    videoEmbeddable: "true",
                    relevanceLanguage: "en",
                    safeSearch: "strict",
                },
            },
        );

        if (response.data.items && response.data.items.length > 0) {
            const video = response.data.items[0];
            res.json({
                videoId: video.id.videoId,
                title: video.snippet.title,
                description: video.snippet.description,
                thumbnail: video.snippet.thumbnails.medium.url,
            });
        } else {
            res.status(404).json({ error: "No videos found" });
        }
    } catch (error) {
        console.error(
            "YouTube API Error:",
            error.response?.data || error.message,
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

