const Discord = require("discord.js");
const Enmap = require("enmap");
const fs = require("fs");
const client = new Discord.Client();

// Make our config available throughout all the files.
client.config = require("./config.json");

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

console.log('============================================================================')
console.log('[' + client.timestamp() + '] ' + client.config.botname + ' is starting.');
console.log('============================================================================')

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

// Add a reaction listener for sign-ups
client.on('raw', packet => {
  client.reaction.rawEvent(client, packet);
});


client.on('ready', () => {
  // Add listener for set-up channels
  client.setup.run(client);
});

client.login(client.config.token);
