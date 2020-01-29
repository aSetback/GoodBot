module.exports = (client, Sequelize) => {
    const Log = client.sequelize.define('log', {
        // attributes
        event: {
            type: Sequelize.TEXT,
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
    Log.sync();
    return Log;
}