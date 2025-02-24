const { ActionRowBuilder , StringSelectMenuBuilder, ModalBuilder, TextInputBuilder, PermissionsBitField } = require("discord.js");
const { SlashCommandBuilder } = require('@discordjs/builders');

let commandData = new SlashCommandBuilder()
    .setName('crosspost')
    .setDescription('Crosspost this raid to another discord.')
    .addStringOption(option =>
		option
            .setName('server')
			.setDescription('input')
			.setRequired(true)
    );

exports.data = commandData;

exports.run = async (client, interaction) => {
    
    let raid = await client.raid.get(client, interaction.channel);
    if (!raid) {
        return interaction.reply({ephemeral: true, content: client.loc('dupeNoRaid', "This is not a valid raid channel, could not duplicated.")});
	}
	
	// Retrieve our server ID or name
	let server = interaction.options.getString('server')
	if (!server) {
        return interaction.reply({ephemeral: true, content: client.loc('noServerID', "Please provide a valid server ID or name.")});
	}

	let crosspostGuild = client.guilds.cache.find(g => g.id == server || g.name.toLowerCase() == server.toLowerCase());

	// Retrieve the category
    let category = await client.customOptions.get(client, crosspostGuild.id, 'raidcategory');
	if (!category) {
		category = 'Raid Signups';
    }

	// Retrieve the whether or not the faction is required on the specified server.
	factionRequired = await client.raid.factionRequired(client, crosspostGuild.id);
	if (factionRequired && !raid.faction) {
        return interaction.reply({ephemeral: true, content: client.loc('multiFaction', "The server you are trying to post to has raids posted for both factions.  Please use /raidfaction to specify this raid's faction, then try again.")});
	}

    // Check for overwrite for this raid type
	let categoryParams = {'raid': raid.raid, 'guildID': crosspostGuild.id};
	if (factionRequired) {
		categoryParams.faction = raid.faction;
    }
	
	let raidCategory = await client.models.raidCategory.findOne({ where: categoryParams});
	if (raidCategory) {
		category = raidCategory.category; 
	}

	// Retrieve our category from the discord API
	let discordCategory = crosspostGuild.channels.cache.find(c => c.name.toLowerCase() == category.toLowerCase().trim() && c.type == 4);

	if (!discordCategory) {
        return interaction.reply({ephemeral: true, content: client.loc('crosspostCategoryExist', "The specified channel category for your raid type on the crosspost server does not exist.")});
	}
	
	await crosspostGuild.members.fetch(interaction.user.id);
	// Retrieve this user's permission for the raid category
	let permissions = discordCategory.permissionsFor(interaction.user);
	if (!permissions.has(PermissionsBitField.Flags.ManageChannels)) {
        return interaction.reply({ephemeral: true, content: client.loc('crosspostNoPermission', "You do not have the correct permissions to post raids on the crosspost server.")});
	}

	let raidDate = new Date(raid.date);
	raid.dateString = raidDate.toLocaleString('en-us', { month: 'short', timeZone: 'UTC' }) + "-" + raidDate.getUTCDate();
    let crosspostChannel = await client.raid.createRaidChannel(client, interaction, discordCategory, raid, crosspostGuild);
    return interaction.reply({ephemeral: true, content: "Your raid has been crossposted successfully.  Crossposted channel: https://discord.com/channels/" + crosspostGuild.id + "/" + crosspostChannel.id});
}