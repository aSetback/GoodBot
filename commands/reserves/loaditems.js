const fs = require("fs");

// Load reservable items list into the db for a specific raid
// example: +loaditems kara
exports.run = async function(client, message, args) {
    let raid = args.shift();
    let fileName = 'items/' + raid + '-items.json';
    let parsedList = {};
    if (fs.existsSync(fileName)) {
        currentList = fs.readFileSync(fileName, 'utf8');
        parsedList = JSON.parse(currentList);
    }
    for (key in parsedList) {        
        let item = parsedList[key];
        let record = {
            'itemID': item[0],
            'raid': item[1],
            'name': item[2]
        }
        client.models.reserveItem.findOne({where: {name: record.name, raid: record.raid}}).then((item) => {
            if (!item)  {
                client.models.reserveItem.create(record);
                console.log('Item created: ' + record.name);
            }
        });
    
    };

};