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
    },
    hasClass: (guild, player) => {
        const classFile = 'data/' + guild.id + '-class.json';
        classList = JSON.parse(fs.readFileSync(classFile));
        for (classPlayer in classList) {
            if (player == classPlayer) {
                return true;
            }
        }
        return false;
    },
    hasRole: (guild, player) => {
        const roleFile = 'data/' + guild.id + '-roles.json';
        roleList = JSON.parse(fs.readFileSync(roleFile));
        for (rolePlayer in roleList) {
            if (player == rolePlayer) {
                return true;
            }
        }
        return false;
    },
    hasFaction: (client, member) => {
        let horde = member.guild.roles.find(role => role.name.toLowerCase() === 'horde');
        let alliance = member.guild.roles.find(role => role.name.toLowerCase() === 'alliance');
        if (member.roles.has(horde.id) || member.roles.has(alliance.id)) {
            return true;
        }
        return false;
    },
    validName: (guild, player) => {
        var reg = /^[a-zàâäåªæÆçÇœŒÐéèêëËƒíìîïÏñÑóòôöºúùûÜýÿ]+$/i;
        if (!reg.test(player)) {
            return false;
        }
        return true;
    },
}
