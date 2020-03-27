module.exports = {
    getDescription: () => {
        return 'Delete to command message and X messages above it.';
    },
	run: (client, message, args) => {

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
}