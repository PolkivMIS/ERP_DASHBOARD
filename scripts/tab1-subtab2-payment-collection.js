window.initTab1Subtab2 = function () {
  console.log("🚀 JS loaded: tab1-subtab2-party-collection.js");

  const sheetURL = "https://docs.google.com/spreadsheets/d/13K5MocwlttfQ7ziLHmDNTE32GK6c2DdSL-R92m-s5pY/export?format=csv&gid=0";

  if (!window.partyCollectionCache) {
    window.partyCollectionCache = { headers: [], rows: [], loaded: false };
  }

  const cache = window.partyCollectionCache;

  function parseCSV(text) {
    return text.trim().split("\n").map(line => {
      const cells = [];
      let current = "";
      let inQuotes = false;

      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"' && line[i + 1] === '"') {
          current += '"';
          i++;
        } else if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === "," && !inQuotes) {
          cells.push(current.trim());
          current = "";
        } else {
          current += char;
        }
      }
      cells.push(current.trim());
      return cells;
    });
  }

  function formatCell(value) {
    if (!value || value === "") return "--";
    const cleaned = value.replace(/,/g, "").replace(/[^\d.-]/g, "");
    const num = parseFloat(cleaned);
    return isNaN(num) ? value : num.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  function renderTable(headers, rows) {
    const thead = document.getElementById("party-header");
    const tbody = document.getElementById("party-body");

    if (!thead || !tbody) {
      console.warn("⚠️ Table elements not found.");
      return;
    }

    // Clear previous content
    thead.innerHTML = "";
    tbody.innerHTML = "";

    // Inject headers
    const headerRow = document.createElement("tr");
    headers.forEach(text => {
      const th = document.createElement("th");
      th.textContent = text;
      headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);

    // Inject rows
    rows.forEach(row => {
      const tr = document.createElement("tr");
      row.forEach(cell => {
        const td = document.createElement("td");
        td.textContent = formatCell(cell);
        tr.appendChild(td);
      });
      tbody.appendChild(tr);
    });
  }

  // === Load CSV ===
  fetch(sheetURL)
    .then(res => res.text())
    .then(csv => {
      const rows = parseCSV(csv);
      cache.headers = rows[0];
      cache.rows = rows.slice(1);
      cache.loaded = true;
      console.log("📥 PARTY COLLECTION sheet loaded:", cache.rows.length, "rows");

      renderTable(cache.headers, cache.rows);
    })
    .catch(err => {
      console.error("❌ Failed to fetch PARTY COLLECTION sheet:", err);
    });
};