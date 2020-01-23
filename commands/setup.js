exports.run = (client, message, args) => {

	// Delete message
	message.delete().catch(O_o=>{}); 

    // Create Category
    message.guild.createChannel('Get Started', {'type': 'category'})
        .then((category) => {
        
        // Set your nickname
        let nickChannel = 'set-your-name';
        message.guild.createChannel(nickChannel, {
            type: 'text'
        })
        .then((channel) => {
            let signupMessage = 'Please enter your in-game character name in this channel.';
            channel.setParent(category.id)
            .then((channel) => {
                channel.lockPermissions()
                    .catch(console.error);
            });
            channel.send(signupMessage);
        });

        // Set your class
        let classChannel = 'select-your-class';
        message.guild.createChannel(classChannel, {
            type: 'text'
        })
        .then((channel) => {
            let signupMessage = 'Please select your class';
            channel.setParent(category.id)
            .then((channel) => {
                channel.lockPermissions()
                    .catch(console.error);
            });

            channel.send(signupMessage).then((botMsg) => {
                reactClasses(botMsg);				
            });
        });

        // Set your role
        let roleChannel = 'select-your-role';
        message.guild.createChannel(roleChannel, {
            type: 'text'
        })
        .then((channel) => {
            let signupMessage = 'Please select your role. \n';
            let emojis = {
                'tank': client.emojis.find(emoji => emoji.name === "tank"),
                'healer': client.emojis.find(emoji => emoji.name === "healer"),
                'dps': client.emojis.find(emoji => emoji.name === "dps"),
                'caster': client.emojis.find(emoji => emoji.name === "caster"),
            }
            for (role in emojis) {
                signupMessage += emojis[role] + ' for ' + role + '\n';
            }

            channel.setParent(category.id)
            .then((channel) => {
                channel.lockPermissions()
                    .catch(console.error);
            });

            channel.send(signupMessage).then((botMsg) => {
                reactRoles(botMsg);				
            });
        });
    });

	async function reactClasses(msg) {
		let emojis = [
            client.emojis.find(emoji => emoji.name === "warrior"),
            client.emojis.find(emoji => emoji.name === "paladin"),
            client.emojis.find(emoji => emoji.name === "shaman"),
            client.emojis.find(emoji => emoji.name === "hunter"),
            client.emojis.find(emoji => emoji.name === "rogue"),
            client.emojis.find(emoji => emoji.name === "druid"),
            client.emojis.find(emoji => emoji.name === "priest"),
            client.emojis.find(emoji => emoji.name === "warlock"),
            client.emojis.find(emoji => emoji.name === "mage")
        ];
		for (key in emojis) {
			await msg.react(emojis[key]);
		}
	}

	async function reactRoles(msg) {
		let emojis = [
            client.emojis.find(emoji => emoji.name === "tank"),
            client.emojis.find(emoji => emoji.name === "healer"),
            client.emojis.find(emoji => emoji.name === "dps"),
            client.emojis.find(emoji => emoji.name === "caster"),
        ];
		for (key in emojis) {
			await msg.react(emojis[key]);
		}
	}
    


}