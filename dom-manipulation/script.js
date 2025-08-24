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
const categoryFilter = document.getElementById("categoryFilter");

let lastServerSync = []; // Store server snapshot

// --- Local Storage Functions ---
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
  populateCategories(); // ensure categories update
}

function loadQuotes() {
  const storedQuotes = localStorage.getItem("quotes");
  if (storedQuotes) {
    quotes = JSON.parse(storedQuotes);
  }
}

// --- Session Storage (last viewed quote) ---
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

// --- Populate categories dynamically ---
function populateCategories() {
  const uniqueCategories = [...new Set(quotes.map(q => q.category))];
  
  // Clear old options except "all"
  categoryFilter.innerHTML = `<option value="all">All Categories</option>`;
  
  uniqueCategories.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    categoryFilter.appendChild(option);
  });

  // Restore last selected filter
  const savedFilter = localStorage.getItem("selectedCategory") || "all";
  categoryFilter.value = savedFilter;
}

// --- Filter quotes ---
function filterQuotes() {
  const selected = categoryFilter.value;
  localStorage.setItem("selectedCategory", selected);
  
  if (selected === "all") {
    showRandomQuote();
  } else {
    const filtered = quotes.filter(q => q.category === selected);
    if (filtered.length > 0) {
      const randomIndex = Math.floor(Math.random() * filtered.length);
      const quote = filtered[randomIndex];
      quoteDisplay.innerHTML = `"${quote.text}" <br><span class="category">— ${quote.category}</span>`;
      saveLastViewedQuote(quote);
    } else {
      quoteDisplay.innerHTML = `<em>No quotes available in "${selected}" category.</em>`;
    }
  }
}

// --- Show a random quote ---
function showRandomQuote() {
  const selected = categoryFilter.value;
  if (quotes.length === 0) {
    quoteDisplay.innerHTML = "<em>No quotes available. Please add one!</em>";
    return;
  }
  if (selected === "all") {
    const randomIndex = Math.floor(Math.random() * quotes.length);
    const quote = quotes[randomIndex];
    quoteDisplay.innerHTML = `"${quote.text}" <br><span class="category">— ${quote.category}</span>`;
    saveLastViewedQuote(quote);
  } else {
    filterQuotes();
  }
}

// --- Add a new quote ---
function addQuote(event) {
  event.preventDefault();
  const text = newQuoteText.value.trim();
  const category = newQuoteCategory.value.trim();

  if (text && category) {
    quotes.push({ text, category });
    saveQuotes();
    newQuoteText.value = "";
    newQuoteCategory.value = "";
    populateCategories();
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
        populateCategories();
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

// --- Handle server sync ---
function handleServerSync(serverQuotes) {
  lastServerSync = serverQuotes;
  const localQuotes = JSON.stringify(quotes);
  const serverData = JSON.stringify(serverQuotes);

  if (localQuotes !== serverData) {
    quotes = serverQuotes; // Server wins
    saveQuotes();
    populateCategories();
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
    saveQuotes();
  }

  populateCategories();
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
loadLastViewedQuote();
populateCategories();
filterQuotes();
fetchFromServer();
setInterval(fetchFromServer, 30000);
