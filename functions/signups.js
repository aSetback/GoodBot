const fs = require("fs");

module.exports = {
	set: (type, name, channel, message, client) => {
        if (type === '+') {
            signValue = 'yes';
        } else if (type === '-') {
            signValue = 'no';
        } else if (type.toLowerCase() === 'm') {
            signValue = 'maybe';
        }
        
        const fileName = './signups/' + message.guild.id + '-' + channel + '.json';
        let parsedLineup = {};
        if (fs.existsSync(fileName)) {
            currentLineup = fs.readFileSync(fileName, 'utf8');
            parsedLineup = JSON.parse(currentLineup);
        }
        const userName = name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
        parsedLineup[userName] = signValue;
        fs.writeFileSync(fileName, JSON.stringify(parsedLineup)); 
    
        client.embed.update(message, channel);
    }
}