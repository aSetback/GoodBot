exports.run = async (client, message, args) => {
    let guildID = args.shift();
    let raidType = args.shift();
    let faction = args.shift();
    if (!guildID || !raidType) {
        return;
    }

    let category = await client.raid.getCategory(client, guildID, raidType, faction);
    message.channel.send(category);
}