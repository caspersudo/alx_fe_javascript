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

// --- Session Storage Example (last viewed quote) ---
function saveLastViewedQuote(quote) {
  sessionStorage.setItem("lastQuote", JSON.stringify(quote));
}

function loadLastViewedQuote() {
  const last = sessionStorage.getItem("lastQuote");
  if (last) {
    const quote = JSON.parse(last);
    quoteDisplay.innerHTML = `"${quote.text}" <br><span class="category">— ${quote.category}</span>`;
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
  saveLastViewedQuote(quote);
}

// --- Add a new quote dynamically ---
function addQuote(event) {
  event.preventDefault(); // Prevent page reload
  const text = newQuoteText.value.trim();
  const category = newQuoteCategory.value.trim();

  if (text && category) {
    quotes.push({ text, category });
    saveQuotes();
    newQuoteText.value = "";
    newQuoteCategory.value = "";

    alert("Quote added successfully!");
  } else {
    alert("Please enter both a quote and a category.");
  }
}

// --- Export to JSON file ---
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

// --- Import from JSON file ---
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

// --- Event listeners ---
newQuoteBtn.addEventListener("click", showRandomQuote);
addQuoteForm.addEventListener("submit", addQuote);
exportBtn.addEventListener("click", exportToJsonFile);
importFile.addEventListener("change", importFromJsonFile);

// --- Initialize App ---
loadQuotes();          // Load from localStorage
loadLastViewedQuote(); // Load from sessionStorage
