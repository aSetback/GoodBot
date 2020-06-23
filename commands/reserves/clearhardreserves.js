const Sequelize = require('sequelize');
const Op = Sequelize.Op;

exports.run = async function (client, message, args, noMsg) {

    // Check for management permission
    if (!client.permission.manageChannel(message.member, message.channel)) {
		return false;
    }

    let raid = await client.signups.getRaid(client, message.channel);
    if (!raid) {
        return false;
    }

    let clear = await clearHardReserves(client, raid);

    (clear) ? () => 
        {
            message.author.send('```diff\n--- Hard Reserve list for **' + message.channel.name + '**  have been erased```');
        } : ()=>{return};
    
    return
}


function clearHardReserves(client, raid) {

    let promise = new Promise((resolve, reject) => {
        client.models.raidHardReserve.destroy({ where: { raidID: raid.id } }).then(resolve(true));
    });
    return promise;
}