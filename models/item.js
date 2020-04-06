module.exports = (client, Sequelize) => {
    const model = client.sequelize.define('item', {
        // attributes
        entry: {
            type: Sequelize.INTEGER,
            allowNull: false
        },
        item: {
            type: Sequelize.STRING,
            allowNull: false
        }
    }, {
    // options
    });
    model.sync({alter: true});
    return model;
}