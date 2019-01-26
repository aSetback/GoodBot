exports.run = (client, message, args) => {

	if ((!message.isAdmin) && (!message.channel.parent.name == 'raid signups')) {
		return false;
	}
 
  message.channel.fetchPinnedMessages()
		             .then(function(list){
			pinnedMsg = list.last();
      pinnedMsg.edit(args.join(''));
    });
}
