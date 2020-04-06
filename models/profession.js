module.exports = (client, Sequelize) => {
    const model = client.sequelize.define('profession', {
        // attributes
        name: {
            type: Sequelize.STRING,
            allowNull: false
        },
        guildID: {
            type: Sequelize.BIGINT(20),
            allowNull: false
        }
    }, {
    // options
    });
    model.sync({alter: true});
    return model;
}