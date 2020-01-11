const Discord = require("discord.js");
const Enmap = require("enmap");
const fs = require("fs");
const client = new Discord.Client();

// Make our config available throughout all the files.
const config = require("./config.json");
client.config = config;

// Create an empty array of embedTitles, used for the class assignment reactions.
client.embedTitles = [];

// Add timestamp functionality
client.timestamp = function() {
  var today = new Date();
  var date = today.getFullYear() + '-' + ('0' + (today.getMonth()+1)).slice('-2') + '-' + ('0' + today.getDate()).slice('-2');
  var time = ('0' + today.getHours()).slice('-2') + ":" + ('0' + today.getMinutes()).slice('-2') + ":" + ('0' + today.getSeconds()).slice('-2');
  var dateTime = date+' '+time;
  return dateTime;
}

console.clear();
console.log('[' + client.timestamp() + '] ' + client.config.botname + ' is starting.');
// Add a listener
client.on('raw', packet => {
	client.reaction.rawEvent(client, packet);
});

// Add the functions from the /events folder
var functions = [];
fs.readdir("./functions/", (err, files) => {
  if (err) return console.error(err);
  files.forEach(file => {
    const loadedFunction = require(`./functions/${file}`);
    let functionName = file.split(".")[0];
    functions.push(functionName);
    client[functionName] = loadedFunction;
  });
  console.log('[' + client.timestamp() + '] Loaded ' + functions.length + ' functions. (' + functions.join(', ') + ')');
})

// Add the events from the /events folder
var events = [];
fs.readdir("./events/", (err, files) => {
  if (err) return console.error(err);
  files.forEach(file => {
    const event = require(`./events/${file}`);
    let eventName = file.split(".")[0];
    events.push(eventName);
    client.on(eventName, event.bind(null, client));
  });
  console.log('[' + client.timestamp() + '] Loaded ' + events.length + ' events. (' + events.join(', ') + ')');
});

// Add the commands from the /commands folder
client.commands = new Enmap();
var commands = [];
fs.readdir("./commands/", (err, files) => {
  if (err) return console.error(err);
  files.forEach(file => {
    if (!file.endsWith(".js")) return;
    let props = require(`./commands/${file}`);
    let commandName = file.split(".")[0];
    commands.push(commandName);
    client.commands.set(commandName, props);
  });
  console.log('[' + client.timestamp() + '] Loaded ' + commands.length + ' commands. (' + commands.join(', ') + ')');
});

// Watch the epgp file and automatically update epgp channel on update.
// fs.watchFile(config.bankFile, {interval: 500}, (curr, prev) => {
//   let guild = client.guilds.get("581817176915181568");
//   client.bank.update(client, guild);
// });

// // Watch the epgp file and automatically update epgp channel on update.
// fs.watchFile(config.epgpFile, {interval: 5000}, (curr, prev) => {
//   let guild = client.guilds.get("581817176915181568");
//   client.epgp.update(client, guild, client.config.epgpFile);
//   client.epgp.backup(client, guild, client.config.epgpFile);
//   client.epgp.itemLog(client, guild, client.config.epgpFile);
// });

client.login(config.token);
