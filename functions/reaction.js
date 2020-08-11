module.exports = {
	setRole: (member, action, roleName, channel) => {
		let role = channel.guild.roles.find(role => role.name === roleName);
		if (action == 'add') {
			member.addRole(role);
		} else if (action == 'remove') {
			member.removeRole(role);
		}
	},
	rawEvent: (client, packet) => {
		if (!['MESSAGE_REACTION_ADD', 'MESSAGE_REACTION_REMOVE'].includes(packet.t)) return;

		// Ignore the bot emojies
		if (!packet.d.user_id == client.config.userId) return;

		let channel = client.channels.get(packet.d.channel_id);
		let emoji = packet.d.emoji;
		let action = packet.t === 'MESSAGE_REACTION_ADD' ? 'add' : 'remove';
		let member = channel.guild.members.get(packet.d.user_id);
		

		// Check is this is a sign-up channel
		client.models.raid.findOne({ where: { 'channelID': channel.id, 'guildID': channel.guild.id } }).then((raid) => {
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
		});
	}
}