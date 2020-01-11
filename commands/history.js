const fs = require("fs");

exports.run = (client, message, args) => {

	const epgpPath = "f:/epgp/";
	let player = args[0];
	message.delete();
	message.author.send('__EPGP History for "' + player + '"__');
	let history = [];
	fs.readdir(epgpPath, (err, files) => {
		files.sort();
		files.forEach(file => {
            let standings 	= fs.readFileSync(epgpPath + file, 'utf8');
			try {
				let parsed 		= JSON.parse(standings);
				parsed.forEach(point => {
					if (point.player == player) {
						let noext = file.split('.');
						let fileparts = noext[0].split('-');
						point.date = fileparts[4] + '/' + fileparts[2].padStart(2, '0') + '/' + fileparts[3].padStart(2, '0'); 
						point.time = fileparts[5].padStart(2, '0') + ':' + fileparts[6].padStart(2, '0') + ':' + fileparts[7].padStart(2, '0');
						point.dateTime = point.date + ' ' + point.time;
						history.push(point);
					}
				});
			} catch (e) {
				// console.log(e);
			}
		});
		returnMsg = '```';
		returnMsg += 'Date'.padEnd(25) + 'EP'.padEnd(10) + 'ΔEP'.padEnd(10) + 'GP'.padEnd(10) + 'ΔGP'.padEnd(10) + 'PR'.padEnd(10) + '\n';	
		
		let lastEP = 0;
		let lastGP = 0;
		history.sort(function(a, b) {
			if (a.dateTime > b.dateTime) { return 1; }
			if (b.dateTime > a.dateTime) { return -1; }
			return 0;
		})
		history.forEach(record => {
			let date = (record.date + ' ' + record.time).padEnd(25);
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