module.exports = {
	setRole: (member, action, roleName, channel) => {
		let role = channel.guild.roles.cache.find(role => role.name === roleName);
		if (action == 'add') {
			member.roles.add(role).catch((e) => { console.error('Add role failed, no permission')});
		} else if (action == 'remove') {
			member.roles.remove(role).catch((e) => { console.error('Add role failed, no permission')});
		}
	},
}