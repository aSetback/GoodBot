exports.run = async function(client, message, args) {
	let raid = await client.signups.getRaid(client, message.channel);
    client.models.raidReserve.belongsTo(client.models.signup, {as: 'signup', foreignKey: 'signupID'});
   
    let includes = [
        {model: client.models.signup, as: 'signup'},
    ];
    
    client.models.raidReserve.findAll({where: {RaidID: raid.id}, include: includes}).then((raidReserves) => {
        let returnMessage = '';
        raidReserves.forEach((reserve) => {
            if (!returnMessage.length) {
                returnMessage = '-\n```md\n';
                returnMessage += '__Player__'.padEnd(20) + '__Item__' + '\n';
            }
            returnMessage += reserve.signup.player.padEnd(20) + reserve.item.name + '\n';
            if (returnMessage.length > 1800) {
                returnMessage += '```';
                message.channel.send(returnMessage);    
                returnMessage = '';
            }
        });
        if (returnMessage.length) {
            returnMessage += '```';
            message.channel.send(returnMessage);    
        }
    });
};