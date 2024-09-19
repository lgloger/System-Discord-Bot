import dotenv from "dotenv";
import request from "request";
dotenv.config();

// Firebase
import { db } from "./firebase.js";
import { collection, addDoc } from "firebase/firestore";

import {
  Client,
  Embed,
  GatewayIntentBits,
  PresenceUpdateStatus,
  EmbedBuilder,
  Guild,
} from "discord.js";

import { GoogleGenerativeAI } from "@google/generative-ai";

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
    activities: [{ name: "?help", type: 1 }],
    status: "online",
  });
});

// ========== HELP ==========

const helpEmbed = {
  color: 0x3498db,
  title: "Knex AI help",
  description:
    "<:report:1284759522212188170> **To report a bug Type /report**",
  thumbnail: {
    url: "https://i.imgur.com/XhmjN7U.png",
  },
  fields: [
    {
      name: "Commands list",
      value:
        "<:ListEmoji:1284528208707981453> Type ?help to view a list of slash commands.",
    },
    {
      name: "Chat with Knex AI",
      value: "<:ListEmoji:1284528208707981453> Type /ask to chat with Knex AI.",
    },
    {
      name: "Mathematics",
      value:
        "<:ListEmoji:1284528208707981453> Type /math to solve a math problem.",
    },
    {
      name: "Summarize",
      value:
        "<:ListEmoji:1284528208707981453> Type /summarize to summarize a text.",
    },
  ],
  footer: {
    text: "Knex-AI",
  },
};

client.on("messageCreate", (message) => {
  if (message.content === "?help") {
    message.channel.send({ embeds: [helpEmbed] });
  }
});

// ========== COMMAND ==========

const cooldown = new Set();
const cooldownTime = 15 * 1000;

