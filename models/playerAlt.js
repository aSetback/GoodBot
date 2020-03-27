module.exports = (client, Sequelize) => {
    const playerAlt = client.sequelize.define('player_alt', {
        altName: {
            type: Sequelize.STRING,
            allowNull: false
        },
        mainName: {
            type: Sequelize.STRING,
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
    playerAlt.sync();
    return playerAlt;
}