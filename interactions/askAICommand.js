import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
dotenv.config();

const GEMINI_API_TOKEN = process.env.GEMINI_API_TOKEN;

export async function askAICommand(cooldown, cooldownTime, interation, user) {
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
      model: "models/gemini-3-flash-preview",
      systemInstruction:
        "You are a AI assistant that helps people find information. Your name is Quantum AI.",
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
