exports.run = (client, message, args) => {

	if (!message.isAdmin) {
		return false;
	}
	
	const raid = args[0];
	const date = args[1];
	const raidName = raid + '-signups-' + date;
	var server = message.guild;
	
	if (!raid || !date) {
		return false;
	}

	let category = server.channels.find(c => c.name == "Raid Signups" && c.type == "category");
	server.createChannel(raidName, 'text')
		.then((channel) => {
			let signupMessage = 'placeholder';
			channel.setParent(category.id);
			channel.send(signupMessage).then((botMsg) => {
				botMsg.pin();
				client.embed.update(botMsg, raidName);
			});
		});
}