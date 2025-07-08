import puppeteer from "puppeteer";
import fs from "fs/promises";
import path from "path";

export async function takeMapScreenshot(filename = "map.png") {
    const folder = path.resolve("./screenshots");

    try {
        await fs.access(folder);
    } catch {
        await fs.mkdir(folder, { recursive: true });
    }

    const fullPath = path.join(folder, filename);

    const browser = await puppeteer.launch({
        headless: "new",
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();
    await page.goto("https://map.ukrainealarm.com", {
        waitUntil: "networkidle2",
    });

    await new Promise(resolve => setTimeout(resolve, 1000));

    await page.screenshot({ path: fullPath });
    await browser.close();

    return fullPath;
}
