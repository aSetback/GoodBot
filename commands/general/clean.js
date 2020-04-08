module.exports = {
    getDescription: () => {
        return 'Delete to command message and X messages above it.';
    },
	run: (client, message, args) => {

		if (!args[0]) {
			return false;
		}
		if (!message.isAdmin) {
			return false;
		}
		
		let messageLimit = 20;
		if (typeof(args[0] !==  'undefined')) {
			messageLimit = parseInt(args[0]);
		}
		if (messageLimit > 20) { messageLimit = 20; }
		setTimeout(() => {
			message.channel.fetchMessages({limit: messageLimit})
			.then(function(list){
					message.channel.bulkDelete(list);
				});
		}, 1500);
	}
}