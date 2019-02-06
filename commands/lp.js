const https = require('https');
const mysql = require('mysql');
const con = mysql.createConnection({
	host: 'localhost',
	user: 'root',
	password: 'root',
	database: 'mangos'
});

exports.run = (client, message, args) => {
	// The name needs to be in the format "Setback" .. "SETBACK" & "setback" will not work.
	const player = args[0].charAt(0).toUpperCase() + args[0].slice(1).toLowerCase();
	const apiUrl = 'https://legacyplayers.com/API.aspx?type=7&arg1=0&arg2=3&StrArg1=' + player;

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
			let gear = parsedData.RefGear.Slots;
			let items = [];
			for (key in gear) { 
				let item = gear[key];
				items.push(item.ItemID);
			}
			let query = 'SELECT entry AS id, name AS item FROM item_template WHERE entry IN (' + items.toString() + ') GROUP BY entry;';
			con.connect((err) => {
				if (err) { 
					console.log(err);
				}
				con.query(query, (err, result, fields) => {
					let itemMessage = '';
					for (key in result) {
						let row = result[key];
						if (row.id != 0 && row.item.length > 0) {
							itemMessage += row.item + ' (id: ' + row.id + ')\n';
						}
					}
					message.channel.send(itemMessage);
					con.end();
				});
			});
		
		}
	  });
	}).on("error", (err) => {
		message.channel.send("Error: " + err.message);
	});
}