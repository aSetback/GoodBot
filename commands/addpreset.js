const fs = require("fs");

exports.run = (client, message, args) => {

	if ((!message.isAdmin)) {
		return false;
	}
	
	let fileName = args.shift().toLowerCase();
	let preset = args.join(' ');
	
	fs.writeFileSync('presets/' + fileName + '.txt', preset); 

	message.delete();
	message.channel.send('New preset "'  + fileName + '" has been added');

}
