const { SlashCommandBuilder } = require('@discordjs/builders');

let commandData = new SlashCommandBuilder()
    .setName('characterlist')
    .setDescription('List all characters on this server.');

exports.data = commandData;

exports.run = async (client, interaction) => {
    let returnMessages = [];
    let returnMessage = '__Characters:__\n';
    let characterList = {};
    let alts = [];
    await client.models.character.findAll({ where: { guildID: interaction.guild.id }, order: [['name', 'ASC']] }).then((characters) => {
        characters.forEach(character => {
            if (!character.mainID) {
                characterList[character.id] = { main: character, alts: [] };
            } else {
                alts.push(character);
            }
        });

        alts.forEach(character => {
            if (characterList[character.mainID]) {
                characterList[character.mainID].alts.push(character);
            }
        })
    });
    
    for (id in characterList) {
        if (returnMessage.length > 1500) {
            returnMessages.push(returnMessage);
            returnMessage = '';
        }
        let characterInfo = characterList[id];
        returnMessage += '**' + characterInfo.main.name + '** (' + characterInfo.main.class + '/' + characterInfo.main.role  + ')\n';
        if (characterInfo.alts.length) {
            for (altID in characterInfo.alts) {
                let altInfo = characterInfo.alts[altID];
                returnMessage += '- ' + altInfo.name + ' (' + altInfo.class + '/' + altInfo.role + ')\n';
            }
        }
    }
    returnMessages.push(returnMessage);

    for (key in returnMessages) {
        returnMessage = returnMessages[key];
        if (key == 0) {
            await interaction.reply({content: returnMessage, ephemeral: true});
        } else {
            interaction.followUp({content: returnMessage, ephemeral: true});
        }
    }
}
 
