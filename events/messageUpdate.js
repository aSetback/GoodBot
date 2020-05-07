module.exports = (client, oldMessage, newMessage) => {
    client.messages.handle(client, newMessage);
};