const Twilio = require('twilio');
const fs = require("fs");

exports.run = (client, message, args) => {
    let text = args.join(' ');

    // Write to notify json file
	let fileName = 'data/notify.json';
	let parsedList = [];
	if (fs.existsSync(fileName)) {
        currentList = fs.readFileSync(fileName);
		parsedList = JSON.parse(currentList);
    }
    
    for (key in parsedList) {
        let notifyNumber = parsedList[key];
        twilio = new Twilio(client.config.twilioSID, client.config.twilioToken);
        twilio.messages.create({
            from: client.config.twilioNumber,
            to: notifyNumber,
            body: text
        }, function(err, result) {
            if (err) {
                console.log(err);
            } else {
                console.log(result);
            }
        });
    }
  
};