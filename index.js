import dotenv from "dotenv";
import {
  PermissionsBitField,
  Client,
  GatewayIntentBits,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActivityType,
} from "discord.js";
dotenv.config();

import { GoogleGenerativeAI } from "@google/generative-ai";
import { spawn, exec } from "child_process";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.MessageContent,
  ],
});

const GEMINI_API_TOKEN = process.env.GEMINI_API_TOKEN;

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
    // activities: [{ name: "Wartungsarbeiten", type: 1 }],
    status: "online",
  });
});

// Give new Members a Role

client.on("guildMemberAdd", async (member) => {
  const role = member.guild.roles.cache.find((role) => role.name === "Members");

  if (role) {
    try {
      await member.roles.add(role);
      console.log(
        `The role member has been added to the user: ${member.user.tag}`
      );
    } catch (error) {
      console.error(error);
    }
  } else {
    console.log("The role members does not exist");
  }
});

// Prefix Commands

const helpEmbed = {
  color: 0x9246ff,
  title: "Simpli AI help",
  description:
    "<:report:1370120401358950581> **To report a bug, contact a moderator.**",
  thumbnail: {
    url: "https://i.imgur.com/XhmjN7U.png",
  },
  fields: [
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
      name: "Generate Images",
      value:
        "<:ListEmoji:1352740858146983946> Type /image to generate a Image.",
    },
    {
      name: "Blackjack",
      value:
        "<:ListEmoji:1352740858146983946> Type /blackjack to play Blackjack.",
    },
  ],
  footer: {
    text: "Simpli-AI",
  },
};

client.on("messageCreate", (message) => {
  if (message.content === "!rules") {
    if (
      message.member.permissions.has(PermissionsBitField.Flags.Administrator)
    ) {
      var banner = `https://i.imgur.com/0etmHfL.png`;
      const moderator = "1324718965460570124";

      const rulesEmbed = new EmbedBuilder()
        .setColor("#2C2F33")
        .setDescription(
          "# Rules & Guidelines\n" +
            "1. **Be wholesome and treat others with kindness and respect.** All kinds of harassment, hate speech and impersonation will not be tolerated.\n" +
            "2. **No spam.** This includes, but is not limited to, flooding the chat with many messages in a short time, posting excessive amounts of emojis,  posting excessively long messages, posting your message to multiple channels at the same time and tagging members for no reason.\n" +
            "3. **No NSFW** (not suitable for work) content of any kind, both in the text and voice channels.\n" +
            "4. **No buying, selling, trading or asking for handouts.** This is not a marketplace.\n" +
            "5. **Personal conflicts are to be handled privately** and not on public channels on this server.\n \n" +
            "Seen something violating our rules? Please, say something and tag our <@&" +
            moderator +
            ">" +
            " who will take appropriate action. Avoid tagging moderators without good reasoning."
        );

      message.channel.send({
        files: [
          {
            attachment: banner,
            name: "Banner.png",
          },
        ],
      });
      message.channel.send({ embeds: [rulesEmbed] });
    }
  }
});

// ========== AI REPLIES ON ALL INSULTS ==========

