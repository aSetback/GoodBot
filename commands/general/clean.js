exports.run = (client, message, args) => {

	if (!message.isAdmin) {
		return false;
	}
	
	let messageLimit = 20;
	if (typeof(args[0] !==  'undefined')) {
		messageLimit = parseInt(args[0]);
	}
	message.channel.fetchMessages({limit: messageLimit})
	   .then(function(list){
			message.channel.bulkDelete(list);
		});
}