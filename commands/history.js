var request = require('request');

exports.run = (client, message, args) => {


	async function getHistory(player) {
		let channel = message.guild.channels.find(channel => channel.name === "standings");
		let messages = await getMessages(channel);
		console.log(messages);
		return false;

		try {
			let html = await getJson('https://storage.googleapis.com/epgp/epgp-standings-11-19-2019-12-24-9.json?GoogleAccessId=discord%40api-project-483394155093.iam.gserviceaccount.com&Expires=1668792250&Signature=nLJH3IM7pGWAHbzE0q6CyynpBzvQOtFTx8pfYiuhm43eSks2azwaiJML54a4uCsRaRCyy0bSwURFuLHJlIHOm3jt%2F1uMUH9Zy0RoxvE%2B0hrLIIqL5YJpp2UxhuekXY59a4TtAmOYB02x%2BZdMN1%2Fm4TVSHGzVTkDYXxNndYZ5Tjzsp%2BOcgv9VWFwTNoMcB6IF0f8k8GBccDhicva9A4c0EQGoSa1imEvOUezt1wddbYuch0uMvChGbrxhGBq8AdMISSdeiAFe2z%2Fvm%2B0snLmNrrQNUmpF3waYe0yiypulTPqwaxoQ2hOnF3IQkDhFW%2B%2BY6cOZspGyDrm8UV%2FJFbcg2g%3D%3D')
			let standings = JSON.parse(html);
			console.log(standings);
		} catch (error) {
			console.error('Error: ' + error);
		}

	}

	function getMessages(channel) {
		return new Promise((resolve, reject) => {
			let messages = channel.fetchMessages();
			console.log(':');
			console.log(messages);
			resolve(messages);
		});
	}

	function getJson(url) {
		return new Promise((resolve, reject) => {
			request(url, (error, response, body) => {
				if (error) reject(error);
				if (response.statusCode != 200) {
					reject('Invalid status code <' + response.statusCode + '>');
				}
				resolve(body);
			});
		});
	}


}