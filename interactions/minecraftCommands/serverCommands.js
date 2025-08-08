import { exec } from "child_process";

export async function handleServerCommand(interation) {
  const commands = interation.options.getString("commands");

  if (commands === "stop") {
    await stopImmediately(interation);
  } else {
    await checkMinecraftServerStatus(interation);
  }
}

async function checkMinecraftServerStatus(interation) {
  await interation.deferReply();

  exec("screen -ls || true", (error, stdout) => {
    if (error) {
      console.error(`Error while using screen -ls: ${error}`);
      interation.editReply(
        "<:error:1284753947680309318> `Error while checking Minecraft server State.`"
      );
      return;
    }

    const isRunning = stdout.includes("minecraft");

    if (isRunning) {
      exec('screen -S minecraft -X stuff "stop\n"', (error) => {
        if (error) {
          console.error(`Error: ${error}`);
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
      });
    } else {
      exec(
        "cd /home/admin/mcserver && screen -S minecraft -dm java -Xms6G -Xmx6G -jar server.jar nogui",
        (error) => {
          if (error) {
            console.error(`Error while starting the Server: ${error.message}`);
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
}

async function stopImmediately(interation) {
  await interation.deferReply();

  exec('screen -S minecraft -X stuff "stop\n"', (error) => {
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
  });
}
