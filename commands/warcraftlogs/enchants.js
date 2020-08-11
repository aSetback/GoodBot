const { Op } = require('sequelize');

var request = require('request');
const slots = {
    3: 'Shoulder',
    17: 'Two Handed',
    22: 'Off Hand',
    21: 'Main Hand',
    14: 'Shield',
    20: 'Chest',
    5: 'Chest',
    7: 'Legs',
    8: 'Feet',
    16: 'Back',
    13: 'One Hand',
    1: 'Head',
    9: 'Wrists',
    10: 'Hands'
};

exports.run = async (client, message, args) => {
    // Retrieve our server/region.
    let character = args[0];
    let server = client.customOptions.get(message.guild, 'server');
    let region = client.customOptions.get(message.guild, 'region');
    if (!server) {
        server = 'Mankrik';
    }
    if (!region) {
        region = 'US';
    }
    let reportID = await getReportID(client, character, server, region);
    let player = await getPlayer(client, reportID, character);
    let enchantInfo = await retrieveGear(client, reportID, player);
    enchantInfo.sort((a, b) => {
        if (a.slot < b.slot) { return 1; }
        else if (a.slot > b.slot) { return -1; }
        else { return 0; }
    });

    returnString = 'Enchant Report: **' + player.name + '**\n```diff\n';
    for (key in enchantInfo) {
        let info = enchantInfo[key];
        if (info.enchant) {
            returnString += '+ ' + info.item.padEnd(50) + info.slot.padEnd(15) + info.enchant + '\n';
        } else {
            returnString += '- ' + info.item.padEnd(50) + info.slot.padEnd(15) + 'No Enchant\n';
        }
    }
    returnString += '```';
    return message.channel.send(returnString);
};

function getPlayer(client, reportID, player) {
    return new Promise((resolve, reject) => {
        let searchUrl = "https://classic.warcraftlogs.com:443/v1/report/fights/" + reportID + "?api_key=" + client.config.warcraftlogs;
        reqOpts = {
            url: encodeURI(searchUrl)
        };
        request(reqOpts, (err, resp, html) => {
            if (err) {
                return;
            }
            fights = JSON.parse(resp.body);
            if (logs.error) {
                return message.channel.send(logs.error);
            }
            for (key in fights.friendlies) {
                if (client.general.ucfirst(player) == fights.friendlies[key].name) {
                    resolve(fights.friendlies[key]);
                }
            }
            resolve(false);
        });
    });
}

function getReportID(client, player, server, region) {
    return new Promise((resolve, reject) => {
        let searchUrl = "https://classic.warcraftlogs.com:443/v1/parses/character/" + player + "/" + server + "/" + region + "?zone=1002&api_key=" + client.config.warcraftlogs;
        reqOpts = {
            url: encodeURI(searchUrl)
        };
        request(reqOpts, (err, resp, html) => {
            if (err) {
                return;
            }
            logs = JSON.parse(resp.body);
            if (logs.error) {
                return message.channel.send(logs.error);
            }

            if (!logs || !logs.length) {
                return message.channel.send('Could not find gear information for ' + player);
            }

            logs.sort(function (a, b) {
                if (a.startTime < b.startTime) { return 1; }
                else if (a.startTime > b.startTime) { return -1; }
                else { return 0; }
            });

            let report = logs.shift();
            resolve(report.reportID);
        })
    });
}

function retrieveGear(client, code, player) {
    return new Promise((resolve, reject) => {
        let start = 0;
        let end = 999999999;
        let searchUrl = "https://classic.warcraftlogs.com:443/v1/report/events/summary/" + code + "?api_key=" + client.config.warcraftlogs;
        searchUrl += '&start=' + start + '&end=' + end + '&sourceid=' + player.id;
        reqOpts = {
            url: encodeURI(searchUrl)
        };
        request(reqOpts, function (err, resp, html) {
            if (err) {
                return;
            }
            data = JSON.parse(resp.body);
            let gearList = {};
            if (data.events) {
                for (key in data.events) {
                    let event = data.events[key];
                    if (event.gear) {
                        for (gearKey in event.gear) {
                            let gear = event.gear[gearKey];
                            gearList[gear.id] = gear;
                        }
                    }
                }
            }
            gearIDs = [];
            enchantIDs = [];
            for (key in gearList) {
                if (gearList[key].permanentEnchant) {
                    enchantIDs.push(gearList[key].permanentEnchant);
                }
                gearIDs.push(key);
            }
            if (player.type == 'Hunter') {
                slots[15] = 'Ranged';
            }
            client.models.item.findAll({ where: { id: { [Op.in]: gearIDs } } }).then((items) => {
                client.models.enchant.findAll({ where: { id: { [Op.in]: enchantIDs } } }).then((enchants) => {
                    let enchantList = {};
                    for (enchantKey in enchants) {
                        enchantList[enchants[enchantKey].id] = enchants[enchantKey].enchant;
                    }
                    let itemEnchants = [];
                    for (key in items) {
                        let item = items[key];
                        if (slots[item.slot]) {
                            let enchant = null;
                            if (gearList[item.id].permanentEnchant) {
                                enchant = enchantList[gearList[item.id].permanentEnchant];
                            }
                            itemEnchants.push({
                                item: item.name,
                                slot: slots[item.slot],
                                enchant: enchant
                            });
                        }
                    }
                    resolve(itemEnchants);
                });
            });
        });
    });
}