const express = require('express');
const path = require('path');
const { kv } = require('@vercel/kv');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static('public'));

// Default comments for initialization
const DEFAULT_COMMENTS = [
    {
        id: 1733697000000,
        text: "🌌 Welcome to the cosmic void! This is a test transmission to show the system is operational. More comments will appear here as earthlings and aliens leave their anonymous thoughts! 🛸",
        timestamp: new Date(1733697000000).toISOString()
    },
    {
        id: 1733697060000,
        text: "Testing... testing... is this thing on? 👽",
        timestamp: new Date(1733697060000).toISOString()
    }
];

// Initialize comments in KV store if not exists
async function initializeComments() {
    try {
        const existingComments = await kv.get('comments');
        if (!existingComments) {
            await kv.set('comments', DEFAULT_COMMENTS);
        }
    } catch (error) {
        console.log('Running locally - KV not available, using in-memory storage');
    }
}

// Get comments from KV or fallback to local storage
async function getComments() {
    try {
        const comments = await kv.get('comments');
        return comments || DEFAULT_COMMENTS;
    } catch (error) {
        // Fallback for local development
        return DEFAULT_COMMENTS;
    }
}

// Save comments to KV
async function saveComments(comments) {
    try {
        await kv.set('comments', comments);
    } catch (error) {
        console.log('KV storage not available, changes will not persist');
    }
}

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/api/comments', async (req, res) => {
    try {
        const comments = await getComments();
        res.json(comments);
    } catch (error) {
        console.error('Error fetching comments:', error);
        res.status(500).json({ error: 'Failed to fetch comments' });
    }
});

app.post('/api/comments', async (req, res) => {
    const { text } = req.body;
    
    if (!text || text.trim() === '') {
        return res.status(400).json({ error: 'Comment text is required' });
    }
    
    try {
        const comment = {
            id: Date.now(),
            text: text.trim(),
            timestamp: new Date().toISOString()
        };
        
        const comments = await getComments();
        comments.unshift(comment);
        await saveComments(comments);
        
        console.log('New comment added:', comment);
        console.log('Total comments:', comments.length);
        
        res.status(201).json(comment);
    } catch (error) {
        console.error('Error saving comment:', error);
        res.status(500).json({ error: 'Failed to save comment' });
    }
});

// Initialize comments on startup
initializeComments();

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});