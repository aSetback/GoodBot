const fs = require("fs");

exports.run = (client, message, args) => {
	let commandList = ['Bot Commands:'];
	fs.readdir("./commands/", (err, files) => {
		if (err) return console.error(err);
		files.forEach(file => {
			if (!file.endsWith(".js")) return;
			let command = client.config.prefix + file.split(".")[0];
			commandList.push(command);
		});
		message.author.send(commandList.join('\n'));
	});
}