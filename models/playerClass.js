module.exports = (client, Sequelize) => {
    const playerClass = client.sequelize.define('player_class', {
        player: {
            type: Sequelize.STRING,
            allowNull: false
        },
        class: {
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
    playerClass.sync();
    return playerClass;
}