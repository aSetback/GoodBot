exports.run = (client, message, args) => {
	if (!message.guild) {
		return false;
    }
    let validResists = ['Fire', 'Frost', 'Shadow', 'Nature'];
    let character = client.general.ucfirst(args.shift());
    let type;

    // Check if the first parameter was the type ..
    if (validResists.includes(character)) {
        type = character;
        character = message.member.nickname;
        if (!character) {
            character = message.author.username;
        }
    } else {
        type = client.general.ucfirst(args.shift());
    }
    
    let amount = parseInt(args.shift());

	if (!type || !character || !amount) {
		return client.messages.send(message.channel, 'Correct usage is: `+resist name type amount`', 240);
	}

	client.models.character.findOne({where: {name: character, guildID: message.guild.id}}).then((characterData) => {
		if (!characterData) {
			return client.messages.errorMessage(message.channel, 'Could not find character: ' + character, 240);
		}
        resistType = type.toLowerCase() + 'Resist';
        let data = {};
        data[resistType] = amount;
        client.models.character.update(data, {where: {id: characterData.id}}).then(() => {
            return client.messages.send(message.channel, 'Updated **' + type + '** resistance for **' + character + '** to **' + amount.toString() + '**.', 240);
        });
    });		
};