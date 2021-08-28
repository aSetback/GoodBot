var request = require('request');
const Discord = require("discord.js");
const { karaParse } = require('../../functions/wcl');

exports.run = async (client, message, args) => {

  let server = 'Mankrik';
  let region = 'US';
  let raid = await client.raid.get(client, message.channel);
  if (!raid) {
    return message.channel.send('This command can only be run from a raid channel!');
  }
  let bestAverage = await getParses(client, raid, server, region);
  let response = '```\n';
  response += 'Best Karazhan Parses\n';
  response += ''.padEnd(28, '-') + '\n';
  for (key in bestAverage) {
    response += key.padEnd(15) + bestAverage[key] + '\n';
  }
  response += ''.padEnd(28, '-') + '\n';
  response += '```';
  return message.channel.send(response);

}

async function getParses(client, raid, server, region) {
  let promise = new Promise(async (resolve, reject) => {
    let bestAverage = {};
    for (key in raid.signups) { 
      let signup = raid.signups[key];
      let player = signup.player;
      if (signup.character.role == 'dps' || signup.character.role == 'caster') {
        let apiData = await client.wcl.karaParse(client, player, server, region);
        let total = 0;
        for (key in apiData) {
          total += apiData[key];
        }
        let avg = (total/9).toFixed(2);
        bestAverage[player] = avg;
      }
    }
    resolve(bestAverage);
  });
  return promise;
}