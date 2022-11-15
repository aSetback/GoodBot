module.exports = (client, Sequelize) => {
    const model = client.sequelize.define('reserve_log', {
        // attributes
        raidID: {
            type: Sequelize.INTEGER,
            allowNull: false
        },
        log: {
            type: Sequelize.STRING,
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