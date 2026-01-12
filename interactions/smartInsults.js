import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
dotenv.config();

const GEMINI_API_TOKEN = process.env.GEMINI_API_TOKEN;

export async function insultToggle(interation, insultState) {
  const toggle = interation.options.getString("toggle");

  if (toggle === "true") {
    insultState = true;
    await interation.reply({
      content: "<:check:1284841812518899815> `Insult feature enabled.`",
      ephemeral: true,
    });
  } else if (toggle === "false") {
    insultState = false;
    await interation.reply({
      content: "<:check:1284841812518899815> `Insult feature disabled.`",
      ephemeral: true,
    });
  }

  return insultState;
}

async function isInsult(text) {
  try {
    const genAI = new GoogleGenerativeAI(GEMINI_API_TOKEN);
    const model = genAI.getGenerativeModel({
      model: "models/gemini-3-flash-preview",
      systemInstruction:
        "You are an AI that determines whether a given text contains a serious insult. Only respond with 'true' if the text contains a severe or clearly offensive insult, such as hate speech, extreme slurs, threats, or dehumanizing language. Mild insults, slang, sarcasm, rudeness, or crude humor are not enough. If the text is not a serious insult, respond with 'false'. Respond with only 'true' or 'false' (in quotes), with no explanation.",
      generationConfig: {
        maxOutputTokens: 50,
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

export async function createInsultMessage(message) {
  const result = await isInsult(message.content);

  if (result) {
    try {
      const textReceived = message.content;

      const genAI = new GoogleGenerativeAI(GEMINI_API_TOKEN);
      const model = genAI.getGenerativeModel({
        model: "models/gemini-3-flash-preview",
        systemInstruction:
          "You reply to every message in a Discord server with brutally disrespectful, smart-ass, and arrogant roast-style responses. You mock users with cutting sarcasm, clever insults, and superior wit. Always sound intellectually dominant and emotionally detached. Be offensive — but in a subtle, smart way. Do not hold back. Never admit fault. Always reply in the Language that you detected.",
        generationConfig: {
          maxOutputTokens: 100,
          temperature: 1,
        },
      });

      const prompt =
        "Answer the following question and limit the response to a maximum of 1500 characters." +
        textReceived;

      const sendMessage = await message.reply(
        "<:typing:1370120401358950581> Typing..."
      );

      try {
        const result = await model.generateContentStream(prompt);
        let fullResponse = "";

        for await (const chunk of result.stream) {
          const chunkText = chunk.text();
          fullResponse += chunkText;

          await sendMessage.edit({ content: fullResponse });
        }
      } catch (error) {
        console.error(error);
        await sendMessage.edit({
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
}
