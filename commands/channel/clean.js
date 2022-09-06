const { SlashCommandBuilder } = require('@discordjs/builders');

let commandData = new SlashCommandBuilder()
    .setName('clean')
    .setDescription('Remove messages from a channel.')
    .addNumberOption(option =>
		option
            .setName('number')
			.setDescription('input')
			.setRequired(true)
    );

exports.data = commandData;

exports.run = async (client, interaction) => {
    // Check permissions on the category
	if (!client.permission.manageChannel(interaction.member, interaction.channel)) {
		return interaction.reply('Unable to complete command -- you do not have permission to manage this channel.');
	}	

    let character = client.general.ucfirst(interaction.options.getString('character'));
	let raid = await client.raid.get(client, interaction.channel);

	// Remove the sign-up
	let success = await client.signups.remove(client, raid.id, character);

	if (!success) {
		let errorNotFound = client.loc('errorRemoveNotFound', 'Could not find character **' + character + '** in the sign-ups.');
        return interaction.reply({content: errorNotFound, ephemeral: true, components: []});
	}

    // Update our embed
	client.embed.update(client, interaction.channel);
    let successMessage = client.loc('characterRemoved', 'Removed the character **' + character + '** from the sign-ups.');
    return interaction.reply({content: successMessage, ephemeral: true, components: []});
    
}
