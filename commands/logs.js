var request = require('request');
const Discord = require("discord.js");

exports.run = (client, message, args) => {
  let guild = args[0];
  let server = 'Mankrik';
  let region = 'US';
  if (args[1]) {
    server = args[1];
  }
  if (args[2]) {
    region = args[2];
  }

    let searchUrl = "https://classic.warcraftlogs.com:443/v1/reports/guild/" + guild + '/' + server + '/' + region + '?api_key=' + client.config.warcraftlogs;
    reqOpts = {
        url: searchUrl
      };

    request(reqOpts, function(err, resp, html) {
        if (err) {
          return;
        }
        let returnRaids = '-\n';
        logs = JSON.parse(resp.body);
        console.log(logs);
        for (i = 0; i < 10; i++) {
            returnRaids += (i + 1).toString() + ': **' + logs[i].title + '**: https://classic.warcraftlogs.com/reports/' + logs[i].id + ' (' + logs[i].id + ')\n';
        }

        return message.channel.send(returnRaids);
    });
};