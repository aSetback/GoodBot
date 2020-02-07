const fs = require("fs");

exports.run = (client, message, args) => {

	const epgpPath = client.config.epgpBackupFolder;
	message.delete();
	fs.readdir(epgpPath, (err, files) => {
		files.sort();
		files.forEach(file => {
			if (file.indexOf('.json') >= 0) {
			}
		});
	});

}