var request = require('request');
const Discord = require("discord.js");

exports.run = (client, message, args) => {

  compareRaids();

  async function compareRaids() {
    let raid1 = await raidInfo(args[0]);
    let raid2 = await raidInfo(args[1]);

    let types = ['Boss Kill Time', 'Time Between Bosses', 'Overall Time'];

    types.forEach((type) => {
      let returnString = '```diff\n';
      returnString += '+ ' + type + '\n';
      returnString += '\n'.padEnd(100, '-') + '\n';
      returnString += '  Name'.padEnd(37);
      returnString += 'Raid 1'.padEnd(20);
      returnString += 'Raid 2'.padEnd(20);
      returnString += 'Difference'.padEnd(20);
      returnString += '\n'.padEnd(100, '-') + '\n';
  
      raid1.fights.forEach((r1fight) => {
        raid2.fights.forEach((r2fight) => {
          if (r1fight.name == r2fight.name) {
            returnString += compareFight(r1fight, r2fight, type);
          }
        });
      });
      returnString += ''.padEnd(100, '-') + '\n';
      if (type == 'Overall Time') {
        let modifier = raid1.total > raid2.total ? '-' : '+';
        returnString += modifier + ' Total'.padEnd(36);      
        returnString += friendlyTime(raid1.total).padEnd(20);
        returnString += friendlyTime(raid2.total).padEnd(20);
        returnString += modifier + friendlyTime(Math.abs(raid1.total - raid2.total)).padEnd(20);
        returnString += '\n' + ''.padEnd(100, '-') + '\n';
      }
      returnString += '```';
      message.channel.send(returnString);
    });
  }

  function compareFight(r1, r2, type) {
    let r1metric, r2metric = 0;
    if (type == 'Overall Time') {
      r1metric = r1.elapsed;
      r2metric = r2.elapsed;
    }
    if (type == 'Time Between Bosses') {
      r1metric = r1.delta;
      r2metric = r2.delta;
    }
    if (type == 'Boss Kill Time') {
      r1metric = r1.fightDuration;
      r2metric = r2.fightDuration;
    }

    let modifier = r1metric > r2metric ? '-' : '+';
    let fightString = modifier + ' ' + r1.name.padEnd(35);    
    fightString += friendlyTime(r1metric).padEnd(20);
    fightString += friendlyTime(r2metric).padEnd(20);
    fightString += modifier + friendlyTime(Math.abs(r1metric - r2metric)).padEnd(20);

    fightString += '\n';
    return fightString;
  }

  function raidInfo(reportID) {

    let searchUrl = "https://classic.warcraftlogs.com:443/v1/report/fights/" + reportID + "?api_key=" + client.config.warcraftlogs;
    let reqOpts = {
      url: encodeURI(searchUrl)
    };

    return new Promise((resolve, reject) => {
      request(reqOpts, (err, resp, html) => {
          if (err) {
            return;
          }

          let logs = JSON.parse(resp.body);
          let startTime = '';
          let lastBossFight = {};
          fightInfo = [];
          logs.fights.forEach(function(fight) { 
            if (startTime === '') {
              startTime = fight.start_time;
              lastBossFight.end_time = startTime;
            }

            if (lastBossFight.boss != 672 && fight.boss) {
              fightInfo.push({
                'name': fight.name,
                'elapsed': fight.start_time - startTime,
                'fightDuration': fight.end_time - fight.start_time,
                'delta': fight.start_time - lastBossFight.end_time
              });
              lastBossFight = fight;
            }
          });
          
          resolve({
            'fights': fightInfo,
            'total': lastBossFight.end_time - startTime
          });
      });
    });
  }

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