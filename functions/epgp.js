const fs = require("fs");
const Discord = require("discord.js");

module.exports = {
	update: (client, guild, file) => {
		// Read our SavedVariables file
		epgpData = fs.readFileSync(file, 'utf8');

		// Split the lua file up into lines
		epgpLines = epgpData.split('\n');

		let channel = guild.channels.find(channel => channel.name === "standings");
		if (!channel) {
			console.log('EPGP channel does not exist for ' + guild.name);
			return false;
		}
		
		// Loop through the lines, find the one that has the standings.
		let standings = '';
		for (key in epgpLines) {
			let epgpLine = epgpLines[key];
			if (epgpLine.indexOf('GoodEPGPStandings = ') >= 0) {
				standings = epgpLine.replace(/\\"/g, '"');
			}
		}

		standings = standings.substr(21, standings.length - 23);
		try {
			standings = JSON.parse(standings);
		} catch (e) {
			console.log('Invalid json content.');
			return false;
		}

		channel.fetchMessages({limit: 20})
		   .then(function(list){
				channel.bulkDelete(list);

				let returnMsg = '';

				for (key in standings) {
					if (returnMsg.length > 1700) {
						returnMsg += '```';
						channel.send(returnMsg);
						returnMsg = '';
					}

					if (!returnMsg) {
						returnMsg = '```md\n';
						returnMsg += '__Player__'.padEnd(25);
						returnMsg += '__Level/Class__'.padEnd(30);
						returnMsg += '__EP__'.padEnd(20);
						returnMsg += '__GP__'.padEnd(20);
						returnMsg += '__PR__'.padEnd(20) + '\n';	
					}

					let standing = standings[key];
					let spec = standing.spec;
					if (client.config.validSpecs.indexOf(spec) < 0) {
						spec = '';
					} else {
						spec += ' ';
					}
					
					returnMsg += standing.player.padEnd(25);
					returnMsg += ('Level ' + standing.level + ' ' + spec + standing.class).padEnd(30);
					returnMsg += standing.ep.toString().padEnd(20);
					returnMsg += standing.gp.toString().padEnd(20);
					returnMsg += standing.pr.toString().padEnd(20) + '\n';
				}
				returnMsg += '```';
				channel.send(returnMsg);
			});
	},
	parseFile: (client, file) => {
		let fileParts = file.split('-');
		let fileTime = new Date();
		let standings = fs.readFileSync(file, 'utf8');
		let jsonParse = '';
		try {
			jsonParse = JSON.parse(standings);
		} catch (e) {
			console.log('Invalid json content.');
			return false;
		}

		fileTime.setMonth(parseInt(fileParts[2]) - 1);
		fileTime.setDate(fileParts[3]);
		fileTime.setFullYear(fileParts[4]);
		fileTime.setHours(fileParts[5]);
		fileTime.setMinutes(fileParts[6]);
		fileTime.setSeconds(fileParts[7]);
		let createdAt = fileTime.toISOString().slice(0, 19).replace('T', ' ');
		console.log(createdAt);
		let guildID = 0;
		if (!fileParts[8]) {
			if (standings.indexOf('Taunt') != -1) {
				guildID = 581817176915181568;
			}
			if (standings.indexOf('Memerlord') != -1) {
				guildID = 379733719952654337;
			}
		} else {
			guildID = parseInt(fileParts[8].split('.')[0]);
		}
		if (!guildID) {
			console.log('Unable to import file: ' + file);
			return false;
		}

		jsonParse.forEach((player) => {
			let record = {
				'player': player.player,
				'ep': parseFloat(player.ep),
				'gp': parseFloat(player.gp),
				'pr': parseFloat(player.pr),
				'class': player.class,
				'guildID': guildID,
				'createdAt': createdAt
			};
			client.models.epgp.create(record);
		});
	},
	backup: (client, guild, file) => {

		// Read our SavedVariables file
		epgpData = fs.readFileSync(file, 'utf8');

		// Split the lua file up into lines
		epgpLines = epgpData.split('\n');
		
		// Loop through the lines, find the one that has the standings.
		let standings = '';
		for (key in epgpLines) {
			let epgpLine = epgpLines[key];
			if (epgpLine.indexOf('GoodEPGPStandings = ') >= 0) {
				standings = epgpLine.replace(/\\"/g, '"');
			}
		}

		standings = standings.substr(21, standings.length - 23);

		try {
			standings = JSON.parse(standings);
		} catch (e) {
			console.log('Invalid json content.');
			return false;
		}

		let channel = guild.channels.find(channel => channel.name === "backups");
		if (!channel) {
			console.log('EPGP channel does not exist for ' + guild.name);
			return false;
		}

		let d = new Date;
		let timestamp = [
			d.getMonth()+1,
			d.getDate(),
			d.getFullYear()
		].join('-')
		+ '-' +
		[
			d.getHours(),
			d.getMinutes(),
			d.getSeconds()
		].join('-');

		let baseFilename = 'epgp-standings-' + timestamp + '-' + guild.id + '.json';
		let filename = client.config.epgpBackupFolder + '/' + baseFilename;
		fs.writeFileSync(filename, JSON.stringify(standings));

		// Write it to the db
		client.epgp.parseFile(client, filename);


		async function uploadFile(bucketName, filename) {
			// [START storage_upload_file]
			// Imports the Google Cloud client library
			const {Storage} = require('@google-cloud/storage');
		  
			// Creates a client
			const storage = new Storage();
		  
			/**
			 * TODO(developer): Uncomment the following lines before running the sample.
			 */
			// const bucketName = 'Name of a bucket, e.g. my-bucket';
			// const filename = 'Local file to upload, e.g. ./local/path/to/file.txt';
		  
			// Uploads a local file to the bucket
			await storage.bucket(bucketName).upload(filename, {
			  // Support for HTTP requests made with `Accept-Encoding: gzip`
			  gzip: true,
			  // By setting the option `destination`, you can change the name of the
			  // object you are uploading to a bucket.
			  metadata: {
				// Enable long-lived HTTP caching headers
				// Use only if the contents of the file will never change
				// (If the contents will change, use cacheControl: 'no-cache')
				cacheControl: 'public, max-age=31536000',
			  },
			});

			generateSignedUrl('epgp', baseFilename);
		  }

		uploadFile('epgp', filename);
		
		async function generateSignedUrl(bucketName, filename) {
			// Imports the Google Cloud client library
			const {Storage} = require('@google-cloud/storage');
		  
			// Creates a client
			const storage = new Storage();
		  
			// These options will allow temporary read access to the file
			const options = {
			  version: 'v2', // defaults to 'v2' if missing.
			  action: 'read',
			  expires: Date.now() + 1000 * 60 * 60 * 24 * 365 * 3, // three years
			};
		  
			// Get a v2 signed URL for the file
			const [url] = await storage
			  .bucket(bucketName)
			  .file(filename)
			  .getSignedUrl(options);
		  
			channel.send('Download Link: ' + url)
			// [END storage_generate_signed_url]
		  }

		channel.send('New epgp export: ' + baseFilename);
	},
	itemLog: (client, guild, file) => {
		let itemLog = false;
		let logLines = [];
		for (key in epgpLines) {
			let epgpLine = epgpLines[key];
			if (itemLog) {
				let cleanLine = epgpLine.split('"')
				if (cleanLine[1]) {
					logLines.push(cleanLine[1]);
				}
			}
			if (epgpLine.indexOf('GoodEPGPLoot = ') >= 0) {
				itemLog = true;
			}
			if (epgpLine.indexOf('}') >= 0) {
				itemLog = false;
			}
		}

		let channel = guild.channels.find(channel => channel.name === "item-log");
		if (!channel) {
			console.log('Item log channel does not exist for ' + guild.name);
			return false;
		}
		
		channel.fetchMessages({limit: 100})
		   .then(function(list){
				channel.bulkDelete(list);
				let message = '';
				for (key in logLines) {
					let logLine = logLines[key];
					let logSplit = logLine.split("|"); 

					let message = "[" + logSplit[0] + "]: " + logSplit[1] + " looted " + logSplit[2] + ".";
					channel.send(message);				
				}
			});
		}
}