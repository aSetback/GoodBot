const fs = require("fs");
const Discord = require("discord.js");

module.exports = {
	run: (client) => {
		// Watch the upload folder
		let fsTimeout = null;
		if (!client.config.epgpBackupFolder) {
			return false;
		}
		let uploadPath = client.config.epgpBackupFolder + '/upload/';
		fs.watch(uploadPath, {interval: 5000}, async (eventType, fileName) => {
			if (!fsTimeout) {
				let guildID = fileName.split('-').shift();
				let guild = await client.guilds.get(guildID);
				let channel = {
					guild: guild,
					type: null
				};
				let displayChannel = await guild.channels.find(channel => channel.name === "standings");

				fsTimeout = setTimeout(async () => { 
					fsTimeout=null
					let content = fs.readFileSync(uploadPath + fileName, 'utf8');
					if (content.indexOf('EPGP_DB =') > -1) {
						let jsonData = client.epgp.dndParse(client, content);
						await client.epgp.clearChannel(displayChannel);
						client.epgp.display(displayChannel, jsonData);
					} else if (fileName.indexOf('GoodEPGP') > -1) {
						console.log('Parse EPGP: ' + fileName);
						client.epgp.update(client, guild, content);
					} else if (fileName.indexOf('GoodBot') > -1) {
						client.log.write(client, null, channel, "Guild bank information has been uploaded.");
						client.guildbank.update(client, guild, content);
					}
				}, 10000);
			}
		});

	}
}
