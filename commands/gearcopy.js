const https = require('https');
const mysql = require('mysql');

exports.run = (client, message, args) => {

	if (!message.isAdmin) {
		return false;
	}
	
	let con = mysql.createConnection({
		host: client.config.db.ip,
		user: client.config.db.user,
		password: client.config.db.pass,
		database: 'characters'
	});

	// The name needs to be in the format "Setback" .. "SETBACK" & "setback" will not work.
	const player = args[0].charAt(0).toUpperCase() + args[0].slice(1).toLowerCase();
	const apiUrl = 'https://legacyplayers.com/API.aspx?type=7&arg1=0&arg2=3&StrArg1=' + player;
	
	let query = 'SELECT guid FROM characters WHERE name = ' + con.escape(player);
	console.log('Copying gear for ' + player);
	con.connect((err) => {
		if (err) { 
			console.log(err);
		}
		
		console.log(query);
		// Retrieve our GUID
		con.query(query, (err, result, fields) => {
			if (err) { 
				console.log(err);
			}
			if (!result[0]) {
				message.channel.send('Could not find player "' + player + '".');
				return false;
			}
			
			let guid = result[0].guid;
			https.get(apiUrl, (resp) => {
			  let data = '';

			  // A chunk of data has been recieved.
			  resp.on('data', (chunk) => {
				data += chunk;
			  });

			  // The whole response has been received. Print out the result.
			  resp.on('end', () => {
				parsedData = JSON.parse(data);
	
				if (parsedData.CharId) {
					if (!parsedData.RefGear) {
						message.channel.send('Player could not be found on LegacyPlayers.');
						return false;
					}
					let gear = parsedData.RefGear.Slots;
					let items = [];
					
					con.query(query, (err, result, fields) => {
						if (err) { console.log(err); }
						let SlotID = 0;
						for (key in gear) { 
							let item = gear[key];
							if (item.ItemID != 0) {
								itemQuery = 'INSERT INTO item_instance (itemEntry, owner_guid, count, charges, flags, enchantments, durability) VALUES (' + item.ItemID + ', ' + guid + ', 1, "0 0 0 0 0 ", 1, "0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 ", 90);';
								con.query(itemQuery, (err, result, fields) => {
									if (err) { console.log(err); }
									let itemId = result.insertId;
									mailQuery = 'INSERT INTO mail (stationery, sender, receiver, subject, has_items, expire_time, deliver_time, checked) VALUES (41, 51, ' + guid + ', "gear", 1, 1559262976, 1549003721, 4);';
									con.query(mailQuery, (err, result, fields) => {
										if (err) { console.log(err); }
										let mailId = result.insertId;
										mailItemQuery = 'INSERT INTO mail_items (mail_id, item_guid, item_template, receiver) VALUES (' + mailId + ', ' + itemId + ', ' + item.ItemID + ', ' + guid + ');';
										con.query(mailItemQuery, (err, result, fields) => {
											if (err) { console.log(err); }
											console.log('Mailed Item ' + item.ItemID);
										});
									});
								});
							}
						}
					});
				}
			  });
			}).on("error", (err) => {
				message.channel.send("Error: " + err.message);
			});
		});
	});
}