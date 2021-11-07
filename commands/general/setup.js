exports.run = async (client, message, args) => {

    if (!message.isAdmin) {
		return false;
    }
    
    let expansion = await client.guildOption.expansion(client, message.guild.id);
    // Create Categories
    await message.guild.channels.create('Raid Signups', {
        'type': 'GUILD_CATEGORY'
    })
    .catch((e) => {
        message.channel.send("Command failed - GoodBot does not have permission to create channels on your discord, `+setup` failed.  Please give GoodBot administrator rights and try again.");
    });

    await message.guild.channels.create('Archives', {
        'type': 'GUILD_CATEGORY'
    })
    .catch((e) => {});


    message.guild.channels.create('Get Started', {
            'type': 'GUILD_CATEGORY'
        })
        .then((category) => {
            // Set your nickname
            let nickChannel = 'set-your-name';
            message.guild.channels.create(nickChannel, {
                    type: 'GUILD_TEXT'
                })
                .then((channel) => {
                    let signupMessage = 'Please enter your in-game character name in this channel.';
                    channel.setParent(category.id)
                        .then((channel) => {
                            channel.lockPermissions()
                                .catch(console.error);
                        })
                        .catch((e) => {});
                    channel.send(signupMessage);
                })
                .catch((e) => {});

            // Set your class
            let classChannel = 'select-your-class';
            message.guild.channels.create(classChannel, {
                    type: 'GUILD_TEXT'
                })
                .then((channel) => {
                    let signupMessage = 'Please select your class.';
                    channel.setParent(category.id)
                        .then((channel) => {
                            channel.lockPermissions()
                                .catch(console.error);
                        })
                        .catch((e) => {
                            message.channel.send("Command failed - GoodBot does not have permission to move channels on your discord, `+setup` failed.  Please give GoodBot administrator rights and try again.");
                        });
        ;

                    channel.send(signupMessage).then((botMsg) => {
                        reactClasses(botMsg, expansion);
                    });
                });

            // Set your role
            let roleChannel = 'select-your-role';
            message.guild.channels.create(roleChannel, {
                    type: 'GUILD_TEXT'
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
                        }).catch((e) => {});

                    channel.send(signupMessage).then((botMsg) => {
                        reactRoles(botMsg, expansion);
                    });
                });
            message.author.send("GoodBot has been set up for your server!\nI've created a new section called 'Get Started' with channels for users to set their name, class & faction.\nI've also created a category called 'Raid Signups' where all new raid channels will be created by default.\nYou can create your first raid by using `+raid MC may-18 Title`, substituting 'MC' for the raid you'd like to host, 'may-18' for the date of the raid, and 'Title' for the title you'd like to raid to have.");
        })
        .catch(console.error);

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
            await msg.react(emojis[key]).catch(console.error);
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
            await msg.react(emojis[key]).catch(console.error);;
        }
    }



}