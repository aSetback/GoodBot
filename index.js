const { Client, GatewayIntentBits } = require('discord.js');
const { ActionRowBuilder , ButtonBuilder } = require('discord.js');
const Enmap = require("enmap");
const fs = require("fs");
const client = new Client({ intents: [
  GatewayIntentBits.Guilds,
  GatewayIntentBits.GuildVoiceStates,
]}); // Creating discord.js client (constructor)

client.buttons = {};
client.buttons.yes = new ButtonBuilder()
  .setStyle('Success')
  .setLabel('Yes') 
  .setCustomId('+');
client.buttons.no = new ButtonBuilder()
  .setStyle('Danger')
  .setLabel('No') 
  .setCustomId('-');
client.buttons.maybe = new ButtonBuilder()
  .setStyle('Secondary')
  .setLabel('Maybe') 
  .setCustomId('m');
client.buttons.reserves = new ButtonBuilder()
  .setStyle('Link')
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

process.on('unhandledRejection', error => {
	console.error('Unhandled promise rejection:', error);
});

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
});

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

// Allow slash commands to be registered
client.slashCommands = new Enmap();
fs.readdir('./slashcommands', (err, files) => {
  if (err) return console.error(err);

  // Look for directories within the parent directory
  let slashCmdDir = './slashcommands/';
  console.log('-- Loading Slash Commands');
  files.forEach(directory => {
    if (fs.lstatSync(slashCmdDir + directory).isDirectory()) {
      fs.readdir(slashCmdDir + directory, (err, subFiles) => {
        let slashCommands = [];
        if (err) return console.error(err);
        subFiles.forEach(subFile => {
          if (!subFile.endsWith(".js")) return;
          let slashCommand = require(slashCmdDir + directory + '/' + subFile);
          let slashCommandName = subFile.split(".")[0];
          slashCommands.push(slashCommandName);
          client.slashCommands.set(slashCommandName, slashCommand);
        });
        console.log('    > ' + directory.padEnd(15) + ' =>  ' + slashCommands.join(', '));
      });
    }
  });
});

client.on('ready', () => {
  // Add listener for set-up channels
  client.setup.run(client);
});

client.login(client.config.token);
