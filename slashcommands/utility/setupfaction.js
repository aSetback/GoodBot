const Discord = require("discord.js");
const { ActionRowBuilder , ButtonBuilder, PermissionsBitField, EmbedBuilder } = require("discord.js");
const { SlashCommandBuilder } = require('@discordjs/builders');

let commandData = new SlashCommandBuilder()
    .setName('setupfaction')
    .setDescription('Set up Faction Selection on your discord.');

exports.data = commandData;
exports.run = async (client, interaction) => {
    
    let permissions = interaction.channel.permissionsFor(interaction.user);
    if (!permissions.has(PermissionsBitField.Flags.ManageChannels)) {
        return interaction.reply({ephemeral: true, content: client.loc('crosspostNoPermission', "You do not have the correct permissions.")});
    }

    // Create Get Started
    console.log('category check');
    let setupCategory  = interaction.guild.channels.cache.find(c => c.name == "Get Started" && c.type == 4);
    if (!setupCategory) {
        return interaction.reply("Command failed - Please run the /setup command first.");
    }

    console.log('channel check');
    // Create Setup Channel
    let setupChannel = interaction.guild.channels.cache.find(c => c.name.toLowerCase() == 'select-your-faction');
    if (!setupChannel) {
        setupChannel = await interaction.guild.channels.create({
            name: 'select-your-faction',
            type: 0
        });
        setupChannel.setParent(setupCategory.id).then((channel) => {
            channel.lockPermissions().catch(console.error);
        }).catch((e) => {});
    }

    let embed = new EmbedBuilder()
        .setTitle('Faction Setup')
        .setDescription('Please select a faction to be tagged with the appropriate role.')
        .setColor(0xb00b00)

    let buttonRow = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setStyle('Primary')
                .setLabel('Alliance') 
                .setCustomId('sc-button-setupfaction-alliance'),
            new ButtonBuilder()
                .setStyle('Danger')
                .setLabel('Horde') 
                .setCustomId('sc-button-setupfaction-horde'),
        );
    setupChannel.send({ embeds: [embed], components: [buttonRow] });


    if (setupCategory && setupChannel) {
        return interaction.reply('Factions have been set up successfully.');
    } else {
        return interaction.reply('There was an error.');
    }
}

exports.buttonResponse = async (client, interaction, data) => {
    let buttonPress = data.shift();
    let role = interaction.guild.roles.cache.find(role => role.name.toLowerCase() === buttonPress);
    interaction.member.roles.add(role)
    return interaction.reply('You have been given the ' + buttonPress + ' role.');
}
