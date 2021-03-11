const Discord = require("discord.js");

exports.run = async function(client, message, args) {
	if (!client.permission.manageChannel(message.member, message.channel)) {
		return false;
	}

	let raid = await client.raid.get(client, message.channel);
    let lineup = [];
    for (key in raid.signups) {
        lineup.push(raid.signups[key].character);
    }
    lineup.sort((a, b) => {
        return a.name > b.name ? 1 : -1;
    })

    let returnMessage = '```md\n';
    returnMessage += 'Name'.padEnd(25)
        + 'Fire'.padEnd(15)
        + 'Frost'.padEnd(15)
        + 'Nature'.padEnd(15)
        + 'Shadow'.padEnd(15) + '\n'
        + ''.padEnd(85, '=') + '\n';
    for (key in lineup) {
        if (returnMessage.length > 1800) {
            returnMessage += '```';
            message.author.send(returnMessage);
            returnMessage = '```md\n';
        }
        let character = lineup[key];
        let fire = character.fireResist ? character.fireResist : 0;
        let frost = character.frostResist ? character.frostResist : 0;
        let nature = character.natureResist ? character.natureResist : 0;
        let shadow = character.shadowResist ? character.shadowResist : 0;
        returnMessage += character.name.padEnd(25) 
            + fire.toString().padEnd(15)
            + frost.toString().padEnd(15)
            + nature.toString().padEnd(15)
            + shadow.toString().padEnd(15) + '\n';
    } 
    returnMessage += '```';
    message.author.send(returnMessage);
    

};