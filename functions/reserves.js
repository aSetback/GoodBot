const moment = require('moment');

module.exports = {
	byRaid: async function(client, raid) {
        let promise = new Promise((resolve, reject) => {

            let includes = [
                {model: client.models.signup, as: 'signup', foreignKey: 'signupID'},
                {model: client.models.reserveItem, as: 'item', foreignKey: 'reserveItemID'},
            ];

            client.models.raidReserve.findAll({where: {RaidID: raid.id}, include: includes}).then((raidReserves) => {
                let returnMessage = '';
                raidReserves.sort((a, b) => {
                    if (a.item.name > b.item.name) {
                        return 1;
                    }
                    if (a.item.name < b.item.name) {
                        return -1;
                    }
                    if (a.signup.player > b.signup.player) {
                        return 1;
                    }
                    if (a.signup.player < b.signup.player) {
                        return -1;
                    }
                    return 0;
                });
                let reserveList = [];
                raidReserves.forEach((reserve) => {
                    // Only show reserves from players who have a sign-up of 'yes'
                    if (reserve.signup.signup == 'yes') { 
                        reserveList.push({ 
                            'player': reserve.signup.player,
                            'item': reserve.item.name,
                            'itemID': reserve.item.id,
                            'reserveTime': moment(reserve.updatedAt).utcOffset(-240).format('h:mm A, L')
                        });
                    }
                });
                resolve(reserveList);
            });
        });
        return promise;
    }
};