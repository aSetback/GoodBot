const { PermissionsBitField } = require('discord.js');

module.exports = {
	manageChannel: (member, channel) => {
	
        if (channel.type == 'dm') {
            return false;
        }

        // Retrieve this user's permission for the raid category
        let permissions = channel.permissionsFor(member);
        if (permissions.has(PermissionsBitField.Flags.ManageChannels)) {
            return true;
        }
        return false;
    },

    isSuperAdmin: (client, member) => {

        if (Object.values(client.config.validAdmins).includes(member.id)) {
            return true;
        }
        return false;
    }
}
