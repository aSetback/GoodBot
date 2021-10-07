const { Op } = require("sequelize");

// Add a new reservable item to the raid db
exports.run = async function(client, message, args) {

    if (!client.permission.isSuperAdmin(client, message.member)) {
        let errorReservableItemNoPermission = '**Error:** You need permission to be able to add items to the reservable items list.';
        return client.messages.errorMessage(message.channel, errorReservableItemNoPermission, 240);
	}


    if (!(args.length >= 3)) {
        let errorReservableItemArgLength = '**Error:** Correct usage is ``+reservableitem add 30024 TK Mantle of the Elven Kings``';
        return client.messages.errorMessage(message.channel, errorReservableItemArgLength, 240);
    };


    let addOrRemove = args.shift().toLowerCase();

    if (addOrRemove !== 'add' && addOrRemove !== 'remove') {
        let errorReservableItemADDorREMOVE = '**Error:** Must specify **ADD** or **REMOVE**!';
        return client.messages.errorMessage(message.channel, errorReservableItemADDorREMOVE, 240);
    };


    let itemID = parseInt(args.shift());

    if (isNaN(itemID)) {
        let errorReservableItemNaN = '**Error:** ItemID needs to be a number.';
        return client.messages.errorMessage(message.channel, errorReservableItemNaN, 240);
    };


    let raidID = args.shift().toUpperCase();
    let raidValidity = client.raidlist.isValidRaidID(raidID);

    if (!raidValidity.valid) {
            let errorReservableItemValidRaid = `**Error:** Must be a valid raid ID (${raidValidity.raidList.join(', ')})`;
            return client.messages.errorMessage(message.channel, errorReservableItemValidRaid, 240);
    }


    let record = {
        'itemID': itemID,
        'raid': raidID,
        'name': args.join(' ')
    };


    if (isNaN(record.itemID)) {
        let errorReservableItemValidItemNumber = '**Error:** Invalid item number!';
        return client.messages.errorMessage(message.channel,errorReservableItemValidItemNumber, 240);
    };


    if (addOrRemove === "add") {
        // Check if item name already exists under that raid name, warn if yes
        client.models.reserveItem.findOne({
                where: {[Op.and]: [{raid: record.raid}, {name: record.name}]}
            }
        ).then((item) => {
            if (item)  {
                let warningReservableItemExists = `**Warning:** Similar item already exists: ${item.itemID} ${item.name}`;
                client.messages.send(message.channel, warningReservableItemExists, 240);
            };
        });

        // Check if item number already exists under that raid name
        client.models.reserveItem.findOne({
                where: {[Op.and]: [{raid: record.raid}, {itemID: record.itemID}]}
            }
        ).then((item) => {
            if (!item)  {
                client.models.reserveItem.create(record);
                let successReservableItemCreated = `**Item created:** ${record.itemID} ${record.name}`;
                return client.messages.send(message.channel, successReservableItemCreated, 240);
            } else  {
                let errorReservableItemAlreadyExists = `**Error:** Cannot create item: ${item.itemID} ${item.name} already exists!`;
                return client.messages.errorMessage(message.channel, errorReservableItemAlreadyExists, 240);
            };
        });
    
    } else if (addOrRemove === "remove") {
        client.models.reserveItem.findOne({where: {itemID: record.itemID, raid: record.raid}}).then((item) => {
            if (item)  {
                item.destroy();
                let successReservableItemDestroyed = `**Item destroyed:** ${item.itemID} ${item.name}`;
                return client.messages.send(message.channel, successReservableItemDestroyed, 240);
            }
        });
    };
};