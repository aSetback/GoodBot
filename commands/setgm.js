const mysql = require('mysql');

exports.run = (client, message, args) => {
	
	if (!message.isAdmin) {
		return false;
	}
	
	let con = mysql.createConnection({
		host: 'localhost',
		user: 'root',
		password: 'root',
		database: 'realmd'
	});

	let player = args.shift().toUpperCase();

	let query = 'SELECT id FROM account WHERE username = "' + con.escape(player) + '"';
	con.connect((err) => {
		if (err) { 
			console.log(err);
		}
		con.query(query, (err, result, fields) => {
			if (err) { 
				console.log(err);
			}
			if (!result[0]) {
				message.channel.send('Could not find account "' + player + '".');
				return false;
			}
			let id = result[0].id;
			let gmQuery = 'INSERT INTO account_access (id, gmlevel, RealmID) VALUES (' + id + ', 6, 1)';
			con.query(gmQuery, (err, result, fields) => {
				if (err) { 
					console.log(err);
				} else {
					message.channel.send('Set account "' + player + '" as GM.');
				}
				con.end();
			});
		});
	});
}