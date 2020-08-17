const Discord = require("discord.js");

exports.run = async function(client, message, args) {
    
    let itemString = args.join(' ');
    let server = await client.customOptions.get(client, message.guild, 'server');
    let faction = await client.customOptions.get(client, message.guild, 'faction');
    if (!faction) {
        faction = 'alliance';
    }
    if (!server) {
        server = 'mankrik';
    }
    
    let priceInfo = await client.nexushub.priceInfo(itemString, server, faction);
    let embed = new Discord.RichEmbed()
        .setTitle(priceInfo.name)
        .setThumbnail(priceInfo.icon);
    
    let format = priceInfo.tooltip[0].format;
    if (format == 'Legendary') {
        embedColor = '#ff8000';
    } else if (format == 'Epic') {
        embedColor = '#a335ee';
    } else if (format == 'Rare') {
        embedColor = '#0070dd';
    } else if (format == 'Uncommon') {
        embedColor = '#1eff00';
    } else if (format == 'Common') {
        embedColor = '#ffffff';
    } else if (format == 'Poor') {
        embedColor = '#9d9d9d';
    }

    embed.setColor(embedColor);
    let currentInfo = '**Market Value**: ' + client.nexushub.convertGold(priceInfo.stats.current.marketValue) + '\n';
    currentInfo += '**Historical Value**: ' + client.nexushub.convertGold(priceInfo.stats.current.historicalValue) + '\n';
    currentInfo += '**Auctions**: ' + priceInfo.stats.current.numAuctions + '\n';
    currentInfo += '**Total Available**: ' + priceInfo.stats.current.quantity + '\n';
    embed.addField('Current', currentInfo);
    let previousInfo = '**Market Value**: ' + client.nexushub.convertGold(priceInfo.stats.previous.marketValue) + '\n';
    previousInfo += '**Historical Value**: ' + client.nexushub.convertGold(priceInfo.stats.previous.historicalValue) + '\n';
    previousInfo += '**Auctions**: ' + priceInfo.stats.previous.numAuctions + '\n';
    previousInfo += '**Total Available**: ' + priceInfo.stats.previous.quantity + '\n';
    embed.addField('Previous', previousInfo);

    embed.setTimestamp(priceInfo.stats.lastUpdated);

    message.channel.send(embed);

}