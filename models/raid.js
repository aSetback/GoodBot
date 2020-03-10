module.exports = (client, Sequelize) => {
    const raid = client.sequelize.define('raid', {
        // attributes
        // name: {
        //     type: Sequelize.STRING,
        //     allowNull: false
        // },
        raid: {
            type: Sequelize.STRING,
            allowNull: false
        },
        date: {
            type: Sequelize.DATEONLY,
            allowNull: false
        },
        description: {
            type: Sequelize.STRING,
            allowNull: true
        },
        color: {
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
    raid.sync();
    return raid;
}