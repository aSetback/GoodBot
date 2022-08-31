const { MessageActionRow, MessageSelectMenu, Modal, TextInputComponent, SelectMenuBuilder, ActionRowBuilder } = require("discord.js");
const { SlashCommandBuilder } = require('@discordjs/builders');

let commandData = new SlashCommandBuilder()
    .setName('set')
    .setDescription('Set a character\'s class and role.')
    .addStringOption(option =>
		option
            .setName('character')
			.setDescription('input')
			.setRequired(true)
    );

exports.data = commandData;

exports.run = async (client, interaction) => {

    let character = interaction.options.getString('character');
    let input1 = new MessageSelectMenu()
        .setCustomId('sc-select-set-class-' + character)
        .setPlaceholder("Select a Class.")
        .addOptions(client.config.classOptions);

    let input2 = new MessageSelectMenu()
        .setCustomId('sc-select-set-role-' + character)
        .setPlaceholder("Select a Role.")
        .addOptions(client.config.roleOptions);
   

    let ActionRow1 = new MessageActionRow().addComponents(input1);
    let ActionRow2 = new MessageActionRow().addComponents(input2);

    return interaction.reply({content: 'What class and role is ' + client.general.ucfirst(character) + '?', ephemeral: true, components: [ActionRow1, ActionRow2]});
}

exports.selectResponse = async (client, interaction, data) => {
    let args = {
        character: data[1],
        value: interaction.values[0]
    };
 
	const characterName = client.general.ucfirst(args.character);
	const value = client.general.ucfirst(args.value);

    if (data[0] == 'class') {
        let characterClass = await client.set.characterClass(client, interaction.guild, interaction.member, characterName, value);
        if (!characterClass) {
            return interaction.reply({content: value + ' is not a valid class.', ephemeral: true});
        }

    }
     
    if (data[0] == 'role') {
        let characterRole = await client.set.characterRole(client, interaction.guild, interaction.member, characterName, value);
        if (!characterRole) {
            return interaction.reply({content: value + ' is not a valid role.  Valid roles are caster, dps, tank, healer.', ephemeral: true});
        }
    }
    
	// Completed successfully!
    interaction.reply({content: characterName + ' has been set as a ' + value + '.', ephemeral: true});
}
 
