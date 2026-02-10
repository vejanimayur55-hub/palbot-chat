document.addEventListener('DOMContentLoaded', () => {
    const chatBox = document.getElementById("chatBox");
    const userInput = document.getElementById("userInput");
    const sendBtn = document.getElementById("sendBtn");
    const voiceBtn = document.getElementById("voiceBtn");

    let conversationHistory = [];

    // --- 1. VOICE RECOGNITION SETUP ---
    // Check if browser supports it (Chrome, Edge, Safari, Android)
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false; // Stop after one sentence
        recognition.lang = 'en-US';

        // Click Mic Button
        voiceBtn.addEventListener('click', () => {
            if (voiceBtn.classList.contains('listening')) {
                recognition.stop();
            } else {
                recognition.start();
            }
        });

        // Start Listening
        recognition.onstart = () => {
            voiceBtn.classList.add('listening');
            userInput.placeholder = "Listening...";
        };

        // Stop Listening
        recognition.onend = () => {
            voiceBtn.classList.remove('listening');
            userInput.placeholder = "Enter command...";
            userInput.focus();
        };

        // Get Result
        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            userInput.value = transcript;
            // Optional: Remove "//" below to auto-send immediately
            // sendMessage(); 
        };
    } else {
        console.log("Web Speech API not supported.");
        voiceBtn.style.display = "none"; // Hide button if not supported
    }

    // --- 2. CHAT LOGIC ---
    async function sendMessage() {
        const text = userInput.value.trim();
        if (!text) return;

        addMessage(text, 'user');
        userInput.value = '';

        try {
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    message: text,
                    history: conversationHistory 
                })
            });

            const data = await res.json();
            addMessage(data.reply, 'bot');

            conversationHistory.push({ role: "user", content: text });
            conversationHistory.push({ role: "assistant", content: data.reply });

        } catch (err) {
            addMessage("Error: Server offline.", 'bot');
        }
    }

    function addMessage(text, sender) {
        const div = document.createElement('div');
        div.className = `message ${sender}`;
        
        if (sender === 'bot' && typeof marked !== 'undefined') {
            div.innerHTML = marked.parse(text);
        } else {
            div.textContent = text;
        }
        
        chatBox.appendChild(div);
        chatBox.scrollTop = chatBox.scrollHeight;
    }

    if (sendBtn) sendBtn.addEventListener("click", sendMessage);
    
    if (userInput) {
        userInput.addEventListener("keydown", (e) => {
            if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });
    }
});