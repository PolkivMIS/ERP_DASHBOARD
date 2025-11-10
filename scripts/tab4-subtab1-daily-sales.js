window.initTab4Subtab1 = function () {
  function waitForSubtab(selector, callback, timeout = 1000) {
    const start = Date.now();
    const check = () => {
      const el = document.querySelector(selector);
      if (el && el.offsetParent !== null) return callback();
      if (Date.now() - start < timeout) requestAnimationFrame(check);
    };
    check();
  }

  waitForSubtab("#Tab1", () => {
    console.log("✅ Tab 4 Subtab 1 logic triggered");

    const storeSheetURL = "https://docs.google.com/spreadsheets/d/10mSGlLUMTTLEyz9HenfbavVw4tZRIZGjWKxjUya7Z4g/export?format=csv&gid=1608114775";
    const salesSheetURL = "https://docs.google.com/spreadsheets/d/10mSGlLUMTTLEyz9HenfbavVw4tZRIZGjWKxjUya7Z4g/export?format=csv&gid=1169431503";
    const summaryCSVUrl = "https://docs.google.com/spreadsheets/d/10mSGlLUMTTLEyz9HenfbavVw4tZRIZGjWKxjUya7Z4g/export?format=csv&gid=0";
    const storeDropdownCSV = "https://docs.google.com/spreadsheets/d/10mSGlLUMTTLEyz9HenfbavVw4tZRIZGjWKxjUya7Z4g/export?format=csv&gid=2141639070";

    let storeRows = [], storeHeaders = [], salesMap = {}, summaryData = [];

    function parseCSV(text) {
      return text.trim().split("\n").map(line => {
        const cells = [], chars = [...line];
        let current = "", inQuotes = false;
        for (let i = 0; i < chars.length; i++) {
          const char = chars[i];
          if (char === '"' && chars[i + 1] === '"') { current += '"'; i++; }
          else if (char === '"') inQuotes = !inQuotes;
          else if (char === "," && !inQuotes) { cells.push(current.trim()); current = ""; }
          else current += char;
        }
        cells.push(current.trim());
        return cells;
      });
    }

    function normalizeKey(name) {
      return name.trim().toUpperCase();
    }

    function formatINRCurrency(value) {
      const num = parseFloat(value.replace(/[^\d.-]/g, ""));
      return isNaN(num) ? "₹ 0" : `₹ ${num.toLocaleString("en-IN", { minimumFractionDigits: 0 })}`;
    }

    function formatStoreDisplay(rawName, location) {
      const base = rawName?.replace(/\(.*?\)/g, "").split("-")[0].trim() || "";
      const loc = location?.trim().toUpperCase() || "";
      return loc ? `${base} (${loc})` : base;
    }

    function populateSalesTable() {
      const tableBody = document.getElementById("salesTableBody");
      if (!tableBody) return console.error("Sales table body not found.");
      tableBody.innerHTML = "";

      storeRows.forEach((row, i) => {
        const rawStoreName = row[storeHeaders.indexOf("STORE NAME")];
        const location = row[storeHeaders.indexOf("LOCATION")];
        const displayName = formatStoreDisplay(rawStoreName, location);
        const lookupKey = normalizeKey(displayName);
        const sales = salesMap[lookupKey] || { daily: "0", monthly: "0" };

        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${displayName}</td>
          <td>${formatINRCurrency(sales.daily)}</td>
          <td>${formatINRCurrency(sales.monthly)}</td>
        `;
        tableBody.appendChild(tr);
      });
    }

    function buildSalesMap(salesRows) {
      const headers = salesRows[0];
      const nameIndex = headers.indexOf("STORE NAME");
      const dailyIndex = headers.indexOf("DAILY SALES");
      const monthlyIndex = headers.indexOf("MONTHLY SALES");

      const map = {};
      salesRows.slice(1).forEach(row => {
        const key = normalizeKey(row[nameIndex]);
        map[key] = {
          daily: row[dailyIndex] || "0",
          monthly: row[monthlyIndex] || "0"
        };
      });
      return map;
    }

    function formatDate(input) {
      const [yyyy, mm, dd] = input.split("-");
      return `${dd}/${mm}/${yyyy}`;
    }

    function getTodayDate() {
      const now = new Date();
      return `${String(now.getDate()).padStart(2, "0")}/${String(now.getMonth() + 1).padStart(2, "0")}/${now.getFullYear()}`;
    }

    function sumSales(store, date, month, year) {
      return summaryData
        .filter(row =>
          row.store === store &&
          (!date || row.date === date) &&
          (!month || row.month === month.toUpperCase()) &&
          (!year || row.year === year)
        )
        .reduce((sum, row) => sum + row.amount, 0);
    }

    function updateSummaryBoxes() {
      const store = document.getElementById("storeDropdown")?.value || "";
      const dateInput = document.getElementById("dateInput")?.value || "";
      const month = document.getElementById("monthInput")?.value || "";
      const year = document.getElementById("yearInput")?.value || "";

      const formattedDate = dateInput ? formatDate(dateInput) : "";
      const today = getTodayDate();

      const todayTotal = store ? sumSales(store, today, null, null) : 0;
      const dateTotal = store && dateInput ? sumSales(store, formattedDate, null, null) : 0;
      const monthTotal = store && month ? sumSales(store, null, month, null) : 0;
      const yearTotal = store && year ? sumSales(store, null, null, year) : 0;

      document.querySelector("#currentDateSales p").textContent = `₹ ${todayTotal.toLocaleString()}`;
      document.querySelector("#selectedDateSales p").textContent = `₹ ${dateTotal.toLocaleString()}`;
      document.querySelector("#selectedMonthSales p").textContent = `₹ ${monthTotal.toLocaleString()}`;
      document.querySelector("#selectedYearSales p").textContent = `₹ ${yearTotal.toLocaleString()}`;

      console.log("📈 Summary updated →", { store, todayTotal, dateTotal, monthTotal, yearTotal });
    }

    function setupSummaryListeners() {
      ["storeDropdown", "dateInput", "monthInput", "yearInput"].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener("change", updateSummaryBoxes);
      });
    }

    function loadStoreNames() {
      fetch(storeDropdownCSV)
        .then(res => res.text())
        .then(csv => {
          const lines = csv.split("\n").slice(1);
          const storeNames = lines.map(line => line.split(",")[0].trim()).filter(name => name !== "");
          const dropdown = document.getElementById("storeDropdown");
          if (!dropdown) return;
          dropdown.innerHTML = '<option value="">Select Store</option>';
          storeNames.forEach(name => {
            const option = document.createElement("option");
            option.value = name;
            option.textContent = name;
            dropdown.appendChild(option);
          });
        })
        .catch(err => {
          console.error("❌ Error fetching store names:", err);
        });
    }

    function fetchSummaryData() {
      fetch(summaryCSVUrl)
        .then(res => res.text())
        .then(csv => {
          const lines = csv.split("\n").slice(1);
          summaryData = lines.map(line => {
            const [date, store, location, amount, month, year] = line.split(",");
            return {
              date: date?.trim(),
              store: store?.trim(),
              amount: parseFloat(amount?.trim()) || 0,
              month: month?.trim().toUpperCase(),
              year: year?.trim()
            };
          });

          updateSummaryBoxes();
        })
        .catch(err => {
          console.error("❌ Error fetching summary data:", err);
        });
    }

    function initSummaryLogic() {
      loadStoreNames();
      fetchSummaryData();
      setupSummaryListeners();
    }

    Promise.all([
      fetch(storeSheetURL).then(res => res.text()),
      fetch(salesSheetURL).then(res => res.text())
    ])
      .then(([storeCSV, salesCSV]) => {
                const storeData = parseCSV(storeCSV);
        storeHeaders = storeData[0];
        storeRows = storeData.slice(1);

        const salesData = parseCSV(salesCSV);
        salesMap = buildSalesMap(salesData);
        window.salesMap = salesMap;

        populateSalesTable();

        // ✅ Trigger summary logic after table is built
        setTimeout(() => initSummaryLogic(), 50);
      })
      .catch(err => {
        console.error("❌ Failed to fetch sheets:", err);
      });
  });
};