const { SlashCommandBuilder } = require('@discordjs/builders');

let commandData = new SlashCommandBuilder()
    .setName('noreserve')
    .setDescription('Ping a confirmed raiders with no reserve set.');

exports.data = commandData;

exports.run = async (client, interaction) => {
    await interaction.deferReply({ ephemeral: true });
    // Check permissions on the category
	if (!client.permission.manageChannel(interaction.member, interaction.channel)) {
		return interaction.editReply('Unable to complete command -- you do not have permission to manage this channel.');
	}	
    
    let raid = await client.raid.get(client, interaction.channel);
    if (!raid.softreserve) {
        return interaction.editReply("Soft reserve is not currently enabled for this raid.");
    }

    let includes = [
        {model: client.models.signup, as: 'signup', foreignKey: 'signupID'},
    ];
    
    client.models.raidReserve.findAll({where: {RaidID: raid.id}, include: includes}).then((raidReserves) => {
        let hasReserve = [];
        for (key in raidReserves) {
            if (raidReserves[key].signup) {
                hasReserve.push(raidReserves[key].signup.player);
            }
        }
        
        client.models.signup.findAll({where: {RaidID: raid.id, signup: 'yes', confirmed: 1}}).then(async (signups) => {
            let noReserve = [];
            for (key in signups) {
                let signup = signups[key];
                if (!hasReserve.includes(signup.player)) {
                    noReserve.push(signup.player);
                }
            }
            if (noReserve.length) {
                let notifyList = await client.notify.makeList(client, interaction.guild, noReserve);
                interaction.channel.send('Please set your reserve!');
                interaction.channel.send(notifyList);
            } else {
                interaction.editReply('All signed up players have a reserve.');
            }
        });
    });    

}
