const { ActionRowBuilder, PermissionsBitField, ModalBuilder, TextInputBuilder } = require("discord.js");
const { SlashCommandBuilder } = require('@discordjs/builders');

let commandData = new SlashCommandBuilder()
    .setName('raid')
    .setDescription('Open a modal to create a new raid.');

exports.data = commandData;

exports.run = async (client, interaction) => {
    let modal = new ModalBuilder()
        .setCustomId('sc-modal-raid')
        .setTitle('Create a raid');
    let input1 = new TextInputBuilder()
        .setCustomId('raidName')
        .setLabel('Raid Name')
        .setRequired(true)
        .setStyle('Short');
    let input2 = new TextInputBuilder()
        .setCustomId('raidDate')
        .setLabel('Raid Date (eg, Jun-15)')
        .setRequired(true)
        .setStyle('Short');
    let input3 = new TextInputBuilder()
        .setCustomId('raidType')
        .setLabel('What instance are you raiding?  (eg, SSC)')
        .setRequired(true)
        .setStyle('Short');
    let input4 = new TextInputBuilder()
        .setCustomId('raidFaction')
        .setLabel('What faction is this for? (not required)')
        .setRequired(false)
        .setStyle('Short');        

    let ActionRow1 = new ActionRowBuilder().addComponents(input1);
    let ActionRow2 = new ActionRowBuilder().addComponents(input2);
    let ActionRow3 = new ActionRowBuilder().addComponents(input3);
    let ActionRow4 = new ActionRowBuilder().addComponents(input4);
    modal.addComponents([ActionRow1, ActionRow2, ActionRow3, ActionRow4]);

    await interaction.showModal(modal);
}

exports.modalResponse = async (client, interaction) => {
    // Retrieve our category
	let category = await client.customOptions.get(client, interaction.guild, 'raidcategory');
	if (!category) {
		category = 'Raid Signups';
	}
	
    let raid = {
        name: interaction.fields.getTextInputValue('raidName'),
        dateString: interaction.fields.getTextInputValue('raidDate'),
        raid: interaction.fields.getTextInputValue('raidType'),
        faction: interaction.fields.getTextInputValue('raidFaction')
    };

	factionRequired = await client.raid.factionRequired(client, interaction.guild);
	if (factionRequired && !raid.faction) {
		return interaction.reply('You need to specify which faction this raid is for.\n usage: `+raid bwl mar-21 tagalong horde`');
	}
	
	if (!raid.name) {
		raid.name = raid.raid;
	}

	// Raid type translations
	if (raid.raid == 'KZ') { raid.raid = 'KARA'; }
	if (raid.raid == 'KARAZHAN') { raid.raid = 'KARA'; }
	if (raid.raid == 'GRUUL') { raid.raid = 'GL'; }
	if (raid.raid == 'MAG') { raid.raid = 'ML'; }
	if (raid.raid == 'HYJAL') { raid.raid = 'MH'; }

	// Check for overwrite for this raid type
	let categoryParams = {'raid': raid.raid, 'guildID': interaction.guild.id};
	if (factionRequired) {
		categoryParams.faction = raid.faction;
	}
	
	client.models.raidCategory.findOne({ where: categoryParams}).then((raidCategory) => {
		if (raidCategory) {
			category = raidCategory.category; 
		}

		// Retrieve our category from the discord API
		let discordCategory = interaction.guild.channels.cache.find(c => c.name.toLowerCase() == category.toLowerCase().trim() && c.type == 4);

		if (!discordCategory) {
			return interaction.reply('Channel category "' + category + '" does not exist.  Make sure to check your capitalization, as these are case sensitive.');
		}

		// Retrieve this user's permission for the raid category
		let permissions = discordCategory.permissionsFor(interaction.user);
		if (!permissions.has(PermissionsBitField.Flags.ManageChannels)) {
			return interaction.reply('You do not have the manage channels permission for "' + category + '".  Unable to complete command.');
		}

		client.raid.createRaidChannel(client, interaction, discordCategory, raid, interaction.guild);
		// client.raid.createRaidThread(client, interaction, raid, interaction.guild);
        interaction.reply({content: 'Raid has been created!', ephemeral: true});
	});

}