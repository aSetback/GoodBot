const fs = require("fs");

exports.run = (client, message, args) => {


	if (!message.isAdmin) {
		return false;
	}

	message.delete().catch(O_o=>{}); 
	
	const channel = message.channel.name;
	const user = args[0] ? args[0] : message.member.displayName;
	const userName = user.charAt(0).toUpperCase() + user.slice(1).toLowerCase();
	const fileName = './signups/' + message.guild.id + '-' + channel + '.json';
	client.models.raid.findOne({ where: { 'channelID': message.channel.id, 'guildID': message.channel.guild.id } }).then((raid) => {
		if (raid) {
			let parsedLineup = {};
			if (fs.existsSync(fileName)) {
				currentLineup = fs.readFileSync(fileName, 'utf8');
				parsedLineup = JSON.parse(currentLineup);
			}
			
			delete parsedLineup[userName];
			fs.writeFileSync(fileName, JSON.stringify(parsedLineup));
			client.embed.update(message, channel);
		} else {
			message.channel.send("This command can only be used in a sign-up channel.");
			return false;
		}
	});
}