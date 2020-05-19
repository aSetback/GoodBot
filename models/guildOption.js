module.exports = (client, Sequelize) => {
    const model = client.sequelize.define('guild_option', {
        key: {
            type: Sequelize.STRING,
            allowNull: false
        },
        value: {
            type: Sequelize.TEXT,
            allowNull: false
        },
        guildID: {
            type: Sequelize.BIGINT,
            allowNull: false

        }
    }, {
    // options
    });
    model.sync({alter: true});
    return model;
}