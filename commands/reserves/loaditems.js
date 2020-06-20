const fs = require("fs");

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
            'itemID': [item[0]],
            'raid': item[1],
            'name': item[2],
            'alias': item[3]
        }

        console.log(record);

        // check if there's already an item with that name
        client.models.reserveItem.findOne({where: {name: record.name}}).then((item) => {
            if (!item)  {
                // If there's not, create
                client.models.reserveItem.create(record);
                console.log('Item created: ' + record.name);
            } else {
                // If there is, update
                item.alias = record.alias;
                item.itemID = record.itemID;
                item.save();
                console.log('Item updated: Alias "' + record.alias + '" for ' + record.name);
            }
        });
    
    };
};