const fs = require("fs");

exports.run = (client, message, args) => {

	const epgpPath = client.config.epgpBackupFolder;
	message.delete();
    client.models.epgp.sync({force: true});
    fs.readdir(epgpPath, (err, files) => {
		files.sort();
		files.forEach(file => {
            if (file.indexOf('.json') >= 0) {
                client.epgp.parseFile(client, epgpPath + '/' + file);
			}
		});
	});
}