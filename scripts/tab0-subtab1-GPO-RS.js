window.initTab0Subtab1 = function () {
  console.log("🚀 JS loaded: tab0-subtab1-GPO-RS.js");

  const sheetURL =
    "https://docs.google.com/spreadsheets/d/12so3o5nh4KDC2tqb57qudFWtb8T8gKHMjufNi-x88Ik/edit?gid=204054895&rm=minimal&zoom=10";

  const iframe = document.getElementById("google-sheet-frame-subtab1");
  if (iframe) {
    iframe.src = sheetURL;
    console.log("✅ Embedded single sheet tab with frozen columns and zoom.");
  } else {
    console.warn("⚠️ iframe element not found.");
  }
};