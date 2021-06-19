const { Message } = require("discord.js");

module.exports = async (client, button) => {
    button.defer();
    await button.clicker.fetch();
    client.signups.set(button.id, button.clicker.member.displayName, button.channel.name, button.message, client);
};