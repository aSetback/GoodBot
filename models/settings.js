module.exports = (client, Sequelize) => {
    const model = client.sequelize.define('settings', {
        // attributes
        guildID: {
            type: Sequelize.BIGINT(20),
            allowNull: false
        },
        faction: {
            type: Sequelize.STRING,
            allowNull: true
        },
        server: {
            type: Sequelize.STRING,
            allowNull: true
        },
        region: {
            type: Sequelize.STRING,
            allowNull: true
        },
        sheet: {
            type: Sequelize.STRING,
            allowNull: true
        },
        welcomeMessage: {
            type: Sequelize.TEXT,
            allowNull: true
        },
        raidcategory: {
            type: Sequelize.STRING,
            allowNull: true
        }
    }, {
    // options
    });
    model.sync({alter: true});
    return model;
}