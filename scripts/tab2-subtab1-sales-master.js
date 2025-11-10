window.initTab2Subtab1 = function () {
  const container = document.getElementById("Tab1");
  if (!container) {
    setTimeout(() => window.initTab2Subtab1(), 100);
    return;
  }

  console.log("🚀 JS loaded: tab2-subtab1-sales-master.js");

  const dataSheetURL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQ0JT3m9EsaFWilZQPkqQAiWl-hmn0hwkoaB84vNwH3cdWbp26G8mS293vgvksA-sw55kBsxY4a6FXL/pub?output=csv";
  const configSheetURL = "https://docs.google.com/spreadsheets/d/1HFxlrRylkGRfiaNH9hakiZWaOcB8NbJAAkVp7l-8bCc/export?format=csv&gid=443340601";

  if (!window.salesMasterCache) {
    window.salesMasterCache = { headers: [], rows: [], loaded: false };
  }

  const cache = window.salesMasterCache;

  function parseCSV(text) {
    return text.trim().split("\n").map(line => line.split(",").map(cell => cell.trim()));
  }

  function formatNumber(value) {
    if (!value || typeof value !== "string") return "--";
    const cleaned = value.replace(/,/g, "").replace(/[^\d.-]/g, "");
    const num = parseFloat(cleaned);
    return isNaN(num)
      ? "--"
      : num.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  function setText(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value || "--";
  }

  function populateExecutiveDropdownFromConfig(configCSV) {
    const rows = parseCSV(configCSV);
    const headers = rows[0];
    const dataRows = rows.slice(1);

    const execIndex = headers.indexOf("SALES EXECUTIVE");
    if (execIndex === -1) {
      console.warn("⚠️ SALES EXECUTIVE column not found in CONFIG sheet.");
      return;
    }

    const uniqueExecs = [...new Set(dataRows.map(row => row[execIndex]).filter(Boolean))].sort((a, b) => a.localeCompare(b));
    const select = document.getElementById("executiveSelect");
    if (!select) {
      console.warn("⚠️ executiveSelect dropdown not found in DOM.");
      return;
    }

    select.innerHTML = `<option value="">Select Executive</option>`;
    uniqueExecs.forEach(name => {
      const option = document.createElement("option");
      option.value = name;
      option.textContent = name;
      select.appendChild(option);
    });

    select.addEventListener("change", () => {
      const selected = select.value;
      const execIndex = cache.headers.indexOf("SALES EXECUTIVE");
      const filtered = cache.rows.filter(row => row[execIndex] === selected);
      renderDashboard(filtered);
    });

    select.selectedIndex = 0;
    select.dispatchEvent(new Event("change"));
  }

  function renderDashboard(rows) {
    const headers = cache.headers;
    const get = (row, key) => {
      const index = headers.findIndex(h => h.trim().toUpperCase() === key.trim().toUpperCase());
      return index !== -1 ? row[index] : "--";
    };

    const totalOrders = rows.filter(r => get(r, "ORDER RECEIVED") === "YES").length;
    const totalQuantity = rows.reduce((sum, r) => sum + (parseFloat(get(r, "QUANTITY")) || 0), 0);
    const amountReceived = rows.reduce((sum, r) => sum + (parseFloat(get(r, "AMOUNT")) || 0), 0);
    const pendingPayments = rows.filter(r => get(r, "PAYMENT RECEIVED") !== "YES").length;

    setText("orders-received", totalOrders);
    setText("total-quantity", totalQuantity);
    setText("amount-received", formatNumber(String(amountReceived)));
    setText("pending-payments", pendingPayments);

    renderTable(rows);
  }

  function renderTable(rows) {
    const table = document.getElementById("executive-table");
    if (!table) return;

    const tbody = table.querySelector("tbody");
    tbody.innerHTML = "";

    const headers = cache.headers.map(h => h.trim().toUpperCase());

    const get = (row, key) => {
      const normalizedKey = key.trim().toUpperCase();
      const index = headers.findIndex(h => h === normalizedKey);
      return index !== -1 && index < row.length ? row[index] : "--";
    };

    rows.forEach((row, i) => {
      if (row.length !== headers.length) {
        console.warn(`⚠️ Row ${i + 1} has ${row.length} cells, expected ${headers.length}. Skipping.`);
        return;
      }

      const timestamp = get(row, "TIMESTAMP");
      const party = get(row, "PARTY NAME");
      const town = get(row, "DISTRICT / TOWN");
      const order = get(row, "ORDER RECEIVED");
      const payment = get(row, "PAYMENT RECEIVED");
      const rawAmount = get(row, "AMOUNT");
      const rawCurrent = get(row, "CURRENT AMOUNT");
      const rawPostdated = get(row, "POST-DATED AMOUNT");

      const amount = formatNumber(rawAmount);
      const current = formatNumber(rawCurrent);
      const postdated = formatNumber(rawPostdated);

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${timestamp}</td>
        <td>${party}</td>
        <td>${town}</td>
        <td>${order}</td>
        <td>${payment}</td>
        <td>${amount}</td>
        <td>${current}</td>
        <td>${postdated}</td>
      `;
      tbody.appendChild(tr);
    });
  }

  // === Load SALESMASTER and CONFIG ===
  fetch(dataSheetURL)
    .then(res => res.text())
    .then(csv => {
      const rows = parseCSV(csv);
      cache.headers = rows[0];
      cache.rows = rows.slice(1);
      cache.loaded = true;

      document.dispatchEvent(new Event("salesMasterReady"));

      fetch(configSheetURL)
        .then(res => res.text())
        .then(configCSV => {
          populateExecutiveDropdownFromConfig(configCSV);
        })
        .catch(err => {
          console.error("❌ Failed to load CONFIG sheet:", err);
        });
    })
    .catch(err => {
      console.error("❌ Failed to fetch SALESMASTER sheet:", err);
    });
};
