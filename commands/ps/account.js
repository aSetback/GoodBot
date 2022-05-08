var request = require('request');

exports.run = (client, message, args) => {
	if (!args[1]) {
		return message.channel.send("This command requires both a username & password.  Correct Syntax: +account username password")
	}

	let user = args.shift().toLowerCase();
	let pass = args.shift().toLowerCase();

	let apiUrl = "http://upload.setback.me/api/account/" + user + "/" + pass + "?id=" + client.config.goodbot.id + "&key=" + client.config.goodbot.key;
    reqOpts = {
      url: encodeURI(apiUrl)
    };

	console.log(apiUrl);

    request(reqOpts, function (err, resp, html) {
      if (err) {
        return;
      }
      let apiData = JSON.parse(resp.body);

      return message.channel.send(apiData.message);

    });
}; 