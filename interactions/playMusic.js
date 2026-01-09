import {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  AudioPlayerStatus,
} from "@discordjs/voice";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let connection;
let player;
let isPlaying = false;

export async function playRadio(interaction) {
  if (interaction.user.bot) return;

  const channel = interaction.member?.voice?.channel;
  if (!channel) return interaction.reply("You need to be in a Voice Channel!");

  // Stoppen, wenn schon spielt
  if (isPlaying) {
    if (connection) connection.destroy();
    isPlaying = false;
    return interaction.reply("Radio stopped!");
  }

  // Join
  connection = joinVoiceChannel({
    channelId: channel.id,
    guildId: channel.guild.id,
    adapterCreator: channel.guild.voiceAdapterCreator,
    selfDeaf: false,
    selfMute: false,
  });

  // Audio Player
  player = createAudioPlayer();
  const resourcePath = path.join(__dirname, "..", "music", "music.mp3");
  console.log(`Trying to play: ${resourcePath}`);

  const resource = createAudioResource(resourcePath);
  player.play(resource);

  // Loop
  player.on(AudioPlayerStatus.Idle, () => {
    const loopResource = createAudioResource(resourcePath);
    player.play(loopResource);
  });

  connection.subscribe(player);
  isPlaying = true;

  return interaction.reply("Radio started!");
}
