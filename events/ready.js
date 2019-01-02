module.exports = (client, message) => {
	console.log('GainBot has started on ' + client.guilds.size + ' servers.'); 
	client.user.setActivity('World of Setbacks');
};