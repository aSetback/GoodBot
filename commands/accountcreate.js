const crypto = require('crypto');
const mysql = require('mysql');

exports.run = (client, message, args) => {
	
	let con = mysql.createConnection({
		host: client.config.db.ip,
		user: client.config.db.user,
		password: client.config.db.pass,
		database: 'realmd'
	});

	username = args.shift();
	password = args.shift();
	
	if (!username) {
		return message.channel.send('Account name is required.');
	}
	if (!password) {
		return message.channel.send('Password is required.');
	}
	username = username.toUpperCase();
	password = password.toUpperCase();
	
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
				message.channel.send('Username is not available.  Please try again with a different username.');
			} else {
				message.channel.send('Account created.');
			}
			con.end();
		});
	});
}