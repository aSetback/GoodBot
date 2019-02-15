const crypto = require('crypto');
const mysql = require('mysql');

exports.run = (client, message, args) => {
	
	let con = mysql.createConnection({
		host: client.config.db.ip,
		user: client.config.db.user,
		password: client.config.db.pass,
		database: 'realmd'
	});
	var msg = 'ADMIN:ADMIN';
	username =	args.shift().toUpperCase();
	password = args.shift().toUpperCase();
	hash = crypto.createHash('sha1').update(username + ':' + password).digest('hex');
	query = 'INSERT INTO account (username, sha_pass_hash) VALUES ("' + username + '", "'+ hash.toUpperCase() +'")';
	con.connect((err) => {
		if (err) { 
			console.log(err);
		}
		// Retrieve our GUID
		con.query(query, (err, result, fields) => {
			if (err) { 
				console.log(err);
				message.channel.send('Account Create Failed.');
			} else {
				message.channel.send('Account Created');
			}
			con.end();
		});
	});
}