import puppeteer from "puppeteer";
import { EmbedBuilder } from "discord.js";

let lastSentSaleId = null;

export async function checkSales(sendToDiscord) {
  const ROBLOSECRUITY = process.env.ROBLOSECURITY;

  const browser = await puppeteer.launch({
    headless: true,
    executablePath: "/usr/bin/chromium-browser",
  });

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
      const userAvatarImg = cols[1]?.querySelector(".avatar-card-image img");
      const userAvatarUrl = userAvatarImg ? userAvatarImg.src : null;

      return {
        date: cols[0]?.innerText.trim(),
        user: cols[1]?.innerText.trim(),
        item: cols[2]?.innerText.trim(),
        amount: cols[3]?.innerText.trim(),
        userThumbnail: userAvatarUrl,
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
        .setTitle(`${latest.item}`)
        .setAuthor({ name: "New Roblox item sold" })
        .setThumbnail(latest.userThumbnail)
        .addFields(
          {
            name: "**Date**",
            value: `${latest.date.replace("\n", " — ")}`,
            inline: true,
          },
          {
            name: "**Customer**",
            value: `${latest.user}`,
            inline: true,
          }
        )
        .addFields(
          {
            name: "**Revenue**",
            value: `${latest.amount}`,
            inline: true,
          }
        )
        .setDescription('||<:1324740815154581546:>||');

      await sendToDiscord(msg);
    }
  }

  await browser.close();
}
