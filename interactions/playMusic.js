import {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  AudioPlayerStatus,
} from "@discordjs/voice";
const path = require("path");
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let isPlaying = false;

export async function playRadio(interation) {
  if (interation.author.bot) return;

  const channel = interation.member?.voice?.channel;

  if (!channel) {
    interation.reply("You need to be in a Voice Channel!");
    return;
  }

  if (isPlaying) {
    const connection = getVoiceConnection(channel.guild.id);
    if (connection) {
      connection.destroy();
    }

    isPlaying = false;
    await interation.reply("Radio stopped!");
    return;
  }

  const connection = joinVoiceChannel({
    channelId: channel.id,
    guildId: channel.guild.id,
    adapterCreator: channel.guild.voiceAdapterCreator,
  });

  const player = createAudioPlayer();
  const resourcePath = path.join(__dirname, "music", "nonStopPop.mp3");

  function playLoop() {
    const resource = createAudioResource(resourcePath);
    player.play(resource);
  }

  playLoop();

  player.on(AudioPlayerStatus.Idle, () => {
    playLoop();
  });

  connection.subscribe(player);
  isPlaying = true;

  await interation.reply("Radio started!");
}
