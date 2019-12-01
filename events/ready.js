module.exports = (client, message) => {
	console.log('[' + client.timestamp() + '] ' + client.config.botname + ' has started on ' + client.guilds.size + ' servers.'); 
	client.user.setActivity(client.config.botactivity);
	client.watch.run(client);
};