const express = require('express');
const path = require('path');
const { put, head } = require('@vercel/blob');

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

const BLOB_FILENAME = 'comments.json';

// Initialize comments in Blob store if not exists
async function initializeComments() {
    try {
        const existingComments = await getComments();
        if (!existingComments || existingComments.length === 0) {
            await saveComments(DEFAULT_COMMENTS);
        }
    } catch (error) {
        console.log('Running locally - Blob not available, using in-memory storage');
    }
}

// Get comments from Blob or fallback to local storage
async function getComments() {
    try {
        const response = await fetch(`${process.env.BLOB_READ_WRITE_TOKEN ? 'https://blob.vercel-storage.com' : 'fallback'}/${BLOB_FILENAME}`, {
            headers: process.env.BLOB_READ_WRITE_TOKEN ? {
                'authorization': `Bearer ${process.env.BLOB_READ_WRITE_TOKEN}`
            } : {}
        });
        
        if (response.ok) {
            const comments = await response.json();
            return comments || DEFAULT_COMMENTS;
        }
        throw new Error('Blob not found');
    } catch (error) {
        // Fallback for local development or if blob doesn't exist
        return DEFAULT_COMMENTS;
    }
}

// Save comments to Blob
async function saveComments(comments) {
    try {
        await put(BLOB_FILENAME, JSON.stringify(comments), {
            access: 'public',
            addRandomSuffix: false
        });
    } catch (error) {
        console.log('Blob storage not available, changes will not persist');
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