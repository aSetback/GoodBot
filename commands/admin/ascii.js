exports.run = async (client, message, args) => {
    let muffin = new client.disbut.ButtonBuilder()
        .setStyle('blurple')
        .setLabel('Muffin') 
        .setID('muffin');
    let quack = new client.disbut.ButtonBuilder()
        .setStyle('blurple')
        .setLabel('Quack') 
        .setID('quack');

    let buttonRow = new client.disbut.ActionRowBuilder ()
        .addComponent(muffin)
        .addComponent(quack)
 
        message.channel.send('ASCII Art', buttonRow);
}