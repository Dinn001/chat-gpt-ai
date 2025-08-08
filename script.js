const chatBox = document.getElementById("chat-box");
const chatForm = document.getElementById("chat-form");
const userInput = document.getElementById("user-input");

let history = [];

chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const input = userInput.value.trim();
  if (!input) return;

  appendMessage("user", input);
  userInput.value = "";

  const response = await sendToGemini(input);
  appendMessage("bot", response);
});

function appendMessage(sender, text) {
  const div = document.createElement("div");
  div.classList.add("message", sender);
  div.innerText = `${sender === "user" ? "🧑" : "🤖"}: ${text}`;
  chatBox.appendChild(div);
  chatBox.scrollTop = chatBox.scrollHeight;
}

async function sendToGemini(message) {
  history.push({ role: "user", parts: message });

  try {
    const res = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=AIzaSyDJTNp6poW9gufwsYTlNnWheydkffvVfdY", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        contents: history
      })
    });

    const data = await res.json();
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "(Tidak ada respon)";
    history.push({ role: "model", parts: reply });
    return reply;
  } catch (err) {
    console.error(err);
    return "Terjadi kesalahan saat menghubungi Gemini.";
  }
}
