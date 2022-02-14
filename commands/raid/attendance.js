const Discord = require("discord.js");
const { Channel } = require("simple-youtube-api");
var request = require('request');
 
exports.run = async function(client, message, args) {

    let reportID = args.shift();
    
    if (!reportID) {
        let errorMsg = client.loc('errorNoReportID', "A valid report ID is required to run this command.");
		return client.messages.errorMessage(message.channel, errorMsg, 240);
    }

    let apiData = await client.wcl.attendance(client, reportID);
    if (apiData.error) {
        return message.channel.send(apiData.error);
    }
    if (apiData.response == null) {
        let errorMsg = client.loc('errorNoResultsFound', "No results were found.");
		return client.messages.errorMessage(message.channel, errorMsg, 240);
    }
    let response = apiData.response.join(', ');
    return message.channel.send(response);
};