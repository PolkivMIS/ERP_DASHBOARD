window.initTab2Subtab4 = function () {
  console.log("🚀 JS loaded: tab2-subtab4-sales-master.js");

  const configSheetURL = "https://docs.google.com/spreadsheets/d/1HFxlrRylkGRfiaNH9hakiZWaOcB8NbJAAkVp7l-8bCc/export?format=csv&gid=443340601";
  const cache = window.salesMasterCache;
  if (!cache || !cache.loaded) {
    console.warn("⚠️ SALESMASTER data not loaded yet.");
    return;
  }

  const waitForDOM = setInterval(() => {
    const dropdown = document.getElementById("orderStatusSelect");
    const table = document.getElementById("order-status-table");
    if (dropdown && table) {
      clearInterval(waitForDOM);
      fetch(configSheetURL)
        .then(res => res.text())
        .then(configCSV => {
          setupDropdownFromConfig(configCSV);
        })
        .catch(err => {
          console.error("❌ Failed to load CONFIG sheet:", err);
        });
    }
  }, 50);

  function parseCSV(text) {
    const rows = [];
    const lines = text.trim().split("\n");

    for (const line of lines) {
      const cells = [];
      let cell = "", inQuotes = false;

      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"' && line[i + 1] === '"') {
          cell += '"'; i++;
        } else if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          cells.push(cell.trim()); cell = "";
        } else {
          cell += char;
        }
      }
      cells.push(cell.trim());
      rows.push(cells);
    }

    return rows;
  }

  function formatNumber(value) {
    const cleaned = String(value).replace(/,/g, "").replace(/[^\d.-]/g, "");
    const num = parseFloat(cleaned);
    return isNaN(num)
      ? "--"
      : num.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  function setText(id, value) {
    const el = document.getElementById(id);
    el.textContent = value && value !== "" ? value : "--";
  }

  function setupDropdownFromConfig(configCSV) {
    const rows = parseCSV(configCSV);
    const headers = rows[0];
    const dataRows = rows.slice(1);

    const statusIndex = headers.findIndex(h => h.trim().toUpperCase() === "ORDER RECEIVED");
    if (statusIndex === -1) {
      console.warn("⚠️ ORDER RECEIVED column not found in CONFIG sheet.");
      return;
    }

    const uniqueStatuses = [...new Set(dataRows.map(row => row[statusIndex]).filter(Boolean))];
    const select = document.getElementById("orderStatusSelect");
    if (!select) {
      console.warn("⚠️ orderStatusSelect dropdown not found in DOM.");
      return;
    }

    select.innerHTML = `<option value="">Select Status</option>`;
    uniqueStatuses.forEach(status => {
      const option = document.createElement("option");
      option.value = status;
      option.textContent = status;
      select.appendChild(option);
    });

    select.addEventListener("change", () => {
      const selected = select.value.trim().toUpperCase();
      const statusIndex = cache.headers.findIndex(h => h.trim().toUpperCase() === "ORDER RECEIVED");
      const filtered = cache.rows.filter(row => {
        const raw = row[statusIndex] || "";
        return raw.trim().toUpperCase() === selected;
      });

      console.log(`📊 Filtering for ORDER RECEIVED = ${selected}`);
      renderDashboard(filtered);
    });

    select.selectedIndex = 0;
    select.dispatchEvent(new Event("change"));
  }

  function renderDashboard(rows) {
    const get = (row, key) => {
      const index = cache.headers.findIndex(h => h.trim().toUpperCase() === key.trim().toUpperCase());
      const value = index !== -1 ? row[index] : "";
      return value && value.trim() !== "" ? value.trim() : "--";
    };

    const totalOrders = rows.length;
    const totalQuantity = rows.reduce((sum, r) => sum + (parseFloat(get(r, "QUANTITY")) || 0), 0);
    const amountReceived = rows.reduce((sum, r) => sum + (parseFloat(get(r, "AMOUNT")) || 0), 0);
    const partyCount = new Set(rows.map(r => get(r, "PARTY NAME")).filter(p => p !== "--")).size;

    setText("order-status-orders", totalOrders);
    setText("order-status-quantity", totalQuantity);
    setText("order-status-amount", formatNumber(amountReceived));
    setText("order-status-parties", partyCount);

    renderTable(rows);
  }

  function renderTable(rows) {
    const table = document.getElementById("order-status-table");
    const tbody = table.querySelector("tbody");
    tbody.innerHTML = "";

    const headers = cache.headers.map(h => h.trim().toUpperCase());
    const get = (row, key) => {
      const index = headers.findIndex(h => h === key.trim().toUpperCase());
      const value = index !== -1 ? row[index] : "";
      return value && value.trim() !== "" ? value.trim() : "--";
    };

    rows.forEach((row, i) => {
      if (row.length !== headers.length) {
        console.warn(`⚠️ Row ${i + 1} malformed: ${row.length} cells, expected ${headers.length}`);
        console.warn("🔍 Raw row:", row);
        return;
      }

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${get(row, "TIMESTAMP")}</td>
        <td>${get(row, "PARTY NAME")}</td>
        <td>${get(row, "SALES EXECUTIVE")}</td>
        <td>${get(row, "ORDER RECEIVED")}</td>
        <td>${get(row, "PAYMENT RECEIVED")}</td>
        <td>${get(row, "QUANTITY")}</td>
        <td>${formatNumber(get(row, "AMOUNT"))}</td>
        <td>${formatNumber(get(row, "CURRENT AMOUNT"))}</td>
        <td>${formatNumber(get(row, "POST-DATED AMOUNT"))}</td>
      `;
      tbody.appendChild(tr);
    });
  }
};
