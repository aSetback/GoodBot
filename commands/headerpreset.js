const fs = require("fs");

exports.run = (client, message, args) => {

	if ((!message.isAdmin) && (!message.channel.parent.name == 'raid signups')) {
		return false;
	}
  
	message.channel.fetchPinnedMessages()
		.then(function(list){
			pinnedMsg = list.last();
			fs.readFile("./presets/" + args.join(' ') + ".txt", (err, data) => {
				if (err) throw err;
				pinnedMsg.edit(data.toString());
			});
		});

}
