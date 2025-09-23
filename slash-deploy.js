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
          .setDescription("Ask Quantum something.")
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
          .setDescription("Play Blackjack with Quantum."),
        new SlashCommandBuilder()
          .setName("tictactoe")
          .setDescription("Play Tic Tac Toe with Other Users."),
        new SlashCommandBuilder()
          .setName("server-toggle")
          .setDescription("Start or Stop the Minecraft server.")
          .addStringOption((option) =>
            option
              .setName("commands")
              .setDescription("Additional Commands for the Minecraft server.")
              .setRequired(false)
              .addChoices({ name: "StopImmediately", value: "stop" })
          ),
      ],
    });
  } catch (error) {
    console.log(error);
  }
};
slashRegister();
