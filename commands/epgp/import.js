const fs = require("fs");

exports.run = (client, message, args) => {

	const epgpPath = client.config.epgpBackupFolder;
	message.delete();
    client.models.epgp.sync({force: true});
    fs.readdir(epgpPath, (err, files) => {
		files.sort();
		timeout = 0;
		files.forEach(file => {
            if (file.indexOf('.json') >= 0) {
				timeout++;
				setTimeout(() => {
					console.log('Importing ' + file);
					client.epgp.parseFile(client, epgpPath + '/' + file);
				}, 3000 * timeout);
			}
		});
	});
}