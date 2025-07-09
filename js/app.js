// Save journal entry and analyze sentiment
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
    const message = {
      Positive: "You seem to be feeling good today 💛 Keep nurturing that energy.",
      Neutral: "A neutral tone can be a moment of balance 🪷 Want to reflect deeper?",
      Negative: "I'm sensing some heaviness 💙 It's okay to feel this way. I'm here to support you."
    }[sentiment] || "Thank you for sharing. Let's reflect further together.";

    feedback.textContent = message;

    const timestamp = new Date().toISOString();
    const record = { entry, sentiment };
    localStorage.setItem(`zenJournal_${timestamp}`, JSON.stringify(record));
    document.getElementById("journalEntry").value = "";

    displayJournalEntries();

  } catch (err) {
    console.error("Error analyzing sentiment:", err);
    feedback.textContent = "Couldn’t analyze that. Please try again later 🙇‍♂️";
  }
});

// Gemini API call
async function getSentiment(text) {
  const apiKey = "YOUR_API_KEY_HERE";
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

// Display journal history
function displayJournalEntries(filter = "") {
  const container = document.getElementById("journalHistory");
  container.innerHTML = "";

  const entries = Object.entries(localStorage)
    .filter(([key]) => key.startsWith("zenJournal_"))
    .sort((a, b) => new Date(b[0].replace("zenJournal_", "")) - new Date(a[0].replace("zenJournal_", "")));

  entries.forEach(([key, value]) => {
    const { entry, sentiment } = JSON.parse(value);
    const date = new Date(key.replace("zenJournal_", "")).toLocaleString();

    const combined = `${entry} ${sentiment}`.toLowerCase();
    if (!combined.includes(filter.toLowerCase())) return;

    const div = document.createElement("div");
    div.className = "history-entry";
    div.innerHTML = `
      <div>
        <strong><small>${date}</small></strong><br>
        🧘‍♂️ ${entry}<br>
        🧠 Sentiment: <em>${sentiment}</em>
      </div>
      <button class="delete-btn" data-key="${key}">Delete</button>
    `;

    container.appendChild(div);
  });

  document.querySelectorAll(".delete-btn").forEach(btn =>
    btn.addEventListener("click", () => {
      const key = btn.getAttribute("data-key");
      localStorage.removeItem(key);
      displayJournalEntries(document.getElementById("searchInput").value);
    })
  );
}

// Search input listener
document.getElementById("searchInput").addEventListener("input", (e) => {
  displayJournalEntries(e.target.value);
});

// Initial load
displayJournalEntries();
