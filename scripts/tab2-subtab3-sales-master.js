window.initTab2Subtab3 = function () {
  console.log("🚀 JS loaded: tab2-subtab3-sales-master.js");

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
    const cleaned = String(value).replace(/,/g, "").replace(/[^\d.-]/g, "");
    const num = parseFloat(cleaned);
    return isNaN(num)
      ? "--"
      : num.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  function setText(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value || "--";
  }

  function populateStoreDropdown(configCSV) {
    const rows = parseCSV(configCSV);
    const headers = rows[0];
    const dataRows = rows.slice(1);

    const storeIndex = headers.findIndex(h => h.trim().toUpperCase() === "PARTY NAME");
    if (storeIndex === -1) {
      console.warn("⚠️ PARTY NAME column not found in CONFIG sheet.");
      return;
    }

    const uniqueStores = [...new Set(dataRows.map(row => row[storeIndex]).filter(Boolean))].sort((a, b) => a.localeCompare(b));
    const select = document.getElementById("storeSelect");
    if (!select) {
      console.warn("⚠️ storeSelect dropdown not found in DOM.");
      return;
    }

    select.innerHTML = `<option value="">Select Store</option>`;
    uniqueStores.forEach(store => {
      const option = document.createElement("option");
      option.value = store;
      option.textContent = store;
      select.appendChild(option);
    });

    select.addEventListener("change", () => {
      const selected = select.value.trim().toUpperCase();
      const storeIndex = cache.headers.findIndex(h => h.trim().toUpperCase() === "PARTY NAME");
      const filtered = cache.rows.filter(row => {
        const raw = row[storeIndex] || "";
        return raw.trim().toUpperCase() === selected;
      });

      console.log(`📊 Filtering data for store: ${selected} (${filtered.length} rows)`);
      renderStoreDashboard(filtered);
    });

    select.selectedIndex = 0;
    select.dispatchEvent(new Event("change"));
  }

  function renderStoreDashboard(rows) {
    const headers = cache.headers;
    const get = (row, key) => {
      const index = headers.findIndex(h => h.trim().toUpperCase() === key.trim().toUpperCase());
      return index !== -1 ? (row[index] || "").trim() : "";
    };

    const totalOrders = rows.filter(r => get(r, "ORDER RECEIVED").toUpperCase() === "YES").length;
    const totalQuantity = rows.reduce((sum, r) => {
      const val = parseFloat(get(r, "QUANTITY").replace(/,/g, "").replace(/[^\d.-]/g, ""));
      return sum + (isNaN(val) ? 0 : val);
    }, 0);

    const amountReceived = rows.reduce((sum, r) => {
      const val = parseFloat(get(r, "AMOUNT").replace(/,/g, "").replace(/[^\d.-]/g, ""));
      return sum + (isNaN(val) ? 0 : val);
    }, 0);

    const partyCount = new Set(rows.map(r => get(r, "PARTY NAME"))).size;

    setText("store-orders", totalOrders);
    setText("store-quantity", totalQuantity);
    setText("store-amount", formatNumber(amountReceived));
    setText("store-parties", partyCount);

    renderStoreTable(rows);
  }

  function renderStoreTable(rows) {
    const table = document.getElementById("store-table");
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

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${get(row, "TIMESTAMP")}</td>
        <td>${get(row, "PARTY NAME")}</td>
        <td>${get(row, "DISTRICT / TOWN")}</td>
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

  fetch(configSheetURL)
    .then(res => res.text())
    .then(configCSV => {
      populateStoreDropdown(configCSV);
    })
    .catch(err => {
      console.error("❌ Failed to load CONFIG sheet:", err);
    });
};
