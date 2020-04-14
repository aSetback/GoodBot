exports.run = async function(client, message, args) {
	if (!client.permission.manageChannel(message.member, message.channel)) {
		return false;
	}

	let action = args.shift().toLowerCase();
	if (action != 'add' && action != 'remove') {
		return false;
	}
    let itemID = args.shift();

	if (action == 'add') {
		let raid = args.shift().toLowerCase();
		let itemName = args.join(" ");
	
		if (!raid || !itemID || !itemName) {
			return message.channel.send("Item could not be found, please use the following format: `+reserveitem add itemID raid  itemName` or `+reserveitem remove itemID`");
		}

		let record = {
			itemID: itemID,
			raid: raid,
			name: itemName
		};
		client.models.reserveItem.create(record).then((reserveItem) => {
			return message.channel.send("Created a new reservable item: " + reserveItem.name + ' for raid ' + reserveItem.raid.toUpperCase());
		});
	}

	if (action == 'remove') {
		client.models.reserveItem.destroy({where: {itemID: itemID}});
	}

};