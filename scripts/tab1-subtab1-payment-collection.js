window.initTab1Subtab1 = function () {
  console.log("🚀 JS loaded: tab1-subtab1-payment-collection.js");

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
    "10": "0",       // October
    "11": "453259078",        // November
    "12": "GID_FOR_DECEMBER"
  };

  const spreadsheetBaseURL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vR7ql7UDnmOJgCKZSMykJOy9sm8mNC5cDddiYW5bpfQxZcYR6kkIUJAk-Sa_dPWUsdLRyF1U0FP5tfl/pub?single=true&output=csv";

  function parseCSV(text) {
    return text.trim().split("\n").map(line => line.split(",").map(cell => cell.trim()));
  }

  function formatNumber(value) {
    const num = parseFloat(value);
    return isNaN(num)
      ? "--"
      : num.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  function buildExecutiveTotals(rows, headers) {
    const totals = {};
    const nameIndex = headers.findIndex(h => h.toUpperCase() === "EMPLOYEE NAME");
    const targetIndex = headers.findIndex(h => h.trim().toUpperCase() === "TOTAL OUTSTANDING");

    const dateIndexes = headers
      .map((h, i) => /^\d{2}\/\d{2}\/\d{4}$/.test(h) ? i : -1)
      .filter(i => i !== -1);

    rows.forEach(row => {
      const name = row[nameIndex]?.trim().toUpperCase();
      const target = parseFloat(row[targetIndex]) || 0;
      const collected = dateIndexes.reduce((sum, i) => sum + (parseFloat(row[i]) || 0), 0);
      if (!name) return;
      if (!totals[name]) {
        totals[name] = { target: 0, collected: 0 };
      }
      totals[name].target += target;
      totals[name].collected += collected;
    });

    return totals;
  }

  function renderDashboard(rows, headers) {
    const tbody = document.querySelector("#executive-body");
    if (!tbody) return;

    const totals = buildExecutiveTotals(rows, headers);

    [...tbody.rows].forEach(row => {
      const name = row.cells[0].textContent.trim().toUpperCase();
      const data = totals[name];
      for (let i = 1; i < row.cells.length; i++) {
        row.cells[i].textContent = "";
      }
      if (data) {
        const diff = data.target - data.collected;
        const percent = data.target > 0 ? (data.collected / data.target) * 100 : 0;
        row.cells[1].textContent = formatNumber(data.target);
        row.cells[2].textContent = formatNumber(data.collected);
        row.cells[3].textContent = formatNumber(diff);
        row.cells[4].textContent = `${percent.toFixed(2)}%`;
      }
    });
  }

  function renderChart(rows, headers) {
    const totals = buildExecutiveTotals(rows, headers);
    const labels = Object.keys(totals);
    const targets = labels.map(name => totals[name].target);
    const achieved = labels.map(name => totals[name].collected);

    const canvas = document.getElementById("paymentChart");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    const gradientBlue = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradientBlue.addColorStop(0, "#3f51b5");
    gradientBlue.addColorStop(1, "#1d22b0");

    const gradientGreen = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradientGreen.addColorStop(0, "#66bb6a");
    gradientGreen.addColorStop(1, "#388e3c");

    if (window.paymentChartInstance) {
      window.paymentChartInstance.destroy();
    }

    window.paymentChartInstance = new Chart(ctx, {
      type: "bar",
      data: {
        labels,
        datasets: [
          {
            label: "Target Amount",
            data: targets,
            backgroundColor: gradientBlue,
            borderRadius: 6,
            borderSkipped: false
          },
          {
            label: "Achieved Amount",
            data: achieved,
            backgroundColor: gradientGreen,
            borderRadius: 6,
            borderSkipped: false
          }
        ]
      },
      options: {
        responsive: true,
        animation: { duration: 1000, easing: "easeOutQuart" },
        plugins: {
          legend: {
            position: "top",
            labels: { boxWidth: 10, font: { size: 12 } }
          },
          title: {
            display: true,
            text: "Targets & Achievement By Executive",
            font: { size: 20 }
          },
          tooltip: {
            callbacks: {
              label: ctx => `${ctx.dataset.label}: ₹${ctx.raw.toLocaleString("en-IN")}`
            }
          }
        },
        scales: {
          x: { grid: { display: false }, ticks: { font: { size: 9 } } },
          y: {
            beginAtZero: true,
            ticks: {
              callback: value => value.toLocaleString("en-IN"),
              font: { size: 9 }
            }
          }
        }
      }
    });
  }

  function waitForChartJS(callback) {
    if (typeof Chart !== "undefined") {
      callback();
    } else {
      setTimeout(() => waitForChartJS(callback), 100);
    }
  }

  function loadSheetForMonth(monthCode) {
    const gid = monthGidMap[monthCode];
    if (!gid) return;

    const dataSheetURL = `${spreadsheetBaseURL}&gid=${gid}`;
    fetch(dataSheetURL)
      .then(res => res.text())
      .then(csv => {
        const parsed = parseCSV(csv);
        const headers = parsed[0];
        const rows = parsed.slice(1);
        renderDashboard(rows, headers);
        waitForChartJS(() => renderChart(rows, headers));
      })
      .catch(err => {
        console.error("❌ Failed to fetch sheet:", err);
      });
  }

  const monthDropdown = document.getElementById("monthDropdown");
  if (monthDropdown) {
    monthDropdown.addEventListener("change", () => {
      const selectedMonth = monthDropdown.value;
      loadSheetForMonth(selectedMonth);
    });

    const now = new Date();
    const currentMonth = String(now.getMonth() + 1).padStart(2, "0");
    monthDropdown.value = currentMonth;
    monthDropdown.dispatchEvent(new Event("change"));
  }
};