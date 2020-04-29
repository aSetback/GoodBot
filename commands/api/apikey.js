exports.run = (client, message, args) => {
    let level = 0;
    if (message.isAdmin) {
        level = 999;
    }

    let key = generateKey();

    let record = {
        'memberID': message.member.id,
        'guildID': message.guild.id,
        'level': level,
        'key': key
    };

    client.models.apikey.findOne(({where: {memberID: record.memberID, guildID: record.guildID}})).then((apikey) => {
        if (apikey) {
            client.models.apikey.update(record, {where: {id: apikey.id}}).then(() => {
                message.author.send('Your API key has been updated.\nYour updated API key: **' + key + '**');
            })
        } else {
            client.models.apikey.create(record).then(() => {
                message.author.send('Your API key has been created.\nYour API Key: **' + key + '**');
            });
        }
    })

    
}

function generateKey(){
    var dt = new Date().getTime();
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = (dt + Math.random()*16)%16 | 0;
        dt = Math.floor(dt/16);
        return (c=='x' ? r :(r&0x3|0x8)).toString(16);
    });
    return uuid;
}