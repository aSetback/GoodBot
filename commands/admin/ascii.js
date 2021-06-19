exports.run = async (client, message, args) => {
    let muffin = new client.disbut.MessageButton()
        .setStyle('blurple')
        .setLabel('Muffin') 
        .setID('muffin');
    let quack = new client.disbut.MessageButton()
        .setStyle('blurple')
        .setLabel('Quack') 
        .setID('quack');

    let buttonRow = new client.disbut.MessageActionRow()
        .addComponent(muffin)
        .addComponent(quack)
 
        message.channel.send('ASCII Art', buttonRow);
}