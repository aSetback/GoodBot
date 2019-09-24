exports.run = (client, message, args) => {

	if (!message.isAdmin) {
		return false;
	}
    
    let guild = message.channel.guild;
    guild.fetchMembers().then((guild) => {
        let fixedNames = 0;
        guild.members.forEach(function(member) {
            let nickName = member.nickname;
            if (nickName === null) {
                nickName = member.user.username;
            }
    
            nameSplit = nickName.replace(/ /g, '').split('/');
            let fixedName = '';
            nameSplit.forEach(function(nameSegment) {
                if (fixedName) {
                    fixedName += '/';
                }
                nameSegment = nameSegment.trim();
                nameSegment = nameSegment.replace(/([\uE000-\uF8FF]|\uD83C[\uDF00-\uDFFF]|\uD83D[\uDC00-\uDDFF])/g, '');
                nameSegment = nameSegment.replace(/[0-9_!]/g, '');
                nameSegment = nameSegment.replace(/ *\([^)]*\) */g, '');
                nameSegment = nameSegment.replace(/ *\[[^)]*\] */g, '');
                nameSegment = nameSegment.charAt(0).toUpperCase() + nameSegment.slice(1).toLowerCase();
                fixedName += nameSegment;
            })
    
            if (nickName !== fixedName) {
                fixedNames++;
                (function(member, nickName, fixedName, fixedNames) {
                    setTimeout(function() {
                        console.log(nickName + ' => ' + fixedName);
                        // member.setNickname(fixedName);
                    }, (fixedNames) * 500);
                })(member, nickName, fixedName, fixedNames);
            }
        });    
        message.channel.send('Names fixed: ' + fixedNames);
    });

    
}
