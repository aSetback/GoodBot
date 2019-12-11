module.exports = (client, message) => {
	// Ignore all bots
	if (message.author.bot) return;

	// Our standard argument/command name definition.
	var args = message.content.trim().split(/ +/g);
	
	var command = '';
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

	message.serverAdmin = 0;
	if (message.member && message.member.hasPermission("ADMINISTRATOR")) {
		message.serverAdmin = 1;
	}	

	
	
	const cmd = client.commands.get(command);
	// If that command doesn't exist, silently exit and do nothing
	if (!cmd) return;

	var username = message.member !== null ? message.member.displayName : message.author.username;
	// Log to screen
	let channelName = message.channel.name ? message.channel.name : 'via DM';
	let guildId = message.guild ? message.guild.id : '-';
	let logMessage = username + '/' + channelName + ': ' + message + ' [#' + message.author.id + ', ' + guildId + ']';
	console.log('[' + client.timestamp() + '] ' + logMessage);
	let channel = message.guild ? message.guild.channels.find(c => c.name == "server-logs") : null;
	if (channel) {
		channel.send(logMessage);
	}

	message.client = client;

	// Run the command
	cmd.run(client, message, args);
};