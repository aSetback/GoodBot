module.exports = (client, Sequelize) => {
    const model = client.sequelize.define('item', {
        // attributes
        name: {
            type: Sequelize.STRING,
            allowNull: false
        },
        slot: {
            type: Sequelize.TINYINT(3),
            allowNull: false
        },
    }, {
        timestamps: false
    });
    model.sync({alter: true});
    return model;
}