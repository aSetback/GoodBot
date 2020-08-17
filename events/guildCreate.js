module.exports = async (client, guild) => {
    let owner = client.users.find(u => u.id == guild.ownerID);
    owner.send('Thank you for choosing GoodBot!  \nTo set up your server, please visit this link: http://goodbot.me/dashboard/setup/' + guild.id + '\nFor support, please join our discord: http://discord.goodbot.me');
};