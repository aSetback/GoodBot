module.exports = (client, Sequelize) => {
    const model = client.sequelize.define('raid_category', {
        // attributes
        raid: {
            type: Sequelize.STRING,
            allowNull: false
        },
        category: {
            type: Sequelize.STRING,
            allowNull: false
        },
        faction: {
            type: Sequelize.STRING,
            allowNull: true
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