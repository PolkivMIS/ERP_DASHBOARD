const tabFiles = [
  [
    "GOOD_RECEIVE_PO-subtab1.html", // 1
    "GOOD_RECEIVE_PO-subtab2.html"  // 2
  ],
  [
    "PAYMENT_COLLECTION-subtab1.html", // 1
    "PAYMENT_COLLECTION-subtab2.html"  // 2
  ],
  [
    "SALES_MASTER-subtab1.html",       // 1
    "SALES_MASTER-subtab2.html",       // 2
    "SALES_MASTER-subtab3.html",       // 3
    "SALES_MASTER-subtab4.html",       // 4
    "SALES_MASTER-subtab5.html"        // 5
  ], 
  [
   "SHOP-IN-SHOP-subtab1.html",        // 1
   "SHOP-IN-SHOP-subtab2.html"         // 2
  ],
  [
   "DAILY_SALES-subtab1.html",         // 1
   "DAILY_SALES-subtab2.html"          // 2
  ],
  [
   "STORE_ATTENDENCE-subtab1.html",    // 1
   "STORE_ATTENDENCE-subtab2.html"     // 2
  ],
   "ACCOUNTS_CHECKLIST.html"               // 1
];

const scriptFiles = [
  [
    "tab0-subtab1-GPO-RS.js",  // 1
    "tab0-subtab2-GPO-BS.js"   // 2
  ],
  [
    "tab1-subtab1-payment-collection.js",  // 1
    "tab1-subtab2-payment-collection.js"   // 2
  ],
  [
    "tab2-subtab1-sales-master.js",        // 1
    "tab2-subtab2-sales-master.js",        // 2
    "tab2-subtab3-sales-master.js",        // 3
    "tab2-subtab4-sales-master.js",        // 4
    "tab2-subtab5-sales-master.js"         // 5
  ],
  [
   "tab3-subtab1-shop-in-shop.js",         // 1 
   "tab3-subtab2-shop-in-shop.js"          // 2
  ],
  [
    "tab4-subtab1-daily-sales.js",         // 1
    "tab4-subtab2-daily-sales.js"          // 2
  ],
  [
    "tab5-subtab1-attendance.js",          // 1
    "tab5-subtab2-attendance.js"           // 2
  ],
   "tab6-subtab1-accounts-checklist.js"       // 1
];

const cssFiles = [
  [
    "tab0-subtab1-GPO-RS.css",  // 1
    "tab0-subtab2-GPO-BS.css"   // 2
  ],
  [
    "tab1-subtab1-payment-collection.css", // 1
    "tab1-subtab2-payment-collection.css"  // 2
  ],
  [
    "tab2-subtab1-sales-master.css",       // 1
    "tab2-subtab2-sales-master.css",       // 2
    "tab2-subtab3-sales-master.css",       // 3
    "tab2-subtab4-sales-master.css",       // 4
    "tab2-subtab5-sales-master.css"        // 5
  ],
  [
    "tab3-subtab1-shop-in-shop.css",       // 1
    "tab3-subtab2-shop-in-shop.css"        // 2
  ],
  [
    "tab4-subtab1-daily-sales.css",        // 1
    "tab4-subtab2-daily-sales.css"         // 2
  ],
  [
    "tab5-subtab1-attendance.css",         // 1
    "tab5-subtab2-attendance.css"          // 2
  ],
    "tab6-subtab1-accounts-checklist.css"     // 1
];

const tabNames = [
  "GOOD RECEIVE PO", // 0
  "PAYMENT COLLECTION", // 1
  "SALES MASTER", // 2
  "SHOP-IN-SHOP", // 3
  "DAILY SALES", // 4
  "STORE ATTENDENCE", // 5
  "ACCOUNTS CHECKLIST" // 6
];

function getSubtabsForTab(tabIndex) {
  const map = {
    0: ["Good Receive PO (R.S.)", "Good Receive PO (B.S.)"],
    1: ["Colletion DashBoard", "Raw Data Table"],
    2: ["Executive", "District/Town", "Order", "Order Status", "Full Table"],
    3: ["Monthly Breakdown", "Brand Summary"],
    4: ["DASHBOARD", "SALES MASTER"],
    5: ["DASHBOARD", "CONSOLIDATED SHEET"]
  };
  return map[tabIndex] || [];
}

function injectSubtabContainers(parentIndex) {
  const embedArea = document.getElementById("embed-area");
  if (!embedArea) return;

  const subtabs = getSubtabsForTab(parentIndex);
  embedArea.innerHTML = subtabs.map((_, i) => `
    <div id="Tab${i + 1}" class="subtab-content" style="${i === 0 ? '' : 'display:none;'}"></div>
  `).join('');
}

