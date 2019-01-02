const {Translate} = require('@google-cloud/translate');

exports.run = (client, message, args) => {
	const translate = new Translate();
	let language = args.shift().toLowerCase();
	let translateText = args.join(' ');

	translate
		.translate(translateText, language)
		.then(results => {
			const translation = results[0];
			message.channel.send('Translation: ' + translation);
		})
		.catch(err => {
			console.error('ERROR:', err);
		});
};