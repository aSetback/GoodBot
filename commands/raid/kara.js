var request = require('request');
const Discord = require("discord.js");

exports.run = async (client, message, args) => {
  let player = args.shift();
  let server = args.shift();
  let region = args.shift();

  if (!player) {
    return message.channel.send('A valid player name is required for this command.');
  }
  if (!server) { server = 'Mankrik'; }
  if (!region) { region = 'US'; }

  let apiData = await client.wcl.karaParse(client, player, server, region);
  if (apiData.error) {
    return message.channel.send(apiData.error);
  }
  let response = '```\n';
  response += 'Karazhan Parses' + ' - ' + client.general.ucfirst(player) + '\n';
  response += ''.padEnd(32, '-') + '\n';
  let bossTotal = 0;
  let bossCount = 0;
  for (key in apiData) {
    response += key.padEnd(20) + apiData[key] + '\n';
    bossCount++;
    bossTotal += apiData[key];
  }
  response += ''.padEnd(32, '-') + '\n';
  response += 'average'.padEnd(20) + (bossTotal / bossCount).toFixed(2);
  response += '```';
  return message.channel.send(response);


}
