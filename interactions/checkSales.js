import puppeteer from "puppeteer";
import { EmbedBuilder } from "discord.js";

let sentSales = new Set();

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
    { waitUntil: "networkidle2" }
  );

  await page.waitForSelector(".transactions-container");

  const sales = await page.evaluate(() => {
    const rows = Array.from(document.querySelectorAll("tr.pending"));
    return rows.map((row) => {
      const cols = row.querySelectorAll("td");
      const userAvatarImg = cols[1]?.querySelector(".avatar-card-image img");
      const userAvatarUrl = userAvatarImg ? userAvatarImg.src : null;

      const itemColumn = cols[2];
      let itemName = null;
      let itemLink = null;

      if (itemColumn) {
        const itemLinkElement = itemColumn.querySelector("a.text-link");
        if (itemLinkElement) {
          itemLink = itemLinkElement.href;
          itemName = itemLinkElement.innerText.trim();
        }
      }

      return {
        date: cols[0]?.innerText.trim(),
        user: cols[1]?.innerText.trim(),
        item: itemName,
        amount: cols[3]?.innerText.trim(),
        itemUrl: itemLink,
        userThumbnail: userAvatarUrl,
      };
    });
  });

  if (sales.length > 0) {
    for (let i = sales.length - 1; i >= 0; i--) {
      const sale = sales[i];
      const saleId = `${sale.date}-${sale.user}-${sale.item}-${sale.amount}`;

      if (!sentSales.has(saleId)) {
        sentSales.add(saleId);

        const msg = new EmbedBuilder()
          .setColor("#2C2F33")
          .setTitle(`${sale.item}`)
          .setURL(`${sale.itemUrl}`)
          .setAuthor({ name: "New Roblox item sold" })
          .setThumbnail(sale.userThumbnail)
          .setDescription(`<@&1324740815154581546>\n`)
          .addFields(
            { name: "**Date**", value: `${sale.date.replace("\n", " — ")}`, inline: true },
            { name: "**Customer**", value: `${sale.user}`, inline: true },
            { name: "**Revenue**", value: `${sale.amount}`, inline: true }
          )
          .setTimestamp()
          .setFooter({
            text: `quantum's Utilities`,
            iconURL: "https://i.imgur.com/jztAYkV.png",
          });

        await sendToDiscord(msg);
      }
    }
  }

  await browser.close();
}