const fs = require("fs");

exports.run = (client, message, args) => {
	let returnMessage = '__WAVs:__\n';
	fs.readdir("./wav/", (err, files) => {
		if (err) return console.error(err);
		files.forEach(file => {
			if (!file.endsWith(".wav")) return;
			if (returnMessage.length > 1500) {
				message.author.send(returnMessage);
				returnMessage = '';
			}

			let wav = file.split(".")[0];
			console.log(wav);
			returnMessage += wav + '\n';
		});
		return message.author.send(returnMessage);
	});
}