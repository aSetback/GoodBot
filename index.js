const Discord = require("discord.js");
const Enmap = require("enmap");
const fs = require("fs");
const client = new Discord.Client();

// Make our config available throughout all the files.
const config = require("./config.json");
client.config = config;

// Create an empty array of embedTitles, used for the class assignment reactions.
client.embedTitles = [];


// Add a listener
client.on('raw', packet => {
	client.reaction.rawEvent(client, packet);
});

// Add the functions from the /events folder
fs.readdir("./functions/", (err, files) => {
  if (err) return console.error(err);
  files.forEach(file => {
    const loadedFunction = require(`./functions/${file}`);
    let functionName = file.split(".")[0];
    console.log('Loading function: ' + functionName);
    client[functionName] = loadedFunction;
  });
	
})

// Add the events from the /events folder
fs.readdir("./events/", (err, files) => {
  if (err) return console.error(err);
  files.forEach(file => {
    const event = require(`./events/${file}`);
    let eventName = file.split(".")[0];
    console.log('Loading event: ' + eventName);
    client.on(eventName, event.bind(null, client));
  });
});

// Add the commands from the /commands folder
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
