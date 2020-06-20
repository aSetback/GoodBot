const fs = require("fs");

exports.run = async function(client, message, args) {
    let fileName = 'items/set-items.json';
    let parsedList = {};
    
    if (fs.existsSync(fileName)) {
        currentList = fs.readFileSync(fileName, 'utf8');
        parsedList = JSON.parse(currentList);
    }
    for (key in parsedList) {        
        let item = parsedList[key];

        let record = {
            'raid': item[0],
            'name': item[1],
            'alias': item[2],
            'itemID': item[3]
        }

        console.log(record);

        // check if there's already an item with that name
        client.models.reserveSet.findOne({where: {name: record.name}}).then((itemSet) => {
            if (!itemSet)  {
                // If there's not, create
                client.models.reserveSet.create(record);
                console.log('Item Set created: ' + record.name);
            } else {
                // If there is, update
                itemSet.alias = record.alias;
                itemSet.itemID = record.itemID;
                itemSet.raid = record.raid;
                itemSet.save();
                console.log(record.name + ' updated!');
            }
        });
    
    };
};