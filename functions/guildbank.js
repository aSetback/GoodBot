const fs = require("fs");
const Discord = require("discord.js");

module.exports = {
	update: (client, guild, content) => {
		let channel = guild.channels.find(channel => channel.name === "bank");
        if (!channel) {
            console.log('Error: Guild Bank channel could not be found!');
            return false;
        }

		// Split the lua file up into lines
		let lines = content.split('\n');

        // Loop through the lines, find the one that has the standings.
		parseLine = false;
		for (key in lines) {
            let line = lines[key];
            console.log(line);
            if (line.indexOf('}') == 0) {
                parseLine = false;
            }
            if (parseLine) {
                console.log('found a line!');
                client.guildbank.parse(client, guild, line.replace(/\\"/g, '"'));
            }
			if (line.indexOf('GoodBotGuildBank = ') >= 0) {
                console.log('enable parsing');
                parseLine = true;
			}
		}
	},
	parse: (client, guild, line) => {
        console.log("Parsing line: " + line);
        let lineSplit = line.split(" = ");
        let characterName = lineSplit.shift().trim();
        characterName = characterName.substr(2, characterName.length - 4);
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
        });
    
        console.log("Creating embed.");
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