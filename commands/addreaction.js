const fs = require("fs");

exports.run = (client, message, args) => {
	const keyword = args[0];
	const emoji = args[1];
	
	let emojis = {};
	if (fs.existsSync(emojiFile)) {
		fileEmojis = fs.readFileSync(emojiFile, 'utf8');
		emojis = JSON.parse(fileEmojis);
	}
	
	emojis[keyword] = emoji;
	fs.writeFileSync(emojiFile, JSON.stringify(emojis)); 

	message.delete().catch(O_o=>{}); 
	message.channel.send("Added reaction " + emoji + " for '" + keyword + "'.");
}