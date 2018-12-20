const Discord = require("discord.js");
const https = require("https");
const fs = require("fs");
const client = new Discord.Client();
const config = require("./config.json");

client.on("ready", () => {
  console.log(`GainBot has started on ${client.guilds.size} servers.`); 
  client.user.setActivity(`World of Setbacks`);
});

client.on("message", async message => {
	// Ignore all bots
	if(message.author.bot) return;
  
	// Use prefix from config file
	if(message.content.indexOf(config.prefix) !== 0) return;
	  
	// Here we separate our "command" name, and our "arguments" for the command. 
	// e.g. if we have the message "+say Is this the real life?" , we'll get the following:
	// command = say
	// args = ["Is", "this", "the", "real", "life?"]
	const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
	const command = args.shift().toLowerCase();

	// Look up a player on Legacy Players
	if(command === "lp" || command === 'legacyplayers') {
		const classes = {
			"0": "Warrior",
			"1": "Rogue",
			"2": "Priest",
			"3": "Hunter",
			"4": "Druid",
			"5": "Mage",
			"6": "Warlock",
			"7": "Paladin",
			"8": "Shaman"
		};

		// A player name is required
		if (typeof(args[0]) === 'undefined') {
			message.channel.send('Please provide a player name to look up on Legacy Players.');
			return false;
		}
		
		// The name needs to be in the format "Setback" .. "SETBACK" & "setback" will not work.
		const player = args[0].charAt(0).toUpperCase() + args[0].slice(1).toLowerCase();
		const apiUrl = 'https://legacyplayers.com/API.aspx?type=7&arg1=0&arg2=3&StrArg1=' + player;

		https.get(apiUrl, (resp) => {
		  let data = '';

		  // A chunk of data has been received.
		  resp.on('data', (chunk) => {
			data += chunk;
		  });

		  // The whole response has been received. Print out the result.
		  resp.on('end', () => {
			parsedData = JSON.parse(data);
			
			if (parsedData.CharId) {
				const playerLevel = 'Lvl '+ parsedData.RefMisc.Level;
				const playerClass = classes[parsedData.RefMisc.Class];
				const returnUrl = 'https://legacyplayers.com/Armory/?charid=' + parsedData.CharId;
				message.channel.send('LegacyPlayers Profile for ' + player + ' (' + playerLevel + ' ' + playerClass + '): ' + returnUrl);
			} else {
				message.channel.send('Unable LegacyPlayers Profile for "'  + player + '".');
			}
		  });
		}).on("error", (err) => {
		  console.log("Error: " + err.message);
		});
	}

	
	// Allow a user to sign up in the sign-up channel
	if(command === "signup") {
		if (message.channel.name.indexOf('signup') == -1) {
			message.channel.send("You can only sign up in designated sign-up channels.");
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
		const jsonArray = [userName, signValue];
		const jsonValue = JSON.stringify(jsonArray);
		const fileName = '/tmp/' + raid + '.json';
		let parsedLineup = {};
		if (fs.existsSync(fileName)) {
			currentLineup = fs.readFileSync(fileName, 'utf8');
			parsedLineup = JSON.parse(currentLineup);
		}
		
		parsedLineup[userName] = signValue;
		fs.writeFileSync('/tmp/' + raid + '.json', JSON.stringify(parsedLineup)); 
		message.channel.send("Signed up user " + userName + " as '" + signValue + "' for " + raid + ".");
	}

	// Display the raid line-up based on the sign-ups for the channel
	if (command === "lineup") {
		if (message.channel.name.indexOf('signup') == -1) {
			message.channel.send("You can only sign up in designated sign-up channels.");
			return false;
		}

		const raid = message.channel.name;
		const fileName = '/tmp/' + raid + '.json';
		let parsedLineup = {};
		if (fs.existsSync(fileName)) {
			currentLineup = fs.readFileSync(fileName, 'utf8');
			parsedLineup = JSON.parse(currentLineup);
		}
		
		let yesArray = [];
		let maybeArray = [];
		let noArray = [];
		
		for (player in parsedLineup) {
			if (parsedLineup[player] === 'yes') {
				yesArray.push(player);
			} else if (parsedLineup[player] === 'maybe') {
				maybeArray.push(player);
			} else if (parsedLineup[player] === 'no') {
				noArray.push(player);
			}
		}
		message.channel.send("Yes (" + yesArray.length + "): " + yesArray.join(', '));
		message.channel.send("Maybe (" + maybeArray.length + "): " + maybeArray.join(', '));
		message.channel.send("No (" + noArray.length + "): " + noArray.join(', '));
	}
	
	// Create a raid channel based on the raid name & date
	if (command === "addraid") {
		if (message.channel.name != 'officers') {
			message.channel.send('This command can only be used from the officers channel.');
			return false;
		}
		const raid = args[0];
		const date = args[1];
		const name = raid + '-signups-' + date;
		var server = message.guild;
		server.createChannel(name, "text");
	}
});

client.login(config.token);