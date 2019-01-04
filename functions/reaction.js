module.exports = {
	setRole: (user, action, roleName, channel) => {
		let role = channel.guild.roles.find(role => role.name === roleName);
		let member = channel.guild.members.get(user.id);	
		if (action == 'add') {
			member.addRole(role);
		} else if (action == 'remove') {
			member.removeRole(role);
		}		
	},
	rawEvent: (client, packet) => {
	    if (!['MESSAGE_REACTION_ADD', 'MESSAGE_REACTION_REMOVE'].includes(packet.t)) return;
	
		let channel = client.channels.get(packet.d.channel_id);
		let main = client.emojis.find(emoji => emoji.name === "MAIN");
		let alt = client.emojis.find(emoji => emoji.name === "ALT");
		let emoji = packet.d.emoji;
		let action = packet.t === 'MESSAGE_REACTION_ADD' ? 'add' : 'remove';
		let user = client.users.get(packet.d.user_id);
		
		if (channel.name === "class-tags") {
			if (!(packet.d.message_id in client.embedTitles)) {
				channel.fetchMessage(packet.d.message_id)
					.then((message) => {
						let embed = message.embeds.shift();
						if (!embed) { return false; }

						let roleName = embed.title;
						if (emoji.id === alt.id) {
							roleName += ' Alt';
						}
						
						// Cache this info for later
						client.embedTitles[packet.d.message_id] = embed.title;
						client.reaction.setRole(user, action, roleName, channel);
					});
			} else {
				roleName = client.embedTitles[packet.d.message_id];
				if (emoji.id === alt.id) {
					roleName += ' Alt';
				}
				client.reaction.setRole(user, action, roleName, channel);
			}
		}	
	}
}