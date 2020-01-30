const fs = require("fs");

module.exports = {
    playerClass: (guild, playerName, className) => {
        const validClasses = ['priest', 'paladin', 'druid', 'warrior', 'rogue', 'hunter', 'mage', 'warlock', 'shaman', 'dk'];
        
        if (validClasses.indexOf(className.toLowerCase()) < 0) {
            return message.channel.send(className + ' is not a valid class assignment.');
        }
    
        // Write to class json file
        let fileName = 'data/' + guild.id + '-class.json';
        let parsedList = {};
        if (fs.existsSync(fileName)) {
            currentList = fs.readFileSync(fileName, 'utf8');
            parsedList = JSON.parse(currentList);
        }
        parsedList[playerName] = className;
        fs.writeFileSync(fileName, JSON.stringify(parsedList)); 
    },
    playerRole: (guild, playerName, roleName) => {
        const validRoles = ['tank', 'healer', 'dps', 'caster'];
        if (validRoles.indexOf(roleName.toLowerCase()) < 0) {
            return message.channel.send(roleName + ' is not a valid role assignment.');
        }
            
        // Write to roles json file
        fileName = 'data/' + guild.id + '-roles.json';
        parsedList = {};
        if (fs.existsSync(fileName)) {
            currentList = fs.readFileSync(fileName, 'utf8');
            parsedList = JSON.parse(currentList);
        }
        parsedList[playerName] = roleName;
        fs.writeFileSync(fileName, JSON.stringify(parsedList)); 
    }
}
