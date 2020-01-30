const fs = require("fs");

exports.run = (client, message, args) => {
	message.delete().catch(O_o=>{}); 

    let command = args.shift();
    if (!command || command == 'random') {
        randomQuote();
    }

    if (!message.isAdmin) {
        return false;
    }

    if (command == 'list') {
        listQuotes();
    } else if (command == 'add') {
        let record = {
            quote: args.join(' '),
            memberID: message.member.id,
            guildID: message.guild.id
        };
        addQuote(record);
    } else if (command == 'remove') {
        removeQuote(args[0]);
    }

    function addQuote(record) {
        client.models.quote.create(record).then((newRecord) => {
            message.channel.send('New quote added (ID: ' + newRecord.id +')');
        });
    }

    function removeQuote(id) {
        client.models.quote.destroy({ where: {'id': id}}).then(() => {
            message.channel.send('Deleted quote (ID: ' + id + ')');
        });
    }

    function randomQuote() {
        client.models.quote.findAll().then((quotes) => {
            let randomNumber = Math.floor(Math.random() * quotes.length);
            let quote = quotes[randomNumber];
            message.channel.send(quote.quote);
        });
    }

    function listQuotes() {
        let quoteMessage = '**Saved Quotes**\n';
        let quoteCount = 0;
        client.models.quote.findAll().then((quotes) => {
            quotes.forEach((quote) => {
                quoteCount++;
                quoteMessage += quote.id + ' - ' + quote.quote + '\n';
                if (quoteCount % 20 == 0) {
                    message.channel.send(quoteMessage);
                    quoteMessage = '';
                }
            });

            if (quoteMessage) {
                message.channel.send(quoteMessage);
            }
        });
    }
};