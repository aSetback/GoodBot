module.exports = (client, message) => {
	// Ignore all bots
	if (message.author.bot) return;

	// Our standard argument/command name definition.
	var args = message.content.trim().split(/ +/g);
	
	// Allow a user to get the current bot trigger
	if (message.content == '?trigger') {
		return message.channel.send('Current trigger: ' + client.config.prefix);
	}

	// If a message starts with +, - or m, and we're in a sign-up channel, treat it as a sign-up.
	if (message.channel.name.indexOf('signup') > -1) {
		let signupName = '';
		if (message.member) {
			signupName = message.member.displayName;
		}
	
		if (args[1]) {
			signupName = args[1];
		}
	
		if (args[0] == '+') {
			client.signups.set('+', signupName, message.channel.name, message, client);
			message.delete();
		} else if (args[0] == '-') {
			client.signups.set('-', signupName, message.channel.name, message, client);
			message.delete();
		} else if (args[0].toLowerCase() == 'm') {
			client.signups.set('m', signupName, message.channel.name, message, client);
			message.delete();
		}
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
	
	// Get logging information 
	var username = message.member !== null ? message.member.displayName : message.author.username;
	let channelName = message.channel.name ? message.channel.name : 'via DM';
	let guildId = message.guild ? message.guild.id : '-';
	let logMessage = username + '/' + channelName + ': ' + message + ' [#' + message.author.id + ', ' + guildId + ']';

	// Log to console
	console.log('[' + client.timestamp() + '] ' + logMessage);

	// Attempt to log to a server-logs channel
	let channel = message.guild ? message.guild.channels.find(c => c.name == "server-logs") : null;
	if (channel) {
		channel.send(logMessage);
	}

	// Send the client object along with the message
	message.client = client;

	// Run the command
	cmd.run(client, message, args);
};