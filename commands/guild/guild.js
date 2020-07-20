module.exports = {
    getDescription: () => {
        return 'Add/Edit/Remove a Guild, Guild Officer, or Guild Master';
    },
    run: (client, message, args) => {
        let validTypes = ['guild', 'gm', 'officer'];
        let validActions = ['add', 'remove'];
        let validFactions = ['horde', 'alliance'];
        let actionType = args.shift().toLowerCase();

        // Find a single guild
        if (actionType == 'find') {
            let guildName = args.join(' ');
            return client.wowguild.findGuild(client, guildName, message.channel);
        }

        // Pull our action out of the argument array
        let action = args.shift();
        if (action) {
            action = action.toLowerCase();
        }

        // List all guilds, either for a single faction or all
        if (actionType == 'list') {
            return client.wowguild.listGuilds(client, action, message.channel);
        }

        // Check if our type is valid
        if (!validTypes.includes(actionType)) {
            return client.messages.errorMessage(message.channel, actionType + ' is not a valid type.  (Guild, GM, Officer)', 240);
        }

        // Check if our action is valid
        if (!validActions.includes(action)) {
            return client.messages.errorMessage(message.channel, action + ' is not a valid action. (Add, Remove)', 240);
        }

        if (actionType == 'guild') {
            let faction;
            if (action == 'add') {
                faction = args.shift().toLowerCase();
                if (validFactions.includes(faction)) {
                    return client.messages.errorMessage(message.channel, faction + ' is not a valid faction. (Alliance, Horde)', 240);
                }
            }
            let guildName = args.join(' ');

            return (action == 'add') ? client.wowguild.addGuild(client, guildName, faction, message.channel) : client.wow.guild.removeGuild(client, argString, message.channel);
        }
        if (actionType == 'officer') {
            return (action == 'add') ? client.wowguild.addOfficer(client, wowGuildID, args, message.channel) : client.wowguild.removeOfficer(client, wowGuildID, args, message.channel);
        }
        if (actionType == 'gm') {
            return (action == 'add') ? client.wowguild.addGM(client, wowGuildID, args, message.channel) : client.wowguild.removeGM(client, wowGuildID, args, message.channel);
        }


    }
} 