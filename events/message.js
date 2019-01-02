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
	} else if (args[0] == 'm') {
		command = 'signup' 
	} else {
		args = message.content.slice(client.config.prefix.length).trim().split(/ +/g);
		command = args.shift().toLowerCase();

		// Ignore messages not starting with the prefix (in config.json) not in the sign-up check
		if (message.content.indexOf(client.config.prefix) !== 0) return;
	}

	const cmd = client.commands.get(command);
	// If that command doesn't exist, silently exit and do nothing
	if (!cmd) return;

	// Run the command
	cmd.run(client, message, args);
};