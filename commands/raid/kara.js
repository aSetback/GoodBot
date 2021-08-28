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
  response += 'Karazhan Parses\n';
  response += ''.padEnd(32, '-') + '\n';
  let total = 0;
  for (key in apiData) {
    response += key.padEnd(20) + apiData[key] + '\n';
    total += apiData[key];
  }
  response += ''.padEnd(32, '-') + '\n';
  response += 'average'.padEnd(20) + (total / 9).toFixed(2);
  response += '```';
  return message.channel.send(response);


}
