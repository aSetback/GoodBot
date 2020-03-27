module.exports = (client, Sequelize) => {
    const worldbuffSchedule = client.sequelize.define('woldbuff_schedule', {
        // attributes
        type: {
            type: Sequelize.STRING,
            allowNull: false
        },
        day: {
            type: Sequelize.STRING,
            allowNull: false
        },
        time: {
            type: Sequelize.TIME(),
            allowNull: false
        },
        guild: {
            type: Sequelize.STRING,
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
    worldbuffSchedule.sync();
    return worldbuffSchedule;
}