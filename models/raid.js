module.exports = (client, Sequelize) => {
    const model = client.sequelize.define('raid', {
        // attributes
        name: {
            type: Sequelize.STRING,
            allowNull: false
        },
        raid: {
            type: Sequelize.STRING,
            allowNull: false
        },
        rules: {
            type: Sequelize.STRING,
            allowNull: true
        },
        date: {
            type: Sequelize.DATEONLY,
            allowNull: false
        },
        faction: {
            type: Sequelize.STRING,
            allowNull: true
        },
        title: {
            type: Sequelize.STRING,
            allowNull: true
        },
        time: {
            type: Sequelize.STRING,
            allowNull: true
        },
        description: {
            type: Sequelize.STRING,
            allowNull: true
        },
        color: {
            type: Sequelize.STRING,
            allowNull: false
        },
        confirmation: {
            type: Sequelize.BOOLEAN,
            allowNull: true
        },
        softreserve: {
            type: Sequelize.BOOLEAN,
            allowNull: true
        },
        reserveLimit: {
            type: Sequelize.TINYINT(3),
            allowNull: true
        },
        locked: {
            type: Sequelize.BOOLEAN,
            allowNull: true
        },
        archived: {
            type: Sequelize.BOOLEAN,
            allowNull: true
        },
        crosspostID: {
            type: Sequelize.BIGINT(20),
            allowNull: true
        },
        crosspostGuildID: {
            type: Sequelize.BIGINT(20),
            allowNull: true
        },
        channelID: {
            type: Sequelize.BIGINT(20),
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