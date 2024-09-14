import { REST, SlashCommandBuilder, Routes } from "discord.js";
import dotenv from "dotenv";
dotenv.config();

const Token = process.env.DISCORD_TOKEN;
const botID = "1279509321792622735";

const rest = new REST().setToken(Token);
const slashRegister = async () => {
  try {
    await rest.put(Routes.applicationCommands(botID), {
      body: [
        new SlashCommandBuilder()
          .setName("ask")
          .setDescription("Ask Knex something.")
          .addStringOption((option) => {
            return option
              .setName("prompt")
              .setDescription("Ask your question.")
              .setRequired(true)
              .setMinLength(5)
              .setMaxLength(1000);
          }),
        new SlashCommandBuilder()
          .setName("summarize")
          .setDescription("Summarize a Text.")
          .addStringOption((option) => {
            return option
              .setName("text")
              .setDescription("Write yoour Text to be summarized.")
              .setRequired(true)
              .setMinLength(5)
              .setMaxLength(1500);
          }),
        new SlashCommandBuilder()
          .setName("math")
          .setDescription("Solve a Math Problem.")
          .addStringOption((option) => {
            return option
              .setName("problem")
              .setDescription("Write your Math Problem.")
              .setRequired(true)
              .setMinLength(5)
              .setMaxLength(500);
          })
          .addStringOption((option) => {
            return option
              .setName("language")
              .setDescription("Select your Language.")
              .setRequired(true)
              .addChoices(
                { name: "English", value: "English" },
                { name: "Deutsch", value: "German" }
              );
          }),
      ],
    });
  } catch (error) {
    console.log(error);
  }
};
slashRegister();
