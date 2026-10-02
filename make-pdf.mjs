import fs from "node:fs";
import puppeteer from "puppeteer";
import { PDFDocument } from "pdf-lib";

const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const dir = import.meta.dirname;
const checks = `${dir}/checks`;
fs.mkdirSync(checks, { recursive: true });

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: true,
  args: ["--no-sandbox"],
});
const page = await browser.newPage();
await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 1 });
await page.goto(`file://${dir}/proposal.html`, { waitUntil: "load" });
await page.evaluate(() => document.fonts.ready);

await page.pdf({
  path: `${dir}/proposal.pdf`,
  width: "1920px",
  height: "1080px",
  printBackground: true,
});

const slides = await page.$$(".slide");
let n = 0;
for (const slide of slides) {
  n += 1;
  await slide.screenshot({
    path: `${checks}/slide-${String(n).padStart(2, "0")}.png`,
  });
}

const pdf = await PDFDocument.load(fs.readFileSync(`${dir}/proposal.pdf`));
console.log("pages:", pdf.getPageCount());
console.log(
  "sizes:",
  pdf.getPages().map((p) => `${Math.round(p.getWidth())}x${Math.round(p.getHeight())}`).join(", "),
);
console.log("screenshots:", n);

await browser.close();
