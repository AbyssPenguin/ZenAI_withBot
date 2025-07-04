// Journaling prompts based on sentiment
const journalingPrompts = {
  Positive: [
    "What made you smile today?",
    "What’s something you're proud of recently?",
    "How can you keep this good energy going?"
  ],
  Neutral: [
    "How are you feeling right now?",
    "What’s something you’ve been thinking about lately?",
    "Is there anything you’d like to reflect on today?"
  ],
  Negative: [
    "It sounds like you’re going through a lot. Want to share more?",
    "What’s been the hardest part of your day?",
    "Would it help to write about what you’re feeling?"
  ]
};

// Handle journal entry and sentiment analysis
document.getElementById("saveJournalBtn").addEventListener("click", async () => {
  const entry = document.getElementById("journalEntry").value.trim();
  const feedback = document.getElementById("sentimentFeedback");

  if (!entry) {
    feedback.textContent = "Please write something to reflect on 🌱";
    return;
  }

  feedback.textContent = "Analyzing your reflection... 🧘‍♀️";

  try {
    const sentiment = await getSentiment(entry);

    let message = "";
    switch (sentiment) {
      case "Positive":
        message = "You seem to be feeling good today 💛 Keep nurturing that energy.";
        break;
      case "Neutral":
        message = "A neutral tone can be a moment of balance 🪷 Want to reflect deeper?";
        break;
      case "Negative":
        message = "I'm sensing some heaviness 💙 It's okay to feel this way. I'm here to support you.";
        break;
      default:
        message = "Thank you for sharing. Let's reflect further together.";
    }

    // Get a journaling prompt based on sentiment
    const prompts = journalingPrompts[sentiment] || journalingPrompts["Neutral"];
    const randomPrompt = prompts[Math.floor(Math.random() * prompts.length)];

    feedback.textContent = `${message} \n\nHere's a journaling prompt for you: "${randomPrompt}"`;

    // Optional: Save entry locally
    const timestamp = new Date().toLocaleString();
    localStorage.setItem(`zenJournal_${timestamp}`, entry);

    // Clear textarea
    document.getElementById("journalEntry").value = "";

  } catch (error) {
    feedback.textContent = "Hmm, I couldn’t analyze that. Please try again later 🙇‍♂️";
    console.error("Sentiment analysis failed:", error);
  }
});

// Gemini Sentiment Detection API
async function getSentiment(text) {
  const apiKey = "YOUR_API_KEY_HERE"; // 🔒 Replace with your Gemini API key
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${apiKey}`;

  const body = {
    contents: [
      {
        parts: [
          {
            text: `Classify the emotional tone of this journal entry as: Positive, Neutral, or Negative.\n\nJournal entry:\n${text}\n\nRespond with only one word: Positive, Neutral, or Negative.`
          }
        ]
      }
    ]
  };

  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });

  const data = await res.json();

  return data?.candidates?.[0]?.content?.parts?.[0]?.text.trim() || "Neutral";
}
