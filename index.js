const Discord = require("discord.js");
const Enmap = require("enmap");
const fs = require("fs");
const client = new Discord.Client();

// Make our config available throughout all the files.
client.config = require("./config.json");

const Sequelize = require('sequelize');

// Initialize DB
client.sequelize = new Sequelize(client.config.db.name, client.config.db.user, client.config.db.pass, {
    host: client.config.db.ip,
    dialect: 'mariadb'
});

// Add the functions from the /functions folder
let functions = [];
fs.readdir("./functions/", (err, files) => {
  if (err) return console.error(err);
  files.forEach(file => {
    const loadedFunction = require(`./functions/${file}`);
    let functionName = file.split(".")[0];
    functions.push(functionName);
    client[functionName] = loadedFunction;
  });
  console.log('Loaded ' + functions.length + ' functions. (' + functions.join(', ') + ')');
})

// Load models
let models = [];
client.models = {};
fs.readdir("./models/", (err, files) => {
  if (err) return console.error(err);
  files.forEach(file => {
    let modelName = file.split(".")[0];
    client.models[modelName] = require(`./models/${file}`)(client, Sequelize);
    models.push(modelName);
  });
  console.log(client.models);
  console.log('Loaded ' + models.length + ' models. (' + models.join(', ') + ')');
})


// Add the events from the /events folder
let events = [];
fs.readdir("./events/", (err, files) => {
  if (err) return console.error(err);
  files.forEach(file => {
    const event = require(`./events/${file}`);
    let eventName = file.split(".")[0];
    events.push(eventName);
    client.on(eventName, event.bind(null, client));
  });
  console.log('Loaded ' + events.length + ' events. (' + events.join(', ') + ')');
});

// Add the commands from the /commands folder
client.commands = new Enmap();
let commands = [];
let commandDir = './commands/';
fs.readdir(commandDir, (err, files) => {
  if (err) return console.error(err);
  // Look for directories within the parent directory
  files.forEach(directory => {
    if (fs.lstatSync(commandDir + directory).isDirectory()) {
      fs.readdir(commandDir + directory, (err, subFiles) => {
        let subcommands = [];
        if (err) return console.error(err);
        subFiles.forEach(subFile => {
          if (!subFile.endsWith(".js")) return;
          let props = require(commandDir + directory + '/' + subFile);
          let commandName = subFile.split(".")[0];
          subcommands.push(commandName);
          client.commands.set(commandName, props);
        });
        console.log('Loaded ' + subcommands.length + ' ' + directory + ' sub-commands. (' + subcommands.join(', ') + ')');
      });
    }
  });

  files.forEach(file => {
    if (!file.endsWith(".js")) return;
    let props = require(`./commands/${file}`);
    let commandName = file.split(".")[0];
    commands.push(commandName);
    client.commands.set(commandName, props);
  });
  console.log('Loaded ' + commands.length + ' commands. (' + commands.join(', ') + ')');
});

client.login(client.config.token);
