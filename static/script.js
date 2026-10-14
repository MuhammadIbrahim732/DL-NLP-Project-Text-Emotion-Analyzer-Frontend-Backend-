const API_BASE = ""; // same origin. For a separate host use e.g. "https://your-app.onrender.com"

const THEME = {
  sadness:  { emoji: "😢", color: "#4d8dff", color2: "#6a5cff" },
  joy:      { emoji: "😂", color: "#ffc233", color2: "#ff7a18" },
  love:     { emoji: "❤️", color: "#ff4d8d", color2: "#ff2e63" },
  anger:    { emoji: "😡", color: "#ff3b30", color2: "#ff7a00" },
  fear:     { emoji: "😨", color: "#9b5cff", color2: "#4b2bbf" },
  surprise: { emoji: "😲", color: "#22d3ee", color2: "#3b82f6" },
};
const EXAMPLES = [
  "i feel so lonely and empty without her",
  "i feel really happy and excited about today",
  "i feel so loved and cared for by my family",
  "i feel furious and irritated by how they treated me",
  "i feel scared and anxious about what might happen",
  "i feel amazed and shocked by this unexpected news",
];

const $ = (id) => document.getElementById(id);
const textEl = $("text"), btn = $("analyze"), errEl = $("error");
let history = [];

// example chips
EXAMPLES.forEach((t) => {
  const c = document.createElement("span");
  c.className = "chip"; c.textContent = t;
  c.onclick = () => { textEl.value = t; updateCount(); analyze(); };
  $("chips").appendChild(c);
});

function updateCount() { $("count").textContent = `${textEl.value.length} / 2000`; }
textEl.addEventListener("input", updateCount);
textEl.addEventListener("keydown", (e) => { if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) analyze(); });
$("clear").onclick = () => { textEl.value = ""; updateCount(); $("result").hidden = true; errEl.hidden = true; textEl.focus(); };
btn.onclick = analyze;

function setTheme(emotion) {
  const t = THEME[emotion]; if (!t) return;
  const r = document.documentElement.style;
  r.setProperty("--accent", t.color); r.setProperty("--accent2", t.color2);
}

function showError(msg) { errEl.textContent = msg; errEl.hidden = false; }

async function analyze() {
  const text = textEl.value.trim();
  if (!text) return showError("Please type something first.");
  errEl.hidden = true;
  btn.disabled = true; btn.classList.add("loading");
  try {
    const res = await fetch(`${API_BASE}/predict`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      throw new Error(typeof d.detail === "string" ? d.detail : `Request failed (${res.status})`);
    }
    render(await res.json());
  } catch (e) {
    showError(e.message || "Could not reach the server.");
  } finally {
    btn.disabled = false; btn.classList.remove("loading");
  }
}

function render(d) {
  const emo = d.predicted_emotion, t = THEME[emo] || {};
  setTheme(emo);
  $("emoji").textContent = d.emoji || t.emoji || "🙂";
  $("emotion").textContent = emo;
  $("confidence").textContent = (d.confidence * 100).toFixed(1) + "%";

  const bars = $("bars"); bars.innerHTML = "";
  Object.entries(d.all_probabilities).sort((a, b) => b[1] - a[1]).forEach(([k, v], i) => {
    const row = document.createElement("div");
    row.className = "bar" + (i === 0 ? " top" : "");
    row.innerHTML = `<span class="name">${THEME[k]?.emoji || ""} ${k}</span>
      <div class="track"><div class="fill" style="--c:${THEME[k]?.color || "#fff"}"></div></div>
      <span class="pct">${(v * 100).toFixed(1)}%</span>`;
    bars.appendChild(row);
    requestAnimationFrame(() => requestAnimationFrame(() => (row.querySelector(".fill").style.width = (v * 100) + "%")));
  });

  const box = $("result"); box.hidden = false;
  box.style.animation = "none"; box.offsetHeight; box.style.animation = "";

  history.unshift({ text: d.text, emoji: d.emoji || t.emoji, emo });
  history = history.slice(0, 5);
  renderHistory();
}

function renderHistory() {
  const ul = $("history"); ul.innerHTML = "";
  history.forEach((h) => {
    const li = document.createElement("li");
    const em = document.createElement("span"); em.textContent = `${h.emoji} ${h.emo}`;
    const tx = document.createElement("span"); tx.className = "t"; tx.textContent = h.text;
    li.append(em, tx);
    li.onclick = () => { textEl.value = h.text; updateCount(); };
    ul.appendChild(li);
  });
  $("historyBox").hidden = !history.length;
}

// health check
(async function checkHealth() {
  try {
    const r = await fetch(`${API_BASE}/health`);
    const d = await r.json();
    $("statusDot").className = d.model_loaded ? "on" : "off";
    $("statusText").textContent = d.model_loaded ? "Model online" : "Model loading…";
    if (!d.model_loaded) setTimeout(checkHealth, 4000);
  } catch {
    $("statusDot").className = "off";
    $("statusText").textContent = "Server waking up…";
    setTimeout(checkHealth, 5000);
  }
})();
