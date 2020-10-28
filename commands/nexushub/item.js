const Discord = require("discord.js");

exports.run = async function(client, message, args) {
    
    let itemString = args.join(' ');
    let itemInfo = await client.nexushub.item(itemString);
    let embed = new Discord.MessageEmbed()
        .setTitle(itemInfo.name)
        .setThumbnail(itemInfo.icon);
    
    let format = itemInfo.tooltip[0].format;
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

    let itemMessage = '';
    let droppedBy = '';
    let itemLevel = '';
    itemInfo.tooltip.forEach((line) => {
        if (line.label.indexOf('Dropped by') >= 0) {
            droppedBy += line.label;
        } else if (line.label.indexOf('Drop Chance') >= 0) {
            droppedBy += ' (' + line.label + ')';
        } else if (line.label.indexOf('Item Level') >= 0) {
            itemLevel = line.label;
        } else if (line.label.indexOf('Sell Price') >= 0) {
            itemMessage += 'Sell Price: ' + client.nexushub.convertGold(itemInfo.sellPrice);
        } else if (line.label == itemInfo.name || line.format == 'indent') {
            // Skip the title line so it doesn't show twice.
        } else {
            itemMessage += line.label + '\n';
        }
    });
    
    if (droppedBy) {
        itemMessage += '\n' + droppedBy;
    }

    embed.setColor(embedColor);
    embed.addField(itemLevel, itemMessage);
    message.channel.send(embed);

}