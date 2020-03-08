const Discord = require("discord.js");

exports.run = (client, message, args) => {
    // Make sure we're in a discord & not DM, and that user is an admin
    if (!message.guild || !message.isAdmin) {
		return false;
	}
    
    // Make sure raid & category are set
	if (!args[0] || !args[1]) {
		return false;
    }
    
    // Delete the command message
	message.delete().catch(O_o=>{}); 

    // Make sure abbreviation is uppercased
	const raid = args.shift().toUpperCase();
    const category = args.join(" ");

    let record = {
        raid: raid,
        category: category,
        memberID: message.member.id,
        guildID: message.guild.id
    };

    client.models.raidCategory.findOne({ where: {'raid': raid, 'guildID': message.guild.id}}).then((raidCategory) => {
        if (!raidCategory) {
            client.models.raidCategory.create(record);
        } else {
            client.models.raidCategory.update(record, {
                where: {
                    id: raidCategory.id
                }
            });

        }
    });

	message.channel.send('Raid category for "' + raid + '" is set as "' + category + '".');

};