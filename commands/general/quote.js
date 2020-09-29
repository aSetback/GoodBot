const fs = require("fs");

exports.run = (client, message, args) => {

    let command = args.shift();
    let guildID = message.guild.id;
    if (!guildID) {
        return;
    }

    if (!command || command == 'random') {
        randomQuote(guildID);
    }

    if (!message.isAdmin) {
        return false;
    }

    if (command == 'list') {
        listQuotes(guildID);
    } else if (command == 'add') {
        let record = {
            quote: args.join(' '),
            memberID: message.member.id,
            guildID: message.guild.id
        };
        addQuote(record);
    } else if (command == 'remove') {
        removeQuote(args[0], guildID);
    } else if (command == 'get') {
        getQuote(args[0], guildID);
    }

    function getQuote(id, guildID) {
        client.models.quote.findOne({ where: {'guildID': guildID, 'id': id}}).then((quote) => {
            if (quote) {
                client.messages.send(quote.quote, 900);
            }
        });
    }

    function addQuote(record) {
        client.models.quote.create(record).then((newRecord) => {
            client.messages.send('New quote added (ID: ' + newRecord.id +')', 900);
        });
    }

    function removeQuote(id, guildID) {
        client.models.quote.destroy({ where: {'id': id, 'guildID': guildID}}).then(() => {
            client.messages.send('Deleted quote (ID: ' + id + ')', 900);
        });
    }

    function randomQuote(guildID) {
        client.models.quote.findAll({ where: {'guildID': guildID}}).then((quotes) => {
            let randomNumber = Math.floor(Math.random() * quotes.length);
            let quote = quotes[randomNumber];
            client.messages.send(quote.quote, 900);
        });
    }

    function listQuotes(guildID) {
        let quoteMessage = '**Saved Quotes**\n';
        let quoteCount = 0;
        client.models.quote.findAll({ where: {'guildID': guildID}}).then((quotes) => {
            quotes.forEach((quote) => {
                quoteCount++;
                quoteMessage += quote.id + ' - ' + quote.quote + '\n';
                if (quoteCount % 20 == 0) {
                    client.messages.send(quoteMessage, 900);
                    quoteMessage = '';
                }
            });

            if (quoteMessage) {
                client.messages.send(quoteMessage, 900);
            }
        });
    }
};