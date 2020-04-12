const Nexus = require('nexushub-client');

module.exports = {
    item: async function(itemString) {
        let promise = new Promise(async function(resolve, reject) {
            let nexus = new Nexus;
            let itemList = await nexus.get('/wow-classic/v1/search?query=' + itemString);
            console.log(itemList);
            let item = itemList[0];
            let itemInfo = await nexus.get('/wow-classic/v1/item/' + item.itemId);
            console.log(itemInfo);
            resolve(itemInfo);

        });
        return promise;
    },

}

