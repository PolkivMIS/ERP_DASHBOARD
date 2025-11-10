window.initTab5Subtab1 = function () {
  console.log("✅ Tab 5 Subtab 1 logic triggered");

  const sheetURL =
    "https://docs.google.com/spreadsheets/d/16knrcUaOpvowE47mnZpQyNPzv_bllefjT7KutH9qFkA/export?format=csv&gid=576960541";

  if (!window.tab5AttendanceCache) {
    window.tab5AttendanceCache = {
      headers: [],
      rows: [],
      chart: null,
      loaded: false,
    };
  }

  const cache = window.tab5AttendanceCache;
  const container = document.getElementById("Tab1");
  if (!container) {
    setTimeout(() => window.initTab5Subtab1(), 100);
    return;
  }

  container.innerHTML = `
    <div id="attendance-dashboard" class="dashboard">
      <div class="employee-selector">
        <label for="employee-select"><strong>Select Employee:</strong></label>
        <select id="employee-select"></select>
      </div>

      <div class="employee-card">
        <img id="employee-photo" src="assets/icons/default.jpg" alt="Employee Photo" />
        <div class="employee-info">
          <h2 id="employee-name">Loading...</h2>
          <p id="employee-store">Loading store info...</p>
        </div>
      </div>

      <div class="summary-section">
        <div class="attendance-summary">
          <h3>Attendance Summary</h3>
          <ul>
            <li>Present: <span id="present-days">--</span></li>
            <li>Absent: <span id="absent-days">--</span></li>
            <li>Weekoff: <span id="weekoff-days">--</span></li>
            <li>Late: <span id="late-days">--</span></li>
            <li>Early Leave: <span id="early-leave-days">--</span></li>
          </ul>
        </div>

        <div class="salary-details">
          <h3>Salary Details</h3>
          <ul>
            <li>Payable Days: <span id="payable-days">--</span></li>
            <li>Net Salary: <span id="net-salary">--</span></li>
            <li>Monthly Salary: <span id="monthly-salary">--</span></li>
            <li>Daily Rate: <span id="daily-rate">--</span></li>
            <li>Working Days: <span id="working-days">--</span></li>
          </ul>
        </div>

        <div class="attendance-chart">
          <h3>Monthly Attendance</h3>
          <canvas id="attendance-pie" width="200" height="200"></canvas>
        </div>
      </div>
    </div>
  `;

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

  function formatCurrency(value) {
    const num = parseFloat(value.replace(/[^\d.-]/g, ""));
    return isNaN(num)
      ? "--"
      : num.toLocaleString("en-IN", {
          style: "currency",
          currency: "INR",
          minimumFractionDigits: 2,
        });
  }

  function setText(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value || "--";
  }

  function loadEmployee(index) {
    const row = cache.rows[index];
    if (!row) return;

    const record = {};
    cache.headers.forEach((key, i) => {
      record[key] = row[i];
    });

    setText("employee-name", record["Name"]);
    setText("employee-store", record["Store"]);
    setText("present-days", record["Present"]);
    setText("absent-days", record["Absent"]);
    setText("weekoff-days", record["Weekoff"]);
    setText("late-days", record["Late"]);
    setText("early-leave-days", record["Early Leave"]);
    setText("payable-days", record["Payable"]);
    setText("working-days", record["Working Days"]);
    setText("net-salary", formatCurrency(record["Net Salary"]));
    setText("monthly-salary", formatCurrency(record["Monthly Salary"]));
    setText("daily-rate", formatCurrency(record["Daily Rate"]));

    const nameSlug = record["Name"]
      .toLowerCase()
      .replace(/\s+/g, "")
      .replace(/[^a-z]/g, "");
    const photoPath = `assets/icons/${nameSlug}.jpg`;

    const img = document.getElementById("employee-photo");
    if (img) {
      img.onerror = () => {
        img.src = "assets/icons/default.gif";
      };
      img.src = photoPath;
    }

    const present = parseFloat(record["Present"]) || 0;
    const absent = parseFloat(record["Absent"]) || 0;
    const late = parseFloat(record["Late"]) || 0;
    const earlyLeave = parseFloat(record["Early Leave"]) || 0;

    waitForChart(() => {
      renderAttendanceChart(present, absent, late, earlyLeave);
    });
  }

  function renderAttendanceChart(present, absent, late, earlyLeave) {
    const canvas = document.getElementById("attendance-pie");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (cache.chart) cache.chart.destroy();

    cache.chart = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: ["Present", "Absent", "Late", "Early Leave"],
        datasets: [
          {
            data: [present, absent, late, earlyLeave],
            backgroundColor: ["#4CAF50", "#F44336", "#FF9800", "#03A9F4"],
            borderWidth: 2,
            hoverOffset: 12,
          },
        ],
      },
      options: {
        responsive: false,
        cutout: "40%",
        plugins: {
          legend: {
            position: "bottom",
            labels: {
              font: { size: 14 },
              color: "#333",
            },
          },
          tooltip: {
            callbacks: {
              label: function (context) {
                const label = context.label || "";
                const value = context.raw || 0;
                return `${label}: ${value} day${value !== 1 ? "s" : ""}`;
              },
            },
          },
        },
      },
    });
  }

  function renderDropdown() {
    const select = document.getElementById("employee-select");
    if (!select) return;

    select.innerHTML = "";
    cache.rows.forEach((row, i) => {
      const name = row[cache.headers.indexOf("Name")];
      const option = document.createElement("option");
      option.value = i;
      option.textContent = name;
      select.appendChild(option);
    });

    select.addEventListener("change", () => {
      const index = parseInt(select.value);
      loadEmployee(index);
    });

    loadEmployee(0);
  }

  function waitForChart(callback) {
    if (typeof Chart !== "undefined") {
      callback();
    } else {
      setTimeout(() => waitForChart(callback), 50);
    }
  }

  if (cache.loaded) {
    renderDropdown();
  } else {
    fetch(sheetURL)
      .then((res) => res.text())
      .then((csv) => {
        const rows = parseCSV(csv);
        cache.headers = rows[0];
        cache.rows = rows.slice(1);
        cache.loaded = true;
        renderDropdown();
      })
      .catch((err) => {
        console.error("❌ Failed to fetch sheet:", err);
        const dash = document.getElementById("attendance-dashboard");
        if (dash) dash.innerHTML = "<p>Error loading data.</p>";
      });
  }
};
