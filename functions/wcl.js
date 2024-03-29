var request = require('request');

module.exports = {
    attendance: (client, reportID) => {
        let promise = new Promise((resolve, reject) => {
            let apiUrl = "https://goodbot.me/api/attendance/" + reportID + "?id=" + client.config.goodbot.id + "&key=" + client.config.goodbot.key;
            console.log(apiUrl);
            reqOpts = {
                url: encodeURI(apiUrl)
            };

            request(reqOpts, function (err, resp, html) {
                if (err) {
                    return;
                }
            
                let apiData = JSON.parse(resp.body);
                resolve(apiData);
            });
        });
        return promise;
    },
	karaParse: (client, player, server, region) => {
        let promise = new Promise((resolve, reject) => {
            let apiUrl = "https://goodbot.me/api/karazhan/" + player + "/" + server + "/" + region + "?id=" + client.config.goodbot.id + "&key=" + client.config.goodbot.key;
            reqOpts = {
                url: encodeURI(apiUrl)
            };

            request(reqOpts, function (err, resp, html) {
                if (err) {
                    return;
                }
            
                let apiData = JSON.parse(resp.body);
                resolve(apiData);
            });
        });
        return promise;
    },
    karaMultiParse: (client, players, server, region) => {
        let promise = new Promise((resolve, reject) => {
            let apiUrl = "https://goodbot.me/api/karazhanMulti/" + players.join('|') + "/" + server + "/" + region + "?id=" + client.config.goodbot.id + "&key=" + client.config.goodbot.key;
            reqOpts = {
                url: encodeURI(apiUrl)
            };

            request(reqOpts, function (err, resp, html) {
                if (err) {
                    return;
                }
            
                let apiData = JSON.parse(resp.body);
                resolve(apiData);
            });
        });
        return promise;
    },
}
