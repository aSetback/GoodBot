module.exports = (client, Sequelize) => {
    const model = client.sequelize.define('raid_reserve', {
        // attributes
        raidID: {
            type: Sequelize.BIGINT(20),
            allowNull: false,
        },
        reserveItemID: {
            type: Sequelize.BIGINT(20),
            allowNull: false,
        },
        signupID: {
            type: Sequelize.BIGINT(20),
            allowNull: false
        }
    }, {
    // options
    });
    model.sync({alter: true});
    return model;
}