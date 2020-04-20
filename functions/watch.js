const fs = require("fs");
const Discord = require("discord.js");

module.exports = {
	run: (client) => {
		// Watch the upload folder
		let fsTimeout = null;
		let uploadPath = client.config.epgpBackupFolder + '/upload/';
		fs.watch(uploadPath, {interval: 5000}, (eventType, fileName) => {
			if (!fsTimeout) {
				let guildID = fileName.split('-').shift();
				let guild = client.guilds.get(guildID);
				let channel = {
					guild: guild,
					type: null
				};
				fsTimeout = setTimeout(() => { 
					fsTimeout=null
					let content = fs.readFileSync(uploadPath + fileName, 'utf8');
					if (fileName.indexOf('GoodEPGP') > -1) {
						console.log('Parse EPGP: ' + fileName);
						client.epgp.update(client, guild, content);
					}
					if (fileName.indexOf('GoodBot') > -1) {
						client.log.write(client, null, channel, "Guild bank information has been uploaded.");
						client.guildbank.update(client, guild, content);
					}
				}, 10000);
			}
		});

	}
}
