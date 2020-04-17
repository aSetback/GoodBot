const fs = require("fs");
const Discord = require("discord.js");

module.exports = {
	update: (client, guild, file) => {
        // Read our SavedVariables file
        if (!fs.existsSync(file)) {
            console.log("File doesn't exist: " + file)
            return false;
        }
		let data = fs.readFileSync(file, 'utf8');

		let channel = guild.channels.find(channel => channel.name === "bank");
        if (!channel) {
            console.log('Error: Guild Bank channel could not be found!');
            return false;
        }

		// Split the lua file up into lines
		let lines = data.split('\n');

        // Loop through the lines, find the one that has the standings.
		parseLine = false;
		for (key in lines) {
            let line = lines[key];
            if (line.indexOf('}') == 0) 
                parseLine = false;
            if (parseLine) 
                client.guildbank.parse(client, guild, line.replace(/\\"/g, '"'));
			if (line.indexOf('GoodBotGuildBank = ') >= 0) {
                parseLine = true;
			}
		}
	},
	parse: (client, guild, line) => {
        let lineSplit = line.split(" = ");
        let characterName = lineSplit.shift().trim();
        characterName = characterName.substr(2, characterName.length - 4);
        console.log
        let contents = lineSplit.shift().trim();
        contents = contents.substr(1, contents.length - 3);
        contents = JSON.parse(contents);    
        client.guildbank.embed(client, guild, characterName, contents);        
    },
    embed: (client, guild, characterName, contents) => {
        contents.sort((a, b) => {
            if (a.name > b.name) 
                return 1;
            if (b.name > a.name)
                return -1;
            return 0;
        })
    
        let channel = guild.channels.find(channel => channel.name === "bank");
        let embed = new Discord.RichEmbed()
		.setTitle("Character: " + characterName)
        .setColor('#b00b00')
        .setTimestamp();
        let returnMessage = '';
        contents.forEach((item) => {
            returnMessage += item.qty + 'x ' +'[' + item.name + '](https://classic.wowhead.com/item=' + item.id + ')\n';
            if (returnMessage.length > 900) {
                embed.addField('Items', returnMessage);    
				returnMessage = '';
			}
        });
        if (returnMessage.length) {
			embed.addField('Items', returnMessage);    
            channel.send(embed);    
        }
    }
}