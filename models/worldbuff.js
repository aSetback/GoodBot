module.exports = (client, Sequelize) => {
    const worldbuff = client.sequelize.define('worldbuff', {
        // attributes
        buffTime: {
            type: Sequelize.DATE(),
            allowNull: false
        },
        worldbuffScheduleID: {
            type: Sequelize.INTEGER(),
            allowNull: false
        },
        player: {
            type: Sequelize.STRING(),
            allowNull: false
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
    worldbuff.sync();
    return worldbuff;
}