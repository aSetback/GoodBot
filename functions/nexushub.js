const Nexus = require('nexushub-client');

module.exports = {
    item: async function(itemString) {
        let promise = new Promise(async function(resolve, reject) {
            let nexus = new Nexus;
            let itemList = await nexus.get('/wow-classic/v1/search?query=' + itemString);
            let item = encodeURI(itemList[0]);
            if (item) {
                let itemInfo = await nexus.get('/wow-classic/v1/item/' + item.itemId);
                resolve(itemInfo);
            } else {
                resolve(false);
            }
        });
        return promise;
    },
    priceInfo: async function(itemString, server, faction) {
        let promise = new Promise(async function(resolve, reject) {
            let nexus = new Nexus;
            let itemList = await nexus.get('/wow-classic/v1/search?query=' + itemString);
            let item = itemList[0];
            let priceInfo = await nexus.get('/wow-classic/v1/items/' + server + '-' + faction + '/' + item.itemId);
            resolve(priceInfo);
        });
        return promise;
    },
    convertGold: function(raw) { 
        let itemMessage = '';
        let sellPriceGold = Math.floor(raw / 10000);
        let sellPriceSilver = Math.floor((raw % 10000) / 100);
        let sellPriceCopper = Math.floor((raw % 100));
        if (sellPriceGold) {
           itemMessage += sellPriceGold + 'g' + sellPriceSilver + 's' + sellPriceCopper + 'c';
        } else if (sellPriceSilver) {
           itemMessage += sellPriceSilver + 's' + sellPriceCopper + 'c';
        } else {
           itemMessage += sellPriceCopper + 'c';
        }
        return itemMessage;
    }

}

