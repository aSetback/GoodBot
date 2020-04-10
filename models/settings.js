module.exports = (client, Sequelize) => {
    const model = client.sequelize.define('settings', {
        // attributes
        guildID: {
            type: Sequelize.BIGINT(20),
            allowNull: false
        },
        joinMessage: {
            type: Sequelize.STRING,
            allowNull: false
        },
    }, {
    // options
    });
    model.sync({alter: true});
    return model;
}