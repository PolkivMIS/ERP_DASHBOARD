window.initTab0Subtab2 = function () {
  console.log("🚀 JS loaded: tab0-subtab2-GPO-BS.js");

  const sheetURL =
    "https://docs.google.com/spreadsheets/d/1_MxFVONbx1lx5bQSrtMrGz4_GZONPJlyUNb_LaX4L6o/edit?gid=785912789&rm=minimal";

  const iframe = document.getElementById("google-sheet-frame-subtab2");
  if (iframe) {
    iframe.src = sheetURL;
    console.log("✅ Embedded sheet tab for subtab 2.");
  } else {
    console.warn("⚠️ iframe for subtab 2 not found.");
  }
};
