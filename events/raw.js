module.exports = async (client, packet) => {
    if (!['MESSAGE_REACTION_ADD', 'MESSAGE_REACTION_REMOVE'].includes(packet.t)) return;
    let guild = client.guilds.get(packet.d.guild_id);
    let channel = await client.channels.get(packet.d.channel_id);
    let member = await guild.fetchMember(packet.d.user_id);
    let emoji = packet.d.emoji;
    let action = packet.t === 'MESSAGE_REACTION_ADD' ? 'add' : 'remove';

    // Check is this is a sign-up channel
    let raid = await client.raid.get(client, channel);
    if (raid) {
        channel.fetchMessage(packet.d.message_id)
            .then((message) => {
                if (message.author.id == client.config.userId && action == 'add') {
                    // Ignore the bot's emojis
                    if (!member || message.author.id == member.id) {
                        return false;
                    }
                    if (emoji.name == "👍") {
                        client.signups.set('+', member.displayName, channel.name, message, client);
                    }
                    if (emoji.name == "👎") {
                        client.signups.set('-', member.displayName, channel.name, message, client);
                    }
                    if (emoji.name == "🤷") {
                        client.signups.set('m', member.displayName, channel.name, message, client);
                    }
                }
            });
    }
};