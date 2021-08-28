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
  let players = [];
  raid.signups.forEach((signup) => {
    if (signup.character.role == 'caster' || signup.character.role == 'dps') { 
      players.push(signup.player);
    }
  });

  if (!players.length) {
    return message.channel.send('No dps found.');
  }

  let bestAverage = await client.wcl.karaMultiParse(client, players, server, region);
  let response = '```\n';
  response += 'Best Karazhan Parses\n';
  response += ''.padEnd(28, '-') + '\n';
  for (key in bestAverage) {
    response += key.padEnd(15) + bestAverage[key].toFixed(2) + '\n';
  }
  response += ''.padEnd(28, '-') + '\n';
  response += '```';
  return message.channel.send(response);

}
