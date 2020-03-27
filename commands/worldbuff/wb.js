const fs = require("fs");
const Discord = require("discord.js");
const { Op } = require('sequelize');

exports.run = (client, message, args) => {
	message.delete().catch(O_o=>{}); 
    let validTypes = ['Ony', 'Nef'];
    let validDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    let command = args.shift();
    let guildID = message.guild.id;
    if (!guildID) {
        return;
    }

    if (command == 'add') {
        let type = args.shift();
        let day = args.shift();
        let time = args.shift();
        let guild = args.join(' ');
        addSchedule(type, day, time, guild);
    }

    if (command == 'view') {
        viewSchedule();
    }

    if (command == 'remove') {
        removeSchedule(args[0]);
    }

    if (command == 'slots') {
        showSlots()
    }

    if (command == 'gen') {
        generateSlots();
    }

    if (command = 'assign') {
        let worldbuffID = args.shift();
        let player = args.shift();
        assignSlot(worldbuffID, player)
    }

    function assignSlot(worldbuffID, player) {
        client.models.worldbuff.update({player: player}, {where: {id: worldbuffID}});
    }

    function showSlots() {
        let currentTime = new Date();
        client.models.worldbuff.findAll({where: {guildID: message.guild.id, 'buffTime': {[Op.gte]: currentTime}}}).then((buffs) => {
            let schedule = '```diff\n';
            buffs.forEach((buff) => {
                if (buff.player) {
                    schedule += '+ ' + buff.id + ' > ' + buff.buffTime + ': ' + buff.player + '\n';
                } else {
                    schedule += '- ' + buff.id + ' > ' + buff.buffTime + '\n';
                }
            });
            schedule += '```';
            message.channel.send(schedule);
    });
    }

    function generateSlots() {
        // Verify there's a slot in the next 7 days for all scheduled drops
        client.models.worldbuffSchedule.findAll().then((scheduleItems) => {
            scheduleItems.forEach((item) => {
                client.models.worldbuff.findAll({where: {guildID: message.guild.id, worldbuffScheduleID: item.id}}).then((scheduledBuffs) => {
                    if (!scheduledBuffs.length) {
                        let buffTime = new Date();
                        let currentDay = buffTime.getDay();
                        let targetDay = validDays.indexOf(item.day);
                        let distance = (targetDay + 7 - currentDay) % 7;
                        buffTime.setDate(buffTime.getDate() + distance);

                        let timeSplit = item.time.split(':');
                        buffTime.setHours(timeSplit[0] + 11, timeSplit[1], timeSplit[2]);

                        let record = {
                            buffTime: buffTime,
                            worldbuffScheduleID: item.id,
                            player: '',
                            channelID: message.channel.id,
                            guildID: message.guild.id,
                            memberID: message.author.id
                        }
                        client.models.worldbuff.create(record);
                        console.log('buff slot created');
                    }
                });
            });
        });
    }


    function addSchedule(type, day, time, guild) {
        if (validTypes.indexOf(type) == -1) {
            return message.channel.send('Invalid buff type: ' + type);
        }
        if (validDays.indexOf(day) == -1) {
            return message.channel.send('Invalid buff day: ' + day);
        }
        var record = {
            type: type,
            day: day,
            time: time,
            guild: guild,
            channelID: message.channel.id,
            guildID: message.guild.id,
            memberID: message.author.id
        };
        client.models.worldbuffSchedule.create(record);
    }

    function removeSchedule(id) {
        client.models.worldbuffSchedule.destroy({where: {id: id}});
    }

    function viewSchedule() {
        client.models.worldbuffSchedule.findAll().then((scheduleItems) => {
            let schedule = '```\n';
            scheduleItems.forEach((item) => {
                schedule += item.id + ' > ' + item.day + '@' + item.time + ': ' + item.type + ' (' + item.guild + ')\n';
            });
            schedule += '```';
            message.channel.send(schedule);
        });
    }

};