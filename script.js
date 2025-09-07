// ⚠️ API key Gemini dari AI Studio
const API_KEY = "AIzaSyB9_pVjMK0Rt_BX7ILCqyRSEZd0qaExrTs";
const MODEL = "gemini-1.5-flash-latest";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`;

const chatDiv = document.getElementById("chat");
const input = document.getElementById("input");
const sendBtn = document.getElementById("sendBtn");
const stopBtn = document.getElementById("stopBtn");
const stopContainer = document.getElementById("stopContainer");

let typingAbort = false;

// instruksi sistem biar konsisten
const systemInstruction = {
  role: "system",
  parts: [{
    text: `Instruksi:
- Selalu jawab dalam bahasa Indonesia.
- Jika user secara eksplisit minta jawaban dalam bahasa Inggris, baru gunakan bahasa Inggris.
- Nama orang, istilah teknis, atau judul bisa tetap dalam bahasa aslinya.`
  }]
};

// tambah pesan ke chat
function addMessage(content, sender) {
  const div = document.createElement("div");
  div.classList.add("message", sender);
  div.innerText = content;
  chatDiv.appendChild(div);
  chatDiv.scrollTop = chatDiv.scrollHeight;
  return div;
}

// efek mengetik
async function typeEffect(element, text, speed = 20) {
  typingAbort = false;
  stopContainer.style.display = "block";
  element.innerText = "";
  for (let i = 0; i < text.length; i++) {
    if (typingAbort) break;
    element.innerText += text[i];
    chatDiv.scrollTop = chatDiv.scrollHeight;
    await new Promise((r) => setTimeout(r, speed));
  }
  stopContainer.style.display = "none";
}

// kirim pesan
async function sendMessage() {
  const text = input.value.trim();
  if (!text) return;

  // tampilkan pesan user
  addMessage(text, "user");
  input.value = "";

  // 🔹 Auto-reply salam
  const salam = ["halo", "hallo", "hai", "hello", "assalamualaikum"];
  if (salam.includes(text.toLowerCase())) {
    const div = addMessage("", "bot");
    await typeEffect(div, "Halo 👋, saya adalah Asisten pribadi *Dinns* yang siap membantu kapan pun Anda butuhkan 🚀", 20);
    return;
  }

  // 🔹 Auto-reply pembuat
  if (text.toLowerCase().includes("pembuat") ||
      text.toLowerCase().includes("pencipta") ||
      text.toLowerCase().includes("siapa yang buat")) {
    const div = addMessage("", "bot");
    await typeEffect(div, "Saya dibuat dan dikembangkan oleh *Dinns* untuk membantu Anda 🚀", 20);
    return;
  }

  // 🔹 Kalau bukan auto-reply → kirim ke Gemini
  const body = {
    contents: [
      systemInstruction,
      { role: "user", parts: [{ text }] }
    ]
  };

  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });

    const data = await res.json();
    console.log("Response:", data);

    const botText =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "⚠️ Tidak ada jawaban.";

    const botDiv = addMessage("", "bot");
    await typeEffect(botDiv, botText, 20);
  } catch (err) {
    addMessage("⚠️ Error: " + err.message, "bot");
  }
}

// event listener
sendBtn.addEventListener("click", sendMessage);
input.addEventListener("keypress", (e) => {
  if (e.key === "Enter") sendMessage();
});
stopBtn.addEventListener("click", () => {
  typingAbort = true;
});

// clear chat
function clearChat() {
  chatDiv.innerHTML = "";
  addMessage("🔄 Chat dihapus. Mulai percakapan baru.", "bot");
}