function loadTab(tabIndex) {
  const embedArea = document.getElementById("embed-area");
  if (!embedArea) return console.error("❌ Embed area not found.");

  const tabNameElement = document.getElementById("active-tab-name");
  if (tabNameElement) tabNameElement.textContent = tabNames[tabIndex];

  const htmlPath = Array.isArray(tabFiles[tabIndex])
    ? `tabs/${tabFiles[tabIndex][0]}`
    : `tabs/${tabFiles[tabIndex]}`;

  fetch(htmlPath)
    .then(res => res.ok ? res.text() : Promise.reject("Tab HTML not found"))
    .then(html => {
      embedArea.innerHTML = html;
      console.log(`📄 Loaded HTML for tab ${tabIndex}: ${htmlPath}`);

      document.querySelectorAll("link[data-tab-css]").forEach(link => link.remove());

      const cssPaths = Array.isArray(cssFiles[tabIndex]) ? cssFiles[tabIndex] : [cssFiles[tabIndex]];
      cssPaths.forEach(cssPath => {
        const cssLink = document.createElement("link");
        cssLink.rel = "stylesheet";
        cssLink.href = `styles/${cssPath}`;
        cssLink.setAttribute("data-tab-css", "true");
        document.head.appendChild(cssLink);
        console.log(`🎨 Injected CSS: ${cssPath}`);
      });

      document.querySelectorAll("script[data-tab-script]").forEach(script => script.remove());

      const scriptPaths = Array.isArray(scriptFiles[tabIndex]) ? scriptFiles[tabIndex] : [scriptFiles[tabIndex]];
      scriptPaths.forEach(scriptPath => {
        if (!scriptPath) return;
        const script = document.createElement("script");
        script.src = `scripts/${scriptPath}`;
        script.defer = true;
        script.setAttribute("data-tab-script", "true");
        script.onload = () => console.log(`✅ Main script loaded: ${scriptPath}`);
        script.onerror = () => console.error(`❌ Failed to load main script: ${scriptPath}`);
        document.body.appendChild(script);
      });

      const subtabs = getSubtabsForTab(tabIndex);
      if (subtabs.length > 0) {
        injectSubtabContainers(tabIndex);
        loadSubtabs(subtabs, tabIndex);
        loadSubtabContent(tabIndex, 1);
      } else {
        const subtabContainer = document.getElementById("subtabContainer");
        if (subtabContainer) subtabContainer.innerHTML = `<div class="menu__border"></div>`;
      }

      injectExtraScripts(tabIndex);
    })
    .catch(err => {
      console.error("❌ Tab load failed:", err);
      embedArea.innerHTML = `<p style="color:red;">Error loading tab content.</p>`;
    });
}

function loadSubtabs(subtabs, tabIndex) {
  const subtabContainer = document.getElementById("subtabContainer");
  if (!subtabContainer) return;

  subtabContainer.innerHTML = subtabs.map((label, i) => `
    <button class="menu__item ${i === 0 ? 'active' : ''}" style="--bgColorItem: #d32f2f;" data-tab="Tab${i + 1}" data-parent="${tabIndex}">
      <span class="menu__label">${label}</span>
    </button>
  `).join('') + `<div class="menu__border"></div>`;

  const activeItem = subtabContainer.querySelector(".active");
  const menuBorder = subtabContainer.querySelector(".menu__border");
  offsetMenuBorder(activeItem, menuBorder);
  wireSubtabClicks();
  loadSubtabContent(tabIndex, 1);
}

function wireSubtabClicks() {
  const menu = document.getElementById("subtabContainer");
  const items = menu.querySelectorAll(".menu__item");
  const border = menu.querySelector(".menu__border");

  items.forEach(item => {
    item.addEventListener("click", () => {
      menu.querySelector(".active")?.classList.remove("active");
      item.classList.add("active");
      offsetMenuBorder(item, border);

      const tabName = item.getAttribute("data-tab");
      const parentIndex = parseInt(item.getAttribute("data-parent"));
      const subtabIndex = parseInt(tabName.replace("Tab", ""));
      loadSubtabContent(parentIndex, subtabIndex);
    });
  });
}

function loadSubtabContent(parentIndex, subtabIndex) {
  const tabName = `Tab${subtabIndex}`;
  const subtabContainer = document.getElementById(tabName);
  if (!subtabContainer) return;

  showSubtab(tabName);

  const htmlPath = `tabs/${tabNames[parentIndex].replace(/\s+/g, "_").toUpperCase()}-subtab${subtabIndex}.html`;
  const logicFunction = `initTab${parentIndex}Subtab${subtabIndex}`;

  fetch(htmlPath)
    .then(res => res.text())
    .then(html => {
      subtabContainer.innerHTML = html;
      if (typeof window[logicFunction] === "function") {
        setTimeout(() => window[logicFunction](), 50);
      }
    })
    .catch(err => {
      subtabContainer.innerHTML = `<p style="color:red;">Failed to load ${htmlPath}</p>`;
      console.error(`❌ Failed to load ${htmlPath}:`, err);
    });
}

