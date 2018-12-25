const Discord = require("discord.js");
const https = require("https");
const fs = require("fs");
const client = new Discord.Client();
const config = require("./config.json");
const {Translate} = require('@google-cloud/translate');

const emojiFile = '/tmp/emojis.json';

client.on("ready", () => {
	console.log('GainBot has started on ' + client.guilds.size + ' servers.'); 
	client.user.setActivity('World of Setbacks');
});

client.on("message", async message => {
	
	// Determine if the player sending the message is an officer
	let officerRole = message.guild.roles.find(role => role.name === "Officer" || role.name === "Staff");
	let isOfficer = false;
	if (message.member.roles.has(officerRole.id)) {
		isOfficer = true;
	}
	
	let isGain = false;
	if (message.guild.id == '350833594236796928') {
		isGain = true;
	}
	
	// Ignore all bots
	if(message.author.bot) return;
  
	// Auto react with emoji(s)
	if (isGain) {
		let emojis = {};
		if (fs.existsSync(emojiFile)) {
			emojis = JSON.parse(fs.readFileSync(emojiFile, 'utf8'));
		}
		for (key in emojis) {
			if(message.content.toLowerCase().indexOf(key) !== -1) {
				let emoji = client.emojis.find(emoji => emoji.name === emojis[key]);
				message.react(emoji.id);
			}
		}
	}
	
	// Use prefix from config file
	if(message.content.indexOf(config.prefix) !== 0) return;
	  
	// Here we separate our "command" name, and our "arguments" for the command. 
	const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
	const command = args.shift().toLowerCase();

	if (command === "translate") {
		const translate = new Translate();

		let language = args.shift().toLowerCase();
		let translateText = args.join(' ');
		
		translate
			.translate(translateText, language)
			.then(results => {
				const translation = results[0];
				message.channel.send('Translation: ' + translation);
			})
			.catch(err => {
				console.error('ERROR:', err);
			});
	}
			
	// Allow a keyword for an emoji response
	if(command === "addreaction" && message.author.id == config.owner) {
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
	}

	// Display the raid line-up based on the sign-ups for the channel
	if (command === "lineup" && isOfficer) {
		if (message.channel.name.indexOf('signup') == -1) {
			message.channel.send("This command can only be used in a sign-up channel.");
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
		message.channel.send(
			"Yes (" + yesArray.length + "): " + yesArray.join(', ') 
			+ '\n' + "Maybe (" + maybeArray.length + "): " + maybeArray.join(', ')
			+ '\n' + "No (" + noArray.length + "): " + noArray.join(', ')
		);
	}
	
	// Create a raid channel based on the raid name & date
	if (command === "addraid" && isOfficer) {
		const raid = args[0];
		const date = args[1];
		const name = raid + '-signups-' + date;
		var server = message.guild;

		let category = server.channels.find(c => c.name == "Raid Signups" && c.type == "category");
		server.createChannel(name, 'text')
			.then(function(channel) {
				channel.setParent(category.id);
				channel.send('@everyone Please let the officers know if you will be able to make this raid by signing up here. \n For Yes: +signup + \n For Maybe: +signup m \n For No: +signup -');
				channel.send('If you are signing up under a name that does not match your discord name, please add it to the end of your signup. \n For Yes: +signup + Flameaesir \n For Maybe: +signup m Flameaesir \n For No: +signup - Flameaesir');

			});
	}
	
	// Remove last 20 messages from a channel
	if (command === "clean" && isOfficer) {
		let messageLimit = 20;
		if (typeof(args[0] !==  'undefined')) {
			messageLimit = parseInt(args[0]);
		}
		message.channel.fetchMessages({limit: messageLimit})
		   .then(function(list){
				message.channel.bulkDelete(list);
			});
	}
	
});

client.login(config.token);