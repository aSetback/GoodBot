exports.run = async (client, message, args) => {
    if (!message.isAdmin) {
        return false;
    }
    let itemID = args.shift();
    let alias = args.join(' ').toLowerCase();
    client.models.reserveItem.findOne({ where: {'itemID': itemID} }).then(async (reserveItem) => {
        if (reserveItem) {
            client.models.reserveItemAlias.create({
                'reserveItemID': reserveItem.id,
                'alias': alias
            }).then(() => {
                client.messages.send(message.channel, 'Alias added: "' + alias + '" for ' + reserveItem.name, 240);
            });
        } else {
            client.messages.send(message.channel, 'Could not find item with ID: ' + itemID, 240);
        }
    });
}