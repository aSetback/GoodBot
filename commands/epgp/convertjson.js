const https = require("https");
const Discord = require("discord.js");

exports.run = (client, message, args) => {
    let url = args[0];
    var request = https.get(url, (response) => {
        let jsonData = '';
        response.on('data', (data) => {
            jsonData += data;
        });
        response.on('end', () => {
            jsonData = JSON.parse(jsonData);
            luaOutput = '{\n';
            jsonData.forEach((player) => {
                luaOutput += '  {\n';
                luaOutput += '    ["player"] = "' + player.player + '",\n'
                luaOutput += '    ["ep"] = "' + player.ep + '",\n'
                luaOutput += '    ["gp"] = "' + player.gp + '"\n'
                luaOutput += '  },\n';
            });
            luaOutput += '}';
            console.log(luaOutput);
        });
    }).on('error', function (err) { // Handle errors
        console.error(err.message);
    });
}