// ZenAI App JavaScript

// Simulated responses and sentiment analysis for demo purposes
const responses = {
    greetings: [
        "How are you feeling today? 🌸",
        "I'm here to listen. What's on your mind? 🍃",
        "Welcome back! How has your day been? ✨"
    ],
    supportive: [
        "I hear you. It sounds like you're going through a lot right now. Would you like to explore these feelings further?",
        "Thank you for sharing that with me. How long have you been feeling this way?",
        "I'm here to support you. What would help you feel more grounded in this moment?"
    ],
    encouraging: [
        "You're showing great strength by addressing these feelings. Would you like to try a brief mindfulness exercise?",
        "Remember, it's okay to take things one step at a time. What's one small thing you could do for yourself today?",
        "I notice you're being quite hard on yourself. Let's try to approach this with self-compassion."
    ]
};

// Simple sentiment analysis function (placeholder for actual sentiment API)
function analyzeSentiment(text) {
    const positiveWords = ['happy', 'good', 'great', 'amazing', 'peaceful', 'calm', 'joy'];
    const negativeWords = ['sad', 'bad', 'angry', 'anxious', 'stressed', 'worried', 'overwhelmed'];
    
    let score = 0;
    const words = text.toLowerCase().split(' ');
    
    words.forEach(word => {
        if (positiveWords.includes(word)) score += 1;
        if (negativeWords.includes(word)) score -= 1;
    });
    
    return {
        score,
        sentiment: score > 0 ? 'positive' : score < 0 ? 'concerning' : 'neutral'
    };
}

// UI Elements
const chatMessages = document.getElementById('chatMessages');
const userInput = document.getElementById('userInput');
const sendButton = document.getElementById('sendButton');
const sentimentDisplay = document.getElementById('sentimentDisplay');
const journalEntry = document.getElementById('journalEntry');
const saveJournalBtn = document.getElementById('saveJournalBtn');

// Chat functionality
function addMessage(message, isUser = false) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isUser ? 'user-message' : 'ai-message'}`;
    messageDiv.innerHTML = `<p>${message}</p>`;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function getAIResponse() {
    const categories = ['supportive', 'encouraging'];
    const category = categories[Math.floor(Math.random() * categories.length)];
    const responses = window.responses[category];
    return responses[Math.floor(Math.random() * responses.length)];
}

function updateSentimentDisplay(sentiment) {    const messages = {
        positive: "😊 Your message suggests positive emotions. That's wonderful!",
        neutral: "😐 I sense a neutral tone in your message.",
        concerning: "💙 I notice some challenging emotions. Remember, it's okay to not be okay."
    };
    
    sentimentDisplay.textContent = messages[sentiment];
}

// Event Listeners
sendButton.addEventListener('click', handleSend);
userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
    }
});

function handleSend() {
    const message = userInput.value.trim();
    if (!message) return;

    // Add user message
    addMessage(message, true);

    // Analyze sentiment
    const { sentiment } = analyzeSentiment(message);
    updateSentimentDisplay(sentiment);

    // Clear input
    userInput.value = '';

    // Simulate AI thinking
    setTimeout(() => {
        const response = getAIResponse();
        addMessage(response);
    }, 1000);
}

// Journal functionality
saveJournalBtn.addEventListener('click', () => {
    const entry = journalEntry.value.trim();
    if (!entry) return;

    // In a real app, this would save to a database
    // For now, we'll just show a confirmation
    alert('Journal entry saved! 📝');
    journalEntry.value = '';

    // Analyze journal sentiment
    const { sentiment } = analyzeSentiment(entry);
    if (sentiment === 'concerning') {
        addMessage("I noticed some concerning feelings in your journal entry. Would you like to talk about it? Remember, it's okay to seek professional help when needed. 💙");
    }
});

// Accessibility improvements
document.querySelectorAll('button').forEach(button => {
    button.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            button.click();
        }
    });
});
