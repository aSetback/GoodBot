module.exports = (client, Sequelize) => {
    const model = client.sequelize.define('settings', {
        // attributes
        guildID: {
            type: Sequelize.BIGINT(20),
            allowNull: false
        },
        welcomeMessage: {
            type: Sequelize.TEXT,
            allowNull: false
        },
    }, {
    // options
    });
    model.sync({alter: true});
    return model;
}