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
        multifaction: {
            type: Sequelize.BOOLEAN,
            allowNull: true
        },
        classrole: {
            type: Sequelize.BOOLEAN,
            allowNull: true
        },
        completerole: {
            type: Sequelize.STRING,
            allowNull: true
        },
        sheet: {
            type: Sequelize.STRING,
            allowNull: true
        },
        warcraftlogskey: {
            type: Sequelize.STRING,
            allowNull: true
        },
        expansion: {
            type: Sequelize.STRING,
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