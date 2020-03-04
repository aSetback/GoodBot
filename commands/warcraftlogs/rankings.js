var request = require('request');
var moment = require('moment');

exports.run = (client, message, args) => {
    let player = args[0];
    let server = 'Mankrik';
    let region = 'US';
    if (args[2]) {
      server = args[2]; //.replace('-', ' ');
    }
    if (args[3]) {
      region = args[3];
    }

    zones = [1000, 1001, 1002];
    zones.forEach(function(zone) {
      getParses(player, server, region, zone);
    })

    function getParses(player, server, region, zone) {
      let searchUrl = "https://classic.warcraftlogs.com:443/v1/rankings/character/" + player + "/" + server + "/" + region + "?api_key=" + client.config.warcraftlogs;
      let metric = args[1];
      if (!player) {
        return message.channel.send('Please add a valid player name, eg "+rankings Taunt"');
      }
      if (!metric) { 
        metric = 'dps'; 
      }
      let isTank = false;
      if (metric.toLowerCase() == 'tank') {
        metric = 'dps';
        isTank = true;
      }
      searchUrl += '&metric=' + metric;
      searchUrl += '&zone=' + zone;
      searchUrl += '&timeframe=historical';
      console.log(searchUrl);

      reqOpts = {
          url: encodeURI(searchUrl)
        };
      try {
        request(reqOpts, function(err, resp, html) {
            if (err) {
              return;
            }
            try {
              logs = JSON.parse(resp.body);
            } catch (e) {
              console.log(resp.body)
              // console.log(e);
              return false;
            }
            if (logs.error) {
              return message.channel.send(logs.error);
            }
            if (!logs) {
              return message.channel.send('Could not find ranking information for ' + player);
            }

            let metricDisplay = isTank ? 'tank' : metric;
            let returnData = '**Top Parses for ' + player + ' (' + metricDisplay + ')**\n';
            returnData += '```\n';
            returnData += ''.padEnd(95, '-') + '\n';
            returnData += 'boss'.padEnd(35);
            returnData += metric.padEnd(10);
            returnData += '%'.padEnd(6);
            returnData += 'ilvl'.padEnd(6);
            returnData += 'rank'.padEnd(20);
            returnData += 'date'.padEnd(10);
            returnData += '\n';
            returnData += ''.padEnd(95, '-') + '\n';

            logs.forEach(function(log) {
              if ((isTank && log.spec.toLowerCase() == 'tank') 
                || (!isTank && log.spec.toLowerCase() == 'dps' && metric.toLowerCase() != 'hps')
                || (metric.toLowerCase() == 'hps' && log.spec.toLowerCase() == 'healer')) {
                var logDate = new Date(log.startTime);
                var ranking = log.rank + ' of ' + log.outOf;
                var encounter = log.encounterName;
                if (isTank) { encounter + ' (tank)'; }
                returnData += encounter.toString().padEnd(35);
                returnData += log.total.toString().padEnd(10);
                returnData += log.percentile.toString().padEnd(6);
                returnData += log.ilvlKeyOrPatch.toString().padEnd(6);
                returnData += ranking.padEnd(20);
                returnData += moment(logDate).format('LL')
                returnData += '\n';
              }
            })

            returnData += ''.padEnd(95, '-') + '\n';
            returnData += '```';

            return message.channel.send(returnData);
        });
      } catch(e) {
        console.log(e);
      }
    }
};
