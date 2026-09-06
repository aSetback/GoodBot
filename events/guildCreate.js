module.exports = async (client, guild) => {
    let owner = await client.users.fetch(guild.ownerID);
    owner.send('Thank you for choosing GoodBot! \nFor support, please join our discord: <https://discord.gg/4tG8Ab2Hub>.\n\nFor quick set-up, please use the `/setup` command.');
};