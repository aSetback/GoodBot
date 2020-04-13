module.exports = (client, Sequelize) => {
    const model = client.sequelize.define('raid_rules', {
        // attributes
        name: {
            type: Sequelize.STRING,
            allowNull: false
        },
        rules: {
            type: Sequelize.TEXT,
            allowNull: false
        },
        guildID: {
            type: Sequelize.BIGINT(20),
            allowNull: false
        }
    }, {
    // options
    });
    model.sync({alter: true});
    return model;
}