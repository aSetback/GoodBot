module.exports = (client, Sequelize) => {
    const model = client.sequelize.define('wow_officer', {
        name: {
            type: Sequelize.STRING,
            allowNull: false
        },
        wowGuildID: {
            type: Sequelize.INTEGER,
            allowNull: false
        },
        guildID: {
            type: Sequelize.BIGINT,
            allowNull: false

        }
    }, {
    // options
    });
    model.sync({alter: true});
    return model;
}