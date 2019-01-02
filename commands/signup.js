const fs = require("fs");

exports.run = (client, message, args) => {
	// Allow a user to sign up in the sign-up channel
		if (message.channel.name.indexOf('signup') == -1) {
			message.channel.send("This command can only be used in a sign-up channel.");
			return false;
		}
		message.delete().catch(O_o=>{}); 

		const signup = args[0];
		const raid = message.channel.name;
		const user = args[1] ? args[1] : message.member.displayName;
		const userName = user.charAt(0).toUpperCase() + user.slice(1).toLowerCase();
		
		var signValue;
		if (signup === '+') {
			signValue = 'yes';
		} else if (signup === '-') {
			signValue = 'no';
		} else if (signup === 'm') {
			signValue = 'maybe';
		} else {
			message.channel.send('Invalid sign-up. Please sign up as "+", "-", or "m".');
			return false;
		}
		
		const fileName = '/tmp/' + raid + '.json';
		let parsedLineup = {};
		if (fs.existsSync(fileName)) {
			currentLineup = fs.readFileSync(fileName, 'utf8');
			parsedLineup = JSON.parse(currentLineup);
		}
		
		parsedLineup[userName] = signValue;
		fs.writeFileSync(fileName, JSON.stringify(parsedLineup)); 
		message.channel.send("Signed up user " + userName + " as '" + signValue + "' for " + raid + ".");
};