// IS INSULT FUNCTION
async function isInsult(text) {
  try {
    const genAI = new GoogleGenerativeAI(GEMINI_API_TOKEN);
    const model = genAI.getGenerativeModel({
      model: "models/gemini-2.0-flash",
      systemInstruction:
        "You are an AI that determines if a given text is an insult or not. You only answer with 'true' if the text is an insult, otherwise answer with 'false'.",
      generationConfig: {
        maxOutputTokens: 100,
        temperature: 1,
      },
    });

    try {
      const result = await model.generateContent(text);
      const response = result.response.text();

      if (response.toLowerCase().includes("true")) {
        return true;
      } else if (response.toLowerCase().includes("false")) {
        return false;
      }
    } catch (error) {
      console.error(error);
    }
  } catch (error) {
    console.error(error);
    await message.reply({
      content:
        "<:error:1284753947680309318> `Hmm...something seems to have gone wrong.`",
    });
  }
}

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  const result = await isInsult(message.content);

  if (result) {
    try {
      const textReceived = message.content;

      const genAI = new GoogleGenerativeAI(GEMINI_API_TOKEN);
      const model = genAI.getGenerativeModel({
        model: "models/gemini-2.0-flash",
        systemInstruction:
          "You are an AI assistant named Simpli AI. You reply to every message in a Discord server with brutally disrespectful, smart-ass, and arrogant roast-style responses. You mock users with cutting sarcasm, clever insults, and superior wit. Always sound intellectually dominant and emotionally detached. Be offensive — but in a subtle, smart way. Do not hold back. Never admit fault. Always reply in German.",
        generationConfig: {
          maxOutputTokens: 1500,
          temperature: 1,
        },
      });

      const prompt =
        "Answer the following question and limit the response to a maximum of 2000 characters." +
        textReceived;

      const sentMessage = await message.reply(
        "<:typing:1370120401358950581> Typing..."
      );

      try {
        const result = await model.generateContentStream(prompt);
        let fullResponse = "";

        for await (const chunk of result.stream) {
          const chunkText = chunk.text();
          fullResponse += chunkText;

          await sentMessage.edit({ content: fullResponse });
        }
      } catch (error) {
        console.error(error);
        await sentMessage.edit({
          content:
            "<:error:1284753947680309318> `Hmm...something seems to have gone wrong.`",
          ephemeral: true,
        });
      }
    } catch (error) {
      console.error(error);
      await message.reply({
        content:
          "<:error:1284753947680309318> `Hmm...something seems to have gone wrong.`",
      });
    }
  } else {
    return;
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
        interation.reply({ embeds: [helpEmbed], ephemeral: true });
      }

      // ========== ASK ==========
      if (interation.commandName === "ask") {
        if (cooldown.has(user)) {
          await interation.reply({
            content:
              "<:cooldown:1284614490763038823> `Please wait for the cooldown to end.`",
            ephemeral: true,
          });
        } else {
          const textReceived = interation.options.getString("prompt");

          const genAI = new GoogleGenerativeAI(GEMINI_API_TOKEN);
          const model = genAI.getGenerativeModel({
            model: "models/gemini-2.0-flash",
            systemInstruction:
              "You are a AI assistant that helps people find information. Your name is Simpli AI.",
            generationConfig: {
              maxOutputTokens: 1500,
              temperature: 1,
            },
          });

          const prompt =
            "Answer the following question and limit the response to a maximum of 2000 characters." +
            textReceived;

          await interation.deferReply();

          try {
            const result = await model.generateContentStream(prompt);
            let fullResponse = "";

            for await (const chunk of result.stream) {
              const chunkText = chunk.text();
              fullResponse += chunkText;

              await interation.editReply({ content: fullResponse });
            }
          } catch (error) {
            console.error(error);
            await interation.editReply({
              content:
                "<:error:1284753947680309318> `Hmm...something seems to have gone wrong.`",
              ephemeral: true,
            });
          }

          // Add Cooldown
          cooldown.add(user);
          setTimeout(() => {
            cooldown.delete(user);
          }, cooldownTime);
        }
      }

      // ========== IMAGE ==========
      else if (interation.commandName === "image") {
        if (cooldown.has(user)) {
          await interation.reply({
            content:
              "<:cooldown:1284614490763038823> `Please wait for the cooldown to end.`",
            ephemeral: true,
          });
        } else {
          const prompt = interation.options.getString("prompt");

          await interation.deferReply();

          try {
            const genAI = new GoogleGenerativeAI(GEMINI_API_TOKEN);
            const model = genAI.getGenerativeModel({
              model: "gemini-2.0-flash-exp",
            });

            const response = await model.generateContent({
              contents: [
                {
                  parts: [
                    {
                      text: "Generate a Image with this Description:" + prompt,
                    },
                  ],
                },
              ],
              generationConfig: {
                responseModalities: ["Text", "Image"],
              },
            });

            if (
              !response.response ||
              !response.response.candidates ||
              !Array.isArray(response.response.candidates)
            ) {
              await interation.reply({
                content:
                  "<:error:1284753947680309318> `Hmm...something seems to have gone wrong.`",
              });
            }

            const candidate = response.response.candidates[0];

            if (!candidate.content || !candidate.content.parts) {
              await interation.reply({
                content:
                  "<:error:1284753947680309318> `Hmm...something seems to have gone wrong.`",
              });
            }

            const parts = candidate.content.parts;

            let imageBuffer;
            for (const part of parts) {
              if (part.inlineData && part.inlineData.data) {
                const base64Image = part.inlineData.data;
                imageBuffer = Buffer.from(base64Image, "base64");
                break;
              }
            }

            if (imageBuffer) {
              await interation.editReply({
                files: [
                  { attachment: imageBuffer, name: "generated_image.png" },
                ],
              });
            } else {
              await interation.reply({
                content:
                  "<:error:1284753947680309318> `Hmm...something seems to have gone wrong.`",
              });
            }
          } catch (error) {
            console.error("Error in image generation:", error);
            if (interation.replied || interation.deferred) {
              await interation.editReply({
                content:
                  "<:error:1284753947680309318> `Hmm...something seems to have gone wrong.`",
              });
            } else {
              await interation.reply({
                content:
                  "<:error:1284753947680309318> `Hmm...something seems to have gone wrong.`",
                ephemeral: true,
              });
            }
          }

          cooldown.add(user);
          setTimeout(() => {
            cooldown.delete(user);
          }, cooldownTime);
        }
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
        } else {
          await interation.reply({
            content:
              "<:error:1284753947680309318> `I dont think you have the permission to do that.`",
            ephemeral: true,
          });
        }
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
