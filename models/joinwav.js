module.exports = (client, Sequelize) => {
    const model = client.sequelize.define('joinwav', {
        // attributes
        name: {
            type: Sequelize.STRING,
            allowNull: false
        },
        wav: {
            type: Sequelize.STRING,
            allowNull: false
        },
        guildID: {
            type: Sequelize.BIGINT,
            allowNull: false
        }
    }, {
        timestamps: false
    });
    model.sync({alter: true});
    return model;
}