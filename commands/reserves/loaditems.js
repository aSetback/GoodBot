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
            'itemID': item[0],
            'raid': item[1],
            'name': item[2]
        }
        client.models.reserveItem.findOne({where: {name: record.name}}).then((item) => {
            if (!item)  {
                client.models.reserveItem.create(record);
                console.log('Item created: ' + record.name);
            }
        });
    
    };

};