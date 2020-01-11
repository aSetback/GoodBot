const fs = require("fs");

exports.run = (client, message, args) => {
	message.delete();
	const specs = ['Protection', 'Fury', 'Arms', 'Feral', 'Restoration', 'Balance', 'Protection', 'Holy', 'Retribution', 'Shadow', 'Discipline', 'Holy', 'Destruction', 'Affliction', 'Demonology', 'Marksmanship', 'Beast Mastery', 'Survival', 'Subtlety', 'Assassination', 'Combat', 'Frost', 'Fire', 'Arcane'];

	const epgpPath = "f:/epgp/";
	if (!args[0]) {
		return message.channel.send('Please provide one or more classes for a standings look-up.');
	}
	args.forEach((argClass, key) => {
		args[key] = argClass.charAt(0).toUpperCase() + argClass.slice(1).toLowerCase();
	});

	let files = fs.readdirSync(epgpPath);
	let fileList = [];
	files.forEach((file) => {
		let stats = fs.statSync(epgpPath + file);
		let mtime = stats.mtime;
		fileList.push({
			'file': file, 
			'modified': mtime
		});
	});

	fileList.sort(function(a, b) {
		return a.modified > b.modified ? -1 : 1;
	});

	let latestFile = fileList[0];
	let standings 	= fs.readFileSync(epgpPath + latestFile.file, 'utf8');
	let parsed = [];
	try {
		parsed = JSON.parse(standings);
	} catch (e) {
		console.error(e);
	}

	let classStandings = [];
	parsed.forEach((standing) => {
		if (args.indexOf(standing.class) >= 0) {
			classStandings.push(standing);
		}
	});
	
	let returnMessage = "";
	classStandings.forEach((classStanding) => {
		if (!returnMessage.length) {
			returnMessage += "```\n"
			returnMessage += "Name".padEnd(20) + "Class/Spec".padEnd(25) + "EP".padEnd(15) + "GP".padEnd(15) + "PR".padEnd(15) + "\n";
		}
		let spec = specs.indexOf(classStanding.spec) >= 0 ? classStanding.spec + " " : "";
		returnMessage += classStanding.player.padEnd(20) + (spec + classStanding.class).padEnd(25) + classStanding.ep.padEnd(15) + classStanding.gp.padEnd(15) + classStanding.pr.padEnd(15) + "\n";
		if (returnMessage.length > 1500) {
			returnMessage += '```';
			message.author.send(returnMessage);
			returnMessage = '';
		}
	});
	if (returnMessage.length) {
		returnMessage += "```";
		message.author.send(returnMessage);
	}
}