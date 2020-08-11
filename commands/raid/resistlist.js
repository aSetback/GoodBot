const Discord = require("discord.js");

exports.run = async function(client, message, args) {
	if (!client.permission.manageChannel(message.member, message.channel)) {
		return false;
	}

	let raid = await client.raid.get(client, message.channel);
    signups = await client.signups.getSignups(client, raid);
    let characterList = await client.embed.getCharacters(client, message.channel.guild, signups);
    let resistList = [];

    characterList.forEach((characterListItem) => {
        resistList.push({
            name: characterListItem.name,
            class: characterListItem.class,
            role: characterListItem.role,
            resists: {
                fire: characterListItem.fireResist ? characterListItem.fireResist : 0,
                frost: characterListItem.frostResist ? characterListItem.frostResist : 0,
                nature: characterListItem.natureResist ? characterListItem.natureResist : 0,
                shadow: characterListItem.shadowResist ? characterListItem.shadowResist : 0,
            }
        });					
    });

    resistList.sort((a, b) => {
        return a.name > b.name ? 1 : -1;
    })

    let returnMessage = '```md\n';
    returnMessage += 'Name'.padEnd(25)
        + 'Fire'.padEnd(15)
        + 'Frost'.padEnd(15)
        + 'Nature'.padEnd(15)
        + 'Shadow'.padEnd(15) + '\n'
        + ''.padEnd(85, '=') + '\n';
    for (key in resistList) {
        if (returnMessage.length > 1800) {
            returnMessage += '```';
            message.author.send(returnMessage);
            returnMessage = '```md\n';
        }
        let character = resistList[key];
        returnMessage += character.name.padEnd(25) 
            + character.resists.fire.toString().padEnd(15)
            + character.resists.frost.toString().padEnd(15)
            + character.resists.nature.toString().padEnd(15)
            + character.resists.shadow.toString().padEnd(15) + '\n';
    } 
    returnMessage += '```';
    message.author.send(returnMessage);
    

};