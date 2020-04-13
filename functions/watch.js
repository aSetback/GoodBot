const fs = require("fs");
const Discord = require("discord.js");

module.exports = {
	run: (client) => {
		let guildList = client.guilds.array();
		for (index in guildList) {
			let guild = guildList[index];
			let fileName = client.config.epgpBackupFolder + '/upload/' + guild.id + '-gep.lua';
			// Watch the epgp file and automatically update epgp channel on update.
			fs.watchFile(fileName, {interval: 5000}, (curr, prev) => {
				if (!fs.existsSync(fileName)) {
					return false;
				}
				console.log('File uploaded for: ' + guild.name);
				client.epgp.update(client, guild, fileName);
				client.epgp.backup(client, guild, fileName);
			});
		}

	}
}
