module.exports = (client, Sequelize) => {
    const model = client.sequelize.define('signup', {
        // attributes
        player: {
            type: Sequelize.STRING,
            allowNull: false
        },
        signup: {
            type: Sequelize.STRING,
            allowNull: false
        },
        role: {
            type: Sequelize.STRING,
            allowNull: true
        },
        confirmed: {
            type: Sequelize.BOOLEAN,
            allowNull: true
        },
        noshow: {
            type: Sequelize.BOOLEAN,
            allowNull: true
        },
        characterID: {
            type: Sequelize.BIGINT(20),
            allowNull: true
        },
        raidID: {
            type: Sequelize.BIGINT(20),
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
    model.sync({alter: true});
    return model;
}