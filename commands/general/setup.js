exports.run = async (client, message, args) => {

    if (!message.isAdmin) {
		return false;
    }
    
    let expansion = await client.guildOption.expansion(client, message.guild.id);

    // Create Category
    message.guild.channels.create('Get Started', {
            'type': 'category'
        })
        .then((category) => {

            // Set your nickname
            let nickChannel = 'set-your-name';
            message.guild.channels.create(nickChannel, {
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
            message.guild.channels.create(classChannel, {
                    type: 'text'
                })
                .then((channel) => {
                    let signupMessage = 'Please select your class.';
                    channel.setParent(category.id)
                        .then((channel) => {
                            channel.lockPermissions()
                                .catch(console.error);
                        });

                    channel.send(signupMessage).then((botMsg) => {
                        reactClasses(botMsg, expansion);
                    });
                });

            // Set your role
            let roleChannel = 'select-your-role';
            message.guild.channels.create(roleChannel, {
                    type: 'text'
                })
                .then((channel) => {
                    let signupMessage = 'Please select your role. \n';
                    let emojis = {
                        'tank': client.emojis.find(emoji => emoji.name === "GBtank"),
                        'healer': client.emojis.find(emoji => emoji.name === "GBhealer"),
                        'dps': client.emojis.find(emoji => emoji.name === "GBdps"),
                        'caster': client.emojis.find(emoji => emoji.name === "GBcaster"),
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
                        reactRoles(botMsg, expansion);
                    });
                });
        });

    async function reactClasses(msg, expansion) {
        
        let emojis = [
            client.emojis.find(emoji => emoji.name === "GBwarrior"),
            client.emojis.find(emoji => emoji.name === "GBpaladin"),
            client.emojis.find(emoji => emoji.name === "GBshaman"),
            client.emojis.find(emoji => emoji.name === "GBhunter"),
            client.emojis.find(emoji => emoji.name === "GBrogue"),
            client.emojis.find(emoji => emoji.name === "GBdruid"),
            client.emojis.find(emoji => emoji.name === "GBpriest"),
            client.emojis.find(emoji => emoji.name === "GBwarlock"),
            client.emojis.find(emoji => emoji.name === "GBmage")
        ];

        if (expansion >= 2) {
            emojis.push(client.emojis.find(emoji => emoji.name === "GBdk"));
        }
        if (expansion >= 4) {
            emojis.push(client.emojis.find(emoji => emoji.name === "GBmonk"));
        }
        if (expansion >= 6) {
            emojis.push(client.emojis.find(emoji => emoji.name === "GBdh"));
        }
        for (key in emojis) {
            await msg.react(emojis[key]);
        }
    }

    async function reactRoles(msg) {
        let emojis = [
            client.emojis.find(emoji => emoji.name === "GBtank"),
            client.emojis.find(emoji => emoji.name === "GBhealer"),
            client.emojis.find(emoji => emoji.name === "GBdps"),
            client.emojis.find(emoji => emoji.name === "GBcaster"),
        ];
        for (key in emojis) {
            await msg.react(emojis[key]);
        }
    }



}