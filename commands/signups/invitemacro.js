const fs = require("fs");

exports.run = (client, message, args) => {
    client.models.signup.findAll({'where': {'channelID': message.channel.id}}).then((signups) => {
        let dedupedSignups = [];
        signups.forEach((signup, signupKey) => {
            dedupedSignups.forEach((deduped, dedupedKey) => {
                if (signup.player == deduped.player) { 
                    dedupedSignups.splice(dedupedKey, 1);
                }
            });
            dedupedSignups.push(signup);
        });

        let yesArray = [];
        dedupedSignups.forEach((signup) => {
            if (signup.signup == 'yes') {
                yesArray.push('"' + signup.player + '"');
            }
            if (yesArray.length > 10) {
                let yesString = yesArray.join(", ");
                let macroString = "```lua\n/run for key, member in pairs({" + yesString + "}) do InviteUnit(member) end```"
                message.author.send(macroString);
                yesArray = [];
            }
        });

        if (yesArray.length) {
            let yesString = yesArray.join(", ");
            let macroString = "```lua\n/run for key, member in pairs({" + yesString + "}) do InviteUnit(member) end```"
            message.author.send(macroString);
        }



    });
}