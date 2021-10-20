module.exports = (client, Sequelize) => {
    const model = client.sequelize.define('raid_logs', {
        // attributes
        event: {
            type: Sequelize.TEXT,
            allowNull: false
        },
        eventType: {
            type: Sequelize.STRING,
            allowNull: false
        },
        raidID: {
            type: Sequelize.BIGINT(20),
            allowNull: true
        },
        channelID: {
            type: Sequelize.BIGINT(20),
            allowNull: true
        },
        guildID: {
            type: Sequelize.BIGINT(20),
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