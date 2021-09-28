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

    isSuperAdmin: (member) => {
        let validAdmins = [
            93398761979514880n,  // Setback
            276010165549924353n,  // Growth
            149377557307850752n, // Sonalbelli
        ];

        if (validAdmins.includes(BigInt(member.id))) {
            return true;
        }
        return false;
    }
}