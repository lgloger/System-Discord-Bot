import puppeteer from "puppeteer";
import {
  EmbedBuilder,
} from "discord.js";

let lastSentSaleId = null;

export async function checkSales(sendToDiscord) {
  const ROBLOSECRUITY = process.env.ROBLOSECURITY;

  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  await page.setCookie({
    name: ".ROBLOSECURITY",
    value: ROBLOSECRUITY,
    domain: ".roblox.com",
    path: "/",
    httpOnly: true,
    secure: true,
  });

  await page.goto(
    "https://www.roblox.com/communities/configure?id=15069287#!/revenue/sales",
    {
      waitUntil: "networkidle2",
    }
  );

  await page.waitForSelector(".transactions-container");

  const sales = await page.evaluate(() => {
    const rows = Array.from(document.querySelectorAll("tr.pending"));
    return rows.map((row) => {
      const cols = row.querySelectorAll("td");
      return {
        date: cols[0]?.innerText.trim(),
        user: cols[1]?.innerText.trim(),
        item: cols[2]?.innerText.trim(),
        amount: cols[3]?.innerText.trim(),
      };
    });
  });

  if (sales.length > 0) {
    const latest = sales[0];

    const currentSaleId = `${latest.date}-${latest.user}-${latest.item}-${latest.amount}`;

    if (currentSaleId !== lastSentSaleId) {
      lastSentSaleId = currentSaleId;

      const msg = new EmbedBuilder()
        .setColor("#2C2F33")
        .setDescription(
          `### *New Roblox Sale*\n` +
            `- **📅 Date:** ${latest.date.replace("\n", " — ")}\n` +
            `- 👤 **Customer:** ${latest.user}\n` +
            `- 📦 **Item:** ${latest.item}\n` +
            `- 💰 **Robux:** ${latest.amount}\n\n` +
            `|| <@714741152271564861> ||`
        );

      await sendToDiscord(msg);
    }
  }

  await browser.close();
}
