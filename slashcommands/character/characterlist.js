const { SlashCommandBuilder } = require('@discordjs/builders');

let commandData = new SlashCommandBuilder()
    .setName('characterlist')
    .setDescription('List all characters on this server.');

exports.data = commandData;

exports.run = async (client, interaction) => {
    let characterList = {};
    let alts = [];
    await client.models.character.findAll({ where: { guildID: interaction.guild.id } }).then((characters) => {
        characters.forEach(character => {
            if (!character.mainID) {
                characterList[character.id] = { main: character, alts: [] };
            } else {
                alts.push(character);
            }
        });

        alts.forEach(character => {
            if (characterList[character.mainID]) {
                characterList[character.mainID].alts.push(character);
            }
        })
    });

    // Sort mains alphabetically -- object keys here are numeric IDs, and a
    // plain for...in would iterate those in ID order regardless of any SQL
    // ORDER BY, so the sort has to happen on an array instead.
    let mains = Object.values(characterList).sort((a, b) => a.main.name.localeCompare(b.main.name, undefined, { sensitivity: 'base' }));

    // Build one row per main, and one indented row per alt directly below it,
    // so the whole thing renders as a single aligned table.
    let rows = [];
    mains.forEach(characterInfo => {
        rows.push([characterInfo.main.name, characterInfo.main.class || '', characterInfo.main.role || '']);
        characterInfo.alts
            .sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }))
            .forEach(alt => {
                rows.push(['  - ' + alt.name, alt.class || '', alt.role || '']);
            });
    });

    let headers = ['Character', 'Class', 'Role'];
    let widths = headers.map((header, col) => Math.max(header.length, ...rows.map(row => row[col].length)));

    let formatRow = (row) => row.map((cell, col) => cell.padEnd(widths[col])).join(' | ');

    let separator = widths.map(width => '-'.repeat(width)).join('-|-');
    let tableLines = [formatRow(headers), separator, ...rows.map(formatRow)];

    // Discord caps message content at 2000 characters; chunk on whole lines
    // so the ```md fence in each message wraps a complete, valid table.
    let chunks = [];
    let chunkLines = [];
    let chunkLength = 0;
    tableLines.forEach(line => {
        if (chunkLength + line.length + 1 > 1900) {
            chunks.push(chunkLines);
            chunkLines = [];
            chunkLength = 0;
        }
        chunkLines.push(line);
        chunkLength += line.length + 1;
    });
    if (chunkLines.length) {
        chunks.push(chunkLines);
    }
    if (!chunks.length) {
        chunks.push(['No characters have been set up on this server yet.']);
    }

    for (let index = 0; index < chunks.length; index++) {
        let content = '```md\n' + chunks[index].join('\n') + '\n```';
        if (index == 0) {
            await interaction.reply({ content: content, ephemeral: true });
        } else {
            await interaction.followUp({ content: content, ephemeral: true });
        }
    }
}
 
