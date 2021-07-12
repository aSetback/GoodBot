const { Message } = require("discord.js");

module.exports = async (client, button) => {
    await button.clicker.fetch();
    await client.signups.set(button.id, button.clicker.member.displayName, button.channel.name, button.message, client);
    button.defer();
};

