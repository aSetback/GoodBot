const fs = require("fs");

exports.run = (client, message, args) => {
    fs.readdir("./data/", (err, files) => {
        files.forEach((file) => {
            if (file.indexOf('roles') >= 0 && file.indexOf('-') >= 0) {
                migrateRoles(file, client);
            }
            if (file.indexOf('class') >= 0 && file.indexOf('-') >= 0) {
                migrateClasses(file, client);
            }
        }); 

    });
}

function migrateRoles(file, client) {
    let guildID = file.split('-')[0];
    file = 'data/' + file;
	if (fs.existsSync(file)) {
		list = fs.readFileSync(file, 'utf8');
		parsedList = JSON.parse(list);
    }
    for (player in parsedList) {
        let playerRole = parsedList[player];
        client.set.playerRole(client, guildID, 0, player, playerRole);
    }
}

function migrateClasses(file, client) {
    let guildID = file.split('-')[0];
    file = 'data/' + file;
    if (fs.existsSync(file)) {
		list = fs.readFileSync(file, 'utf8');
		parsedList = JSON.parse(list);
	}
    for (player in parsedList) {
        let playerClass = parsedList[player];
        client.set.playerClass(client, guildID, 0, player, playerClass);
    }

}