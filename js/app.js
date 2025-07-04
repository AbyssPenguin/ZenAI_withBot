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

    feedback.textContent = message;

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
  const apiKey = "AIzaSyDjTZX9Oq2EoR17031gcLr3AC7AbANvwss"; // Replace with your key
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

