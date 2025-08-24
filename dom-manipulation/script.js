// Default quotes
let quotes = [
  { text: "The best way to get started is to quit talking and begin doing.", category: "Motivation" },
  { text: "Don’t let yesterday take up too much of today.", category: "Inspiration" },
  { text: "Failure is not the opposite of success, it’s part of success.", category: "Wisdom" }
];

// DOM elements
const quoteDisplay = document.getElementById("quoteDisplay");
const newQuoteBtn = document.getElementById("newQuote");
const addQuoteForm = document.getElementById("addQuoteForm");
const newQuoteText = document.getElementById("newQuoteText");
const newQuoteCategory = document.getElementById("newQuoteCategory");
const exportBtn = document.getElementById("exportJson");
const importFile = document.getElementById("importFile");
const syncNotice = document.getElementById("syncNotice");
const resolveConflictBtn = document.getElementById("resolveConflict");

let lastServerSync = []; // Store last server snapshot

// --- Local Storage Functions ---
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

function loadQuotes() {
  const storedQuotes = localStorage.getItem("quotes");
  if (storedQuotes) {
    quotes = JSON.parse(storedQuotes);
  }
}

// --- Show a random quote ---
function showRandomQuote() {
  if (quotes.length === 0) {
    quoteDisplay.innerHTML = "<em>No quotes available. Please add one!</em>";
    return;
  }
  const randomIndex = Math.floor(Math.random() * quotes.length);
  const quote = quotes[randomIndex];
  quoteDisplay.innerHTML = `"${quote.text}" <br><span class="category">— ${quote.category}</span>`;
}

// --- Add a new quote ---
function addQuote(event) {
  event.preventDefault();
  const text = newQuoteText.value.trim();
  const category = newQuoteCategory.value.trim();

  if (text && category) {
    const newQuote = { text, category };
    quotes.push(newQuote);
    saveQuotes();

    // Simulate POST to server
    postToServer(newQuote);

    newQuoteText.value = "";
    newQuoteCategory.value = "";
    alert("Quote added successfully!");
  } else {
    alert("Please enter both a quote and a category.");
  }
}

// --- Export JSON ---
function exportToJsonFile() {
  const dataStr = JSON.stringify(quotes, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes.json";
  a.click();

  URL.revokeObjectURL(url);
}

// --- Import JSON ---
function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = function(e) {
    try {
      const importedQuotes = JSON.parse(e.target.result);
      if (Array.isArray(importedQuotes)) {
        quotes.push(...importedQuotes);
        saveQuotes();
        alert("Quotes imported successfully!");
      } else {
        alert("Invalid JSON format. Expected an array of quotes.");
      }
    } catch (error) {
      alert("Error reading JSON file.");
    }
  };
  fileReader.readAsText(event.target.files[0]);
}

// --- Simulated server fetch ---
async function fetchFromServer() {
  try {
    const response = await fetch("https://jsonplaceholder.typicode.com/posts?_limit=5");
    const data = await response.json();

    const serverQuotes = data.map(post => ({
      text: post.title,
      category: "Server"
    }));

    handleServerSync(serverQuotes);
  } catch (error) {
    console.error("Error fetching from server:", error);
  }
}

// --- Simulated POST to server ---
async function postToServer(quote) {
  try {
    await fetch("https://jsonplaceholder.typicode.com/posts", {
      method: "POST",
      body: JSON.stringify(quote),
      headers: { "Content-type": "application/json; charset=UTF-8" }
    });
    console.log("Quote sent to server:", quote);
  } catch (error) {
    console.error("Error posting to server:", error);
  }
}

// --- Handle server sync ---
function handleServerSync(serverQuotes) {
  lastServerSync = serverQuotes;
  const localQuotes = JSON.stringify(quotes);
  const serverData = JSON.stringify(serverQuotes);

  if (localQuotes !== serverData) {
    // Default strategy: server wins
    quotes = serverQuotes;
    saveQuotes();
    syncNotice.style.display = "block";
  }
}

// --- Conflict resolution UI ---
resolveConflictBtn.addEventListener("click", () => {
  const choice = confirm("Server data differs from local. OK = keep SERVER version, Cancel = keep LOCAL version.");
  
  if (choice) {
    quotes = lastServerSync;
    saveQuotes();
  } else {
    saveQuotes(); // keep local
  }

  syncNotice.style.display = "none";
  alert("Conflict resolved.");
});

// --- Event listeners ---
newQuoteBtn.addEventListener("click", showRandomQuote);
addQuoteForm.addEventListener("submit", addQuote);
exportBtn.addEventListener("click", exportToJsonFile);
importFile.addEventListener("change", importFromJsonFile);

// --- Init ---
loadQuotes();
fetchFromServer();
setInterval(fetchFromServer, 30000); // sync every 30s
