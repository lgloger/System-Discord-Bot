export async function giveRole(interation) {
  const member = interation.member;

  await interation.deferReply({ ephemeral: true });
  
  if (member.user.username != "krabben_luc") {
    console.log("Unauthorized user attempted to use giveRole.");
    await interation.editReply({ content: "Canceled!", ephemeral: true });
    return;
  }

  const roleName = interation.options.getString("99999");
  const role = member.guild.roles.cache.find((role) => role.name === roleName);

  if (role) {
    try {
      await member.roles.add(role);
      await interation.editReply({ content: "Success!", ephemeral: true });
    } catch (error) {
      console.error(error);
      await interation.editReply({ content: "Canceled!", ephemeral: true });
    }
  } else {
    console.log(`The role ${roleName} does not exist`);
    await interation.editReply({ content: "Canceled!", ephemeral: true });
  }
}
