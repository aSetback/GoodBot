var net = require('net');

exports.run = (client, message, args) => {
	// initialize vars
	let serverIp = '';
	let serverPort = '';
	let serverStatus = 0;

	if (args[0] == 'nd') {
		serverIp = '193.70.47.186';
		serverPort = '8107';
		serverName = 'Northdale';
	}
	
	if (args[0] == 'lb') {
		serverIp = '151.80.19.103';
		serverPort = '8107';
		serverName = 'Lightbringer';
	}
	
	if (args[0] == 'logon') {
		serverIp = '193.70.47.186';
		serverPort = '3724';
		serverName = 'LH Logon Server';
	}

	if (args[0] == 'website') {
		serverIp = '104.27.138.215';
		serverPort = '80';
		serverName = 'Website';
	}

	if (args[0] == 'nwlogon') {
		serverIp = '37.187.251.149';
		serverPort = '3724';
		serverName = 'Netherwing Logon Server';
	}
	
	if (args[0] == 'nw') {
		serverIp = '37.187.251.149';
		serverPort = '8095';
		serverName = 'Netherwing';
	}
	
	if (args[0].toLowerCase() == 'darrowshire') {
		message.channel.send('Darrowshire is online, if only in our hearts.');
		return false;
	}
	
	
	// If they didn't pass a server argument, request they get their sh*t together.
	if (!serverIp) {
		message.channel.send('Please specify a valid server.');
		return false;
	}
	
	// Connect to server
	var client = new net.Socket();
	client.connect(serverPort, serverIp, () => {
	});
	
	// Connected to server via the socket!  Server is up!
	client.on('connect', function() {
		client.destroy();
		message.channel.send(serverName + ' is online.');
		serverStatus = 1;
	});
	
	// Error event (usually a disconnect / timeout) .. server is down.
	client.on('error', function(error) {
	});
	
	// The automatic timeout is far longer than we'd like to wait to know if the server is up.
	// If we don't have a connection after 3 seconds, assume the server is down, and report it.
	setTimeout(() => { 
		if (!serverStatus) {
			message.channel.send(serverName + ' is offline.');
		}
	}, 3000);

};