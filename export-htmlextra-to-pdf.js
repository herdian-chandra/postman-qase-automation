const fs = require("fs");
const path = require("path");
const puppeteer = require("puppeteer");

(async () => {
  const inFile =
    process.argv[2] ||
    "./newman/report/html/Automation Restful-Booker-2025-08-26-05-15-14-876-0.html";
  const outFile =
    process.argv[3] ||
    "./newman/report/pdf/Automation-Restful-Booker-2025-08-25-10-17-21-132-0.pdf";

  fs.mkdirSync(path.dirname(outFile), { recursive: true });

  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox"],
  });
  const page = await browser.newPage();

  await page.goto("file://" + path.resolve(inFile), {
    waitUntil: "networkidle0",
  });

  // BUKA semua panel/tab/accordion & hilangkan display:none
  await page.evaluate(() => {
    // Tab/panel umum (Bootstrap/tab-pane)
    document.querySelectorAll('.tab-pane,[role="tabpanel"]').forEach((el) => {
      el.style.display = "block";
      el.classList.add("active", "show");
      el.classList.remove("fade");
    });
    // details
    document.querySelectorAll("details").forEach((d) => (d.open = true));
    // collapse/accordion
    document
      .querySelectorAll(".collapse,.accordion-collapse,.is-collapsible")
      .forEach((el) => {
        el.classList.add("show");
        el.style.display = "block";
        el.style.height = "auto";
        el.style.visibility = "visible";
        el.hidden = false;
      });
    // elemen hidden/visibility:none
    document.querySelectorAll("[hidden]").forEach((el) => (el.hidden = false));
    Array.from(document.querySelectorAll("*")).forEach((el) => {
      const s = window.getComputedStyle(el);
      if (!s) return;
      if (s.display === "none") el.style.display = "block";
      if (s.visibility === "hidden") el.style.visibility = "visible";
    });
    // CSS cetak
    const style = document.createElement("style");
    style.innerHTML = `
      @media print {
        * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        .nav, .tabs, .tab-controls { display: none !important; }
        body, html { background: #fff !important; }
      }
    `;
    document.head.appendChild(style);
  });

  await page.pdf({
    path: outFile,
    format: "A4",
    printBackground: true,
    margin: { top: "12mm", right: "12mm", bottom: "12mm", left: "12mm" },
  });

  await browser.close();
  console.log("PDF created:", outFile);
})();
