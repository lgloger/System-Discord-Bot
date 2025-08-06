import { EmbedBuilder, PermissionsBitField } from "discord.js";

// ========== Support ==========
export async function sendSupportMessage(message) {
  if (message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
    var banner = `https://i.imgur.com/ytDd3UD.png`;

    await message.channel.send({
      files: [{ attachment: banner, name: "Banner.png" }],
    });
  }
}

// ========== RULES ==========
const moderator = "1324718965460570124";
const rulesEmbed = new EmbedBuilder()
  .setColor("#2C2F33")
  .setDescription(
    "# Rules & Guidelines\n" +
      "1. **Be wholesome and treat others with kindness and respect.** All kinds of harassment, hate speech and impersonation will not be tolerated.\n" +
      "2. **No spam.** This includes, but is not limited to, flooding the chat with many messages in a short time, posting excessive amounts of emojis, posting excessively long messages, posting your message to multiple channels at the same time and tagging members for no reason.\n" +
      "3. **No NSFW** (not suitable for work) content of any kind, both in the text and voice channels.\n" +
      "4. **No buying, selling, trading or asking for handouts.** This is not a marketplace.\n" +
      "5. **Personal conflicts are to be handled privately** and not on public channels on this server.\n" +
      "6. **Use channels for their intended purpose.** Please read the channel descriptions and keep conversations relevant. Off-topic content may be removed.\n" +
      "7. **No abuse of bots or commands.** Using bots to spam, annoy others, or disrupt the server will result in restrictions or bans.\n" +
      "8. **Respect staff decisions.** Moderators are here to keep the server safe and enjoyable. Arguing with them publicly may lead to warnings or timeouts.\n" +
      "9. **English only unless stated otherwise.** To keep the conversation understandable for all, please speak English unless the channel says otherwise.\n" +
      "10. **No inappropriate or offensive usernames/profile pictures.** Keep things clean and respectful. Mods may ask you to change names or avatars if necessary.\n\n" +
      "Seen something violating our rules? Please, say something and tag our <@&" +
      moderator +
      "> who will take appropriate action. Avoid tagging moderators without good reasoning."
  );

export async function sendRulesMessage(message) {
  if (message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
    var banner = `https://i.imgur.com/vgyjxD7.png`;

    await message.channel.send({
      files: [{ attachment: banner, name: "Banner.png" }],
      embeds: [rulesEmbed],
    });
  }
}

// ========== SOCIALS ==========
export async function sendSocialsMessage(message) {
  if (message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
    var banner = `https://i.imgur.com/Oa0VNnj.png`;
    const check = message.guild.emojis.cache.find((e) => e.name === "dc");
    const roblox = message.guild.emojis.cache.find((e) => e.name === "rb");

    const socialsEmbed = new EmbedBuilder()
      .setColor("#2C2F33")
      .setDescription(
        `### *These are all of Quantum's official social channels. Any socials not listed here are most likely fake.*\n` +
          `- ${check} https://discord.gg/4qs2eGG9zG\n` +
          `- ${roblox} https://www.roblox.com/communities/15069287/QU-NTUM#!/about\n\n` +
          `At the moment, Quantum does not have any accounts on other platforms than the ones above, such as TikTok, Instagram, Snapchat and other social media platforms that weren't listed`
      );

    await message.channel.send({
      files: [{ attachment: banner, name: "Banner.png" }],
      embeds: [socialsEmbed],
    });
  }
}
