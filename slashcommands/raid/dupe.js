const { PermissionsBitField, ActionRowBuilder , StringSelectMenuBuilder, ModalBuilder, TextInputBuilder } = require("discord.js");
const { SlashCommandBuilder } = require('@discordjs/builders');

let commandData = new SlashCommandBuilder()
    .setName('dupe')
    .setDescription('Dupe the raid for X days from now.')
    .addStringOption(option =>
		option
            .setName('days')
			.setDescription('input')
			.setRequired(false)
    );

exports.data = commandData;

exports.run = async (client, interaction) => {
    let raid = await client.raid.get(client, interaction.channel);
    if (!raid) {
        return interaction.reply({content: "This is not a valid raid channel, could not duplicated.", ephemeral: true, components: []});
    }

    let daysOut = parseInt(interaction.options.getString('days'));
    if (!daysOut) {
        daysOut = 7;
    }

    // Retrieve our category
    let category = await client.customOptions.get(client, interaction.guild, 'raidcategory');
    if (!category) {
        category = 'Raid Signups';
    }

    // Check for overwrite for this raid type
    let categoryParams = {'raid': raid.raid, 'guildID': interaction.guild.id};
    if (raid.faction) {
        categoryParams.faction = raid.faction;
    }
    
    let raidDate = new Date(raid.date);
    raidDate.setDate(raidDate.getDate() + daysOut);
    raid.dateString = raidDate.toLocaleString('en-us', { month: 'short', timeZone: 'UTC' }) + "-" + raidDate.getUTCDate();
    client.models.raidCategory.findOne({ where: categoryParams}).then(async (raidCategory) => {
        if (raidCategory) {
            category = raidCategory.category; 
        }

        // Retrieve our category from the discord API
        let discordCategory = interaction.guild.channels.cache.find(c => c.name == category.trim() && c.type == 4);

        if (!discordCategory) {
            return interaction.reply({content: 'Channel category "' + category + '" does not exist.  Make sure to check your capitalization, as these are case sensitive.', ephemeral: true, components: []});
        }

        // Retrieve this user's permission for the raid category
        let permissions = discordCategory.permissionsFor(interaction.member);
        if (!permissions.has(PermissionsBitField.Flags.ManageChannels)) {
            return interaction.reply({content: 'Channel category "' + category + '" does not exist.  Make sure to check your capitalization, as these are case sensitive.', ephemeral: true, components: []});                
        }
        delete raid.dataValues.id;

        let dupeChannel = await client.raid.createRaidChannel(client, interaction, discordCategory, raid);
        if (raid.rules) {
            await client.models.raidRules.findOne({where: {name: raid.rules, guildID: interaction.guild.id}}).then(async (raidRules) => {
                if (raidRules) {
                    await dupeChannel.send(raidRules.rules);
                } 
            });
        }
        args = [interaction.channel.name];
        message = {
            channel: dupeChannel,
            guild: interaction.guild,
            member: interaction.member
        };

        // Send out notifications of duped raid
        let dupeRaid = await client.raid.get(client, dupeChannel);
        pingList = await client.notify.getUnsigned(client, dupeRaid, raid);
        let notifications = await client.notify.makeList(client, interaction.guild, pingList);
        dupeChannel.send(notifications);

        // Inform the user!
        return interaction.reply({content: "Raid has been successfully duped: <#" + dupeChannel.id + '>' , ephemeral: false, components: []});
    });
}
