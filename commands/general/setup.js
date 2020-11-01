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
                        'tank': client.emojis.cache.find(emoji => emoji.name === "GBtank").toString(),
                        'healer': client.emojis.cache.find(emoji => emoji.name === "GBhealer").toString(),
                        'dps': client.emojis.cache.find(emoji => emoji.name === "GBdps").toString(),
                        'caster': client.emojis.cache.find(emoji => emoji.name === "GBcaster").toString(),
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
            client.emojis.cache.find(emoji => emoji.name === "GBwarrior").toString(),
            client.emojis.cache.find(emoji => emoji.name === "GBpaladin").toString(),
            client.emojis.cache.find(emoji => emoji.name === "GBshaman").toString(),
            client.emojis.cache.find(emoji => emoji.name === "GBhunter").toString(),
            client.emojis.cache.find(emoji => emoji.name === "GBrogue").toString(),
            client.emojis.cache.find(emoji => emoji.name === "GBdruid").toString(),
            client.emojis.cache.find(emoji => emoji.name === "GBpriest").toString(),
            client.emojis.cache.find(emoji => emoji.name === "GBwarlock").toString(),
            client.emojis.cache.find(emoji => emoji.name === "GBmage").toString(),
        ];

        if (expansion >= 2) {
            emojis.push(client.emojis.cache.find(emoji => emoji.name === "GBdk").toString());
        }
        if (expansion >= 4) {
            emojis.push(client.emojis.cache.find(emoji => emoji.name === "GBmonk").toString());
        }
        if (expansion >= 6) {
            emojis.push(client.emojis.cache.find(emoji => emoji.name === "GBdh").toString());
        }
        for (key in emojis) {
            await msg.react(emojis[key]);
        }
    }

    async function reactRoles(msg) {
        let emojis = [
            client.emojis.cache.find(emoji => emoji.name === "GBtank").toString(),
            client.emojis.cache.find(emoji => emoji.name === "GBhealer").toString(),
            client.emojis.cache.find(emoji => emoji.name === "GBdps").toString(),
            client.emojis.cache.find(emoji => emoji.name === "GBcaster").toString(),
        ];
        for (key in emojis) {
            await msg.react(emojis[key]);
        }
    }



}