const fs = require("fs");
const { SlashCommandBuilder } = require('@discordjs/builders');

let commandData = new SlashCommandBuilder()
    .setName('clearitems')
    .setDescription('Load soft reserve items for a raid type.')
    .addStringOption(option =>
		option
            .setName('type')
			.setDescription('Raid Type')
			.setRequired(true)
    );

exports.data = commandData;

exports.run = async (client, interaction) => {

    if (!interaction.member.permissions.has("ADMINISTRATOR")) {
        return false;
    }
    
    let raid = interaction.options.getString('type');
    client.models.reserveItem.destroy({where: {raid: raid}});
    return interaction.reply({content: "Items cleared for " + raid + ".", ephemeral: true});
};