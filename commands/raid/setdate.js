const Discord = require("discord.js");

exports.run = async function(client, message, args) {
	if (!client.permission.manageChannel(message.member, message.channel)) {
		return false;
	}
    
    let raidDateParts = args[0].split('-');
    // Parse out our date
    if (raidDateParts[2]) {
        raidDate = new Date(Date.parse(raidDateParts[1] + " " + raidDateParts[2] + ", " + raidDateParts[0]));
    } else if (raidDateParts[1]) {
        raidDate = new Date(Date.parse(raidDateParts[0] + " " + raidDateParts[1]));
        raidDate.setFullYear(new Date().getFullYear());
    } else {
        raidDate = new Date(Date.parse(args.join(" ")));
    }
    
    // If 'date' appears to be in the past, assume it's for the next calendar year (used for the dec => jan swapover)
    if (raidDate.getTime() < new Date().getTime()) {
        raidDate.setFullYear(raidDate.getFullYear() + 1);
    }


	let raid = await client.raid.get(client, message.channel);
	await client.raid.setDate(client, raid, raidDate);

	// Update our embed
    client.embed.update(client, message.channel);
};