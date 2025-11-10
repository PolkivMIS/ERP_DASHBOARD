window.initTab2Subtab2 = function () {
  console.log("🚀 JS loaded: tab2-subtab2-district-master.js");

  const configSheetURL = "https://docs.google.com/spreadsheets/d/1HFxlrRylkGRfiaNH9hakiZWaOcB8NbJAAkVp7l-8bCc/export?format=csv&gid=443340601";

  const cache = window.salesMasterCache;
  if (!cache || !cache.loaded) {
    console.warn("⚠️ SALESMASTER data not loaded yet.");
    return;
  }

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

  function populateDistrictDropdownFromConfig(configCSV) {
    const rows = parseCSV(configCSV);
    const headers = rows[0];
    const dataRows = rows.slice(1);

    console.log("📄 CONFIG raw rows:", rows);
    console.log("🔍 CONFIG headers:", headers);

    const townIndex = headers.indexOf("DISTRICT / TOWN");
    console.log("📍 DISTRICT / TOWN column index:", townIndex);

    if (townIndex === -1) {
      console.warn("⚠️ DISTRICT / TOWN column not found in CONFIG sheet.");
      return;
    }

    const uniqueTowns = [...new Set(dataRows.map(row => row[townIndex]).filter(Boolean))].sort((a, b) => a.localeCompare(b));

    console.log("🏙️ Extracted towns:", uniqueTowns);

    const select = document.getElementById("districtSelect");
    if (!select) {
      console.warn("⚠️ districtSelect dropdown not found in DOM.");
      return;
    }

    select.innerHTML = `<option value="">Select District / Town</option>`;
    uniqueTowns.forEach(town => {
      const option = document.createElement("option");
      option.value = town;
      option.textContent = town;
      select.appendChild(option);
    });

    select.addEventListener("change", () => {
      const selected = select.value;
      const townIndex = cache.headers.indexOf("DISTRICT / TOWN");
      const filtered = cache.rows.filter(row => row[townIndex] === selected);
      console.log(`📊 Filtering data for town: ${selected} (${filtered.length} rows)`);
      console.log("🧩 Sheet headers:", cache.headers);
      console.log("📦 Filtered rows:", filtered);
      renderDistrictDashboard(filtered);
    });

    select.selectedIndex = 0;
    select.dispatchEvent(new Event("change"));
  }

  function renderDistrictDashboard(rows) {
    const headers = cache.headers;
    const get = (row, key) => {
      const index = headers.findIndex(h => h.trim().toUpperCase() === key.trim().toUpperCase());
      return index !== -1 ? row[index] : "--";
    };

    const totalOrders = rows.filter(r => get(r, "ORDER RECEIVED") === "YES").length;
    const totalQuantity = rows.reduce((sum, r) => sum + (parseFloat(get(r, "QUANTITY")) || 0), 0);
    const amountReceived = rows.reduce((sum, r) => sum + (parseFloat(get(r, "AMOUNT")) || 0), 0);
    const partyCount = new Set(rows.map(r => get(r, "PARTY NAME"))).size;

    setText("district-orders", totalOrders);
    setText("district-quantity", totalQuantity);
    setText("district-amount", formatNumber(String(amountReceived)));
    setText("district-parties", partyCount);

    renderDistrictTable(rows);
  }

  function renderDistrictTable(rows) {
    const table = document.getElementById("district-table");
    if (!table) return;

    const tbody = table.querySelector("tbody");
    tbody.innerHTML = "";

    const headers = cache.headers.map(h => h.trim().toUpperCase());
    const get = (row, key) => {
      const index = headers.findIndex(h => h === key.trim().toUpperCase());
      return index !== -1 && index < row.length ? row[index] : "--";
    };

    rows.forEach((row, i) => {
      if (row.length !== headers.length) {
        console.warn(`⚠️ Row ${i + 1} has ${row.length} cells, expected ${headers.length}. Skipping.`);
        return;
      }

      const timestamp = get(row, "TIMESTAMP");
      const party = get(row, "PARTY NAME");
      const executive = get(row, "SALES EXECUTIVE");
      const order = get(row, "ORDER RECEIVED");
      const payment = get(row, "PAYMENT RECEIVED");
      const quantity = get(row, "QUANTITY");
      const rawAmount = get(row, "AMOUNT");
      const rawCurrent = get(row, "CURRENT AMOUNT");
      const rawPostdated = get(row, "POST-DATED AMOUNT");

      const amount = formatNumber(rawAmount);
      const current = formatNumber(rawCurrent);
      const postdated = formatNumber(rawPostdated);

      console.log(`🧾 Row ${i + 1}:`, {
        TIMESTAMP: timestamp,
        PARTY_NAME: party,
        SALES_EXECUTIVE: executive,
        ORDER_RECEIVED: order,
        PAYMENT_RECEIVED: payment,
        QUANTITY: quantity,
        AMOUNT: rawAmount,
        FORMATTED_AMOUNT: amount
      });

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${timestamp}</td>
        <td>${party}</td>
        <td>${executive}</td>
        <td>${order}</td>
        <td>${payment}</td>
        <td>${quantity}</td>
        <td>${amount}</td>
        <td>${current}</td>
        <td>${postdated}</td>
      `;
      tbody.appendChild(tr);
    });
  }

  // === Load CONFIG sheet and populate dropdown ===
  fetch(configSheetURL)
    .then(res => res.text())
    .then(configCSV => {
      populateDistrictDropdownFromConfig(configCSV);
    })
    .catch(err => {
      console.error("❌ Failed to load CONFIG sheet:", err);
    });
};