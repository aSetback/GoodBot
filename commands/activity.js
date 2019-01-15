exports.run = (client, message, args) => {
	if (!message.isAdmin) {
		return false;
	}

	client.user.setActivity(args.join(' '));
}