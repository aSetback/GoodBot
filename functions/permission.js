module.exports = {
	manageChannel: (member, channel) => {
	
        if (channel.type == 'dm') {
            return false;
        }

        // Retrieve this user's permission for the raid category
        let permissions = channel.permissionsFor(member);
        if (permissions.has("MANAGE_CHANNELS")) {
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