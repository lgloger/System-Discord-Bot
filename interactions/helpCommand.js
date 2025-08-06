import { EmbedBuilder } from "discord.js";

const helpEmbed = new EmbedBuilder()
  .setColor("#2C2F33")
  .setTitle(`quantum's Utilities help`)
  .setDescription(
    "<:report:1370120401358950581> **To report a bug, contact a moderator.**"
  )
  .addFields(
    {
      name: "Commands list",
      value:
        "<:ListEmoji:1352740858146983946> Type /help to view a list of slash commands.",
    },
    {
      name: "Chat with Simpli AI",
      value:
        "<:ListEmoji:1352740858146983946> Type /ask to chat with Simpli AI.",
    },
    {
      name: "Blackjack",
      value:
        "<:ListEmoji:1352740858146983946> Type /blackjack to play Blackjack.",
    }
  )
  .setTimestamp()
  .setFooter({
    text: `quantum's Utilities`,
    iconURL: "https://i.imgur.com/jztAYkV.png",
  });

export async function sendHelpEmbed(interation) {
  interation.reply({ embeds: [helpEmbed], ephemeral: true });
}
