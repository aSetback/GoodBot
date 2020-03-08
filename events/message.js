module.exports = (client, message) => {
	// Ignore all bots
	if (message.author.bot) return;

	// Our standard argument/command name definition.
	var args = message.content.trim().split(/ +/g);

	// Allow a user to get the current bot trigger
	if (message.content == '?trigger') {
		return message.channel.send('Current trigger: ' + client.config.prefix);
	}

	if (message.channel && message.channel.name && message.channel.name == 'set-your-name') {
		client.setup.nick(client, message);
	}

	// If a message starts with +, - or m, and we're in a sign-up channel, treat it as a sign-up.
	if (["+", "-", "m"].includes(args[0]) && args[0].length == 1) {
		// Check if this is a raid channel
		client.models.raid.findOne({ where: { 'channelID': message.channel.id, 'guildID': message.channel.guild.id } }).then((raid) => {
			if (raid) {
				let signupSymbol = args.shift();
				let signupName = args.shift();
				if (!signupName) {
					signupName = message.member.displayName;
				}

				if (!signupSymbol) {
					return false;
				}

				if (signupSymbol == "+") {
					client.signups.set("+", signupName, message.channel.name, message, client);
					message.delete().catch(O_o => { });
				} else if (signupSymbol == "-") {
					client.signups.set("-", signupName, message.channel.name, message, client);
					message.delete().catch(O_o => { });
				} else if (signupSymbol == "m") {
					client.signups.set("m", signupName, message.channel.name, message, client);
					message.delete().catch(O_o => { });
				}
			}
		});
	}

	// Check if the message starts with our command trigger -- if so, pop off first element and check if it's a command.
	var command = '';
	if (message.content.indexOf(client.config.prefix) == 0) {
		args = message.content.slice(client.config.prefix.length).trim().split(/ +/g);
		command = args.shift().toLowerCase();
	};

	const cmd = client.commands.get(command);
	// If that command doesn't exist, silently exit and do nothing
	if (!cmd) return;

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
};