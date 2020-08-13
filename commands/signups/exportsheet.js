exports.run = async function(client, message, args) {
	// Check permissions on the category
	if (!client.permission.manageChannel(message.member, message.channel)) {
		return message.channel.send('Unable to complete command -- you do not have permission to manage this channel.');
	}	


	let sheetID = client.customOptions.get(message.guild, 'sheet');
	if (sheetID) {
		sheedID = sheetID.trim();
	}
	
	if (args[0]) {
		sheetID = args[0];
	}

	let { GoogleSpreadsheet } = require('google-spreadsheet');
	let doc = new GoogleSpreadsheet(sheetID);
	var creds = require("../../google.json");
	await doc.useServiceAccountAuth(creds);
	await doc.loadInfo();
	let raid = await client.raid.get(client, message.channel);

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
		'shaman-healer': 17
	};

	let expansion = client.guildOption.expansion(client, message.guild.id);
	if (expansion >= 2) {
		sheetCols['dk-dps'] = 18;
		sheetCols['dk-tank'] = 19;
	}
	if (expansion >= 4) {
		sheetCols['monk-dps'] = 20;
		sheetCols['monk-tank'] = 21;
		sheetCols['monk-healer'] = 22;
	}
	if (expansion >= 6) {
		sheetCols['dk-dps'] = 23;
		sheetCols['dk-tank'] = 24;
	}

	let lineup = await client.embed.getLineup(client, raid)

	cellData = [];
	rowCounter = [];
	for (key in lineup) {
		player = lineup[key];
		if (player.signup == 'yes' && (!raid.confirmation || (raid.confirmation && player.confirmed))) {
			let playerType = player.class + '-' + player.role;
			if (playerType == 'druid-tank') {
				playerType = 'druid-dps';
			}
			col = sheetCols[playerType];			
			if (col !== undefined) {
				if (rowCounter[col] === undefined) {
					rowCounter[col] = 2;
				}
				cellData.push({
					row: rowCounter[col], 
					col: col, 
					value: player.name
				});
	
				rowCounter[col]++;
			}
		}
	}
	setCells(cellData);

	let reserves = await client.reserves.byRaid(client, raid);
	await exportReserves(reserves);
	await exportResists(lineup);

	function exportResists(lineup) {
		return new Promise(async (resolve, reject) => {
			let sheet = null;
			for (key in doc.sheetsById) {
				if (doc.sheetsById[key].title == 'Resistances') {
					sheet = doc.sheetsById[key];
				}
			}
			if (!sheet) {
				return resolve(false);
			}

			await sheet.loadCells('A2:E60');
			for (row = 1; row < 60; row++) {
				for (col = 0; col <  3; col++) {
					sheet.getCell(row, col).value = '';
				}
			}
			let outputRow = 1;
			for (key in lineup) {
				let signup = lineup[key];
				let cell = sheet.getCell(outputRow, 0);
				cell.value = signup.name;
				cell = sheet.getCell(outputRow, 1);
				cell.value = signup.resists.nature;
				cell = sheet.getCell(outputRow, 2);
				cell.value = signup.resists.shadow;
				cell = sheet.getCell(outputRow, 3);
				cell.value = signup.resists.fire;
				cell = sheet.getCell(outputRow, 4);
				cell.value = signup.resists.frost;
				outputRow++;
			}
			await sheet.saveUpdatedCells();
			resolve(true)
		});
	}

	function exportReserves(reserves) {
		return new Promise(async (resolve, reject) => {
			let sheet = null;
			for (key in doc.sheetsById) {
				if (doc.sheetsById[key].title == 'Reserves') {
					sheet = doc.sheetsById[key];
				}
			}
			if (!sheet) {
				return resolve(false);
			}

			await sheet.loadCells('A2:C60');
			for (row = 1; row < 60; row++) {
				for (col = 0; col <  3; col++) {
					sheet.getCell(row, col).value = '';
				}
			}
			let outputRow = 1;
			for (key in reserves) {
				let reserve = reserves[key];
				let cell = sheet.getCell(outputRow, 0);
				cell.value = reserve.player;
				cell = sheet.getCell(outputRow, 1);
				cell.value = reserve.item;
				cell = sheet.getCell(outputRow, 2);
				cell.value = reserve.reserveTime;
				outputRow++;
			}
			await sheet.saveUpdatedCells();
			resolve(true)
		});
	}


	async function setCells(cellData) {
		var sheet;
		sheet = doc.sheetsByIndex[0];
		await sheet.loadCells('B3:V35');
		for (row = 2; row < 23; row++) {
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
		});
		await sheet.saveUpdatedCells();

		message.author.send('Line-up has been exported to https://docs.google.com/spreadsheets/d/' + sheetID);

	}

}
