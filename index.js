import dotenv from "dotenv";
import cron from "node-cron";
import {
  Client,
  GatewayIntentBits,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActivityType,
} from "discord.js";
dotenv.config();
import { exec } from "child_process";

// Import Interactions
import { checkSales } from "./interactions/checkSales.js";
import { addRole } from "./interactions/addRole.js";
import { sendHelpEmbed } from "./interactions/helpCommand.js";
import {
  insultToggle,
  createInsultMessage,
} from "./interactions/smartInsults.js";
import { askAICommand } from "./interactions/askAICommand.js";
import {
  sendSupportMessage,
  sendRulesMessage,
  sendSocialsMessage,
} from "./interactions/sendPrefixMessages.js";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.MessageContent,
  ],
});

// ========== START UP ==========
client.once("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);

  client.user.setPresence({
    activities: [
      {
        name: "/help",
        type: ActivityType.Streaming,
        url: "https://www.twitch.tv/krabben_luc",
      },
    ],
    status: "online",
  });

  // Check Roblox Sales
  async function sendToDiscord(msg) {
    const channel = await client.channels.fetch("1399121444964663378");
    if (channel)
      await channel.send({
        embeds: [msg],
      });
  }

  setInterval(() => {
    checkSales(sendToDiscord).catch(console.error);
  }, 5 * 60 * 1000);

  // Send daily Advertaisement
  const adEmbed = new EmbedBuilder()
    .setColor("#2C2F33")
    .setTitle(`Quantum`)
    .setAuthor({ name: "quantum's Utilities" })
    .setDescription(
      `**🌌 Welcome to Quantum – Redefining Roblox Fashion!**\n

      🧵 **Premium Roblox Clothing**\n
      Stand out with **high-quality and unique outfits** you won’t find anywhere else.\n

      🎨 **Clean & Aesthetic Server Design**\n 
      Enjoy a **modern, well-structured** layout that makes everything easy to navigate.\n

      🚀 **Active Community & Exclusive Drops**\n
      Be part of a **growing fashion-focused community** and catch limited-time releases!\n

      ✨ **Quality isn’t just a word – it’s our standard.**\n

      🔗 **Join now:** https://discord.gg/4qs2eGG9zG
      🎮 **Roblox Group:** https://www.roblox.com/communities/15069287/QU-NTUM#!/about`
    )
    .setImage("https://i.imgur.com/jztAYkV.png")
    .setTimestamp()
    .setFooter({
      text: `quantum's Utilities`,
      iconURL: "https://i.imgur.com/jztAYkV.png",
    });

  cron.schedule(
    "0 16 * * *",
    () => {
      const channelId = "1399785684671398049";
      const channel = client.channels.cache.get(channelId);

      if (channel?.isTextBased()) {
        channel.send({
          embeds: [adEmbed],
        });
      }
    },
    {
      timezone: "Europe/Berlin",
    }
  );
});

// Give new Members a Role
client.on("guildMemberAdd", async (member) => {
  addRole(member).catch(console.error);
});

// ========== SMART INSULTS ==========
let insultState = false;

// Handle Insult Slash Command
client.on("interactionCreate", async (interation) => {
  try {
    if (interation.isCommand()) {
      if (interation.commandName === "insult") {
        insultState = insultToggle(interation, insultState);
      }
    }
  } catch (error) {
    console.error(error);
    await interation.reply({
      content:
        "<:error:1284753947680309318> `Hmm...something seems to have gone wrong.`",
    });
  }
});

// Handle Insult Messages
client.on("messageCreate", async (message) => {
  if (!insultState) return;
  if (message.author.bot) return;
  if (message.attachments.size > 0) return;

  createInsultMessage(message).catch(console.error);
});

// ========== Support ==========
client.on("messageCreate", async (message) => {
  if (message.content === "!support") {
    sendSupportMessage(message).catch(console.error);
  }

  if (message.content === "!rules") {
    sendRulesMessage(message).catch(console.error);
  }

  if (message.content === "!socials") {
    sendSocialsMessage(message).catch(console.error);
  }
});

// ========== COMMAND ==========

const cooldown = new Set();
const cooldownTime = 15 * 1000;

