const { Op } = require('sequelize');

exports.run = (client, message, args) => {
    if (!message.isAdmin) {
        return false;
    }
    
    let reserveCmd = client.commands.get('reserve');
    client.models.log.findAll({where: {event: {[Op.like]: '%+reserve %'}}, order: [['id', 'ASC']] }).then(async (reserves) => {
        for (key in reserves) {
            let reserve = reserves[key];
            let events = reserve.event.split(': ');
            let reserveMsg = events[1].split(' / ')[0];
            let args = reserveMsg.split(' ');
            let channel = events[3].split(' ')[0];
            args.shift();
            message.guild = client.guilds.find(g => g.id == reserve.guildID);
            channel = message.guild.channels.find(c => c.name == channel);
            message.channel = channel;
            message.author = client.users.find(m => m.id == reserve.memberID);
            message.content = reserveMsg;
            await reserveCmd.run(client, message, args, true);
        }
    });


}