client.on("interactionCreate", async (interation) => {
  const user = interation.user.id;

  try {
    // ========== ASK ==========
    if (interation.isCommand()) {
      if (interation.commandName === "ask") {
        // Check Cooldown
        if (cooldown.has(user)) {
          interation.reply({
            content:
              "<:cooldown:1284614490763038823> `Please wait for the cooldown to end.`",
            ephemeral: true,
          });
        } else {
          const textRecieved = interation.options.getString("prompt");

          const genAI = new GoogleGenerativeAI(GEMINI_API_TOKEN);
          const model = genAI.getGenerativeModel({
            model: "gemini-1.5-flash",
            systemInstruction:
              "You are a AI assistant that helps people find information. Your name is Knex.",
            generationConfig: {
              maxOutputTokens: 1500,
              temperature: 1,
            },
          });

          const prompt =
            "Answer the following question in the same language it was asked, and limit the response to a maximum of 2000 characters." +
            textRecieved;

          await interation.reply({
            content: "<a:loading:1284754853389926480> `Thinking`",
          });

          try {
            const result = await model.generateContentStream(prompt);
            let fullresponse = "";

            for await (const chunk of result.stream) {
              const chunkText = chunk.text();
              fullresponse += chunkText;

              await interation.editReply({ content: fullresponse });
            }
          } catch (error) {
            console.error(error);
            await interation.editReply({
              content:
                "<:error:1284753947680309318> `Hmm...something seems to have gone wrong.`",
              ephemeral: true,
            });
          }

          // add Cooldown
          cooldown.add(user);
          setTimeout(() => {
            cooldown.delete(user);
          }, cooldownTime);
        }
      }
    }

    // ========== SUMMARIZE ==========
    if (interation.isCommand()) {
      if (interation.commandName === "summarize") {
        if (cooldown.has(user)) {
          interation.reply({
            content:
              "<:cooldown:1284614490763038823> `Please wait for the cooldown to end.`",
            ephemeral: true,
          });
        } else {
          const textRecieved = interation.options.getString("text");

          const genAI = new GoogleGenerativeAI(GEMINI_API_TOKEN);
          const model = genAI.getGenerativeModel({
            model: "gemini-1.5-flash",
            systemInstruction:
              "You are a AI assistant that helps people summarize Texts. Your name is Knex.",
            generationConfig: {
              maxOutputTokens: 1500,
              temperature: 1,
            },
          });

          const prompt =
            "Please summarize the following text in a list of key points, and limit the response to a maximum of 2000 characters." +
            textRecieved;

          await interation.reply({ content: "`Thinking`" });

          try {
            const result = await model.generateContentStream(prompt);
            let fullresponse = "";

            for await (const chunk of result.stream) {
              const chunkText = chunk.text();
              fullresponse += chunkText;

              await interation.editReply({ content: fullresponse });
            }
          } catch (error) {
            console.error(error);
            await interation.editReply({
              content:
                "<:error:1284753947680309318> `Hmm...something seems to have gone wrong.`",
              ephemeral: true,
            });
          }

          // add Cooldown
          cooldown.add(user);
          setTimeout(() => {
            cooldown.delete(user);
          }, cooldownTime);
        }
      }
    }

    // ========== MATH ==========
    if (interation.isCommand()) {
      if (interation.commandName === "math") {
        if (cooldown.has(user)) {
          interation.reply({
            content:
              "<:cooldown:1284614490763038823> `Please wait for the cooldown to end.`",
            ephemeral: true,
          });
        } else {
          const textRecieved = interation.options.getString("problem");
          const language = interation.options.getString("language");

          const genAI = new GoogleGenerativeAI(GEMINI_API_TOKEN);
          const model = genAI.getGenerativeModel({
            model: "gemini-1.5-flash",
            systemInstruction:
              "You are a AI assistant that helps people solving math. Your name is Knex.",
            generationConfig: {
              maxOutputTokens: 1500,
              temperature: 1,
            },
          });

          const prompt =
            "Calculate the following and limit the response to a maximum of 2000 characters." +
            textRecieved +
            "And Explain it in " +
            language;

          await interation.reply({ content: "`Thinking`" });

          try {
            const result = await model.generateContentStream(prompt);
            let fullresponse = "";

            for await (const chunk of result.stream) {
              const chunkText = chunk.text();
              fullresponse += chunkText;

              await interation.editReply({ content: fullresponse });
            }
          } catch (error) {
            console.error(error);
            await interation.editReply({
              content:
                "<:error:1284753947680309318> `Hmm...something seems to have gone wrong.`",
              ephemeral: true,
            });
          }

          // add Cooldown
          cooldown.add(user);
          setTimeout(() => {
            cooldown.delete(user);
          }, cooldownTime);
        }
      }
    }

    // ========== REPORT Problem
    if (interation.isCommand()) {
      if (interation.commandName === "report") {
        const userName = interation.user.username;
        const userID = interation.user.id;
        const textRecieved = interation.options.getString("problem");

        try {
          const docRef = await addDoc(collection(db, "reports"), {
            userName: userName,
            userID: userID,
            report: textRecieved,
          });
          await interation.reply({
            content:
              "<:check:1284841812518899815> `Report Sended`",
            ephemeral: true,
          })
        } catch (e) {
          await interation.reply({
            content:
              "<:error:1284753947680309318> `Hmm...something seems to have gone wrong.`",
            ephemeral: true,
          });
          console.error("Error adding document: ", e);
        }
      }
    }

    // ========== TEST COMMAND =========
    if (interation.isCommand()) {
      if (interation.commandName === "test") {
        if (cooldown.has(user)) {
          interation.reply({
            content:
              "<:cooldown:1284614490763038823> `Please wait for the cooldown to end.`",
            ephemeral: true,
          });
        } else {
          
          // add Cooldown
          cooldown.add(user);
          setTimeout(() => {
            cooldown.delete(user);
          }, cooldownTime);
        }
      }
    }
  } catch (error) {
    console.error(error);
    interation.reply({
      content:
        "<:error:1284753947680309318> `Hmm...something seems to have gone wrong.`",
      ephemeral: true,
    });
  }
});

client.login(process.env.DISCORD_TOKEN);
