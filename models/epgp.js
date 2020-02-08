module.exports = (client, Sequelize) => {
    const Epgp = client.sequelize.define('epgp', {
        // attributes
        player: {
            type: Sequelize.STRING,
            allowNull: false
        },
        class: {
            type: Sequelize.STRING,
            allowNull: false
        },
        ep: {
            type: Sequelize.DOUBLE,
            allowNull: false
        },
        gp: {
            type: Sequelize.DOUBLE,
            allowNull: false
        },
        pr: {
            type: Sequelize.DOUBLE,
            allowNull: false
        },
        guildID: {
            type: Sequelize.BIGINT(20),
            allowNull: false
        },
    }, {
    // options
    });
    Epgp.sync();
    return Epgp;
}