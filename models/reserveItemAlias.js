module.exports = (client, Sequelize) => {
    const model = client.sequelize.define('reserve_item_alias', {
        // attributes
        reserveItemID: {
            type: Sequelize.STRING,
            allowNull: false
        },
        alias: {
            type: Sequelize.STRING,
            allowNull: false
        }
    }, {
    // options
    });
    model.sync({alter: true});
    return model;
}