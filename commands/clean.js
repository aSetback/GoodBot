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
	
	let messageLimit = 20;
	if (typeof(args[0] !==  'undefined')) {
		messageLimit = parseInt(args[0]);
	}
	message.channel.fetchMessages({limit: messageLimit})
	   .then(function(list){
			message.channel.bulkDelete(list);
		});
}