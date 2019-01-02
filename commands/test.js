const Discord = require("discord.js");

exports.run = (client, message, args) => {
	const embed = new Discord.RichEmbed()
  .setTitle("It looks like you're having trouble signing up.")
  .setColor(0x00AE86)
  .setDescription("Would you like some help?")
  .setImage("https://i.gifer.com/origin/c6/c6afab251a20e6d0eb80b983450bc66e_w200.gif")

  message.author.send({embed});
}