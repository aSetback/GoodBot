const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');

module.exports = async (client, message) => {
	let commands = [];
	client.slashCommands.forEach((slashCommand) => {
		commands.push(slashCommand.data.toJSON());
	});
	
	console.log('-- Registering Slash Commands');
	// Register our slash commands
	
	const rest = new REST({ version: '9' }).setToken(client.config.token);
	for (key in commands) {
		console.log('  > ' + commands[key].name);
	}
	try {
		console.log('-- Started refreshing application (/) commands @ ' + client.timestamp.get());

		await rest.put(
			Routes.applicationCommands(client.config.userId),
			{ body: commands },
		);

		console.log('-- Successfully reloaded application (/) commands @ ' + client.timestamp.get());
	} catch (error) {
		console.error(error);
	}

	console.log('(GB) ===========================================================================')
	console.log('(GB) -- Startup complete @ ' + client.timestamp.get());
	console.log('(GB) ===========================================================================')
	console.log('(GB) [' + client.timestamp.get() + '] ' + client.config.botname + ' has started on ' + client.guilds.cache.size + ' servers.'); 
	client.user.setActivity(client.config.botactivity, {type: 'WATCHING'});
};
