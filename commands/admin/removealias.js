exports.run = async (client, message, args) => {
    if (!message.isAdmin) {
        return false;
    }
    let alias = args.join(' ').toLowerCase();
    client.models.reserveItemAlias.findOne({ where: {'alias': alias} }).then(async (itemAlias) => {
        if (itemAlias) {
            client.models.reserveItemAlias.destroy({ where: {'id': itemAlias.id}}).then(() => {
                client.messages.send(message.channel, 'Alias removed.', 240);
            });
        } else {
            client.messages.send(message.channel, 'Could not find alias: ' + alias, 240);
        }
    });
}