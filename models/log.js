module.exports = (client, Sequelize) => {
    const model = client.sequelize.define('log', {
        // attributes
        event: {
            type: Sequelize.TEXT,
            allowNull: false
        },
        guildName: {
            type: Sequelize.STRING,
            allowNull: true
        },
        guildID: {
            type: Sequelize.BIGINT(20),
            allowNull: true
        },
        memberName: {
            type: Sequelize.STRING,
            allowNull: true
        },
        memberID: {
            type: Sequelize.BIGINT(20),
            allowNull: true
        }
    }, {
    // options
    });
    model.sync({alter: true});
    return model;
}