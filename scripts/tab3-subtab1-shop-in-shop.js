window.initTab3Subtab1 = function () {
  console.log("✅ tab3-subtab1-shop-in-shop.js is running");

  const sheetMap = {
    "2024-25": "gid=123456789", // Replace with actual GID
    "2025-26": "gid=0",         // Your current sheet
    "2026-27": "gid=987654321"  // Replace with actual GID
  };

  const baseId = "1qUB7gJz8__HBnCTNTzuCbgzNTxkYYPQO74YA5gh2l7E";

  let setupMap = {};
  let allShops = [];
  let allBrandsByMonth = {};

  function getSheetURL(yearRange) {
    const gid = sheetMap[yearRange];
    if (!gid) return null;
    return `https://docs.google.com/spreadsheets/d/${baseId}/export?format=csv&${gid}`;
  }

  function parseCSV(text) {
    const lines = text.trim().split("\n");
    return lines.map((line) => {
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

  function forwardFill(row) {
    let current = "";
    return row.map((cell) => {
      if (cell.trim()) current = cell.trim();
      return current;
    });
  }

  function buildSetupMap(rows) {
    const monthRow = forwardFill(rows[0]);
    const brandRow = rows[1];
    const shopRows = rows.slice(2);

    setupMap = {};
    allBrandsByMonth = {};
    allShops = [];

    shopRows.forEach((row) => {
      const shop = row[0]?.trim();
      if (!shop) return;
      allShops.push(shop);
      setupMap[shop] = {};

      for (let i = 1; i < row.length; i++) {
        const month = monthRow[i]?.trim().toUpperCase();
        const brand = brandRow[i]?.trim();
        const status = row[i]?.trim();

        if (!month || !brand) continue;

        if (!setupMap[shop][month]) setupMap[shop][month] = {};
        setupMap[shop][month][brand] = status;

        if (!allBrandsByMonth[month]) allBrandsByMonth[month] = new Set();
        allBrandsByMonth[month].add(brand);
      }
    });

    Object.keys(allBrandsByMonth).forEach((month) => {
      allBrandsByMonth[month] = Array.from(allBrandsByMonth[month]);
    });
  }

  function renderTable(containerId, brands, shops, month) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const table = document.createElement("table");
    table.className = "shop-brand-table";

    const thead = document.createElement("thead");
    const headerRow = document.createElement("tr");
    headerRow.innerHTML = `<th>Shop Name</th>` + brands.map((b) => `<th>${b}</th>`).join("");
    thead.appendChild(headerRow);

    const tbody = document.createElement("tbody");
    shops.forEach((shop) => {
      const row = document.createElement("tr");
      const cells = brands.map((brand) => {
        const status = setupMap?.[shop]?.[month]?.[brand] || "";
        let colorClass = "";
        if (status.toUpperCase() === "DONE") colorClass = "done-cell";
        else if (status.toUpperCase() === "NOT DONE") colorClass = "not-done-cell";
        else colorClass = "blank-cell";

        return `<td class="${colorClass}">${status}</td>`;
      }).join("");
      row.innerHTML = `<td>${shop}</td>${cells}`;
      tbody.appendChild(row);
    });

    table.appendChild(thead);
    table.appendChild(tbody);
    container.innerHTML = "";
    container.appendChild(table);
  }

  function populateMatrix(month) {
    const brands = allBrandsByMonth[month] || [];
    const midpoint = Math.ceil(allShops.length / 2);
    const groupA = allShops.slice(0, midpoint);
    const groupB = allShops.slice(midpoint);

    renderTable("matrixA", brands, groupA, month);
    renderTable("matrixB", brands, groupB, month);
  }

  function handleMonthChange() {
    const selectedMonth = document.getElementById("monthSelect")?.value.trim().toUpperCase();
    populateMatrix(selectedMonth);
  }

  function handleYearChange() {
    const yearRange = document.getElementById("yearSelect")?.value;
    const month = document.getElementById("monthSelect")?.value.trim().toUpperCase();
    const sheetURL = getSheetURL(yearRange);

    if (!sheetURL) {
      document.getElementById("matrixA").innerHTML = `<p style="text-align:center;color:#c62828;">Sheet for "${yearRange}" not found.</p>`;
      document.getElementById("matrixB").innerHTML = "";
      return;
    }

    fetch(sheetURL)
      .then((res) => res.text())
      .then((csv) => {
        const rows = parseCSV(csv);
        buildSetupMap(rows);
        populateMatrix(month);
      })
      .catch((err) => {
        console.error("❌ Failed to fetch sheet:", err);
        document.getElementById("matrixA").innerHTML = `<p style="text-align:center;color:#c62828;">Failed to load data.</p>`;
        document.getElementById("matrixB").innerHTML = "";
      });
  }

  // ✅ Auto-select current year and wire up listeners
  const currentYear = new Date().getFullYear();
  const fiscalYear = `${currentYear}-${(currentYear + 1).toString().slice(-2)}`;
  const yearSelect = document.getElementById("yearSelect");
  if (yearSelect) {
    yearSelect.value = fiscalYear;
    handleYearChange();
  }

  document.getElementById("monthSelect")?.addEventListener("change", handleMonthChange);
  document.getElementById("yearSelect")?.addEventListener("change", handleYearChange);
};