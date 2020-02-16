const fs = require("fs");
const Discord = require("discord.js");


exports.run = (client, message, args) => {
	if (!message.guild) {
		return false;
	}

	let role = message.guild.roles.find(role => role.name === 'Black Lotus Mafia');
	if (!role) {
		return false;
	}	
	
	message.delete().catch(O_o=>{}); 
	if (!args[0] || !args[1]) {
		return false;
	}

	const zone = args[0].toLowerCase();
	const time = args[1].split(':');

	const validZones = {
		'ws': 'Winterspring', 
		'bs': 'Burning Steppes', 
		'si': 'Silithus', 
		'ep': 'Eastern Plaguelands'
	};

	if (!(zone in validZones)) {
		return message.channel.send(zone + ' is not a valid zone.');
	}
	
	if (!time[0] || !time[1]) {
		return message.channel.send('Invalid time.  Please use format: 12:52');
	}

	let date = new Date();
	let date2 = new Date();
	let difference = date.getTime() - date2.getTime();

	if (difference < 0) {
		return message.channel.send("I'm sorry, but you can't pick black lotus in the future, " + message.author);
	}

	if (difference > 45 * 60 * 1000) {
		return message.channel.send("Please only report only Black Lotus that have been picked in the last 45 minutes.");
	}

	date2.setHours(time[0]);
	date2.setMinutes(time[1]);

	let twelveHours = (12 * 60 * 60 * 1000); 
	if (difference > twelveHours) {
		difference = difference - twelveHours;
	}

	let startWindow = timeAdd(time, 45);
	let endWindow = timeAdd(time, 75);

	let seconds = difference / 1000;

	message.channel.send('Black Lotus was looted in ' + validZones[zone] + ' by ' + message.author + ' at ' + time[0] + ':' + time[1] + '.  Next window is ' + startWindow + ' => ' + endWindow + '.');
	setTimeout(function() {
		message.channel.send(role + ' -- Black Lotus window has begun in ' + validZones[zone] + '.');
	}, 45 * 60 * 1000 - difference);


	function timeAdd(time, minutes) {
		let totalMinutes = parseInt(time[1]) + parseInt(minutes);
		let addHours = Math.floor(totalMinutes / 60);
		let remainMinutes = totalMinutes % 60;
		let hours = parseInt(time[0]) + addHours;
		if (hours > 12) {
			hours -= 12;
		}
		if (remainMinutes < 10) {
			remainMinutes = '0' + remainMinutes;
		}
		return hours + ':' + remainMinutes;
	}


}; 