exports.run = (client, message, args) => {
    let subCommand = args.shift().toLowerCase();
    let profession = args.join(' ');
    let model = client.models.profession;
    let guildID = parseInt(message.guild.id);
    let record = {'name': profession, 'guildID': guildID};
    if (subCommand == 'add') {
        addProfession(record);
    } else if (subCommand == 'remove') {
        removeProfession(record);
    } else if (subCommand == 'list') {
        listProfessions();
    }

    function listProfessions() {
        model.findAll().then(records => {
            records.forEach(record => {
                message.channel.send(record.name);
            });
        });
    }

    function addProfession(record) {
        model.findAll({ where: record }).then(existRecords => {
            console.log(existRecords);
            if (existRecords.length) {
                return message.channel.send('Profession already existed!');
            }

            model.create(record).then(newRecord => {
                return message.channel.send('Added profession: ' + newRecord.name);
            });
        });
    }

    function removeProfession(record) {
        model.destroy({ where: record }).then(() => {
            return message.channel.send('Removed profession: ' + record.name);
        });
    }

}