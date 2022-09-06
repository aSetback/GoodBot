const { SlashCommandBuilder } = require('@discordjs/builders');

let commandData = new SlashCommandBuilder()
    .setName('info')
    .setDescription('Get info about a character.')
    .addStringOption(option =>
		option
            .setName('character')
			.setDescription('input')
			.setRequired(true)
    );

exports.data = commandData;

exports.run = async (client, interaction) => {

    let character = interaction.options.getString('character');

    let main = await client.character.get(client, character, interaction.guild.id);

    // Character doesn't exist, evidently.
    if (!main) {
        return interaction.reply({content: "Could not find player: **" + character + "**", ephemeral: true});
    }
    if (main.mainID) {
        main = await client.character.getByID(client, main.mainID);
    }

    main = await client.character.getAttendance(client, main, interaction.guild.id);
    let alts = await client.character.getAlts(client, main);
    let characterNames = [main.name];

    let returnMsg = '**Characters**\n```md\n';
    returnMsg += '  Character'.padEnd(30) + 'Class'.padEnd(20) + 'Role'.padEnd(20) + 'Sign-ups'.padEnd(20) + 'No Shows'.padEnd(20) + '\n';
    returnMsg += ''.padEnd(100, '=') + '\n';
    returnMsg += '* ' + main.name.padEnd(28) + client.general.ucfirst(main.class).padEnd(20) + client.general.ucfirst(main.role).padEnd(20) + main.signups.toString().padEnd(20) + main.noshows.toString().padEnd(20) + '\n';
    for (key in alts) {
        let alt = alts[key];
        alt = await client.character.getAttendance(client, alt, interaction.guild.id);
        characterNames.push(alt.name);
        returnMsg += '  ' + alt.name.padEnd(28) + client.general.ucfirst(alt.class).padEnd(20) + client.general.ucfirst(alt.role).padEnd(20) + alt.signups.toString().padEnd(20) + alt.noshows.toString().padEnd(20) + '\n';
    }
    returnMsg += '```';

    let signups = await client.raid.getSignupsByName(client, characterNames, interaction.guild.id);
    let signupMsg = '**Sign-Ups**\n```md\n';

    let signupInfo = [];
    for (key in signups) {
        let signup = signups[key];
        let channel = interaction.guild.channels.cache.find(c => c.id == signup.raid.channelID)
        let confirmed = '-';
        if (signup.raid.confirmation) {
            confirmed = signup.confirmed ? 'yes' : 'no';
        } 
        let reserve = '-';
        if (signup.raid.softreserve) { 
            reserve = signup.reserve ? signup.reserve.item.name : 'not set';
        }
        if (channel) {
            let channelName = channel.name.length > 19 ? channel.name.substr(0, 19) + '..' : channel.name;

            signupInfo.push({
                date: signup.raid.date,
                player: signup.player,
                name: channelName,
                signup: signup.signup,
                confirmed: confirmed,
                reserve: reserve
            });
        }
    }

    signupInfo.sort((a,b) => {
        return a.date > b.date;
    });

    signupMsg += 'Date'.padEnd(12) + 'Character'.padEnd(15) + 'Raid'.padEnd(22) + 'Signed As'.padEnd(12) + 'Confirmed'.padEnd(12) + 'Soft Reserve\n';
    signupMsg += ''.padEnd(100, '=') + '\n';
    signupInfo.forEach((signup) => {
        signupMsg += signup.date.padEnd(12) + signup.player.padEnd(15) + signup.name.padEnd(22) + signup.signup.padEnd(12) + signup.confirmed.padEnd(12) + signup.reserve + '\n';
    });
    if (!signupInfo.length) {
        signupMsg += 'Player is not currently signed up for any raids.\n';
    }
    signupMsg += '```';

	// Completed successfully!
    await interaction.reply({content: returnMsg, ephemeral: true});
    interaction.followUp({content: signupMsg, ephemeral: true});
}
 
