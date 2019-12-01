var moment = require('moment');

exports.run = (client, message, args) => {

	// Delete channel
	message.delete().catch(O_o=>{}); 

    var lockoutMsg = "-\n";
    var resetDate = new Date('October 28, 2019');
    var currentDate = new Date();
    while (resetDate < currentDate) {
        resetPreviousDate = resetDate;
        resetDate = new Date(resetDate.getTime() + 5 * 24 * 60 * 60 * 1000);
    }
    resetSecondDate = new Date(resetDate.getTime() + 5 * 24 * 60 * 60 * 1000);
    lockoutMsg += '__Onyxia__' + '\n';
    lockoutMsg += 'Current lockout began on ' + moment(resetPreviousDate).format('LL') + ' and will end on ' + moment(resetDate).format('LL') + ' at 5 AM (EST)' + '\n';
    lockoutMsg += 'Next lockout will begin on ' + moment(resetDate).format('LL') + ' and will end on ' + moment(resetSecondDate).format('LL') + ' at 5 AM (EST)' + '\n';
    lockoutMsg += '\n';

    var resetDate = new Date('October 22, 2019');
    var currentDate = new Date();
    while (resetDate < currentDate) {
        resetPreviousDate = resetDate;
        resetDate = new Date(resetDate.getTime() + 7 * 24 * 60 * 60 * 1000);
    }
    resetSecondDate = new Date(resetDate.getTime() + 7 * 24 * 60 * 60 * 1000);
    lockoutMsg += '__Molten Core__' + '\n';
    lockoutMsg += 'Current lockout began on ' + moment(resetPreviousDate).format('LL') + ' and will end on ' + moment(resetDate).format('LL') + ' at 5 AM (EST)' + '\n';
    lockoutMsg += 'Next lockout will begin on ' + moment(resetDate).format('LL') + ' and will end on ' + moment(resetSecondDate).format('LL') + ' at 5 AM (EST)' + '\n';
 
    message.channel.send(lockoutMsg);
}