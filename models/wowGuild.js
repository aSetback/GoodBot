module.exports = (client, Sequelize) => {
    const model = client.sequelize.define('wow_guild', {
        name: {
            type: Sequelize.STRING,
            allowNull: false
        },
        faction: {
            type: Sequelize.STRING,
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