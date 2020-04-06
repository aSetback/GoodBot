const fs = require("fs");

exports.run = (client, message, args) => {

	let player = args[0];
	message.author.send('__EPGP History for "' + player + '"__');
	console.log(message.guild.id);
	client.models.epgp.findAll({'where': {'player': player, 'guildID': parseInt(message.guild.id)}, 'order': [['createdAt', 'ASC']]}).then((history) => {

		let lastEP = 0;
		let lastGP = 0;
		let returnMsg = '```';
		returnMsg += 'Date'.padEnd(25) + 'EP'.padEnd(10) + 'ΔEP'.padEnd(10) + 'GP'.padEnd(10) + 'ΔGP'.padEnd(10) + 'PR'.padEnd(10) + '\n';	
		history.forEach(record => {
			let date = (client.timestamp.translate(record.createdAt)).padEnd(25);
			let ep = (Math.round(record.ep * 100) / 100).toString().padEnd(10);
			let gp = (Math.round(record.gp * 100) / 100).toString().padEnd(10);
			let pr = (Math.round(record.pr * 100) / 100).toString().padEnd(10);
			let epChange = 0;
			let gpChange = 0;

			if (lastEP != ep) {
				epChange = Math.round((ep - lastEP) * 100) / 100;
				if (epChange > 0) {
					epChange = '+' + epChange;
				}
				lastEP = ep;
			}
			if (lastGP != gp) {
				gpChange = Math.round((gp - lastGP) * 100) / 100;
				if (gpChange > 0) {
					gpChange = '+' + gpChange;
				}
				lastGP = gp;
			}
			if (epChange != 0 || gpChange != 0) {
				epChange = epChange.toString().padEnd(10);
				gpChange = gpChange.toString().padEnd(10);

				returnMsg += date + ep + epChange + gp + gpChange + pr;
				returnMsg += '\n';
				if (returnMsg.length >= 1500) {
					returnMsg += '```';
					message.author.send(returnMsg);
					returnMsg = '```';
				}
			}
		});
		if (returnMsg != '```') {
			returnMsg += '```';
			message.author.send(returnMsg);
		}
	});
}