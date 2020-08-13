const Discord = require("discord.js");

exports.run = async function(client, message, args) {
	if (!client.permission.manageChannel(message.member, message.channel)) {
		return false;
	}

	let raid = await client.raid.get(client, message.channel);
    let lineup = await client.embed.getLineup(client, raid);
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
        returnMessage += character.name.padEnd(25) 
            + character.resists.fire.toString().padEnd(15)
            + character.resists.frost.toString().padEnd(15)
            + character.resists.nature.toString().padEnd(15)
            + character.resists.shadow.toString().padEnd(15) + '\n';
    } 
    returnMessage += '```';
    message.author.send(returnMessage);
    

};