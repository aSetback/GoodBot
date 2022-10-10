const { SlashCommandBuilder } = require('@discordjs/builders');

let commandData = new SlashCommandBuilder()
    .setName('showoptions')
    .setDescription('Show current value of options.')

exports.data = commandData;

exports.run = async (client, interaction) => {

    if (!interaction.member.permissions.has("ADMINISTRATOR")) {
        return false;
    }
    
	client.models.settings.findOne({where: {guildID: interaction.guild.id}}).then((settings) => {
        let returnString = '-\n```';
        returnString += 'Faction                    ' + settings.faction + '\n'
        returnString += 'WoW Server                 ' + settings.server + '\n'
        returnString += 'Multi Faction Server       ' + settings.multifaction + '\n'
        returnString += 'Enable Class Roles         ' + settings.classrole + '\n'
        returnString += 'Complete Role              ' + settings.completerole + '\n'
        returnString += 'Google Sheet ID            ' + settings.sheet + '\n'
        returnString += 'Warcraft Logs API Key      ' + settings.warcraftlogskey + '\n'
        returnString += 'Expansion                  ' + settings.expansion + '\n'
        returnString += 'Raid Category              ' + settings.raidcategory
        returnString += '```';
        interaction.reply({content: returnString, ephemeral: true});
    });
}
