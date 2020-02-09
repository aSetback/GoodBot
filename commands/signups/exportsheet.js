exports.run = (client, message, args) => {
	if (!message.isAdmin) {
		return false;
	}

	var sheetID = client.customOptions.get(message.guild, 'sheet').trim();
	if (args[0]) {
		sheetID = args[0];
	}
	var async = require('async');
	var fs = require('fs');

	message.delete();

	const sheetCols = {
		'warrior-tank': 1,
		'warrior-dps': 2,
		'hunter-dps': 3,
		'rogue-dps': 4,
		'mage-caster': 5,
		'warlock-caster': 6,
		'priest-healer': 7,
		'paladin-healer': 8,
		'druid-healer': 9,
		'druid-caster': 10,
		'druid-dps': 11,
		'priest-caster': 12,
		'paladin-dps': 13,
		'paladin-tank': 14,
		'shaman-dps': 15,
		'shaman-caster': 16,
		'shaman-healer': 17,
		'dk-dps': 18,
		'dk-tank': 19
	};
	
	const raid = message.channel.name;
	const fileName = './signups/' + message.guild.id + '-' + raid + '.json';
	let parsedLineup = {};
	if (fs.existsSync(fileName)) {
		currentLineup = fs.readFileSync(fileName, 'utf8');
		parsedLineup = JSON.parse(currentLineup);
	}

	// Look for druid-dps, and move them to the bottom of the line-up so the druid tanks will be on top of the feral list.
	for (player in parsedLineup) {
		let playerType = getClass(player) + '-' + getRole(player);
		let result = parsedLineup[player];
		if (playerType == 'druid-dps') {
			delete parsedLineup[player];
			parsedLineup[player] = result;
		}	
	}

	cellData = [];
	rowCounter = [];
	for (player in parsedLineup) {
		result = parsedLineup[player];
		if (result == 'yes') {
			let playerType = getClass(player) + '-' + getRole(player);
			if (playerType == 'druid-tank') {
				playerType = 'druid-dps';
			}
			col = sheetCols[playerType];			
			if (col === undefined) {
				message.author.send('Could not find a column assignment for ' + player + '.');
			} else {
				if (rowCounter[col] === undefined) {
					rowCounter[col] = 2;
				}
				cellData.push({
					row: rowCounter[col], 
					col: col, 
					value: player
				});
	
				rowCounter[col]++;
			}
		}
	}
	setCells(cellData);

	function getRole(player) {
		const roleFile = 'data/' + message.guild.id + '-roles.json';
		roleList = JSON.parse(fs.readFileSync(roleFile));
		for (rolePlayer in roleList) {
			if (player == rolePlayer) {
				return roleList[player].toLowerCase();
			}
		}
		return 'unknown';
	}

	function getClass(player) {
		const classFile = 'data/' + message.guild.id + '-class.json';
		classList = JSON.parse(fs.readFileSync(classFile));
		for (classPlayer in classList) {
			if (player == classPlayer) {
				return classList[player].toLowerCase();
			}
		}
		return 'unknown';
	}

	async function setCells(cellData) {
		var { GoogleSpreadsheet } = require('google-spreadsheet');
		var doc = new GoogleSpreadsheet(sheetID);
		var sheet;
		var cells;

		var creds = require("../../google.json");
		await doc.useServiceAccountAuth(creds);
		await doc.loadInfo();
		sheet = doc.sheetsByIndex[0];
		await sheet.loadCells('B3:V35');
		for (row = 2; row < 24; row++) {
			for (col = 1; col <  22; col++) {
				sheet.getCell(row, col).value = '';
			}
		}

		for (row = 25; row < 35; row++) {
			for (col = 1; col <  22; col++) {
				sheet.getCell(row, col).value = '';
			}
		}

		cellData.forEach((cellInfo) => {
			let cell = sheet.getCell(cellInfo.row, cellInfo.col);
			cell.value = cellInfo.value;
			console.log(cell);
		});
		await sheet.saveUpdatedCells();
	}

}
