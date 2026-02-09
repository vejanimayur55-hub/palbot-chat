console.log("--------------------------------------------------");
console.log("🚀 SYSTEM CHECK: Starting Local Chatbot Server...");

// 1. Load Modules
const express = require('express');
const path = require('path');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// --- CONFIGURATION ---
// PASTE YOUR GROQ KEY HERE
// Use the environment variable if available, otherwise use the hardcoded one (for local testing)
// Remove the actual key text!
const GROQ_API_KEY = process.env.GROQ_API_KEY;

app.use(express.json());
app.use(cors());

// Serve static files (HTML, CSS, JS) from the current folder
app.use(express.static(path.join(__dirname)));

// --- ROUTE: CHAT ---
app.post('/api/chat', async (req, res) => {
    const { message, history } = req.body;

    console.log(`\n📨 User: "${message}"`);

    // Prepare conversation for Groq (OpenAI format)
    const conversation = [
        { role: "system", content: "You are Pip, a helpful AI Assistant. Be concise and use Markdown." },
        ...(history || []), // Add conversation history
        { role: "user", content: message } // Add new message
    ];

    try {
        const response = await axios.post(
            'https://api.groq.com/openai/v1/chat/completions',
            {
                model: "llama-3.3-70b-versatile", // Smartest model
                messages: conversation
            },
            {
                headers: { 
                    'Authorization': `Bearer ${GROQ_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        const botReply = response.data.choices[0].message.content;
        console.log("✅ Bot Replied");
        res.json({ reply: botReply });

    } catch (error) {
        console.error("❌ GROQ ERROR:", error.response ? error.response.data : error.message);
        res.json({ reply: "I am having trouble connecting to the AI right now." });
    }
});

app.listen(PORT, () => console.log(`🚀 SERVER RUNNING ON: http://localhost:${PORT}`));