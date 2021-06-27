var request = require('request');
var moment = require('moment');
const Discord = require("discord.js");
const slots = [
    'Head', // 0
    'Neck', // 1
    'Shoulders', //2
    'Shirt', // 3
    'Chest', // 4
    'Belt', // 5
    'Legs', // 6
    'Boots', // 7
    'Bracers', // 8
    'Gloves', // 9
    'Rings', // 10
    'Rings', // 11
    'Trinkets', // 12
    'Trinkets', // 13
    'Cloak', // 14
    'Main Hand', // 15
    'Off Hand', // 16
    'Ranged', // 17
    'Tabard', // 18
];

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

  async function getGear(apiData) {
    let gearList = {};
    // Organize our gear by slot
    for (key in apiData.data) {
      let fight = apiData.data[key];
      for (gearKey in fight.gear) {
        let gear = fight.gear[gearKey];
        if (gear.itemName) {
          if (gear.itemName == 'Unknown') {
            let itemInfo = await client.nexushub.itemID(gear.id);
            gear.itemName = itemInfo.name;
            // Save our item info for next time!
            client.models.item.create({name: itemInfo.name, id: itemInfo.id, slot: slots.indexOf(gear.slot)});
          }
          if (!gearList[gear.slot]) {
            gearList[gear.slot] = [];
          }
          gear.link = '[' + gear.itemName + '](' + 'https://tbc.wowhead.com/item=' + gear.id + ')';
          if (gearList[gear.slot].indexOf(gear.link) < 0) {
            gearList[gear.slot].push(gear.link);
          }
        }
      }
    }
    return gearList;
  }

  async function displayData(apiData) {
    let embed = new Discord.MessageEmbed()
      .setTitle(player)
      .setColor(0x02a64f);

    let gearList = await getGear(apiData);

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
