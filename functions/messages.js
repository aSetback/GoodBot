module.exports = {
    errorMessage: (channel, message, seconds) => {
        channel.send(message).then((sentMessage) => {
            setTimeout(() => {
                sentMessage.delete();
            }, seconds * 1000);
        });
        let errorChannel = channel.guild ? channel.guild.channels.find(c => c.name == "error-logs") : null;
        if (errorChannel) {
            errorChannel.send(channel + ': ' + message);
        }
    },
    send: (channel, message, seconds) => {
        channel.send(message).then((sentMessage) => {
            setTimeout(() => {
                sentMessage.delete();
            }, seconds * 1000);
        });
    },
    signup: async (client, message) => {
        return new Promise(async(resolve, reject) => {
            let args = message.content.trim().split(/ +/g);
            let signupSymbol = args[0];
            let signupName = args[1];

            // If a message starts with +, - or m, and we're in a sign-up channel, treat it as a sign-up.
            if (["+", "-", "m"].includes(signupSymbol)) {
                // Check if this is a raid channel
                client.models.raid.findOne({ where: { 'channelID': message.channel.id, 'guildID': message.channel.guild.id } }).then(async (raid) => {
                    if (raid) {
                        if (!signupName) {
                            signupName = message.member.displayName;
                        }

                        if (!signupSymbol) {
                            resolve(false);
                        }

                        let signup = await client.signups.set(signupSymbol, signupName, message.channel.name, message, client);
                        resolve(signup);
                        setTimeout(() => {
                            message.delete().catch(O_o => { });
                        }, 1000);
                    }
                });
            } else {
                resolve(false);
            }
        });

    },
    command: (client, message, cmd) => {
        return new Promise(async (resolve, reject) => {
            let args = message.content.trim().split(/ +/g);
            args.shift();

            // Delete the message from the channel after delaying for 1s (prevents 'phantom message' bug)
            setTimeout(() => {
                message.delete().catch(O_o => { });
            }, 1000)

            // Check if user can manage channels
            message.isAdmin = 0;
            if (message.member && message.member.hasPermission("MANAGE_CHANNELS")) {
                message.isAdmin = 1;
            }

            // Check if user is a server admin
            message.serverAdmin = 0;
            if (message.member && message.member.hasPermission("ADMINISTRATOR")) {
                message.serverAdmin = 1;
            }

            member = message.member ? message.member : message.author;

            // Log the command
            client.log.write(client, member, message.channel, 'Command: ' + message.content)

            // Send the client object along with the message
            message.client = client;

            // Run the command
            cmd.run(client, message, args);
            resolve(true);
        });
    },
    handle: async (client, message) => {
        // Ignore all bots
        if (message.author.bot) return;

        // Split our message into arguments
        let args = message.content.trim().split(/ +/g);

        let success = false;

        // Check if this is a sign-up, written correctly
        if (["+", "-", "m"].includes(args[0])) {
            let character = await client.set.getCharacter(client, message.guild, args[1]);
            if (character) {
                console.log('signup correct');
                success = await client.messages.signup(client, message);
                if (success) { return; }
            }
        }

        // Check if this is a command, written correctly
        if (args[0].indexOf(client.config.prefix) == 0 && args[0].length > 1) {
            let command = args[0];
            let commandString = args.join(' ');
            let cmd = client.commands.get(command.slice(client.config.prefix.length));
            if (cmd) {
                console.log('command correct');
                message.content = commandString;
                success = await client.messages.command(client, message, cmd);
                if (success) { return; }
            }
        }

        // Check if this is a sign-up, written incorrectly
        let signup = args[0]
        let symbol = signup.charAt(0);
        signup = signup.slice(1);
        if (["+", "-", "m"].includes(symbol)) {
            let character = await client.set.getCharacter(client, message.guild, signup);
            if (character) {
                console.log('signup incorrect');
                message.content = symbol + ' ' + signup;
                success = await client.messages.signup(client, message);
                if (success) { return; }
            }
        }

        // Check if this is a command, written incorrectly
        let prefix = args.shift();
        let commandString = args.join(' ');
        if (prefix = client.config.prefix) {
            let cmd = client.commands.get(args[0]);
            if (cmd) {
                console.log('command incorrect');
                message.content = client.config.prefix + commandString;
                success = await client.messages.command(client, message, cmd);
                if (success) { return; }
            }
        }

        console.log('no hits');

        if (message.channel && message.channel.name && message.channel.name == 'set-your-name') {
            client.setup.nick(client, message);
        }
    }
}