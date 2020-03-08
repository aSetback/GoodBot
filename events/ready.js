module.exports = (client, message) => {
	console.log('============================================================================')
	console.log('[' + client.timestamp.get() + '] ' + client.config.botname + ' is starting.');
	console.log('============================================================================')
	console.log('[' + client.timestamp.get() + '] ' + client.config.botname + ' has started on ' + client.guilds.size + ' servers.'); 
	client.user.setActivity(client.config.botactivity, {type: 'WATCHING'});
};