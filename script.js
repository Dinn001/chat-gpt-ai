// ⚠️ Ganti dengan API key dari Google AI Studio
const API_KEY = "YOUR_API_KEY";
const API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=" + API_KEY;

const chatDiv = document.getElementById("chat");
const input = document.getElementById("input");
const sendBtn = document.getElementById("sendBtn");

let history = [];

function addMessage(content, sender) {
  const div = document.createElement("div");
  div.classList.add("message", sender);
  div.innerText = content;
  chatDiv.appendChild(div);
  chatDiv.scrollTop = chatDiv.scrollHeight;
}

async function sendMessage() {
  const text = input.value.trim();
  if (!text) return;
  addMessage(text, "user");
  input.value = "";

  // aturan manual: pencipta
  if (text.toLowerCase().includes("pencipta") ||
      text.toLowerCase().includes("pembuat") ||
      text.toLowerCase().includes("siapa yang buat")) {
    addMessage("Saya dibuat dan dikembangkan oleh *Dinns* khusus untuk membantu Anda 🚀", "bot");
    return;
  }

  try {
    history.push({ role: "user", parts: [{ text }] });
    const body = { contents: history };

    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });

    const data = await res.json();
    console.log("Response:", data);

    const botText = data?.candidates?.[0]?.content?.parts?.[0]?.text || "⚠️ Tidak ada jawaban.";
    addMessage(botText, "bot");

    history.push({ role: "model", parts: [{ text: botText }] });
  } catch (err) {
    addMessage("⚠️ Error: " + err.message, "bot");
  }
}

sendBtn.addEventListener("click", sendMessage);
input.addEventListener("keypress", e => { if (e.key === "Enter") sendMessage(); });

function clearChat() {
  chatDiv.innerHTML = "";
  history = [];
  addMessage("🔄 Chat direset. Mulai percakapan baru.", "bot");
}
