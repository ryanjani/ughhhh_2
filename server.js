const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static('public'));

const COMMENTS_FILE = path.join(__dirname, 'comments.json');

// Load comments from file
function loadComments() {
    try {
        if (fs.existsSync(COMMENTS_FILE)) {
            const data = fs.readFileSync(COMMENTS_FILE, 'utf8');
            return JSON.parse(data);
        }
    } catch (error) {
        console.error('Error loading comments:', error);
    }
    return [];
}

// Save comments to file
function saveComments(comments) {
    try {
        fs.writeFileSync(COMMENTS_FILE, JSON.stringify(comments, null, 2));
    } catch (error) {
        console.error('Error saving comments:', error);
    }
}

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/api/comments', (req, res) => {
    const comments = loadComments();
    res.json(comments);
});

app.post('/api/comments', (req, res) => {
    const { text } = req.body;
    
    if (!text || text.trim() === '') {
        return res.status(400).json({ error: 'Comment text is required' });
    }
    
    const comment = {
        id: Date.now(),
        text: text.trim(),
        timestamp: new Date().toISOString()
    };
    
    const comments = loadComments();
    comments.unshift(comment);
    saveComments(comments);
    
    res.status(201).json(comment);
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});