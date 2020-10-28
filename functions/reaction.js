module.exports = {
	setRole: (member, action, roleName, channel) => {
		let role = channel.guild.roles.cache.find(role => role.name === roleName);
		if (action == 'add') {
			member.addRole(role);
		} else if (action == 'remove') {
			member.removeRole(role);
		}
	},
}