function offsetMenuBorder(element, menuBorder) {
  const offsetActiveItem = element.getBoundingClientRect();
  const menu = document.getElementById("subtabContainer");
  const left = Math.floor(offsetActiveItem.left - menu.offsetLeft - (menuBorder.offsetWidth - offsetActiveItem.width) / 2) + "px";
  menuBorder.style.transform = `translate3d(${left}, 0 , 0)`;
}

function showSubtab(name) {
  document.querySelectorAll('.subtab-content').forEach(el => el.style.display = 'none');
  const target = document.getElementById(name.replace(/\s+/g, ''));
  if (target) target.style.display = 'block';
}

function injectExtraScripts(tabIndex) {
  // === Tab 1: Payment Collection ===
  if (tabIndex === 1) {
    // Remove old script if reloading
    const oldScript = document.querySelector('script[src="scripts/tab1-subtab1-payment-collection.js"]');
    if (oldScript) oldScript.remove();

    console.log("📦 Injecting tab1-subtab1-payment-collection.js");
    const script = document.createElement("script");
    script.src = "scripts/tab1-subtab1-payment-collection.js";
    script.defer = true;
    script.setAttribute("data-tab-script", "true");
    script.onload = () => {
      console.log("✅ tab1-subtab1-payment-collection.js loaded");
      if (typeof window.initTab1Subtab1 === "function") {
        window.initTab1Subtab1();
      }
    };
    script.onerror = () => {
      console.error("❌ Failed to load tab1-subtab1-payment-collection.js");
    };
    document.body.appendChild(script);

    // Inject CSS for Tab 1
    const oldCSS = document.querySelector('link[href="styles/tab1-subtab1-payment-collection.css"]');
    if (oldCSS) oldCSS.remove();

    const cssLink = document.createElement("link");
    cssLink.rel = "stylesheet";
    cssLink.href = "styles/tab1-subtab1-payment-collection.css";
    cssLink.setAttribute("data-tab-css", "true");
    document.head.appendChild(cssLink);

    // Inject Chart.js for Tab 1
    const oldChartScript = document.querySelector('script[src="https://cdn.jsdelivr.net/npm/chart.js"]');
    if (oldChartScript) oldChartScript.remove();

    console.log("📦 Injecting Chart.js for Tab 1");
    const chartScript = document.createElement("script");
    chartScript.src = "https://cdn.jsdelivr.net/npm/chart.js";
    chartScript.defer = true;
    chartScript.setAttribute("data-tab-script", "true");
    chartScript.onload = () => {
      console.log("✅ Chart.js loaded");
    };
    chartScript.onerror = () => {
      console.error("❌ Failed to load Chart.js");
    };
    document.body.appendChild(chartScript);
  }

  // === Tab 4: Summary Control ===
  if (tabIndex === 4) {
    const oldSummaryScript = document.querySelector('script[src="scripts/tab4-subtab1-summary-control.js"]');
    if (oldSummaryScript) oldSummaryScript.remove();

    console.log("📦 Injecting tab4-subtab1-summary-control.js");
    const summaryScript = document.createElement("script");
    summaryScript.src = "scripts/tab4-subtab1-summary-control.js";
    summaryScript.defer = true;
    summaryScript.setAttribute("data-tab-script", "true");
    summaryScript.onload = () => {
      console.log("✅ tab4-subtab1-summary-control.js loaded");
      if (typeof window.initTab4Summary === "function") {
        window.initTab4Summary();
      }
    };
    summaryScript.onerror = () => {
      console.error("❌ Failed to load tab4-subtab1-summary-control.js");
    };
    document.body.appendChild(summaryScript);
  }

  // === Tab 5: Attendance Chart ===
  if (tabIndex === 5) {
    const oldChartScript = document.querySelector('script[src="https://cdn.jsdelivr.net/npm/chart.js"]');
    if (oldChartScript) oldChartScript.remove();

    console.log("📦 Injecting Chart.js for attendance tab");
    const chartScript = document.createElement("script");
    chartScript.src = "https://cdn.jsdelivr.net/npm/chart.js";
    chartScript.defer = true;
    chartScript.setAttribute("data-tab-script", "true");
    chartScript.onload = () => {
      console.log("✅ Chart.js loaded");
    };
    chartScript.onerror = () => {
      console.error("❌ Failed to load Chart.js");
    };
    document.body.appendChild(chartScript);
  }
}