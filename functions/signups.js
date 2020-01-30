const fs = require("fs");

module.exports = {
	set: (type, name, channel, message, client) => {
        if (!message.guild.id) {
            return channel.send('This can only be used in a sign-up channel.');
        }
        if (type === '+') {
            signValue = 'yes';
        } else if (type === '-') {
            signValue = 'no';
        } else if (type.toLowerCase() === 'm') {
            signValue = 'maybe';
        }

        const userName = name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
        let member = message.guild.members.find(member => member.nickname == userName ||  member.user.username == userName);
        let playerId = null;
        if (member) {
            playerId = member.user.id.toString();
        }

        var reg = /^[a-zàâäåªæÆçÇœŒÐéèêëËƒíìîïÏñÑóòôöºúùûÜýÿ]+$/i;
        if (!reg.test(userName)) {
            let playerMessage = 'Unable to sign "' + userName + '" for this raid.  Please set your in-game name using +nick first.';
            if (playerId) {
                playerMessage = '<@' + playerId + '> ' + playerMessage;
            }
            return playerMessage;
        }

        // Check to make sure role is set
        let playerRole = getRole(userName);
        let playerClass = getClass(userName);

        let unsavedSettings = false;
        if ((playerRole == 'unknown' || playerClass == 'unknown') && member) {
            playerClass = getClassByTag(member);
            playerRole = getRoleByTag(member);
            unsavedSettings = true;
        }

        if (playerClass == 'unknown') {
            let playerMessage = 'Unable to sign "' + userName + '" for this raid.  Player class is not set.';
            if (playerId) {
                playerMessage = '<@' + playerId + '> ' + playerMessage;
            }
            return message.channel.send(playerMessage);
        }

        if (playerRole == 'unknown') {
            let playerMessage = 'Unable to sign "' + userName + '" for this raid.  Player role is not set.';
            if (playerId) {
                playerMessage = '<@' + playerId + '> ' + playerMessage;
            }
            return message.channel.send(playerMessage);
        }

        if (unsavedSettings) {
            if ((playerClass == 'Mage' || playerClass == 'Warlock' || playerClass == 'Priest' || playerClass == 'Druid') && playerRole == 'RDPS') {
                playerRole = 'Caster';
            }
            if (playerRole == 'RDPS' || playerRole == 'MDPS') {
                playerRole = 'DPS';
            }
            if (playerRole == 'Heal') {
                playerRole = 'Healer';
            }

            // Write to class json file
            let fileName = 'data/' + message.guild.id + '-class.json';
            let parsedList = {};
            if (fs.existsSync(fileName)) {
                currentList = fs.readFileSync(fileName, 'utf8');
                parsedList = JSON.parse(currentList);
            }
            parsedList[userName] = playerClass;
            fs.writeFileSync(fileName, JSON.stringify(parsedList)); 

            // Write to roles json file
            fileName = 'data/' + message.guild.id + '-roles.json';
            parsedList = {};
            if (fs.existsSync(fileName)) {
                currentList = fs.readFileSync(fileName, 'utf8');
                parsedList = JSON.parse(currentList);
            }
            parsedList[userName] = playerRole;
            fs.writeFileSync(fileName, JSON.stringify(parsedList)); 
        }

        const fileName = './signups/' + message.guild.id + '-' + channel + '.json';
        let parsedLineup = {};
        if (fs.existsSync(fileName)) {
            currentLineup = fs.readFileSync(fileName, 'utf8');
            parsedLineup = JSON.parse(currentLineup);
        }

        parsedLineup[userName] = signValue;
        if (fs.existsSync(fileName)) {
            fs.writeFileSync(fileName, JSON.stringify(parsedLineup)); 
            client.embed.update(message, channel);
        }

        // Save our sign-up to the db
        client.models.raid.findOne({'where': {'guildID': message.guild.id, 'channelID': message.channel.id}}).then((raid) => {
            if (raid) {
                let record = {
                    'player': userName,
                    'signup': signValue,
                    'raidID': raid.id,
                    'channelID': raid.channelID,
                    'guildID': raid.guildID,
                    'memberID': message.author.id
                };
                client.models.signup.create(record);
            }
        });

        let logMessage = 'Sign Up: ' + userName + ' => ' + signValue;
        client.log.write(client, message.author, message.channel, logMessage);

        function getRole(player) {
            const roleFile = 'data/' + message.guild.id + '-roles.json';
            roleList = JSON.parse(fs.readFileSync(roleFile));
            for (rolePlayer in roleList) {
                if (player == rolePlayer) {
                    return roleList[player].toLowerCase();
                }
            }
            return 'unknown';
        }
    
        function getClass(player) {
            const classFile = 'data/' + message.guild.id + '-class.json';
            classList = JSON.parse(fs.readFileSync(classFile));
            for (classPlayer in classList) {
                if (player == classPlayer) {
                    return classList[player].toLowerCase();
                }
            }
            return 'unknown';
        }

        function getClassByTag(member) {
            const validClasses = ['Priest', 'Paladin', 'Druid', 'Warrior', 'Rogue', 'Hunter', 'Mage', 'Warlock'];
            for (key in validClasses) {
                let localClass = validClasses[key];
                if (member.roles.some(role => role.name == localClass)) {
                    return localClass;
                }
            }
            return 'unknown';
        }

        function getRoleByTag(member) {
            const validRoles = ['Tank', 'Heal', 'MDPS', 'RDPS'];
            for (key in validRoles) {
                let localRole = validRoles[key];
                if (member.roles.some(role => role.name == localRole)) {
                    return localRole;
                }
            }
            return 'unknown';
        }
        
    }
}