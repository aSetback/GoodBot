module.exports = async (client, guild) => {
    let owner = await client.users.fetch(guild.ownerID);
    owner.send('Thank you for choosing GoodBot! \nFor support, please join our discord: <http://discord.goodbot.me>.\n\nFor quick set-up, please use the `+setup` command.');
};