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
            allowNull: false
        },
        itemID: {
            type: Sequelize.STRING,
            allowNull: true
        }
    }, {
    // options
    });
    model.sync({alter: true});
    return model;
}