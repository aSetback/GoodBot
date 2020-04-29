module.exports = (client, Sequelize) => {
    const model = client.sequelize.define('api_key', {
        // attributes
        key: {
            type: Sequelize.STRING,
            allowNull: false
        },
        memberID: {
            type: Sequelize.BIGINT,
            allowNull: false
        },
        guildID: {
            type: Sequelize.BIGINT,
            allowNull: false
        },
        level: {
            type: Sequelize.DOUBLE,
            allowNull: false
        }
    }, {
    // options
    });
    model.sync({alter: true});
    return model;
}