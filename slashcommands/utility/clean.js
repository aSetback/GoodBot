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

    let number = interaction.options.getNumber('number');

    interaction.channel.messages.fetch({limit: number})
        .then(function(list){
            interaction.channel.bulkDelete(list).catch(() => {
                let counter = 0;
                list.forEach((message) => {
                    counter++;
                    setTimeout(async() => {
                        await message.delete();
                    }, counter * 1000);
                });
            });
        });
    interaction.reply({content: 'Messages deleted.', ephemeral: true});
}
