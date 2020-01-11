const https = require('https');
const mysql = require('mysql');
exports.run = (client, message, args) => {
    let item = args.join(' ');
    let query = 'SELECT entry AS id, name AS item FROM item_template WHERE name LIKE "%' + item + '%" GROUP BY entry;';
    console.log(query);
	let con = mysql.createConnection({
		host: client.config.db.ip,
		user: client.config.db.user,
		password: client.config.db.pass,
		database: 'mangos'
	});

    con.connect((err) => {
        console.log('connected!');
        if (err) { 
            console.log('LP Error:');
            console.log(err);
        }
        con.query(query, (err, result, fields) => {
            if (result.length > 8) {
                message.channel.send('8 or more results.  Please refine your query.');
            } else if (result.length) {
                for (key in result) {
                    let itemId = result[key].id;
                    let itemName = result[key].item;
                    let itemLink = '<https://classic.wowhead.com/item=' + itemId + '>';
                    message.channel.send(itemName + ': ' + itemLink);
                }
            } else {
                message.channel.send("Unable to find item: " + item);
            }
            con.end();
        });
    });
}