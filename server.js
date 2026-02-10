console.log("--------------------------------------------------");
console.log("🚀 SYSTEM CHECK: Starting Pipbot Server...");

const express = require('express');
const path = require('path');
const axios = require('axios');
const cors = require('cors');

const app = express();
// Use the port Render assigns (or 3000 for local)
const PORT = process.env.PORT || 3000;

// SECURE KEY HANDLING
// We read this from Render's "Environment Variables"
const GROQ_API_KEY = process.env.GROQ_API_KEY;

app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname)));

// --- API ROUTE ---
app.post('/api/chat', async (req, res) => {
    const { message, history } = req.body;

    // Safety Check
    if (!GROQ_API_KEY) {
        return res.json({ reply: "⚠️ System Error: API Key missing in server settings." });
    }

    const conversation = [
        { role: "system", content: "You are Pipbot Neo, a futuristic AI Assistant. Be concise, technical, and helpful. Use Markdown." },
        ...(history || []),
        { role: "user", content: message }
    ];

    try {
        const response = await axios.post(
            'https://api.groq.com/openai/v1/chat/completions',
            {
                model: "llama-3.3-70b-versatile",
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
        res.json({ reply: botReply });

    } catch (error) {
        console.error("❌ Groq API Error:", error.message);
        res.json({ reply: "⚠️ Signal Interrupted: Unable to reach AI core." });
    }
});

app.listen(PORT, () => console.log(`🚀 SERVER ONLINE ON PORT: ${PORT}`));