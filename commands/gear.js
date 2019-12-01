var request = require('request');
var moment = require('moment');
const Discord = require("discord.js");

exports.run = (client, message, args) => {
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
      let metric = args[1];
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
          if (!logs) {
            return message.channel.send('Could not find gear information for ' + player);
          }

          let embed = new Discord.RichEmbed()
            .setTitle('Gear for ' + player)
            .setColor(0x02a64f);

          logs.sort(function(a, b) {
            if (a.startTime < b.startTime) { return 1; }
            else if (a.startTime > b.startTime) { return -1; }
            else { return 0; }
          });
            
          logs[0].gear.forEach(function(gear) {
            if (gear.id != 0) {
              console.log(gear);
              embed.addField(gear.name, 'https://classic.wowhead.com/item=' + gear.id);
            }
          });

          var logDate = new Date(logs[0].startTime);
          embed.setFooter('Last updated: ' + moment(logDate).format('LL'));

          return message.channel.send(embed);
      });
    }
};
