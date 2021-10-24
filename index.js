const { Client, Intents } = require('discord.js');
const { MessageActionRow, MessageButton } = require('discord.js');
const Enmap = require("enmap");
const fs = require("fs");
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGE_REACTIONS, Intents.FLAGS.GUILD_MESSAGES] }); // Creating discord.js client (constructor)
client.buttons = {};
client.buttons.yes = new MessageButton()
  .setStyle('SUCCESS')
  .setLabel('Yes') 
  .setCustomId('+');
client.buttons.no = new MessageButton()
  .setStyle('DANGER')
  .setLabel('No') 
  .setCustomId('-');
client.buttons.maybe = new MessageButton()
  .setStyle('SECONDARY')
  .setLabel('Maybe') 
  .setCustomId('m');
client.buttons.reserves = new MessageButton()
  .setStyle('LINK')
  .setLabel('Reserves')
  .setURL('https://goodbot.me/r/');


// Our music
client.queue = {};

// Embed holder
client.embeds = {};

// Guild Options
client.guildOptions = {};

// Make our config available throughout all the files.
client.config = require("./config.json");

client.loc = function (key, defaultText) {
  return defaultText;
};

const Sequelize = require('sequelize');

// Initialize DB
client.sequelize = new Sequelize(client.config.db.name, client.config.db.user, client.config.db.pass, {
  host: client.config.db.ip,
  dialect: 'mariadb',
  dialectOptions: {
    timezone: "Etc/GMT-5",
    bigNumberStrings: true,
    supportBigNumbers: true
  },
  logging: false
});

// Add the functions from the /functions folder
let functions = [];
fs.readdir("./functions/", (err, files) => {
  if (err) return console.error(err);
  console.log('-- Loading Functions');
  files.forEach(file => {
    const loadedFunction = require(`./functions/${file}`);
    let functionName = file.split(".")[0];
    functions.push(functionName);
    client[functionName] = loadedFunction;
  });
  console.log('    > ' + functions.join(', '));
})



// Load models
let models = [];
client.models = {};
fs.readdir("./models/", (err, files) => {
  if (err) return console.error(err);
  console.log('-- Loading Models');

  files.forEach(file => {
    let modelName = file.split(".")[0];
    client.models[modelName] = require(`./models/${file}`)(client, Sequelize);
    models.push(modelName);
  });

  // Associations
  client.models.raidReserve.belongsTo(client.models.signup, { as: 'signup', foreignKey: 'signupID', constraints: false  });
  client.models.raidReserve.belongsTo(client.models.reserveItem, { as: 'item', foreignKey: 'reserveItemID', constraints: false });
  client.models.raid.hasMany(client.models.signup, { as: 'signups', foreignKey: 'raidID', constraints: false });
  client.models.raid.hasMany(client.models.raidLeader, { as: 'leaders', foreignKey: 'raidID', constraints: false });
  client.models.signup.belongsTo(client.models.raid);
  client.models.signup.belongsTo(client.models.character, { as: 'character', foreignKey: 'characterID', constraints: false});
  client.models.signup.hasOne(client.models.raidReserve, { as: 'reserve', foreignKey: 'signupID', constraints: false  });
  client.models.wowGuild.hasMany(client.models.wowGuildMaster, { as: 'gm', foreignKey: 'wowGuildID', constraints: false });
  client.models.wowGuild.hasMany(client.models.wowOfficer, { as: 'officer', foreignKey: 'wowGuildID', constraints: false });
  console.log('    > ' + models.join(', '));
})

// Add the events from the /events folder
let events = [];
fs.readdir("./events/", (err, files) => {
  if (err) return console.error(err);

  console.log('-- Loading Events');
  files.forEach(file => {
    const event = require(`./events/${file}`);
    let eventName = file.split(".")[0];
    events.push(eventName);
    client.on(eventName, event.bind(null, client));
  });
  console.log('    > ' + events.join(', '));
});

// Add the commands from the /commands folder
client.commands = new Enmap();
let commandDir = './commands/';
fs.readdir(commandDir, (err, files) => {
  if (err) return console.error(err);
  // Look for directories within the parent directory
  console.log('-- Loading Commands');
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
        console.log('    > ' + directory.padEnd(10) + ' =>  ' + subcommands.join(', '));
      });
    }
  });
});

client.on('ready', () => {
  // Add listener for set-up channels
  client.setup.run(client);

  // Add EPGP watcher
  client.watch.run(client);
});

client.login(client.config.token);
