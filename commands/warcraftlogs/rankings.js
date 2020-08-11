var request = require('request');
var moment = require('moment');

exports.run = (client, message, args) => {

  let zone;
  args.forEach((arg, key) => {
    if (arg.indexOf('-z=') == 0) {
      zone = arg.replace('-z=', '').toLowerCase();
      args.splice(key, 1);
    }
  });

  let zones = [1002, 1003, 1000, 1001];
  if (zone) {
    zoneObj = {
      'mc': [1000],
      'bwl': [1002],
      'ony': [1001],
      'zg': [1003]
    };
    if (zoneObj[zone]) {
      zones = zoneObj[zone]
    }
  }

  // Retrieve our server/region.
  let server = client.customOptions.get(message.guild, 'server');
  let region = client.customOptions.get(message.guild, 'region');
  if (!server) {
    server = 'Mankrik';
  }
  if (!region) {
    region = 'US';
  }

  server = server.charAt(0).toUpperCase() + server.slice(1).toLowerCase();
  region = region.toUpperCase()

  // Set our player
  let player = args[0];
  player = player.charAt(0).toUpperCase() + player.slice(1).toLowerCase();

  // Set our metric
  let metric = args[1];
  if (!metric) {
    metric = 'dps';
  }

  // Set our partition -- Phase 3 is current default.
  let partition = 3;

  // Allow the user to overwrite
  if (args[2]) {
    partition = args[2];
  }

  if (metric == "tank") {
    metricDisplay = "Tanking";
  } else if (metric == "hps") {
    metricDisplay = "Healing";
  } else {
    metricDisplay = "DPS"
  }

  let returnTitle = "Best " + metricDisplay + " Parses: **" + player + "** (" + server + " " + region + ")\n";

  getParses(zones, 0);

  function getParses(parseZones, returnParses) {
    let searchUrl = "https://classic.warcraftlogs.com:443/v1/rankings/character/" + player + "/" + server + "/" + region + "?api_key=" + client.config.warcraftlogs;
    if (!player) {
      return message.channel.send('Please add a valid player name, eg "+rankings Taunt"');
    }

    let isTank = false;
    if (metric.toLowerCase() == 'tank') {
      searchMetric = 'dps';
      isTank = true;
    } else {
      searchMetric = metric;
    }

    // Include partition, metric, zone & timeframe
    searchUrl += '&partition=' + partition;
    searchUrl += '&metric=' + searchMetric;
    searchUrl += '&zone=' + parseZones.shift();
    searchUrl += '&timeframe=historical';

    if (returnParses >= 2) {
      return false;
    }

    // Set our encoded URL
    reqOpts = {
      url: encodeURI(searchUrl)
    };
    try {
      request(reqOpts, function (err, resp, html) {
        if (err) {
          return;
        }
        try {
          logs = JSON.parse(resp.body);
        } catch (e) {
          console.log(e);
          return false;
        }
        if (logs.length) {
          returnData = '```\n';
          returnData += ''.padEnd(98, '-') + '\n';
          returnData += 'boss'.padEnd(35);
          returnData += searchMetric.padEnd(11);
          returnData += '%'.padEnd(8);
          returnData += 'ilvl'.padEnd(6);
          returnData += 'rank'.padEnd(20);
          returnData += 'date'.padEnd(10);
          returnData += '\n';
          returnData += ''.padEnd(98, '-') + '\n';

          let returnLines = 0;
          let rankingTotal = 0;
          let rankingCount = 0;
          logs.forEach(function (log) {
            if ((isTank && log.spec.toLowerCase() == 'tank')
              || (!isTank && metric.toLowerCase() != 'hps' && log.spec.toLowerCase() != 'tank' && log.spec.toLowerCase() != 'healer')
              || (metric.toLowerCase() == 'hps' && log.spec.toLowerCase() == 'healer')) {

              returnLines++;
              let ranking = log.rank + ' of ' + log.outOf;
              let encounter = log.encounterName;
              let logDate = new Date(log.startTime);
              logDate = moment(logDate).format('ll');
              logDate = logDate.split(" ");

              if (isTank) { encounter + ' (tank)'; }
              returnData += encounter.toString().padEnd(35);
              returnData += log.total.toString().padEnd(11);
              returnData += log.percentile.toPrecision(3).toString().padEnd(8);
              returnData += log.ilvlKeyOrPatch.toString().padEnd(6);
              returnData += ranking.padEnd(20);
              returnData += logDate[0] + " " + logDate[1].padEnd(4) + logDate[2];
              returnData += '\n';
              rankingTotal += log.percentile;
              rankingCount ++;
            }
          });

          // Calculate the player's average ranking for this raid
          let averageRanking = (rankingTotal/rankingCount).toPrecision(3);

          returnData += ''.padEnd(98, '-') + '\n';
          returnData += 'Average Ranking'.padEnd(46) + averageRanking.toString()  + '\n';
          returnData += '```';
          if (returnLines) {
            if (returnTitle) {
              returnData = returnTitle + returnData;
              returnTitle = "";
            }
            message.channel.send(returnData);
            returnParses++;
          }
        }

        // Continue to next zone if it exists.
        if (zones.length) {
          getParses(zones, returnParses);
        } else {
          if (!returnParses) {
            return message.channel.send('We couldn\'t find any parses for ' + player + ' on ' + server + ' ' + region + ' for metric "' + metric + '"');
          }

        }
      });
    } catch (e) {
      console.log(e);
    }
  }
};
