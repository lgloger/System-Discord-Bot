import {
  REST,
  SlashCommandBuilder,
  PermissionFlagsBits,
  Routes,
} from "discord.js";
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
          .setDescription("Ask Simpli something.")
          .addStringOption((option) => {
            return option
              .setName("prompt")
              .setDescription("Ask your question.")
              .setRequired(true)
              .setMaxLength(1000);
          }),
        new SlashCommandBuilder()
          .setName("image")
          .setDescription("Generates an image.")
          .addStringOption((option) => {
            return option
              .setName("prompt")
              .setDescription("Describe the image you want.")
              .setRequired(true)
              .setMaxLength(5000);
          }),
        new SlashCommandBuilder()
          .setName("blackjack")
          .setDescription("Play Blackjack with Simpli.")
      ],
    });
  } catch (error) {
    console.log(error);
  }
};
slashRegister();
