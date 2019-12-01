var request = require('request');
const Discord = require("discord.js");

exports.run = (client, message, args) => {
    let argString = args.join(' ');

    let searchUrl = "https://classic.warcraftlogs.com:443/v1/reports/guild/" + args[0] + "/Mankrik/US?api_key=" + client.config.warcraftlogs;
    reqOpts = {
        url: searchUrl
      };

    request(reqOpts, function(err, resp, html) {
        if (err) {
          return;
        }
        let returnRaids = '-\n';
        logs = JSON.parse(resp.body);
        for (i = 0; i < 10; i++) {
            returnRaids += (i + 1).toString() + ': **' + logs[i].title + '**: https://classic.warcraftlogs.com/reports/' + logs[i].id + '\n';
        }

        return message.channel.send(returnRaids);
    });
};