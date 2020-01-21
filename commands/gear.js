var request = require('request');
var moment = require('moment');
const Discord = require("discord.js");

exports.run = (client, message, args) => {
    message.delete();
    let string = args.join(' ');
    console.log(string);
    let hidden = false;
    if (string.indexOf('-h') > -1) {
      hidden = true;
      string = string.replace('-h', '');
      args = string.split(' ');
    }
  
    let player = args[0];
    let server = 'Mankrik';
    let region = 'US';
    if (args[1]) {
      server = args[1];
    }
    if (args[2]) {
      region = args[2];
    }

    gearCheck(player, server, region);

    function gearCheck(player, server, region) {
      let searchUrl = "https://classic.warcraftlogs.com:443/v1/parses/character/" + player + "/" + server + "/" + region + "?api_key=" + client.config.warcraftlogs;
      if (!player) {
        return message.channel.send('Please add a valid player name, eg "+gear Taunt"');
      }
      reqOpts = {
          url: searchUrl
        };

      request(reqOpts, function(err, resp, html) {
          if (err) {
            return;
          }
          logs = JSON.parse(resp.body);
          if (logs.error) {
            return message.channel.send(logs.error);
          }
          if (!logs || !logs[0] || logs[0].indexOf('reportID') == -1!) {
            return message.channel.send('Could not find gear information for ' + player);
          }
          if (!logs)

          logs.sort(function(a, b) {
            if (a.startTime < b.startTime) { return 1; }
            else if (a.startTime > b.startTime) { return -1; }
            else { return 0; }
          });
            
          let embed = new Discord.RichEmbed()
            .setTitle(player)
            .setColor(0x02a64f);

          let reportID = logs[0].reportID;
          let gearList = {};
          let slots = [
            'Head', // 0
            'Neck', // 1
            'Shoulders', //2
            'Shirt', // 3
            'Chest', // 4
            'Belt', // 5
            'Legs', // 6
            'Boots', // 7
            'Bracers', // 8
            'Gloves', // 9
            'Rings', // 10
            'Rings', // 11
            'Trinkets', // 12
            'Trinkets', // 13
            'Cloak', // 14
            'Main Hand', // 15
            'Off Hand', // 16
            'Ranged', // 17
          ];
          logs.forEach(function(log) {
            log.gear.forEach(function(gear, key) {
              if (gear.id != 0 && log.reportID == reportID) {
                let gearLink = '[' + gear.name + '](' + 'https://classic.wowhead.com/item=' + gear.id + ')';
                let slotName = slots[key];

                // Create a blank array if this slot isn't already populated.
                if (!gearList[slotName]) {
                  gearList[slotName] = [];
                }

                // Add this gear link to the slot array if it's not already there
                if (gearList[slotName].indexOf(gearLink) < 0) {
                  gearList[slotName].push(gearLink);
                }
              }
            });
          });

          info = '```Class: ' + logs[0].class + '\n';
          // info += 'Spec:  ' + logs[0].spec + '\n';
          info += 'iLvl:  ' + logs[0].ilvlKeyOrPatch + '\n```';
          embed.addField('**General**', info, false);

          for (slot in gearList) {
            gear = gearList[slot];
            embed.addField('**' + slot + '**', gear.join('\n'), true); 
          }

          let logDate = new Date(logs[0].startTime);
          embed.setFooter('Last updated: ' + moment(logDate).format('LL'));
          if (hidden) {
            return message.author.send(embed);
          } else {
            return message.channel.send(embed);
          }
      });
    }
};
