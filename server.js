const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static('public'));

let comments = [];

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/api/comments', (req, res) => {
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
    
    comments.unshift(comment);
    res.status(201).json(comment);
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});