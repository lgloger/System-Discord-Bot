export async function addRole(member) {
  const role = member.guild.roles.cache.find((role) => role.name === "Members");

  if (role) {
    try {
      await member.roles.add(role);
    } catch (error) {
      console.error(error);
    }
  } else {
    console.log('The role "Members" does not exist');
  }
}