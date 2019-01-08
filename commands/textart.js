const fs = require("fs");
const text2png = require('text2png');
const Discord = require("discord.js");

exports.run = (client, message, args) => {
	let color = args.shift();
	if (!color) { return false; }
	let text = args.join(' ');
	if (!text) { return false; }
	fs.writeFileSync('./img/text2png.png', text2png(text, {
		color: color,
		font: '50px Alex Brush',
		localFontPath: 'fonts/AlexBrush-Regular.ttf',
		localFontName: 'Alex Brush',
		padding: 20
	}));
	message.channel.send('', {files: ['./img/text2png.png']});
}