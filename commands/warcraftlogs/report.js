var request = require('request');
const Discord = require("discord.js");

exports.run = (client, message, args) => {
  let showTrash = 1;
  if (args[0]) {
    showTrash = args[0];
  }
  let searchUrl = "https://classic.warcraftlogs.com:443/v1/report/fights/" + args[0] + "?api_key=" + client.config.warcraftlogs;
    reqOpts = {
      url: encodeURI(searchUrl)
    };

    request(reqOpts, function(err, resp, html) {
        if (err) {
          return;
        }
        logs = JSON.parse(resp.body);
        let returnString = '```';
        returnString += '  Fight Name'.padEnd(40) + 'Duration'.padEnd(25) + 'Overall'.padEnd(25) + 'Since Last Boss\n';
        returnString += ''.padEnd(115, '=') + '\n';

        let startTime = '';
        let lastFight = '';
        let lastBossFight = {};
        logs.fights.forEach(function(fight) { 
            if (!fight.boss && !showTrash) {
              return
            }
            if (lastBossFight.boss != 672) {
            if (startTime === '') {
              startTime = fight.start_time;
              lastBossFight.end_time = startTime;
            }
            if (returnString.length > 1500) {
              message.channel.send(returnString + '```');
              returnString = '```';
            }
            let name = fight.name;
            if (fight.boss) {
              name = '> ' + name;
            } else {
              name = '  ' + name;
            }

            let timeElapsed = friendlyTime(fight.start_time - startTime);
            let fightDuration = friendlyTime(fight.end_time - fight.start_time)
            let bossDelta = friendlyTime(fight.start_time - lastBossFight.end_time);

            returnString += name.padEnd(40) + fightDuration.padEnd(25) + timeElapsed.padEnd(25);
            if (fight.boss) {
              returnString += bossDelta.padEnd(25);
              lastBossFight = fight;
            }
            returnString += '\n';
            lastFight = fight;
          }
        });
        
        let totalTime = friendlyTime(lastFight.end_time - startTime);
        returnString += ''.padEnd(115, '=') + '\n';
        returnString += 'Total Time: ' + totalTime;
        message.channel.send(returnString + '```');
    });

    function friendlyTime(ms) {
      let msElapsed = ms % 1000;
      let secondsElapsed = Math.floor(ms / 1000) % (60);
      let minutesElapsed = Math.floor(ms / (60 * 1000)) % 60;
      let hoursElapsed = Math.floor(ms / (60 * 60 * 1000));
      let friendlyTime = '';
      
      if (hoursElapsed) {
        friendlyTime += hoursElapsed + 'h ';
      }
      if (minutesElapsed) {
        friendlyTime += (minutesElapsed % 60 + 'm ').padStart(4, '0');
      } 

      friendlyTime += (secondsElapsed + 's ').padStart(4, '0');
      friendlyTime += (msElapsed + 'ms').padStart(5, '0');
      return friendlyTime;
    }
};