var request = require('request');
var moment = require('moment');

exports.run = (client, message, args) => {

  message.delete();

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
  let partition = 2;

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

  let zone = 1002; // BWL
  getPerformance(zone);

  function getPerformance(zone) {
    let searchUrl = "https://classic.warcraftlogs.com:443/v1/parses/character/" + player + "/" + server + "/" + region + "?api_key=" + client.config.warcraftlogs;
    if (!player) {
      return message.channel.send('Please add a valid player name, eg "+performance Taunt"');
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
    searchUrl += '&zone=' + zone;
    searchUrl += '&timeframe=historical';

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
        let reports = {};
        logs.forEach((encounter) => {
            if (!reports[encounter.reportID])
                reports[encounter.reportID] = [];

            reports[encounter.reportID].push(encounter);
        });

        returnString = '-\n```';
        for (key in reports) {
            report = reports[key];
            console.log('loop');
            console.log(report);
            report.forEach((encounter) => {
                console.log(encounter);
                returnString += Math.round(encounter.percentile).toString().padEnd(20)
            })
            returnString += '\n';
        };
        returnString += '```\n';
        message.channel.send(returnString);
        
      });
    } catch (e) {
      console.log(e);
    }
  }
};
