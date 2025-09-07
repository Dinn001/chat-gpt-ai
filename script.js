// ⚠️ Ganti dengan API key dari Google AI Studio
const API_KEY = "AIzaSyB9_pVjMK0Rt_BX7ILCqyRSEZd0qaExrTs";
const API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=" +
  API_KEY;

const chatDiv = document.getElementById("chat");
const input = document.getElementById("input");
const sendBtn = document.getElementById("sendBtn");
const stopContainer = document.getElementById("stopContainer");
const stopBtn = document.getElementById("stopBtn");

let history = [];
let typingAbort = false;
let uploadedFiles = [];

// Instruksi sistem
const systemInstruction = {
  role: "system",
  parts: [
    {
      text: `Instruksi:
- Jawablah semua pertanyaan dalam bahasa Indonesia.
- Jika user secara eksplisit meminta jawaban dalam bahasa Inggris, maka jawab sesuai permintaan.
- Istilah teknis, nama orang, atau judul boleh tetap dalam bahasa aslinya.`,
    },
  ],
};

// Tambah pesan ke chat
function addMessage(content, sender, isFile = false, fileName = "") {
  const div = document.createElement("div");
  div.classList.add("message", sender);

  if (isFile) {
    if (/\.(jpg|jpeg|png|gif|webp)$/i.test(fileName)) {
      const img = document.createElement("img");
      img.src = content;
      img.classList.add("preview");
      div.appendChild(img);
    } else {
      const icon = document.createElement("span");
      icon.innerText = "📄 " + fileName;
      div.appendChild(icon);

      const link = document.createElement("a");
      link.href = content;
      link.target = "_blank";
      link.style.color = "#00c6ff";
      link.innerText = " Buka File";
      div.appendChild(link);
    }
  } else {
    div.innerText = content;
  }

  chatDiv.appendChild(div);
  chatDiv.scrollTop = chatDiv.scrollHeight;
  return div;
}

// Efek mengetik
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

// Konversi file ke base64
async function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(",")[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Kirim pesan
async function sendMessage() {
  const text = input.value.trim();
  if (!text && uploadedFiles.length === 0) return;

  if (text) addMessage(text, "user");
  uploadedFiles.forEach((f) =>
    addMessage(f.preview, "user", true, f.name)
  );
  input.value = "";

  // Auto sapaan salam
  const salam = ["hallo", "halo", "hai", "assalamualaikum", "hello"];
  if (text && salam.includes(text.toLowerCase())) {
    const div = addMessage("", "bot");
    await typeEffect(
      div,
      "Halo 👋, saya adalah Asisten pribadi *Dinns* yang siap membantu kapan pun Anda butuhkan 🚀",
      20
    );
    uploadedFiles = [];
    return;
  }

  // Auto jawaban pencipta
  if (
    text.toLowerCase().includes("pencipta") ||
    text.toLowerCase().includes("pembuat") ||
    text.toLowerCase().includes("siapa yang buat")
  ) {
    const div = addMessage("", "bot");
    await typeEffect(
      div,
      "Saya dibuat dan dikembangkan oleh *Dinns* khusus untuk membantu Anda 🚀",
      20
    );
    uploadedFiles = [];
    return;
  }

  try {
    let parts = [];
    if (text) parts.push({ text });
    for (let f of uploadedFiles) {
      parts.push({
        inlineData: { data: f.base64, mimeType: f.type },
      });
    }

    history.push({ role: "user", parts });

    const body = { contents: [systemInstruction, ...history] };

    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    console.log("Response:", data);

    const botText =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "⚠️ Tidak ada jawaban.";

    const botDiv = addMessage("", "bot");
    await typeEffect(botDiv, botText, 20);

    history.push({ role: "model", parts: [{ text: botText }] });
  } catch (err) {
    addMessage("⚠️ Error: " + err.message, "bot");
  }

  uploadedFiles = [];
}

// Event listener
sendBtn.addEventListener("click", sendMessage);
input.addEventListener("keypress", (e) => {
  if (e.key === "Enter") sendMessage();
});
stopBtn.addEventListener("click", () => {
  typingAbort = true;
});

// Clear chat
function clearChat() {
  chatDiv.innerHTML = "";
  history = [];
  uploadedFiles = [];
  addMessage("🔄 Chat dihapus. Mulai percakapan baru.", "bot");
}

// Menu upload
function toggleMenu() {
  const menu = document.getElementById("uploadMenu");
  menu.style.display =
    menu.style.display === "block" ? "none" : "block";
}
function openCamera() {
  document.getElementById("cameraInput").click();
}
function openGallery() {
  document.getElementById("galleryInput").click();
}
function openFile() {
  document.getElementById("fileInput").click();
}

async function handleFiles(files) {
  for (let file of files) {
    uploadedFiles.push({
      name: file.name,
      type: file.type,
      base64: await fileToBase64(file),
      preview: URL.createObjectURL(file),
    });
  }
}
document
  .getElementById("cameraInput")
  .addEventListener("change", (e) =>
    handleFiles(e.target.files)
  );
document
  .getElementById("galleryInput")
  .addEventListener("change", (e) =>
    handleFiles(e.target.files)
  );
document
  .getElementById("fileInput")
  .addEventListener("change", (e) =>
    handleFiles(e.target.files)
  );
