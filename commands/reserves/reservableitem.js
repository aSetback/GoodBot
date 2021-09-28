const { Op } = require("sequelize");

// Add a new reservable item to the raid db
exports.run = async function(client, message, args) {

    if (!client.permission.manageReserves(message.member)) {
		return message.channel.send('**Error:** You need permission to be able to add items to the reservable items list.');
	}


    if (!args[0]) {
        return message.channel.send('**Error:** Correct usage is ``+reservableitem add 30024 TK Mantle of the Elven Kings``');
    };


    let addOrRemove = args.shift().toLowerCase();

    if (addOrRemove !== 'add' && addOrRemove !== 'remove') {
        return message.channel.send('**Error:** Must specify **ADD** or **REMOVE**!')
    };


    let record = {
        'itemID': parseInt(args.shift()),
        'raid': args.shift().toUpperCase(),
        'name': args.join(' ')
    };


    let validRaidList = ['MC', 'BWL', 'Ony', 'ZG', 'AQ20', 'AQ40', 'Naxx', 'GL', 'Kara', 'ML', 'SSC', 'TK'];

    if (!validRaidList.includes(raid)) {
        return message.channel.send('**Error:** Must be a valid raid ID (MC, BWL, Ony, ZG, AQ20, AQ40, Naxx, GL, Kara, ML, SSC, TK)')
    }


    if (isNaN(record.itemID)) {
        return message.channel.send('**Error:** Invalid item number!');
    };


    if (addOrRemove === "add") {
        // Check if item name or item number already exists under that raid name
        client.models.reserveItem.findOne({
                where: {
                    [Op.and]: [
                    {   raid: record.raid,
                        [Op.or]: [
                            {name: record.name}, {itemID: record.itemID}
                            ]
                    }]
            }
        }).then((item) => {
            if (!item)  {
                client.models.reserveItem.create(record);
                message.channel.send('Item created: ' + record.name);
            } else  {
                return message.channel.send(`**Error:** Cannot create item: '${item.itemID} ${item.name}' already exists!`);
            };
        });
    
    } else if (addOrRemove === "remove") {
        client.models.reserveItem.findOne({where: {name: record.name, raid: record.raid}}).then((item) => {
            if (item)  {
                item.destroy();
                return message.channel.send('Item destroyed: ' + record.name);
            }
        });
    };
};