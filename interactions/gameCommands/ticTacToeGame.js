import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";

export async function ticTacToe(interation, user) {
  const creator = user;
  let opponent = null;
  let currentPlayer = creator;
  let board = Array(9).fill(null);
  let gameActive = false;

  const joinBtn = new ButtonBuilder()
    .setCustomId("join")
    .setLabel("Join Game")
    .setStyle(ButtonStyle.Success);

  const stopBtn = new ButtonBuilder()
    .setCustomId("stop")
    .setLabel("Stop Game")
    .setStyle(ButtonStyle.Danger);

  const controlRow = new ActionRowBuilder().addComponents(joinBtn, stopBtn);

  const message = await interation.reply({
    content: `🎲 \`${creator.username}\` VS \`Unknown\` \n\n Waiting for a player...`,
    components: [controlRow],
    fetchReply: true,
  });

  const collector = message.createMessageComponentCollector({ time: 600000 });

  collector.on("collect", async (i) => {
    if (i.customId === "stop") {
      if (i.user.id !== creator.id) {
        return i.reply({
          content: "Only the Creator can stop the Game!",
          ephemeral: true,
        });
      }
      collector.stop();
      return i.update({ content: "🛑 Game stopped.", components: [] });
    }

    if (i.customId === "join") {
      if (i.user.id === creator.id) {
        return i.reply({
          content: "You can't play against yourself!",
          ephemeral: true,
        });
      }
      if (opponent) {
        return i.reply({
          content: "There already is someone playing.",
          ephemeral: true,
        });
      }

      opponent = i.user;
      gameActive = true;
      await i.update({
        content: `🎲 \`${creator.username} (X)\` VS \`${opponent.username} (O)\` \n\n ${currentPlayer.username} starts!`,
        components: renderBoard(board),
      });
    }

    if (i.customId.startsWith("cell_") && gameActive) {
      if (i.user.id !== currentPlayer.id) {
        return i.reply({ content: "It's not your turn!", ephemeral: true });
      }

      const index = parseInt(i.customId.split("_")[1]);
      if (board[index]) {
        return i.reply({
          content: "This field is already occupied!",
          ephemeral: true,
        });
      }

      // Display symbol
      const symbol = currentPlayer.id === creator.id ? "X" : "O";
      board[index] = symbol;

      // Switch Player
      currentPlayer = currentPlayer.id === creator.id ? opponent : creator;

      // Check Winner
      const winner = checkWinner(board);
      if (winner || board.every((c) => c)) {
        gameActive = false;
        let endMsg = winner
          ? `🎉 \`${creator.username}\` VS \`${opponent.username}\` \n\n ${
              winner === "X" ? creator.username : opponent.username
            } has won!`
          : `🎲 \`${creator.username}\` VS \`${opponent.username}\` \n\n🤝 Draw!`;
        return i.update({
          content: endMsg,
          components: renderBoard(board, true),
        });
      }

      await i.update({
        content: `🎲 \`${creator.username} (X)\` VS \`${opponent.username} (O)\` \n\n ${currentPlayer.username}, it's your turn!`,
        components: renderBoard(board),
      });
    }
  });
}

function renderBoard(board, disabled = false) {
  const rows = [];
  for (let r = 0; r < 3; r++) {
    const row = new ActionRowBuilder();
    for (let c = 0; c < 3; c++) {
      const i = r * 3 + c;
      let btn = new ButtonBuilder()
        .setCustomId(`cell_${i}`)
        .setStyle(ButtonStyle.Secondary)
        .setLabel(board[i] ? board[i] : "_")
        .setDisabled(disabled || board[i] !== null);

      if (board[i] === "X") btn.setStyle(ButtonStyle.Danger); // Red
      if (board[i] === "O") btn.setStyle(ButtonStyle.Primary); // Blue

      row.addComponents(btn);
    }
    rows.push(row);
  }
  return rows;
}

function checkWinner(b) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (const [a, b1, c] of lines) {
    if (b[a] && b[a] === b[b1] && b[a] === b[c]) return b[a];
  }
  return null;
}
