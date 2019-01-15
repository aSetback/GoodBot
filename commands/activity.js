exports.run = (client, message, args) => {
   client.user.setActivity(args.join(' '));
}