client.on("interactionCreate", async (interation) => {
  const user = interation.user.id;

  try {
    if (interation.isCommand()) {
      // ========== HELP ==========
      if (interation.commandName === "help") {
        sendHelpEmbed(interation).catch(console.error);
      }

      // ========== ASK ==========
      if (interation.commandName === "ask") {
        askAICommand(cooldown, cooldownTime, interation, user).catch(
          console.error
        );
      }

      // ========== Blackjack ==========
      else if (interation.commandName === "blackjack") {
        let playerHand = [];
        let botHand = [];

        function drawCard() {
          const cards = [2, 3, 4, 5, 6, 7, 8, 9, 10, 10, 10, 10, 11];
          return cards[Math.floor(Math.random() * cards.length)];
        }

        function calculateHand(hand) {
          return hand.reduce((acc, card) => acc + card, 0);
        }

        // Starte das Spiel
        playerHand.push(drawCard(), drawCard());
        botHand.push(drawCard(), drawCard());

        let playerTotal = calculateHand(playerHand);
        let botTotal = calculateHand(botHand);

        await interation.reply({
          content: `🃏 **Blackjack gestartet!**\nDeine Karten: ${playerHand.join(
            ", "
          )} (**${playerTotal}**)`,
          components: [
            new ActionRowBuilder().addComponents(
              new ButtonBuilder()
                .setCustomId("hit")
                .setLabel("Hit")
                .setStyle(ButtonStyle.Primary),
              new ButtonBuilder()
                .setCustomId("stand")
                .setLabel("Stand")
                .setStyle(ButtonStyle.Secondary)
            ),
          ],
        });

        const filter = (btn) => btn.user.id === interation.user.id;
        const collector = interation.channel.createMessageComponentCollector({
          filter,
          time: 60000,
        });

        collector.on("collect", async (btn) => {
          if (btn.customId === "hit") {
            playerHand.push(drawCard());
            playerTotal = calculateHand(playerHand);

            if (playerTotal > 21) {
              await btn.update({
                content: `❌ **BUST!** Deine Karten: ${playerHand.join(
                  ", "
                )} (**${playerTotal}**) - Du hast verloren!`,
                components: [],
              });
              collector.stop();
            } else {
              await btn.update({
                content: `Deine Karten: ${playerHand.join(
                  ", "
                )} (**${playerTotal}**)`,
                components: btn.message.components,
              });
            }
          } else if (btn.customId === "stand") {
            while (botTotal < 17) {
              botHand.push(drawCard());
              botTotal = calculateHand(botHand);
            }

            let result = "";
            if (botTotal > 21 || playerTotal > botTotal) {
              result = "🎉 **Glückwunsch! Du hast gewonnen!**";
            } else if (playerTotal < botTotal) {
              result = "😞 **Der Bot gewinnt!**";
            } else {
              result = "⚖️ **Unentschieden!**";
            }

            await btn.update({
              content: `**Spiel beendet!**\nDeine Karten: ${playerHand.join(
                ", "
              )} (**${playerTotal}**)\nBot Karten: ${botHand.join(
                ", "
              )} (**${botTotal}**)\n\n${result}`,
              components: [],
            });
            collector.stop();
          }
        });
      }

      // ========== MINECRAFT SERVER START ==========
      else if (interation.commandName === "start-mc") {
        const userId = interation.user.id;

        if (userId === "714741152271564861") {
          await interation.deferReply();

          // CHECK SERVER STATE
          exec("screen -ls || true", (error, stdout, stderr) => {
            if (error) {
              console.error(`Error while using screen -ls: ${error}`);
              interation.editReply(
                "<:error:1284753947680309318> `Error while checking Minecraft server State.`"
              );
              return;
            }

            const isRunning = stdout.includes("minecraft");

            if (isRunning) {
              interation.editReply(
                "<:error:1284753947680309318> `The Server is already running.`"
              );
            } else {
              exec(
                "cd /home/admin/mcserver && screen -S minecraft -dm java -Xmx1024M -Xms1024M -jar server.jar nogui",
                (error, stdout, stderr) => {
                  if (error) {
                    console.error(
                      `Fehler beim Starten des Servers: ${error.message}`
                    );
                    return interation.editReply({
                      content:
                        "<:error:1284753947680309318> `Error starting Minecraft server.`",
                      ephemeral: true,
                    });
                  }
                  console.log(`Minecraft server started successfully!`);
                  interation.editReply({
                    content:
                      "<:check:1284841812518899815> `Minecraft server started successfully!`",
                  });
                }
              );
            }
          });
<<<<<<< HEAD
        } else {
          await interation.reply({
            content:
              "<:error:1284753947680309318> `I dont think you have the permission to do that.`",
            ephemeral: true,
          });
        }
=======
          } else {
            await interation.reply({
              content:
              "<:error:1284753947680309318> `I dont think you have the permission to do that.`",
              ephemeral: true,
            });
          }
>>>>>>> 7acd4556ad761ec5ffa265bbaaa35c3fcbc9d901
      }

      // ========== MINECRAFT SERVER STOP ==========
      else if (interation.commandName == "stop-mc") {
        const userId = interation.user.id;

        if (userId === "714741152271564861") {
          await interation.deferReply();

          // CHECK SERVER STATE
          exec("screen -ls || true", (error, stdout, stderr) => {
            if (error) {
              console.error(`Error while using screen -ls: ${error}`);
              interation.editReply(
                "<:error:1284753947680309318> `Error while checking Minecraft server State.`"
              );
              return;
            }

            const isRunning = stdout.includes("minecraft");

            if (isRunning) {
              exec(
                'screen -S minecraft -X stuff "stop\n"',
                (error, stdout, stderr) => {
                  if (error) {
                    console.error(`Fehler: ${error}`);
                    return interation.editReply({
                      content:
                        "<:error:1284753947680309318> `Error stopping Minecraft server.`",
                      ephemeral: true,
                    });
                  }
                  console.log(`Minecraft server stopped successfully!`);
                  interation.editReply({
                    content:
                      "<:check:1284841812518899815> `Minecraft server stopped successfully!`",
                  });
                }
              );
            } else {
              interation.editReply(
                "<:error:1284753947680309318> `The Server is not running.`"
              );
            }
          });
<<<<<<< HEAD
        } else {
          await interation.reply({
            content:
=======
          } else {
            await interation.reply({
              content:
>>>>>>> 7acd4556ad761ec5ffa265bbaaa35c3fcbc9d901
              "<:error:1284753947680309318> `I dont think you have the permission to do that.`",
            ephemeral: true,
          });
        }
      }
    }
  } catch (error) {
    console.error(error);
    await interation.reply({
      content:
        "<:error:1284753947680309318> `Hmm...something seems to have gone wrong.`",
    });
  }
});

client.login(process.env.DISCORD_TOKEN);
