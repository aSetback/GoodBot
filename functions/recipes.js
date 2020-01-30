const fs = require("fs");
const Discord = require("discord.js");

module.exports = {
	update: (message) => {
		let channel = message.guild.channels.find(channel => channel.name === "recipes");
		if (!channel) {
			console.log('Recipes channel does not exist for ' + guild.name);
			return false;
		}

		const fileName = 'data/' + message.guild.id + '-recipes.json';
		let parsedList = {};
		if (fs.existsSync(fileName)) {
			currentList = fs.readFileSync(fileName, 'utf8');
			parsedList = JSON.parse(currentList);
		}

		let professionList = [];
		for (key in parsedList) {
			let recipe = parsedList[key];
			if (professionList.indexOf(recipe.professionList) < 0) {
				professionList[recipe.profession] = [];
			}
			professionList[recipe.profession].push(recipe);
		}
		
		channel.fetchMessages({limit: 20})
			.then(function(list){
				channel.bulkDelete(list);

				for (key in professionList) {
					let profession = professionList[key];
					let embed = new Discord.RichEmbed()
						.setTitle(key)
						.setColor(0x02a64f);
					for (recipeKey in profession) {
						let recipe = profession[recipeKey];
						crafterList = [recipe.link];
						for (crafterKey in recipe.crafters) {
							let crafter = recipe.crafters[crafterKey];
							crafter = crafter.charAt(0).toUpperCase() + crafter.slice(1).toLowerCase();
							crafterList.push(crafter);
						}
						embed.addField(recipe.name, crafterList.join('\n'));
					}

					channel.send(embed);				
				}

			});
	}
}