window.initTab6Subtab1 = function () {
  console.log("🚀 Tab 6 JS loaded");

  const monthGidMap = {
    "01": "GID_FOR_JANUARY",
    "02": "GID_FOR_FEBRUARY",
    "03": "GID_FOR_MARCH",
    "04": "GID_FOR_APRIL",
    "05": "GID_FOR_MAY",
    "06": "GID_FOR_JUNE",
    "07": "GID_FOR_JULY",
    "08": "GID_FOR_AUGUST",
    "09": "GID_FOR_SEPTEMBER",
    "10": "GID_FOR_OCTOBER",
    "11": "0", // ✅ November 2025
    "12": "GID_FOR_DECEMBER"
  };

  const spreadsheetBaseURL =
    "https://docs.google.com/spreadsheets/d/18HQFEWaPJXY8KLF_kEePpNgRYRbD3Y94vIZ3ubfw00w/export?format=csv";

  function parseCSV(text) {
    return text
      .trim()
      .split("\n")
      .map(line => {
        const cells = [], chars = [...line];
        let current = "", inQuotes = false;
        for (let i = 0; i < chars.length; i++) {
          const char = chars[i];
          if (char === '"' && chars[i + 1] === '"') {
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

  function renderTable(rows) {
    console.log("📋 Rendering table with rows:", rows.length);
    if (!rows || rows.length < 2 || rows[0].length === 0) {
      console.warn("⚠️ No data found or malformed CSV");
      const container = document.querySelector(".table-container");
      if (container) {
        container.innerHTML = "<p style='color:red;'>No data available or sheet is empty.</p>";
      }
      return;
    }

    const headers = rows[0];
    const dataRows = rows.slice(1);

    const table = document.getElementById("tab6-table");
    const thead = table.querySelector("thead");
    const tbody = table.querySelector("tbody");

    thead.innerHTML = "";
    tbody.innerHTML = "";

    const headerRow = document.createElement("tr");
    headers.forEach(h => {
      const th = document.createElement("th");
      th.textContent = h;
      headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);

    dataRows.forEach(row => {
      const tr = document.createElement("tr");
      for (let i = 0; i < headers.length; i++) {
        const cell = row[i] || "";
        const td = document.createElement("td");

        if (cell === "PENDING") {
          td.innerHTML = "🔄";
          td.title = "Pending";
          td.style.textAlign = "center";
          td.style.fontSize = "16px";
          td.style.fontWeight = "bold";
        } else if (cell === "DONE") {
          td.innerHTML = "🟢";
          td.title = "Done";
          td.style.textAlign = "center";
          td.style.fontSize = "16px";
          td.style.fontWeight = "bold";
        } else {
          td.textContent = cell;
        }

        tr.appendChild(td);
      }
      tbody.appendChild(tr);
    });

    console.log(`✅ Table rendering complete. Total rows: ${dataRows.length}`);
  }

  function loadSheetForMonth(monthCode) {
    const gid = monthGidMap[monthCode];
    if (!gid) {
      console.warn("⚠️ No GID mapped for month:", monthCode);
      return;
    }

    const sheetURL = `${spreadsheetBaseURL}&gid=${gid}`;
    console.log("🌐 Fetching sheet:", sheetURL);

    fetch(sheetURL)
      .then(res => res.text())
      .then(csv => {
        console.log("📦 Raw CSV fetched:");
        console.log(csv);
        const parsed = parseCSV(csv);
        console.log("🧮 Parsed rows:", parsed);
        renderTable(parsed);
      })
      .catch(err => {
        console.error("❌ Fetch error:", err);
        const table = document.getElementById("tab6-table");
        if (table) {
          table.outerHTML = "<p style='color:red;'>Failed to load data.</p>";
        }
      });
  }

  const monthDropdown = document.getElementById("monthDropdown");
  if (monthDropdown) {
    monthDropdown.addEventListener("change", () => {
      const selectedMonth = monthDropdown.value;
      console.log("📅 Month selected:", selectedMonth);
      loadSheetForMonth(selectedMonth);
    });

    const now = new Date();
    const currentMonth = String(now.getMonth() + 1).padStart(2, "0");
    monthDropdown.value = currentMonth;
    monthDropdown.dispatchEvent(new Event("change"));
  }
};