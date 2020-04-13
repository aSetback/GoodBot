module.exports = (client, Sequelize) => {
    const model = client.sequelize.define('quote', {
        // attributes
        quote: {
            type: Sequelize.TEXT,
            allowNull: false
        },
        guildID: {
            type: Sequelize.BIGINT(20),
            allowNull: false
        },
        memberID: {
            type: Sequelize.BIGINT(20),
            allowNull: false
        }
    }, {
    // options
    });
    model.sync({alter: true});
    return model;
}