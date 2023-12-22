const { SlashCommandBuilder } = require('@discordjs/builders');

let commandData = new SlashCommandBuilder()
    .setName('exportsheet')
    .setDescription('Export the raid lineup to spreadsheet.');

exports.data = commandData;

exports.run = async (client, interaction) => {
	interaction.deferReply();
    // Check permissions on the category
	if (!client.permission.manageChannel(interaction.member, interaction.channel)) {
		return interaction.reply({content: 'Unable to complete command -- you do not have permission to manage this channel.', ephemeral: true});
	}	

	let sheetID = await client.customOptions.get(client, interaction.guild, 'sheet');
	if (sheetID) {
		sheedID = sheetID.trim();
	}
	
	let { GoogleSpreadsheet } = require('google-spreadsheet');
	let doc = new GoogleSpreadsheet(sheetID);
	var creds = require("../../google.json");
	await doc.useServiceAccountAuth(creds);
	await doc.loadInfo();
	let raid = await client.raid.get(client, interaction.channel);

	const sheetCols = {
		'warrior-tank': 1,
		'warrior-dps': 2,
		'hunter-dps': 3,
		'rogue-dps': 4,
		'rogue-tank': 5,
		'mage-caster': 6,
		'mage-healer': 7,
		'warlock-caster': 8,
		'warlock-tank': 9,
		'priest-healer': 10,
		'paladin-healer': 11,
		'druid-healer': 12,
		'druid-caster': 13,
		'druid-dps': 14,
		'priest-caster': 15,
		'paladin-dps': 16,
		'paladin-tank': 17,
		'shaman-dps': 18,
		'shaman-caster': 19,
		'shaman-healer': 20,
		'dk-dps': 21,
		'dk-tank': 22
	};

	cellData = [];
	rowCounter = [];
	raid.signups.forEach((player) => {
		if (player.signup == 'yes' && (!raid.confirmation || (raid.confirmation && player.confirmed))) {
			let playerType = player.character.class + '-' + player.character.role;
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
					value: player.character.name
				});
	
				rowCounter[col]++;
			}
		}
	});

	setCells(cellData);

	let reserves = await client.reserves.byRaid(client, raid);
	await exportReserves(reserves);
	await exportResists(raid);

	function exportResists(raid) {
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
			raid.signups.forEach((signup) => {
				let cell = sheet.getCell(outputRow, 0);
				cell.value = signup.character.name;
				cell = sheet.getCell(outputRow, 1);
				cell.value = signup.character.natureResist;
				cell = sheet.getCell(outputRow, 2);
				cell.value = signup.character.shadowResist;
				cell = sheet.getCell(outputRow, 3);
				cell.value = signup.character.fireResist;
				cell = sheet.getCell(outputRow, 4);
				cell.value = signup.character.frostResist;
				outputRow++;
			});
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
		for (key in doc.sheetsById) {
			if (doc.sheetsById[key].title == 'Export') {
				sheet = doc.sheetsById[key];
			}
		}
		if (!sheet) {
			sheet = doc.sheetsByIndex[0];
		}
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

		interaction.editReply('Line-up has been exported to https://docs.google.com/spreadsheets/d/' + sheetID);

	}

}
