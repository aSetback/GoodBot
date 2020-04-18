exports.run = async function(client, message, args) {
    if (!client.queue[message.guild.id]) {
        return message.channel.send('There is currently no songs in the queue.');
    }
    
    if (!client.queue[message.guild.id].repeat) {
        client.queue[message.guild.id].repeat = true;
        return message.channel.send('Repeat is now **on**.');
    } else {
        client.queue[message.guild.id].repeat = false;
        return message.channel.send('Repeat is now **off**.');
    }
}
