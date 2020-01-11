const Twilio = require('twilio');
const fs = require("fs");

const TwilioSID = 'ACde7e5bf940aad8f4c8989d4840d9bf8f';
const TwilioToken = 'f91ea5aeb1e28ad686ca98d8372bc118';
exports.run = (client, message, args) => {
    let text = args.join(' ');
    message.delete();

    	// Write to notify json file
	let fileName = 'data/notify.json';
	let parsedList = [];
	if (fs.existsSync(fileName)) {
        currentList = fs.readFileSync(fileName);
		parsedList = JSON.parse(currentList);
    }
    
    for (key in parsedList) {
        let notifyNumber = parsedList[key];
        twilio = new Twilio(TwilioSID, TwilioToken);
        twilio.messages.create({
            from: '+12056512229',
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