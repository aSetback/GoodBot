exports.run = (client, message, args) => {

	// Determine if the player sending the message is an officer
	let isOfficer = false;
	if (message.guild !== null) {
		let officerRole = message.guild.roles.find(role => role.name === "Officer" || role.name === "Staff");

		if (message.member.roles.has(officerRole.id)) {
			isOfficer = true;
		}
	}
	if (!isOfficer) {
		return false;
	}
	
	let category = message.guild.channels.find(c => c.name == "Sign Up Archives" && c.type == "category");
	message.channel.setParent(category.id).then((channel) => {
		channel.lockPermissions();
	});
}