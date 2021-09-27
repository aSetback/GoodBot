exports.run = async (client, message, args) => {
    // Get our raid information
    let raid = await client.raid.get(client, message.channel);
    // Make sure this is actually a raid!
    if (!raid) {
        client.messages.errorMessage(message.channel, 'This does not appear to be a raid channel, item reserve has failed.', 240);
        return false;
    }

    let list = raid.signups.filter(signup => signup.confirmed == 1);
    let players = [];
    list.forEach((signup) => {
            players.push('"' + signup.player + '"');
            if (players.length > 10) {
                let playerString = players.join(", ");
                let macroString = "```lua\n/run for key, member in pairs({" + playerString + "}) do InviteUnit(member) end```"
                message.author.send(macroString);
                players = [];
            }
    });
    if (players.length) {
        let playerString = players.join(", ");
        let macroString = "```lua\n/run for key, member in pairs({" + playerString + "}) do InviteUnit(member) end```"
        message.author.send(macroString);
    }
}