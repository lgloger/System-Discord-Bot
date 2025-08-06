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
          .setName("help")
          .setDescription("Get a List of all Commands."),
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
          .setName("insult")
          .setDescription("Toggle the insult feature.")
          .addStringOption((option) =>
            option
              .setName("toggle")
              .setDescription("True or false to toggle the insult feature.")
              .setRequired(true)
              .addChoices(
                { name: "True", value: "true" },
                { name: "False", value: "false" }
              )
          ),
        new SlashCommandBuilder()
          .setName("blackjack")
          .setDescription("Play Blackjack with Simpli."),
        new SlashCommandBuilder()
          .setName("start-mc")
          .setDescription("Start the Minecraft server."),
        new SlashCommandBuilder()
          .setName("stop-mc")
          .setDescription("Stop the Minecraft server."),
      ],
    });
  } catch (error) {
    console.log(error);
  }
};
slashRegister();
