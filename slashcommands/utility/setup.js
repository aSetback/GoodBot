const Discord = require("discord.js");
const { MessageActionRow, MessageButton, Modal, TextInputComponent, MessageSelectMenu } = require("discord.js");
const { SlashCommandBuilder } = require('@discordjs/builders');

let commandData = new SlashCommandBuilder()
    .setName('setup')
    .setDescription('Set up GoodBot on your discord.');

exports.data = commandData;
exports.run = async (client, interaction) => {
    // Check permissions on the category
	if (!client.permission.manageChannel(interaction.member, interaction.channel)) {
		return interaction.reply('Unable to complete command -- you do not have permission to manage this channel.');
	}	
    
    // Create Categories

    // Create Raid Signups
    let signupCategory = interaction.guild.channels.cache.find(c => c.name == "Raid Signups" && c.type == "GUILD_CATEGORY");
    if (!signupCategory) {
        signupCategory = await interaction.guild.channels.create('Raid Signups', {
            'type': 'GUILD_CATEGORY'
        })
        .catch((e) => {
            return interaction.reply("Command failed 4 - GoodBot does not have permission to create channels on your discord, `/setup` failed.  Please give GoodBot administrator rights and try again.");
        });
    }

    // Create Archives
    let archiveCategory = interaction.guild.channels.cache.find(c => c.name == "Archives" && c.type == "GUILD_CATEGORY");
    if (!archiveCategory) {
        archiveCategory = await interaction.guild.channels.create('Archives', {
            'type': 'GUILD_CATEGORY'
        })
        .catch((e) => {
            return interaction.reply("Command failed 3 - GoodBot does not have permission to create channels on your discord, `/setup` failed.  Please give GoodBot administrator rights and try again.");
        });
    }

    // Create Get Started
    let setupCategory  = interaction.guild.channels.cache.find(c => c.name == "Get Started" && c.type == "GUILD_CATEGORY");
    if (!setupCategory) {
        setupCategory = await interaction.guild.channels.create('Get Started', {
            'type': 'GUILD_CATEGORY'
        })
        .catch((e) => {
            return interaction.reply("Command failed 2 - GoodBot does not have permission to create channels on your discord, `/setup` failed.  Please give GoodBot administrator rights and try again.");
        });
    }

    // Create Setup Channel
    let setupChannel = interaction.guild.channels.cache.find(c => c.name.toLowerCase() == 'get-started-goodbot');
    if (!setupChannel) {
        setupChannel = await interaction.guild.channels.create('Get-Started-GoodBot', {
            type: 'GUILD_TEXT'
        });
        setupChannel.setParent(setupCategory.id).then((channel) => {
            channel.lockPermissions().catch(console.error);
        }).catch((e) => {});

    }

    let embed = new Discord.MessageEmbed()
        .setTitle('GoodBot Character Setup')
        .setDescription('Please click the "Set Up Main" button to get started setting up your first character.\n\nA modal will pop up asking your character\'s name.  Enter it, and press "submit"\n\nThe bot will reply to you asking the character\'s class and role.  Select each of these and your character will be set up.')
        .setColor(0xb00b00)
        .setThumbnail('https://goodbot.me/images/GoodBot.png');

    let buttonRow = new MessageActionRow()
        .addComponents(
            new MessageButton()
                .setStyle('SUCCESS')
                .setLabel('Set Up Main') 
                .setCustomId('sc-button-setup-main'),
            new MessageButton()
                .setStyle('DANGER')
                .setLabel('Set Up Alt') 
                .setCustomId('sc-button-setup-alt'),
        );
    setupChannel.send({ embeds: [embed], components: [buttonRow] });
    
    if (setupCategory && setupChannel) {
        interaction.reply('GoodBot has been set up successfully.');
    }
}

exports.buttonResponse = async (client, interaction, data) => {
    let type = data.shift();
    let modal, input1;
    if (type == "main") {
        modal = new Modal()
            .setCustomId('sc-modal-setup')
            .setTitle('Set up your main');
        input1 = new TextInputComponent()
            .setCustomId('mainName')
            .setLabel('Main Character Name')
            .setRequired(true)
            .setStyle('SHORT');
    } else {
        modal = new Modal()
            .setCustomId('sc-modal-setup')
            .setTitle('Set up your alt');
        input1 = new TextInputComponent()
            .setCustomId('altName')
            .setLabel('Alt Character Name')
            .setRequired(true)
            .setStyle('SHORT');
    }

    let ActionRow1 = new MessageActionRow().addComponents(input1);
    modal.addComponents([ActionRow1]);

    await interaction.showModal(modal);
}

exports.modalResponse = async (client, interaction) => {
    type = interaction.fields.components[0].components[0].customId;
    if (type == "mainName") {
        character = client.general.ucfirst(interaction.fields.getTextInputValue('mainName'));
        interaction.guild.members.cache.get(interaction.author.id).setNickname(client.general.ucfirst(character));
    } else {
        character = client.general.ucfirst(interaction.fields.getTextInputValue('altName'));

        // Retrieve our main
        let mainName = interaction.member.nickname ? interaction.member.nickname : interaction.user.username;
        let mainCharacter = await client.models.character.findOne({where: {name: mainName, guildID: interaction.guild.id}})
        if (!mainCharacter) {
            return interaction.reply({content: 'Please set up your main character first!', ephemeral: true});
        }

        let altCharacter = await client.models.character.findOne({where: {name: character, guildID: interaction.guild.id}})
        if (!altCharacter) {
            await client.models.character.create({'name': character, guildID: interaction.guild.id, memberID: interaction.user.id });
        }

        client.models.character.update({mainID: mainCharacter.id}, {where: {id: altCharacter.id}});
    }
    let input1 = new MessageSelectMenu()
        .setCustomId('sc-select-set-class-' + character)
        .setPlaceholder("Select a Class.")
        .addOptions(client.config.classOptions);

    let input2 = new MessageSelectMenu()
        .setCustomId('sc-select-set-role-' + character)
        .setPlaceholder("Select a Role.")
        .addOptions(client.config.roleOptions);
   

    let ActionRow1 = new MessageActionRow().addComponents(input1);
    let ActionRow2 = new MessageActionRow().addComponents(input2);

    return interaction.reply({content: 'What class and role is ' + client.general.ucfirst(character) + '?', ephemeral: true, components: [ActionRow1, ActionRow2]});
}
