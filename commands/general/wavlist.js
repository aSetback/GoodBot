const fs = require("fs");

exports.run = (client, message, args) => {
	let wavList = ['Wav Files:'];
	fs.readdir("./wav/", (err, files) => {
		if (err) return console.error(err);
		files.forEach(file => {
			if (!file.endsWith(".wav")) return;
			let wav = file.split(".")[0];
			wavList.push(wav);
		});
		message.author.send(wavList.join('\n'));
	});
}