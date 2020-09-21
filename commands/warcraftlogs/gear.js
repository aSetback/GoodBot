var request = require('request');
var moment = require('moment');
const Discord = require("discord.js");

exports.run = async (client, message, args) => {

  let server = await client.customOptions.get(client, message.guild, 'server');
  if (!server) {
    server = 'Mankrik';
  }
  if (args[1]) {
    server = args[1];
  }

  let region = await client.customOptions.get(client, message.guild, 'region');
  if (!region) {
    region = 'US';
  }
  if (args[2]) {
    region = args[2];
  }

  let player = client.general.ucfirst(args[0]);

  getGearData(player, server, region);

  function getGearData(player, server, region) {
    let searchUrl = "https://goodbot.me/api/gear/" + player + "/" + server + "/" + region + "?id=" + client.config.goodbot.id + "&key=" + client.config.goodbot.key;
    if (!player) {
      return message.channel.send('Please add a valid player name, eg "+gear Taunt"');
    }
    reqOpts = {
      url: encodeURI(searchUrl)
    };

    request(reqOpts, function (err, resp, html) {
      if (err) {
        return;
      }
      let apiData = JSON.parse(resp.body);

      if (apiData.error) {
        return message.channel.send(apiData.error);
      }
      displayData(apiData);

    });
  }

  function displayData(apiData) {
    let embed = new Discord.RichEmbed()
      .setTitle(player)
      .setColor(0x02a64f);

    let gearList = {};
    // Organize our gear by slot
    apiData.data.forEach(function(fight) {
        fight.gear.forEach(function(gear) {
            if (gear.itemName) {
                if (!gearList[gear.slot]) {
                    gearList[gear.slot] = [];
                }
                gear.link = '[' + gear.itemName + '](' + 'https://classic.wowhead.com/item=' + gear.id + ')';
                if (gearList[gear.slot].indexOf(gear.link) < 0) {
                    gearList[gear.slot].push(gear.link);
                }
            }
        });
    });

    for (slot in gearList) {
      let gear = gearList[slot];
      if (gear.join().trim().length) {
        embed.addField('**' + slot + '**', gear.join('\n'), true);
      }
    }

    embed.setFooter('Last seen: ' + apiData.raidTime.split(' ')[0]);
      return message.channel.send(embed);
    }
  }
