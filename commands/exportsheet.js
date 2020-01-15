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
		'paladin-tank': 15,
		'shaman-dps': 16,
		'shaman-caster': 17,
		'shaman-healer': 18,
		'dk-dps': 19,
		'dk-tank': 20
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
				message.author.send('Could not find a column assignment for ' + player + '.');
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
				var creds = require("../google.json");
				doc.useServiceAccountAuth(creds, step);
				
			},
			function getInfoAndWorksheets(step) {
				doc.getInfo(function(err, info) {
					try {
						sheet = info.worksheets[0];
						step();
					} catch(e) {
						console.error(e);
						return message.author.send('Unable to write to specified sheet!  Please give the bot\'s user access to edit spreadsheet.  \n Bot User: discord@api-project-483394155093.iam.gserviceaccount.com');
					}
				});
			},
			function getCells(step) {
				sheet.getCells({
					'min-row': 2,
					'max-row': 23,
					'min-col': 2,
					'max-col': 20,
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
					} else {
						cell.value = '';
					}
					saveCells.push(cell);

				}
				sheet.bulkUpdateCells(saveCells);
				message.author.send('Line-up has been exported to https://docs.google.com/spreadsheets/d/' + sheetID);
				step();
			},
			function clearStandbys(step) {
				sheet.getCells({
					'min-row': 26,
					'max-row': 35,
					'min-col': 2,
					'max-col': 14,
					'return-empty': true
				}, async function(err, data) {
					for (key in data) {
						data[key].value = '';
					}
					sheet.bulkUpdateCells(data);
					step();
				});			},
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