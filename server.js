const express = require('express');
const cors = require('cors');
const path = require('path');
const translate = require('./index');
const languages = require('./languages');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// API Routes
app.get('/api/languages', (req, res) => {
    res.json(languages);
});

app.post('/api/translate', async (req, res) => {
    try {
        const { text, from, to } = req.body;
        
        if (!text) {
            return res.status(400).json({ error: 'Text is required' });
        }

        const result = await translate(text, { from, to });
        res.json(result);
    } catch (error) {
        console.error('Translation error:', error);
        res.status(500).json({ 
            error: 'Translation failed', 
            message: error.message || 'Unknown error' 
        });
    }
});

// Serve the main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`🌐 Translator app running at http://localhost:${PORT}`);
    console.log(`📚 Supporting ${Object.keys(languages).length - 1} languages`);
});
