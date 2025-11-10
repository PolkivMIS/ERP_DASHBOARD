window.initTab5Subtab2 = function () {
  console.log("✅ Tab 5 Subtab 2 logic triggered");

  const sheetURL =
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vTbHngtITw-xJhvFTYwmrvAwttXhMcY3Y6gLB0CCfiJazP8yZ4L-V-hfFWA1qGFUVF1CHvUIs6DLktH/pub?gid=1504729487&output=csv";

  const container = document.getElementById("Tab2");
  if (!container) return;

  const isMobile = window.innerWidth <= 768;

  const table = document.querySelector("#attendance-full-table");
  const thead = table?.querySelector("thead");
  const tbody = table?.querySelector("tbody");

  const grid = document.querySelector("#attendance-grid");

  // === CSV Parser ===
  function parseCSV(text) {
    const lines = text.trim().split("\n");
    return lines.map(line => {
      const cells = [];
      let current = "";
      let inQuotes = false;

      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        const nextChar = line[i + 1];

        if (char === '"' && nextChar === '"') {
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

  // === Desktop Table Renderer ===
  function renderTable(headers, rows) {
    const columnIndexes = [];
    for (let i = 0; i < headers.length; i++) {
      if (i === 0 || i === 1 || (i >= 2 && i % 2 === 0)) {
        columnIndexes.push(i);
      }
    }

    thead.innerHTML = `<tr>${columnIndexes.map(i => `<th>${headers[i] || ""}</th>`).join("")}</tr>`;

    tbody.innerHTML = "";
    rows.forEach(row => {
      const tr = document.createElement("tr");
      columnIndexes.forEach(index => {
        const td = document.createElement("td");
        const val = row[index] ? row[index].trim().toUpperCase() : "";
        td.textContent = val;

        if (val === "P") td.classList.add("attendance-P");
        else if (val === "A") td.classList.add("attendance-A");
        else if (val === "L") td.classList.add("attendance-L");
        else if (val === "H") td.classList.add("attendance-H");

        tr.appendChild(td);
      });
      tbody.appendChild(tr);
    });
  }

  // === Mobile Grid Renderer ===
  function renderGrid(headers, rows) {
    grid.innerHTML = "";

    const visibleIndexes = [];
    for (let i = 0; i < headers.length; i++) {
      if (i === 0 || i === 1 || (i >= 2 && i % 2 === 0)) {
        visibleIndexes.push(i);
      }
    }

    grid.style.gridTemplateColumns = `130px 130px repeat(${visibleIndexes.length - 2}, 28px)`;

    // === Header Row ===
    visibleIndexes.forEach(i => {
      const cell = document.createElement("div");
      cell.className = "attendance-cell header";
      if (i === 0) cell.classList.add("frozen-1");
      if (i === 1) cell.classList.add("frozen-2");
      if (i >= 2) cell.classList.add("date");
      cell.textContent = headers[i];
      grid.appendChild(cell);
    });

    // === Data Rows ===
    rows.forEach(row => {
      visibleIndexes.forEach(i => {
        const val = row[i] ? row[i].trim().toUpperCase() : "";
        const cell = document.createElement("div");
        cell.className = "attendance-cell";
        if (i === 0) cell.classList.add("frozen-1");
        if (i === 1) cell.classList.add("frozen-2");
        if (val === "P") cell.classList.add("P");
        else if (val === "A") cell.classList.add("A");
        else if (val === "L") cell.classList.add("L");
        else if (val === "H") cell.classList.add("H");
        cell.textContent = val;
        grid.appendChild(cell);
      });
    });
  }

  // === Fetch and Render ===
  fetch(sheetURL)
    .then(res => res.text())
    .then(csv => {
      const rows = parseCSV(csv);
      const headers = rows[1];        // Row 3 = actual headers
      const dataRows = rows.slice(3); // Row 4+ = attendance data

      if (isMobile) {
        renderGrid(headers, dataRows);
      } else {
        renderTable(headers, dataRows);
      }
    })
    .catch(err => {
      console.error("❌ Failed to fetch sheet:", err);
      container.innerHTML = "<p>Error loading attendance data.</p>";
    });
};
