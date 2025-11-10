window.initTab2Subtab5 = function () {
  console.log("🚀 JS loaded: tab2-subtab5-sales-master.js");

  const cache = window.salesMasterCache;
  if (!cache || !cache.loaded) {
    console.warn("⚠️ SALESMASTER data not loaded yet.");
    return;
  }

  const waitForDOM = setInterval(() => {
    const table = document.getElementById("full-table");
    if (table) {
      clearInterval(waitForDOM);
      renderFullTable(cache.headers, cache.rows);
    }
  }, 50);

  function formatNumber(value) {
    const cleaned = String(value).replace(/,/g, "").replace(/[^\d.-]/g, "");
    const num = parseFloat(cleaned);
    return isNaN(num)
      ? "--"
      : num.toLocaleString("en-IN", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });
  }

  function convertDriveLink(url) {
    const match = url.match(/id=([a-zA-Z0-9_-]+)/);
    if (match && match[1]) {
      return `https://drive.google.com/file/d/${match[1]}/view?usp=sharing`;
    }
    return url;
  }

  function getCellHTML(value, key) {
    const trimmed = value ? value.trim() : "";
    if (trimmed === "") return "--";

    // Detect and convert Google Drive links
    if (trimmed.includes("drive.google.com/open?id=")) {
      const converted = convertDriveLink(trimmed);
      return `<a href="${converted}" target="_blank" style="color:#007bff;text-decoration:underline;">Open Image</a>`;
    }

    // Format numeric columns
    if (
      ["QUANTITY", "AMOUNT", "CURRENT AMOUNT", "POST-DATED AMOUNT"].includes(
        key
      )
    ) {
      return formatNumber(trimmed);
    }

    return trimmed;
  }

  function renderFullTable(headers, rows) {
    const table = document.getElementById("full-table");
    const thead = table.querySelector("thead");
    const tbody = table.querySelector("tbody");
    thead.innerHTML = "";
    tbody.innerHTML = "";

    // 🔠 Render dynamic headers
    const headerRow = document.createElement("tr");
    headers.forEach((h) => {
      const th = document.createElement("th");
      th.textContent = h.trim();
      headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);

    // 📦 Render rows
    rows.forEach((row, i) => {
      if (row.length !== headers.length) {
        console.warn(
          `⚠️ Row ${i + 1} malformed: ${row.length} cells, expected ${headers.length}`
        );
        console.warn("🔍 Raw row:", row);
        return;
      }

      const tr = document.createElement("tr");
      row.forEach((cell, j) => {
        const key = headers[j].trim().toUpperCase();
        const td = document.createElement("td");
        td.innerHTML = getCellHTML(cell, key);
        tr.appendChild(td);
      });

      tbody.appendChild(tr);
    });
  }
};