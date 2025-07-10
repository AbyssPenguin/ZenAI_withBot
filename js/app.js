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

    // Escalation logic based on critical phrases
    const crisisPhrases = ["suicidal", "end my life", "kill myself", "worthless", "i want to die", "give up"];
    const isCritical = crisisPhrases.some(p => entry.toLowerCase().includes(p));

    const message = {
      Positive: "You seem to be feeling good today 💛 Keep nurturing that energy.",
      Neutral: "A neutral tone can be a moment of balance 🪷 Want to reflect deeper?",
      Negative: "I'm sensing some heaviness 💙 It's okay to feel this way. I'm here to support you."
    }[sentiment] || "Thank you for sharing. Let's reflect further together.";

    // Override if critical content is found
    if (isCritical) {
      feedback.innerHTML = `⚠️ I'm really concerned about your well-being.<br>Please consider reaching out for support:<br><a href="https://sos.org.sg" target="_blank">💜 SOS Singapore – 24/7 Helpline</a>`;
    } else {
      feedback.textContent = message;
    }

    // Save the entry
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

// Gemini API call with few-shot + fallback
async function getSentiment(text) {
  const apiKey = "YOUR_GEMINI_API_KEY"; // Replace with your key
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${apiKey}`;

  const body = {
    contents: [
      {
        role: "user",
        parts: [
          {
            text: `
You are a sentiment classification bot. Classify the journal entry as either "Positive", "Neutral", or "Negative".

Rules:
- Your answer must be exactly one word: Positive, Neutral, or Negative.
- Do not explain your answer.
- Do not add punctuation.
- If the user expresses sadness, frustration, hopelessness, or anxiety, label it Negative.
- If the entry expresses joy, gratitude, peace, or energy, label it Positive.
- If it is factual, vague, or lacks strong emotional tone, label it Neutral.

Examples:
- "I feel hopeless." → Negative
- "My life is sad." → Negative
- "Everything is okay." → Neutral
- "Today was okay, nothing special." → Neutral
- "I am proud of myself." → Positive
- "So grateful for my friends." → Positive
- "I'm so tired of everything." → Negative
- "Just another day." → Neutral

Journal Entry:
"${text}"

Now classify it. Respond with only one word.
            `.trim()
          }
        ]
      }
    ]
  };

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });

    const data = await res.json();
    const response = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    if (!["Positive", "Neutral", "Negative"].includes(response)) {
      console.warn("Gemini returned unknown label:", response);
      return fallbackSentiment(text);
    }

    return response;
  } catch (err) {
    console.error("Gemini API failed, falling back:", err);
    return fallbackSentiment(text);
  }
}

// Fallback rule-based sentiment classifier
function fallbackSentiment(text) {
  const lowered = text.toLowerCase();

  const negativeWords = ["sad", "tired", "hopeless", "angry", "frustrated", "depressed", "lonely", "worthless"];
  const positiveWords = ["happy", "grateful", "proud", "joyful", "excited", "peaceful", "calm", "content"];

  if (negativeWords.some(word => lowered.includes(word))) return "Negative";
  if (positiveWords.some(word => lowered.includes(word))) return "Positive";
  return "Neutral";
}

// Display journal entries with filtering
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

  // Attach delete listeners
  document.querySelectorAll(".delete-btn").forEach(btn =>
    btn.addEventListener("click", () => {
      const key = btn.getAttribute("data-key");
      localStorage.removeItem(key);
      displayJournalEntries(document.getElementById("searchInput").value);
    })
  );
}

// Filter as you type
document.getElementById("searchInput").addEventListener("input", (e) => {
  displayJournalEntries(e.target.value);
});

// Initial load
displayJournalEntries();
