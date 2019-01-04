const Discord = require("discord.js");
const Enmap = require("enmap");
const fs = require("fs");
const client = new Discord.Client();
const config = require("./config.json");
const https = require("https");
const emojiFile = '/tmp/emojis.json';

client.embedTitles = [];
client.config = config;

client.on('raw', packet => {
	client.reaction.rawEvent(client, packet);
});

fs.readdir("./functions/", (err, files) => {
  if (err) return console.error(err);
  files.forEach(file => {
    const loadedFunction = require(`./functions/${file}`);
    let functionName = file.split(".")[0];
    console.log('Loading function: ' + functionName);
    client[functionName] = loadedFunction;
  });
	
})

fs.readdir("./events/", (err, files) => {
  if (err) return console.error(err);
  files.forEach(file => {
    const event = require(`./events/${file}`);
    let eventName = file.split(".")[0];
    console.log('Loading event: ' + eventName);
    client.on(eventName, event.bind(null, client));
  });
});

client.commands = new Enmap();

fs.readdir("./commands/", (err, files) => {
  if (err) return console.error(err);
  files.forEach(file => {
    if (!file.endsWith(".js")) return;
    let props = require(`./commands/${file}`);
    let commandName = file.split(".")[0];
    console.log('Loading command: ' + commandName);
    client.commands.set(commandName, props);
  });
});

client.login(config.token);
