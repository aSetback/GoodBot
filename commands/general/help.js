module.exports = {
    getDescription: () => {
        return 'Get a list of all commands';
    },
    run: (client, message, args) => {
        client.commands.forEach((command, name) => {
            cmd = client.commands.get(name);
            if (typeof command.getDescription !== undefined && typeof command.getDescription === 'function') {
                console.log(name + ': ' + command.getDescription());
            }
        })
    }
}