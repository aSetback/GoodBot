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

				let fieldCount = 0;
				let embed = new Discord.RichEmbed()
					.setTitle("EPGP Standings")
					.setColor(0x02a64f);

				for (key in standings) {
					let standing = standings[key];
					let spec = standing.spec ? standing.spec + " " : "";
					embed.addField(standing.player + ', Level ' + standing.level + ' ' + spec + standing.class, (standing.ep + " EP, " + standing.gp + " GP, ") + standing.pr + " PR");
					fieldCount++;
					if (fieldCount > 24) {
						channel.send(embed);
						fieldCount = 0;
						embed = new Discord.RichEmbed()
							.setColor(0x02a64f);					
					}
				}

				channel.send(embed);				
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

		let filename = client.config.epgpBackupFolder + 'epgp-standings-' + timestamp + '.json';
		let baseFilename = 'epgp-standings-' + timestamp + '.json';
		fs.writeFileSync(filename, JSON.stringify(standings));

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


		channel.send('New epgp export: ' + filename);

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