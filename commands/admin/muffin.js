exports.run = async (client, message, args) => {
    let muffin = new client.disbut.MessageButton()
        .setStyle('blurple')
        .setLabel('Muffin Button') 
        .setID('muffin');
    message.channel.send('Do Not Push', muffin);
}