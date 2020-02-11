const fs = require("fs");

exports.run = (client, message, args) => {

	const epgpPath = client.config.epgpBackupFolder;
	message.delete();
    client.models.epgp.sync({force: true});
    fs.readdir(epgpPath, (err, files) => {
		files.sort();
		timeout = 0;
		files.forEach(file => {
			timeout++;
			setTimeout(() => {
            if (file.indexOf('.json') >= 0) {
				console.log('Importing ' + file);
                client.epgp.parseFile(client, epgpPath + '/' + file);
			}
			}, 5000 * timeout);
		});
	});
}