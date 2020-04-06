const fs = require("fs");

exports.run = async function(client, message, args) {
    let files = fs.readdirSync("./data/");
    for (key in files) {
        let file = files[key];

        console.log('parsing ' + file);
        let guildID = file.split('-')[0];
        if (file.indexOf('roles') >= 0 && file.indexOf('-') >= 0) {
            file = 'data/' + file;
            if (fs.existsSync(file)) {
                list = fs.readFileSync(file, 'utf8');
                parsedList = JSON.parse(list);
            }
            for (player in parsedList) {
                let characterRole = parsedList[player];
                await client.set.characterRole(client, guildID, 0, player, characterRole);
            }
        }
        if (file.indexOf('class') >= 0 && file.indexOf('-') >= 0) {
            file = 'data/' + file;
            if (fs.existsSync(file)) {
                list = fs.readFileSync(file, 'utf8');
                parsedList = JSON.parse(list);
            }
            for (player in parsedList) {
                let characterClass = parsedList[player];
                await client.set.characterClass(client, guildID, 0, player, characterClass);
            }
        }
    }
}
