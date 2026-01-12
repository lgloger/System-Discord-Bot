import dotenv from "dotenv";
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

// Import Interactions
import { giveRole } from "./interactions/giveRole.js";
import { addRole } from "./interactions/addRole.js";
import { sendHelpEmbed } from "./interactions/helpCommand.js";
import {
  insultToggle,
  createInsultMessage,
} from "./interactions/smartInsults.js";
import { askAICommand } from "./interactions/askAICommand.js";
import { playRadio } from "./interactions/playMusic.js";
import {
  sendSupportMessage,
  sendRulesMessage,
} from "./interactions/sendPrefixMessages.js";
import { handleServerCommand } from "./interactions/minecraftCommands/serverCommands.js";

import { ticTacToe } from "./interactions/gameCommands/ticTacToeGame.js";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates,
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
});

// Give new Users a Role
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
});

// ========== INTERACTIONS ==========

const cooldown = new Set();
const cooldownTime = 15 * 1000;

client.on("interactionCreate", async (interation) => {
  const user = interation.user.id;
  const userData = interation.user;

  try {
    if (interation.isCommand()) {
      // ========== HELP ==========
      if (interation.commandName === "help") {
        sendHelpEmbed(interation).catch(console.error);
      }

      // ========== GIVE ROLE (9999) ==========
      if (interation.commandName === "9999") {
        giveRole(interation).catch(console.error);
      }

      // ========== ASK ==========
      if (interation.commandName === "ask") {
        askAICommand(cooldown, cooldownTime, interation, user).catch(
          console.error
        );
      }

      // ========== PLAY RADIO ==========
      if (interation.commandName === "radio") {
        playRadio(interation).catch(console.error);
      }

      // ========== TIC TAC TOE ==========
      if (interation.commandName === "tictactoe") {
        ticTacToe(interation, userData).catch(console.error);
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
    }
  } catch (error) {
    console.error(error);
    await interation.reply({
      content:
        "<:error:1284753947680309318> `Hmm...something seems to have gone wrong.`",
    });
  }
});

// ========== MINECRAFT SERVER COMMANDS ==========
client.on("interactionCreate", async (interation) => {
  try {
    if (interation.isCommand()) {
      if (interation.commandName === "server-toggle") {
        const userId = interation.user.id;

        if (userId === "714741152271564861") {
          handleServerCommand(interation).catch(console.error);
        } else {
          await interation.reply({
            content:
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
