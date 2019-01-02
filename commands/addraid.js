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
	
	const raid = args[0];
	const date = args[1];
	const name = raid + '-signups-' + date;
	var server = message.guild;
	
	if (!raid || !date) {
		return false;
	}

	let category = server.channels.find(c => c.name == "Raid Signups" && c.type == "category");
	server.createChannel(name, 'text')
		.then(function(channel) {
			channel.setParent(category.id);
			channel.send('@everyone Please let the officers know if you will be able to make this raid by signing up here. \n For Yes: + \n For Maybe: m \n For No: -');
			channel.send('If you are signing up under a name that does not match your discord name, please add it to the end of your signup. \n For Yes: + Flameaesir \n For Maybe: m Flameaesir \n For No: - Flameaesir');

		});
}