exports.run = (client, message, args) => {

    if (!message.isAdmin) {
		return false;
    }
    
    // Find Category
    category = message.guild.channels.cache.find(c => c.name == "Get Started" && c.type == "GUILD_CATEGORY");
    if (!category) {
        message.channel.send('Command failed - "Get Started" category does not exist.');
    }

    // Set your faction
    let factionChannel = 'select-your-faction';
    message.guild.channels.create(factionChannel, {
            type: 'text'
        })
        .then((channel) => {
            let signupMessage = 'Please select your faction.';
            channel.setParent(category.id)
                .then((channel) => {
                    channel.lockPermissions()
                        .catch(console.error);
                });
                channel.send(signupMessage).then((botMsg) => {
                    reactFactions(botMsg);
                });
        })
        .catch((e) => {});

    async function reactFactions(msg) {
        let emojis = [
            client.emojis.cache.find(emoji => emoji.name === "GoodBotAlliance"),
            client.emojis.cache.find(emoji => emoji.name === "GoodBotHorde"),
        ];
        for (key in emojis) {
            await msg.react(emojis[key]).catch((e) => {});
        }
    }



}