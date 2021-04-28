const fs = require("fs");
const Discord = require("discord.js");

module.exports = {
	run: (client, member) => {
        client.wizard.getName(client, member);
	},
    getName: (client, member) => {
        member.send("Help us get your character set up on " + member.guild.name + "! [ID " + member.guild.id + "]");
        member.send("What is your main character's name?");
    },
    getClass: (client, member) => {
        let emojis = client.wizard.loadEmojis(client);
        member.send("What class is your main?").then(async (msg) => {
            await msg.react(emojis.warrior);
            await msg.react(emojis.druid);
            await msg.react(emojis.paladin);
            await msg.react(emojis.priest);
            await msg.react(emojis.mage);
            await msg.react(emojis.warlock);
            await msg.react(emojis.shaman);
            await msg.react(emojis.hunter);
            await msg.react(emojis.rogue);
        });
    },
    getRole: (client, member) => {
        let emojis = client.wizard.loadEmojis(client);
        member.send("What role is your main?  (Please note that Shadow Priests, Balance Druids, Mages and Warlocks are **casters** not **dps**!)").then(async (msg) => {
            await msg.react(emojis.tank);
            await msg.react(emojis.healer);
            await msg.react(emojis.dps);
            await msg.react(emojis.caster);
        });
    },
    handleEmoji: async (client, channel, emoji, memberID) => {
        let guildID = await client.wizard.retrieveGuildID(client, channel);
        let guild = client.guilds.cache.find(g => g.id == guildID);
        let member = await guild.members.fetch(memberID);
        if (member.user.bot) { return; }
        let classEmojis = ['GBwarrior', 'GBdruid', 'GBpaladin', 'GBpriest', 'GBmage', 'GBwarlock', 'GBshaman', 'GBhunter', 'GBrogue'];
        let roleEmojis = ['GBtank', 'GBhealer', 'GBdps', 'GBcaster'];
        if (classEmojis.find(e => e == emoji.name)) {
            let className = emoji.name.substring(2, emoji.name.length);
            client.wizard.setClass(client, member, className);
            client.log.write(client, member, channel, 'Set Class: ' + className);
            client.wizard.deleteMessage(client, channel, "What class is your main?");
        }
        if (roleEmojis.find(e => e == emoji.name)) {
            let roleName = emoji.name.substring(2, emoji.name.length);
            client.wizard.setRole(client, member, roleName);
            client.log.write(client, member, channel, 'Set Role: ' + roleName);
            client.wizard.deleteMessage(client, channel, "What role is your main?");
        }
    },
    complete: async(client, member) => {
        let character = await client.models.character.findOne({ where: {'name': member.displayName, 'guildID': member.guild.id}});
        member.send('Thank you!  I have set **' + character.name + "** as a **" + character.class + " " + character.role + "** on " + member.guild.name + ".\nNeed to start over?  Type **restart** in this channel.");
    },
    setRole: async (client, member, roleName) => {
        let record = {
            name: client.general.ucfirst(member.displayName),
            role: roleName,
            memberID: member.id,
            guildID: member.guild.id
        };
            
        let character = await client.models.character.findOne({ where: {'name': record.name, 'guildID': record.guildID}});
        if (!character) {
            character = await client.models.character.create(record);
        } else {
            await client.models.character.update(record, {
                where: {
                    id: character.id
                }
            });
        }
        client.wizard.complete(client, member);
    },
    setClass: async (client, member, className) => {
        let record = {
            name: client.general.ucfirst(member.displayName),
            class: className,
            memberID: member.id,
            guildID: member.guild.id
        };
            
        let character = await client.models.character.findOne({ where: {'name': record.name, 'guildID': record.guildID}});
        if (!character) {
            character = await client.models.character.create(record);
        } else {
            await client.models.character.update(record, {
                where: {
                    id: character.id
                }
            });
        }
        client.wizard.getRole(client, member);
    },
    deleteMessage: async(client, channel, content) => {
        let messages = await channel.messages.fetch();
        let message = messages.find(m => m.content.includes(content));
        if (message) {
            message.delete();
        }
    },
    handleMessage: async (client, message) => {
        if (message.author.bot) { return; }
        let guildID = await client.wizard.retrieveGuildID(client, message.channel);
        let guild = client.guilds.cache.find(g => g.id == guildID);
        let member = await guild.members.fetch(message.author.id);
        
        if (message.content == 'restart') {
            return client.wizard.run(client, member);
        }

        if (guild) {
            // Verify they haven't alreadyt set their name
            let messages = await message.channel.messages.fetch();
            let nameQuestion = messages.find(m => m.content.includes("What is your main character's name?"));
            if (!nameQuestion) { return; }

            if (!member) { 
                console.error('Member could not be found to set their name - did they leave?');
            }
            let newName = client.general.ucfirst(message.content.trim());
            if (!client.set.validName(guild, newName)) {
                return member.send('Unable to set your name.  Please use only letters.');
            }
            let result = member.setNickname(newName);  
            result.catch(() => {
                console.error('Unable to set username for ' + guild.name);
            });
            if (result) {
                message.react("✔️");
                client.log.write(client, member, message.channel, 'Set Nick: ' + newName);
                message.author.send("Your username has been set to **" + newName + "** on " + guild.name + ".").catch(() => {console.log('error')});
                client.wizard.deleteMessage(client, message.channel, "What is your main character's name?");
                client.wizard.getClass(client, message.author);
            }
        }
        
    },
    retrieveGuildID: async (client, channel) => {
        let messages = await channel.messages.fetch();
        let idMessage = messages.find(m => m.content.includes('[ID '));
        let split1 = idMessage.content.split('[ID ');
        let split2 = split1[1].split(']');
        let guildID = split2[0];
        return guildID;
    },
    loadEmojis: (client) => {
        emojis = {
            "warrior": client.emojis.cache.find(emoji => emoji.name === "GBwarrior").toString(),
            "druid": client.emojis.cache.find(emoji => emoji.name === "GBdruid").toString(),
            "paladin": client.emojis.cache.find(emoji => emoji.name === "GBpaladin").toString(),
            "priest": client.emojis.cache.find(emoji => emoji.name === "GBpriest").toString(),
            "mage": client.emojis.cache.find(emoji => emoji.name === "GBmage").toString(),
            "warlock": client.emojis.cache.find(emoji => emoji.name === "GBwarlock").toString(),
            "rogue": client.emojis.cache.find(emoji => emoji.name === "GBrogue").toString(),
            "hunter": client.emojis.cache.find(emoji => emoji.name === "GBhunter").toString(),
            "shaman": client.emojis.cache.find(emoji => emoji.name === "GBshaman").toString(),
            "dk": client.emojis.cache.find(emoji => emoji.name === "GBdk").toString(),
            "monk": client.emojis.cache.find(emoji => emoji.name === "GBmonk").toString(),
            "dh": client.emojis.cache.find(emoji => emoji.name === "GBdh").toString(),
            "tank": client.emojis.cache.find(emoji => emoji.name === "GBtank").toString(),
            "healer": client.emojis.cache.find(emoji => emoji.name === "GBhealer").toString(),
            "dps": client.emojis.cache.find(emoji => emoji.name === "GBdps").toString(),
            "caster": client.emojis.cache.find(emoji => emoji.name === "GBcaster").toString(),
        }
        return emojis;
    }
}
