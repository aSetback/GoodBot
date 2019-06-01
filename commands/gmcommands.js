const mysql = require('mysql');

exports.run = (client, message, args) => {
	// The name needs to be in the format "Setback" .. "SETBACK" & "setback" will not work.
	let con = mysql.createConnection({
		host: client.config.db.ip,
		user: client.config.db.user,
		password: client.config.db.pass,
		database: 'mangos'
	});
	
	let query = 'SELECT name, help FROM mangos.command WHERE security = 0;';

	con.connect((err) => {
		if (err) { 
			console.log(err);
		}
		let commandLines = [];
		let messageCounter = 0;
		
		con.query(query, (err, result, fields) => {
			commandLines[messageCounter] = '';
			for (key in result) {
				let row = result[key];
				commandLines[messageCounter] += '__' + row.name + '__ :\n ' + row.help + '\n\n';
				if (commandLines[messageCounter].length > 1500) {
					messageCounter ++;
					commandLines[messageCounter] = '';
				}
			}
			for (key in commandLines) {
				let commandLine = commandLines[key];
				setTimeout(() => {
					if (message.member) {
						message.member.send(commandLine);
					} else {
						message.channel.send(commandLine);
					}
				}, key * 2000);
			}
			con.end();
		});
	});
	
}