var request = require('request');
var moment = require('moment');
const Discord = require("discord.js");

exports.run = async (client, message, args) => {
  let guild = args.join(" ");
  let server = await client.customOptions.get(client, message.guild, 'server');
  let region = await client.customOptions.get(client, message.guild, 'region');
  if (!server) {
    server = 'Mankrik';
  }
  if (!region) {
    region = 'US';
  }

  let searchUrl = "https://classic.warcraftlogs.com:443/v1/reports/guild/" + guild + '/' + server + '/' + region + '?api_key=' + client.config.warcraftlogs;
  reqOpts = {
    url: encodeURI(searchUrl)
  };

  request(reqOpts, function (err, resp, html) {
    if (err) {
      return;
    }
    let embed = new Discord.MessageEmbed()
      .setTitle("Recent Logs: " + guild)
      .setColor(0x02a64f);
    
    logs = JSON.parse(resp.body);
    if (logs[0]) {
      for (i = 0; i < 10; i++) {
        let raidTitle = "**" + logs[i].title + "** (" + moment(logs[i].start).format('LL') + ")";
        let raidLink = "Logs: [" + logs[i].id + "](https://classic.warcraftlogs.com/reports/" + logs[i].id + ")";
        embed.addField(raidTitle, raidLink);
      }

      return message.channel.send(embed);
    }
  });
};