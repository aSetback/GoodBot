module.exports = (client, Sequelize) => {
    const model = client.sequelize.define('reserve_item', {
        // attributes
        raid: {
            type: Sequelize.STRING,
            allowNull: false
        },
        name: {
            type: Sequelize.STRING,
            allowNull: false
        },
        alias: {
            type: Sequelize.STRING,
            allowNull: true
        },
        itemID: {
            type: Sequelize.JSON,
            allowNull: true
        }
    }, {
    // options
    });
    model.sync({alter: true});
    return model;
}
