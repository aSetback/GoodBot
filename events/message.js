module.exports = (client, message) => {
	// Ignore all bots
	if (message.author.bot) return;

	// Our standard argument/command name definition.
	var args = message.content.trim().split(/ +/g);
	
	var command = '';
	if (args[0] == '+') {
		command = 'signup'
	} else if (args[0] == '-') {
		command = 'signup'
	} else if (args[0].toLowerCase() == 'm') {
		command = 'signup' 
	} else {
		args = message.content.slice(client.config.prefix.length).trim().split(/ +/g);
		command = args.shift().toLowerCase();

		// Ignore messages not starting with the prefix (in config.json) not in the sign-up check
		if (message.content.indexOf(client.config.prefix) !== 0) return;
	}

	message.isAdmin = 0;
    if (message.member && message.member.hasPermission("MANAGE_CHANNELS")) {
		message.isAdmin = 1;
	}

	
	
	const cmd = client.commands.get(command);
	// If that command doesn't exist, silently exit and do nothing
	if (!cmd) return;

	var username = message.member !== null ? message.member.displayName : message.author.username;
	// Log to screen
	let channelName = message.channel.name ? message.channel.name : 'via DM';
	let logMessage = username + '/' + channelName + ': ' + message + ' [#' + message.author.id + ']';
	console.log('[' + client.timestamp() + '] ' + logMessage);

	let channel = message.guild ? message.guild.channels.find(c => c.name == "server-logs") : null;
	if (channel) {
		channel.send(logMessage);
	}

	// Run the command
	cmd.run(client, message, args);
};