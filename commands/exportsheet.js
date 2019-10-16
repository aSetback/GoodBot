exports.run = (client, message, args) => {
	if (!message.isAdmin) {
		return false;
	}

	var sheetID = '1If9a5QKgrvRS0Qfps2WnXg49dqqMIIxe-VZSDU3Ojmk';
	var async = require('async');
	var fs = require('fs');

	message.delete();

	const sheetCols = {
		'warrior-tank': 2,
		'warrior-dps': 3,
		'hunter-dps': 4,
		'rogue-dps': 5,
		'mage-caster': 6,
		'warlock-caster': 7,
		'priest-healer': 8,
		'paladin-healer': 9,
		'druid-healer': 10,
		'druid-caster': 11,
		'druid-dps': 12,
		'priest-caster': 13,
		'paladin-dps': 14,
	};
	
	const raid = message.channel.name;
	const fileName = './signups/' + message.guild.id + '-' + raid + '.json';
	let parsedLineup = {};
	if (fs.existsSync(fileName)) {
		currentLineup = fs.readFileSync(fileName, 'utf8');
		parsedLineup = JSON.parse(currentLineup);
	}

	cellData = [];
	rowCounter = [];
	for (player in parsedLineup) {
		result = parsedLineup[player];
		if (result == 'yes') {
			playerType = getClass(player) + '-' + getRole(player);
			col = sheetCols[playerType];			
			if (col === undefined) {
				message.channel.send('Could not find a column assignment for ' + player + '.');
			} else {
				if (rowCounter[col] === undefined) {
					rowCounter[col] = 3;
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
	message.channel.send('Line-up has been exported to https://docs.google.com/spreadsheets/d/' + sheetID);

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
		var GoogleSpreadsheet = require('google-spreadsheet');
		var doc = new GoogleSpreadsheet(sheetID);
		var sheet;
		var cells;

		async.series([
			function setAuth(step) {
				var creds = ("C:\\API Project-5e42a3b136ca.json");
				doc.useServiceAccountAuth(creds, step);
				
			},
			function getInfoAndWorksheets(step) {
				doc.getInfo(function(err, info) {
					sheet = info.worksheets[0];
					step();
				});
			},
			function getCells(step) {
				sheet.getCells({
					'min-row': 2,
					'max-row': 23,
					'min-col': 2,
					'max-col': 14,
					'return-empty': true
				}, async function(err, data) {
					cells = data;
					step();
				});
			},
			function setCellData(step) {
				saveCells = [];
				for (key in cells) {
					cell = cells[key];
					newValue = findCellValue(cell);
					if (newValue !== null) {
						cell.value = newValue;
						saveCells.push(cell);
					} else {
						cell.value = '';
					}
				}
				sheet.bulkUpdateCells(saveCells);
				step();
			},
			function getLuaData(step) {


				step();
			}
		]);
	}
	
	function findCellValue(cell) {
		for (key in cellData) {
			var tempCell = cellData[key];
			if (tempCell.row == cell.row && tempCell.col == cell.col) {
				return tempCell.value;
			}
		}
		return null;
	}

}