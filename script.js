document.addEventListener('DOMContentLoaded', () => {
    const chatBox = document.getElementById("chatBox");
    const userInput = document.getElementById("userInput");
    const sendBtn = document.getElementById("sendBtn");

    // Memory storage (resets on refresh)
    let conversationHistory = [];

    if (userInput) userInput.focus();

    async function sendMessage() {
        const text = userInput.value.trim();
        if (!text) return;

        // 1. Show User Message
        addMessage(text, 'user');
        userInput.value = '';

        // 2. Send to Server
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
            
            // 3. Show Bot Message
            addMessage(data.reply, 'bot');

            // 4. Update Memory
            conversationHistory.push({ role: "user", content: text });
            conversationHistory.push({ role: "assistant", content: data.reply });

        } catch (err) {
            addMessage("Error: Is the server running?", 'bot');
        }
    }

    function addMessage(text, sender) {
        const div = document.createElement('div');
        div.className = `message ${sender}`;
        
        // Render Markdown if available
        if (sender === 'bot' && typeof marked !== 'undefined') {
            div.innerHTML = marked.parse(text);
        } else {
            div.textContent = text;
        }
        
        chatBox.appendChild(div);
        chatBox.scrollTop = chatBox.scrollHeight;
    }

    // Event Listeners
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