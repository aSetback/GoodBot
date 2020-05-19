const fs = require("fs");

exports.run = async function(client, message, args) {
    let fileName = 'data/enchants.json';
    let parsedList = {};
    if (fs.existsSync(fileName)) {
        currentList = fs.readFileSync(fileName, 'utf8');
        parsedList = JSON.parse(currentList);
    }
    for (key in parsedList) {        
        let enchant = parsedList[key];
        let record = {
            'id': key,
            'enchant': enchant
        }
        client.models.enchant.create(record);    
    }

};