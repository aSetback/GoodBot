module.exports = {
	manageChannel: (member, channel) => {
	
        // Retrieve this user's permission for the raid category
        let permissions = channel.permissionsFor(member);
        if (permissions.has("MANAGE_CHANNELS")) {
            return true;
        }
        return false;
    }
}